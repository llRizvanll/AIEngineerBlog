export interface Triple {
  subject: string;
  relation: string;
  object: string;
}

/** Entity graph behind GraphRAG: deduplicated triples, plus communities to summarise. */
export class KnowledgeGraph {
  private edges = new Map<string, Set<string>>();
  private triples = new Map<string, Triple>();

  add(t: Triple): void {
    const [s, o] = [t.subject.trim().toLowerCase(), t.object.trim().toLowerCase()];
    this.triples.set(`${s}|${t.relation}|${o}`, { subject: s, relation: t.relation, object: o });
    for (const [a, b] of [[s, o], [o, s]]) {
      if (!this.edges.has(a)) this.edges.set(a, new Set());
      this.edges.get(a)!.add(b);
    }
  }

  /** Louvain's local-moving phase: each entity joins the community that most raises modularity. */
  communities(maxRounds = 20): string[][] {
    const nodes = [...this.edges.keys()].sort();
    const degree = (n: string) => this.edges.get(n)!.size;
    const twoM = nodes.reduce((sum, n) => sum + degree(n), 0);
    const home = new Map(nodes.map((n) => [n, n]));
    const total = new Map(nodes.map((n) => [n, degree(n)])); // sum of degrees per community

    for (let round = 0; round < maxRounds; round++) {
      let moved = false;
      for (const n of nodes) {
        const current = home.get(n)!;
        total.set(current, total.get(current)! - degree(n));
        const links = new Map<string, number>([[current, 0]]);
        for (const m of this.edges.get(n)!) links.set(home.get(m)!, (links.get(home.get(m)!) ?? 0) + 1);

        let best = current;
        let bestGain = links.get(current)! - (total.get(current)! * degree(n)) / twoM;
        for (const [c, k] of [...links].sort((x, y) => x[0].localeCompare(y[0]))) {
          const gain = k - (total.get(c)! * degree(n)) / twoM;
          if (gain > bestGain + 1e-12) {
            best = c;
            bestGain = gain;
          }
        }
        total.set(best, total.get(best)! + degree(n));
        home.set(n, best);
        if (best !== current) moved = true;
      }
      if (!moved) break;
    }
    const groups = new Map<string, string[]>();
    for (const n of nodes) groups.set(home.get(n)!, [...(groups.get(home.get(n)!) ?? []), n]);
    return [...groups.values()].sort((a, b) => b.length - a.length);
  }

  /** The facts inside one community: the input to its LLM summary. */
  factsFor(community: string[]): string[] {
    const inside = new Set(community);
    return [...this.triples.values()]
      .filter((t) => inside.has(t.subject) && inside.has(t.object))
      .map((t) => `${t.subject} ${t.relation} ${t.object}`);
  }
}
