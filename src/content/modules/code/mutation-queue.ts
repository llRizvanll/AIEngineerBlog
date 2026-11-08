/* An offline mutation queue, written to fix what a quick version gets wrong. The database here is in memory, and the
   transaction rule is the same one SQLite gives you: the local row and the queue row commit together, or neither does. */
export type Status = "PENDING" | "IN_FLIGHT" | "CONFLICT" | "FAILED";
export interface Mutation {
  id: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body: string;
  status: Status;
  attempts: number;
  createdAt: number;
  /** not before this time, set by backoff */
  nextAt: number;
  lastError?: string;
}
export type Sender = (req: { method: string; endpoint: string; body: string; idempotencyKey: string }) => Promise<{ status: number }>;

export class MemoryDb {
  rows = new Map<string, unknown>();
  queue: Mutation[] = [];
  transaction<T>(fn: (rows: Map<string, unknown>, queue: Mutation[]) => T): T {
    const rows = new Map(this.rows);
    const queue = this.queue.map((m) => ({ ...m }));
    const result = fn(rows, queue);
    this.rows = rows;
    this.queue = queue;
    return result;
  }
}

export interface Options {
  now: () => number;
  baseDelayMs: number;
  maxAttempts: number;
}

export class MutationQueue {
  private running?: Promise<void>;
  private db: MemoryDb;
  private send: Sender;
  private opts: Options;
  constructor(db: MemoryDb, send: Sender, opts: Options) {
    this.db = db;
    this.send = send;
    this.opts = opts;
  }

  // region: enqueue
  /** The screen reads the local row, so it updates at once. The queue row records what the server still has to hear. */
  enqueue(m: Pick<Mutation, "id" | "method" | "endpoint" | "body">, writeLocal: (rows: Map<string, unknown>) => void): void {
    this.db.transaction((rows, queue) => {
      writeLocal(rows);
      queue.push({ ...m, status: "PENDING", attempts: 0, createdAt: this.opts.now(), nextAt: 0 });
    });
  }
  // endregion

  /** After a crash, anything marked IN_FLIGHT may or may not have reached the server. Sending it again is safe, because of the key. */
  recover(): void {
    this.db.transaction((_rows, queue) => queue.forEach((m) => m.status === "IN_FLIGHT" && (m.status = "PENDING")));
  }

  // region: drain
  drain(): Promise<void> {
    this.running ??= this.run().finally(() => (this.running = undefined));
    return this.running;
  }

  private async run(): Promise<void> {
    for (;;) {
      const next = this.db.queue.filter((m) => m.status === "PENDING").sort((a, b) => a.createdAt - b.createdAt)[0];
      if (!next || next.nextAt > this.opts.now()) return;
      this.mark(next.id, { status: "IN_FLIGHT" });
      let status: number;
      try {
        status = (await this.send({ method: next.method, endpoint: next.endpoint, body: next.body, idempotencyKey: next.id })).status;
      } catch {
        // No network. Stop here, so later changes never overtake this one.
        this.mark(next.id, { status: "PENDING" });
        return;
      }
      if (status >= 200 && status < 300) this.db.queue = this.db.queue.filter((m) => m.id !== next.id);
      else if (status === 409) this.mark(next.id, { status: "CONFLICT", lastError: "server has a newer version" });
      else if (status === 429 || status >= 500) {
        const attempts = next.attempts + 1;
        if (attempts >= this.opts.maxAttempts) this.mark(next.id, { status: "FAILED", attempts, lastError: `gave up after HTTP ${status}` });
        else {
          this.mark(next.id, { status: "PENDING", attempts, nextAt: this.opts.now() + this.opts.baseDelayMs * 2 ** (attempts - 1), lastError: `HTTP ${status}` });
          return; // the server is unwell, so wait before trying anything
        }
      } else this.mark(next.id, { status: "FAILED", lastError: `HTTP ${status}` });
    }
  }
  // endregion

  private mark(id: string, patch: Partial<Mutation>) {
    this.db.queue = this.db.queue.map((m) => (m.id === id ? { ...m, ...patch } : m));
  }
}
