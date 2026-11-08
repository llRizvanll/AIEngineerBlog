/* A small version of the lint rule that keeps feature folders independent. Paths look like src/features/auth/index.ts. */
export interface SourceFile {
  path: string;
  /** the files this one imports, already resolved to paths */
  imports: string[];
}
export interface Violation {
  from: string;
  to: string;
  rule: "private-import" | "shared-imports-feature";
}

const featureOf = (path: string) => /^src\/features\/([^/]+)\//.exec(path)?.[1];
const isPublicEntry = (path: string) => /^src\/features\/[^/]+\/index\.ts$/.test(path);
const isShared = (path: string) => path.startsWith("src/shared/");

// region: check
export function checkBoundaries(files: SourceFile[]): Violation[] {
  const out: Violation[] = [];
  for (const file of files) {
    for (const to of file.imports) {
      const target = featureOf(to);
      if (!target) continue;
      if (isShared(file.path)) out.push({ from: file.path, to, rule: "shared-imports-feature" });
      else if (featureOf(file.path) !== target && !isPublicEntry(to)) out.push({ from: file.path, to, rule: "private-import" });
    }
  }
  return out;
}
// endregion

// region: removal
/** Everything outside a feature that still touches it. Removing the feature means editing exactly these files. */
export function removalImpact(files: SourceFile[], feature: string): string[] {
  return files
    .filter((f) => featureOf(f.path) !== feature && f.imports.some((to) => featureOf(to) === feature))
    .map((f) => f.path)
    .sort();
}
// endregion

/** Two features that import each other can't be removed or tested alone. */
export function featureCycles(files: SourceFile[]): [string, string][] {
  const edges = new Set<string>();
  for (const f of files) {
    const from = featureOf(f.path);
    if (!from) continue;
    for (const to of f.imports) {
      const target = featureOf(to);
      if (target && target !== from) edges.add(`${from}>${target}`);
    }
  }
  const cycles: [string, string][] = [];
  for (const e of edges) {
    const [a, b] = e.split(">");
    if (a < b && edges.has(`${b}>${a}`)) cycles.push([a, b]);
  }
  return cycles.sort();
}
