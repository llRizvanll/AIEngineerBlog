import { Backoff } from "./Backoff.ts";

/**
 * One pending local change. [id] is generated on the device and doubles as the
 * idempotency key, so a retried push is applied by the server at most once.
 */
export interface PendingOp {
  entity: string;
  payload: string;
  id: string;
  attempts: number;
}

export const newOp = (entity: string, payload: string): PendingOp => ({ entity, payload, id: crypto.randomUUID(), attempts: 0 });

export type PushResult =
  | { kind: "applied" }
  | { kind: "duplicate" }                              // server already applied this id: success
  | { kind: "retryable"; afterMs?: number }            // 429 / 5xx
  | { kind: "rejected"; reason: string };              // 4xx validation: never retry

/** Thrown by the transport when the device has no network. */
export class OfflineError extends Error {}

export interface SyncTransport {
  push(op: PendingOp): Promise<PushResult>;
}

export interface OutboxStore {
  load(): Promise<PendingOp[]>;
  save(ops: PendingOp[]): Promise<void>;
}

export type DrainOutcome = { kind: "drained" } | { kind: "offline" } | { kind: "backoff"; delayMs: number } | { kind: "alreadyRunning" };

/** Runs one async section at a time, so a save cannot interleave with another change. */
class Mutex {
  private tail: Promise<void> = Promise.resolve();
  async run<T>(section: () => Promise<T>): Promise<T> {
    const before = this.tail;
    let release!: () => void;
    this.tail = new Promise<void>((resolve) => (release = resolve));
    await before;
    try {
      return await section();
    } finally {
      release();
    }
  }
}

/**
 * Durable, ordered queue of local writes. The UI enqueues and moves on; a sync job
 * drains it whenever the OS gives us time. Safe to kill at any line.
 */
export class Outbox {
  private store: OutboxStore;
  private transport: SyncTransport;
  private maxAttempts: number;
  private state = new Mutex();                         // guards queue, parked and loaded
  private draining = false;                            // single flight
  private queue: PendingOp[] = [];
  private parked: PendingOp[] = [];                    // needs the user's attention
  private loaded = false;

  constructor(store: OutboxStore, transport: SyncTransport, maxAttempts = 8) {
    this.store = store;
    this.transport = transport;
    this.maxAttempts = maxAttempts;
  }

  pendingCount(): Promise<number> {
    return this.state.run(async () => {
      await this.loadIfNeeded();
      return this.queue.length;
    });
  }

  parkedOps(): Promise<PendingOp[]> {
    return this.state.run(async () => [...this.parked]);
  }

  /** Persist first, then return: if the app dies a millisecond later, the intent survives. */
  enqueue(op: PendingOp): Promise<void> {
    return this.state.run(async () => {
      await this.loadIfNeeded();
      this.queue.push(op);
      await this.store.save([...this.queue]);
    });
  }

  async drain(): Promise<DrainOutcome> {
    if (this.draining) return { kind: "alreadyRunning" };   // a drain is already running
    this.draining = true;
    try {
      for (;;) {
        const op = await this.state.run(async () => {
          await this.loadIfNeeded();
          return this.queue[0];
        });
        if (!op) return { kind: "drained" };
        let result: PushResult;
        try {
          result = await this.transport.push(op);
        } catch (e) {
          if (e instanceof OfflineError) return { kind: "offline" };   // keep everything; try again later
          throw e;
        }
        const stop = await this.state.run(async (): Promise<DrainOutcome | undefined> => {
          if (result.kind === "applied" || result.kind === "duplicate") {
            this.queue.shift();
          } else if (result.kind === "rejected") {
            this.parked.push(this.queue.shift()!);
          } else {
            const next = { ...op, attempts: op.attempts + 1 };
            this.queue.shift();
            if (next.attempts >= this.maxAttempts) {
              this.parked.push(next);
            } else {
              this.queue.unshift(next);
              await this.store.save([...this.queue]);
              return { kind: "backoff", delayMs: result.afterMs ?? Backoff.delay(next.attempts) };
            }
          }
          await this.store.save([...this.queue]);      // checkpoint after every op
          return undefined;
        });
        if (stop) return stop;
      }
    } finally {
      this.draining = false;
    }
  }

  private async loadIfNeeded(): Promise<void> {
    if (this.loaded) return;
    const saved = await this.store.load();
    this.queue.unshift(...saved);
    this.loaded = true;
  }
}
