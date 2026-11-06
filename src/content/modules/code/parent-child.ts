export interface Chunk {
  id: string;
  parentId: string;
  text: string;
}

/** Splits a document into large parents, and each parent into small children to embed. */
export function splitDocument(docId: string, words: string[], parentSize: number, childSize: number) {
  const parents = new Map<string, string>();
  const children: Chunk[] = [];
  for (let p = 0; p * parentSize < words.length; p++) {
    const parentWords = words.slice(p * parentSize, (p + 1) * parentSize);
    const parentId = `${docId}#${p}`;
    parents.set(parentId, parentWords.join(" "));
    for (let c = 0; c * childSize < parentWords.length; c++) {
      children.push({ id: `${parentId}.${c}`, parentId, text: parentWords.slice(c * childSize, (c + 1) * childSize).join(" ") });
    }
  }
  return { parents, children };
}

/** Search hits children; the model reads parents. Each parent appears once, at its best score. */
export function toParents(hits: { child: Chunk; score: number }[], parents: Map<string, string>, limit: number) {
  const best = new Map<string, number>();
  for (const { child, score } of hits) best.set(child.parentId, Math.max(best.get(child.parentId) ?? -Infinity, score));
  return [...best]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, score]) => ({ id, score, text: parents.get(id) ?? "" }));
}
