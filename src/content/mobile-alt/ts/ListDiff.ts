export interface Move {
  from: number;
  to: number;
}

/**
 * The changes a list needs to animate from old to new: deletions (old indices),
 * insertions (new indices), moves and in-place reloads.
 */
export interface ListDiff {
  deletes: number[];
  inserts: number[];
  moves: Move[];
  reloads: number[];                                   // new indices whose content changed
}

export const isEmpty = (d: ListDiff) => !d.deletes.length && !d.inserts.length && !d.moves.length && !d.reloads.length;

/**
 * O(n log n) diff keyed by identity. Items that keep their relative order stay put
 * (the longest increasing subsequence); only the others are reported as moves.
 */
export function diff<T, ID>(old: T[], next: T[], idOf: (t: T) => ID, same: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b)): ListDiff {
  const oldIndex = new Map<ID, number>();
  old.forEach((item, i) => oldIndex.set(idOf(item), i));
  const newIds = new Set(next.map(idOf));
  const deletes = old.map((_, i) => i).filter((i) => !newIds.has(idOf(old[i])));

  const inserts: number[] = [];
  const reloads: number[] = [];
  const survivors: [number, number][] = [];            // (old index, new index) in new order
  next.forEach((item, j) => {
    const i = oldIndex.get(idOf(item));
    if (i === undefined) {
      inserts.push(j);
    } else {
      survivors.push([i, j]);
      if (!same(old[i], item)) reloads.push(j);
    }
  });

  const stay = new Set(longestIncreasingSubsequence(survivors.map((s) => s[0])));
  const moves = survivors.filter((_, k) => !stay.has(k)).map(([from, to]) => ({ from, to }));
  return { deletes, inserts, moves, reloads };
}

/** Indices (into [values]) of one longest strictly increasing subsequence. Patience sorting. */
export function longestIncreasingSubsequence(values: number[]): number[] {
  const tails: number[] = [];                          // index of the smallest tail for each length
  const previous = new Array<number>(values.length).fill(-1);
  values.forEach((v, i) => {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {                                  // first tail >= v
      const mid = (lo + hi) >>> 1;
      if (values[tails[mid]] < v) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) previous[i] = tails[lo - 1];
    if (lo === tails.length) tails.push(i);
    else tails[lo] = i;
  });
  const out: number[] = [];
  let k = tails.length ? tails[tails.length - 1] : -1;
  while (k >= 0) {
    out.unshift(k);
    k = previous[k];
  }
  return out;
}
