/**
 * The resumable state of one multipart upload. Persist it after every part:
 * it is all you need to continue after the process is killed.
 */
export interface UploadPlan {
  fileId: string;
  size: number;
  partSize: number;
  completed: Record<number, string>;                   // part number → ETag
}

export const partCount = (p: UploadPlan) => Math.ceil(p.size / p.partSize);
export const remaining = (p: UploadPlan) => Array.from({ length: partCount(p) }, (_, i) => i).filter((i) => !(i in p.completed));
export const isComplete = (p: UploadPlan) => Object.keys(p.completed).length === partCount(p);
/** [from, to) byte range of one part. */
export const byteRange = (p: UploadPlan, part: number): [number, number] => [part * p.partSize, Math.min(p.size, (part + 1) * p.partSize)];

export interface PartUploader {
  upload(fileId: string, part: number, bytes: Uint8Array): Promise<string>;   // returns the ETag
}

export interface CheckpointStore {
  save(plan: UploadPlan): Promise<void>;
}

/** Runs one async section at a time, so checkpoints are saved in order. */
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
 * Uploads only the parts that are missing, at most [maxConcurrent] at a time, checkpointing
 * each one. A kill or a failure loses at most the parts that were in flight.
 */
export class ResumableUploader {
  private uploader: PartUploader;
  private checkpoints: CheckpointStore;
  private maxConcurrent: number;

  constructor(uploader: PartUploader, checkpoints: CheckpointStore, maxConcurrent: number) {
    this.uploader = uploader;
    this.checkpoints = checkpoints;
    this.maxConcurrent = maxConcurrent;
  }

  async upload(file: Uint8Array, initial: UploadPlan): Promise<UploadPlan> {
    if (file.length !== initial.size) throw new Error("plan does not match the file");
    let plan: UploadPlan = { ...initial, completed: { ...initial.completed } };
    const parts = remaining(initial);                  // one queue of parts, shared by the workers
    const lock = new Mutex();
    let failure: unknown;
    let failed = false;

    const worker = async (): Promise<void> => {
      while (!failed) {
        const part = parts.shift();
        if (part === undefined) return;
        const [from, to] = byteRange(initial, part);
        try {
          const etag = await this.uploader.upload(initial.fileId, part, file.slice(from, to));
          await lock.run(async () => {
            plan = { ...plan, completed: { ...plan.completed, [part]: etag } };
            await this.checkpoints.save(plan);         // durable before this worker takes another part
          });
        } catch (e) {
          failed = true;                               // one failing part stops the others from starting more
          failure ??= e;
          return;
        }
      }
    };

    await Promise.all(Array.from({ length: this.maxConcurrent }, worker));
    if (failed) throw failure;
    return plan;
  }
}
