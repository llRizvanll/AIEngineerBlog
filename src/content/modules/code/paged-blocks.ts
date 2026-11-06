/** PagedAttention's memory manager: fixed-size blocks, one table per sequence, copy-on-write forks. */
export class BlockManager {
  private free: number[];
  private refs: number[];
  private blockTokens: number;
  private seqs = new Map<string, { blocks: number[]; tokens: number }>();

  constructor(totalBlocks: number, blockTokens = 16) {
    this.free = Array.from({ length: totalBlocks }, (_, i) => totalBlocks - 1 - i);
    this.refs = new Array<number>(totalBlocks).fill(0);
    this.blockTokens = blockTokens;
  }

  get freeBlocks(): number {
    return this.free.length;
  }

  table(seq: string): number[] {
    return [...(this.seqs.get(seq)?.blocks ?? [])];
  }

  /** Reserves room for one more token. False means no free block: the scheduler must preempt. */
  addToken(seq: string): boolean {
    const s = this.seqs.get(seq) ?? { blocks: [], tokens: 0 };
    this.seqs.set(seq, s);
    const lastIsFull = s.tokens % this.blockTokens === 0;
    if (lastIsFull) {
      const block = this.free.pop();
      if (block === undefined) return false;
      this.refs[block] = 1;
      s.blocks.push(block);
    } else {
      const last = s.blocks[s.blocks.length - 1];
      if (this.refs[last] > 1) {
        // A forked sequence shares this block: copy before writing.
        const copy = this.free.pop();
        if (copy === undefined) return false;
        this.refs[last]--;
        this.refs[copy] = 1;
        s.blocks[s.blocks.length - 1] = copy;
      }
    }
    s.tokens++;
    return true;
  }

  /** Parallel sampling or beam search: the child shares every block until it writes. */
  fork(parent: string, child: string): void {
    const p = this.seqs.get(parent);
    if (!p) throw new Error(`unknown sequence ${parent}`);
    p.blocks.forEach((b) => this.refs[b]++);
    this.seqs.set(child, { blocks: [...p.blocks], tokens: p.tokens });
  }

  release(seq: string): void {
    for (const b of this.seqs.get(seq)?.blocks ?? []) {
      if (--this.refs[b] === 0) this.free.push(b);
    }
    this.seqs.delete(seq);
  }
}
