import { LruCache } from "./LruCache.ts";

export interface ImageFetcher {
  fetch(url: string, signal: AbortSignal): Promise<Uint8Array>;
}

export interface DiskCache {
  get(key: string): Promise<Uint8Array | undefined>;
  put(key: string, bytes: Uint8Array): Promise<void>;
}

interface Download {
  promise: Promise<Uint8Array>;
  abort: AbortController;
}

/**
 * Memory → disk → network image loading with request coalescing:
 * fifty rows asking for the same URL trigger exactly one download.
 */
export class ImageLoader {
  private fetcher: ImageFetcher;
  private disk?: DiskCache;
  private memory: LruCache<string, Uint8Array>;
  private inFlight = new Map<string, Download>();

  constructor(fetcher: ImageFetcher, disk?: DiskCache, memoryLimit = 50 * 1024 * 1024) {
    this.fetcher = fetcher;
    this.disk = disk;
    this.memory = new LruCache(memoryLimit);
  }

  async load(url: string): Promise<Uint8Array> {
    const cached = this.memory.get(url);               // 1. memory
    if (cached) return cached;
    let job = this.inFlight.get(url);                  // 2. or join the download already running
    if (!job) {
      const abort = new AbortController();
      job = { promise: this.download(url, abort.signal), abort };
      this.inFlight.set(url, job);
    }
    try {
      const bytes = await job.promise;
      this.memory.put(url, bytes, bytes.length);
      return bytes;
    } finally {
      if (this.inFlight.get(url) === job) this.inFlight.delete(url);   // clean up even if the download failed
    }
  }

  private async download(url: string, signal: AbortSignal): Promise<Uint8Array> {
    const onDisk = await this.disk?.get(url);          // 3. disk
    if (onDisk) return onDisk;
    const bytes = await this.fetcher.fetch(url, signal);   // 4. network, written back to disk
    await this.disk?.put(url, bytes);
    return bytes;
  }

  /** Call when a row is recycled before its image arrives and nobody else needs it. */
  cancel(url: string): void {
    const job = this.inFlight.get(url);
    if (!job) return;
    this.inFlight.delete(url);
    job.abort.abort();
  }

  clearMemory(): void {
    this.memory.clear();
  }
}
