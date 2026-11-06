export interface Job {
  arrival: number;
  tokens: number;
}

const byArrival = (jobs: Job[]) => jobs.map((_, i) => i).sort((a, b) => jobs[a].arrival - jobs[b].arrival);

/** Static batching: the whole batch waits for its longest request. Returns each job's finish step. */
export function staticBatching(jobs: Job[], size: number): number[] {
  const done = new Array<number>(jobs.length);
  const queue = byArrival(jobs);
  let t = 0;
  let next = 0;
  while (next < queue.length) {
    t = Math.max(t, jobs[queue[next]].arrival);
    const batch: number[] = [];
    while (batch.length < size && next < queue.length && jobs[queue[next]].arrival <= t) batch.push(queue[next++]);
    t += Math.max(...batch.map((i) => jobs[i].tokens));
    for (const i of batch) done[i] = t;
  }
  return done;
}

/** Continuous batching: finished jobs leave after any step, and waiting jobs join at once. */
export function continuousBatching(jobs: Job[], size: number): number[] {
  const done = new Array<number>(jobs.length);
  const queue = byArrival(jobs);
  const left = jobs.map((j) => j.tokens);
  const running = new Set<number>();
  let t = 0;
  let next = 0;
  while (running.size > 0 || next < queue.length) {
    while (running.size < size && next < queue.length && jobs[queue[next]].arrival <= t) running.add(queue[next++]);
    if (running.size === 0) {
      t = jobs[queue[next]].arrival;
      continue;
    }
    t++; // one step: one token for everyone in the batch
    for (const i of [...running]) {
      if (--left[i] === 0) {
        done[i] = t;
        running.delete(i);
      }
    }
  }
  return done;
}
