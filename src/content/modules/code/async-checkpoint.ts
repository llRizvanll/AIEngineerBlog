export interface Storage {
  write(path: string, data: string): Promise<void>;
  list(): Promise<string[]>;
}

/** Copy the state fast, write it in the background, and write the commit marker last. */
export class AsyncCheckpointer<S> {
  private storage: Storage;
  private inFlight: Promise<void> = Promise.resolve();

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /** Blocks training only for the copy. A second save waits for the first to finish writing. */
  save(step: number, rank: number, state: S): Promise<void> {
    const snapshot = JSON.stringify(state);
    this.inFlight = this.inFlight.then(async () => {
      await this.storage.write(`ckpt-${step}/rank-${rank}.json`, snapshot);
      await this.storage.write(`ckpt-${step}/COMMIT`, "ok"); // absent means incomplete
    });
    return this.inFlight;
  }

  /** The newest checkpoint with a commit marker. Half-written ones are ignored. */
  async latest(): Promise<number | null> {
    const files = await this.storage.list();
    const steps = files.filter((f) => f.endsWith("/COMMIT")).map((f) => Number(f.match(/ckpt-(\d+)/)?.[1]));
    return steps.length ? Math.max(...steps) : null;
  }
}
