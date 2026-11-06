type Vec = number[];
const dist = (a: Vec, b: Vec) => a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0);

/** A compact HNSW: layers of small-world graphs, searched greedily from the top down. */
export class Hnsw {
  private vecs: Vec[] = [];
  private links: number[][][] = []; // links[node][layer] = neighbours
  private entry = -1;
  private top = -1;
  private M: number;
  private efConstruction: number;
  private rand: () => number;

  constructor(M = 16, efConstruction = 100, rand: () => number = Math.random) {
    this.M = M;
    this.efConstruction = efConstruction;
    this.rand = rand;
  }

  private searchLayer(q: Vec, start: number, ef: number, layer: number): number[] {
    const seen = new Set([start]);
    const candidates = [start];
    const best = [start];
    while (candidates.length > 0) {
      candidates.sort((a, b) => dist(q, this.vecs[a]) - dist(q, this.vecs[b]));
      const c = candidates.shift()!;
      if (best.length >= ef && dist(q, this.vecs[c]) > dist(q, this.vecs[best[best.length - 1]])) break;
      for (const n of this.links[c][layer] ?? []) {
        if (seen.has(n)) continue;
        seen.add(n);
        candidates.push(n);
        best.push(n);
        best.sort((a, b) => dist(q, this.vecs[a]) - dist(q, this.vecs[b]));
        if (best.length > ef) best.pop();
      }
    }
    return best;
  }

  insert(v: Vec): void {
    const id = this.vecs.length;
    const level = Math.floor(-Math.log(Math.max(this.rand(), 1e-9)) / Math.log(this.M));
    this.vecs.push(v);
    this.links.push(Array.from({ length: level + 1 }, () => []));
    if (this.entry < 0) {
      this.entry = id;
      this.top = level;
      return;
    }
    let ep = this.entry;
    for (let l = this.top; l > level; l--) ep = this.searchLayer(v, ep, 1, l)[0];
    for (let l = Math.min(this.top, level); l >= 0; l--) {
      const found = this.searchLayer(v, ep, this.efConstruction, l);
      const limit = l === 0 ? this.M * 2 : this.M;
      this.links[id][l] = found.slice(0, this.M);
      for (const n of this.links[id][l]) {
        const list = this.links[n][l];
        list.push(id);
        if (list.length > limit) {
          list.sort((a, b) => dist(this.vecs[n], this.vecs[a]) - dist(this.vecs[n], this.vecs[b]));
          list.length = limit;
        }
      }
      ep = found[0];
    }
    if (level > this.top) {
      this.entry = id;
      this.top = level;
    }
  }

  search(q: Vec, k: number, ef = 50): number[] {
    let ep = this.entry;
    for (let l = this.top; l > 0; l--) ep = this.searchLayer(q, ep, 1, l)[0];
    return this.searchLayer(q, ep, Math.max(ef, k), 0).slice(0, k);
  }
}
