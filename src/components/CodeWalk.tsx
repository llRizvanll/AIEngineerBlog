import fs from "node:fs";
import path from "node:path";
import { Code } from "@/components/ui";
import { CODE, type CodeDoc } from "@/content/code-docs";

const DIRS: Record<CodeDoc["dir"], string> = {
  programme: "src/content/programme/code",
  modules: "src/content/modules/code",
  protocols: "src/content/protocol-code",
};

const LANG: Record<string, string> = { kt: "kotlin", ts: "ts", py: "python", sbatch: "bash" };

/** Reads the code the tests run. Server-only. */
export function codeOf(d: CodeDoc): string {
  const text = fs.readFileSync(path.join(process.cwd(), DIRS[d.dir], d.file), "utf8");
  let lines = text.split("\n");
  if (d.region) {
    const start = lines.findIndex((l) => l.trim() === `// region: ${d.region}`);
    if (start === -1) throw new Error(`${d.file} has no region ${d.region}`);
    const end = lines.findIndex((l, i) => i > start && l.trim() === "// endregion");
    lines = lines.slice(start + 1, end);
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
    lines = lines.map((l) => l.slice(indent));
  }
  const body = lines.filter((l) => !/^\s*\/\/ (region: .*|endregion)$/.test(l)).join("\n").replace(/\n+$/, "");
  return d.tail ? `${body}\n${d.tail}` : body;
}

const PROOF: Record<string, string> = {
  kt: "Compiled and tested by npm run test:mobile.",
  ts: "Tested by npm run test:modules.",
  py: "Syntax-checked. The GPU libraries it needs don't run in our tests.",
  sbatch: "Syntax-checked only.",
};

export function CodeWalk({ id }: { id: string }) {
  const d = CODE[id];
  if (!d) throw new Error(`unknown code doc ${id}`);
  const ext = d.file.split(".").pop()!;
  return (
    <div className="cw">
      <h3>{d.title}</h3>
      <p className="cw-lead">{d.lead}</p>
      <Code sample={[d.title, LANG[ext] ?? "text", codeOf(d)]} fileName={d.file} hideTitle />
      <dl className="cw-points">
        {d.points.map(([k, x]) => (
          <div key={k}>
            <dt>
              <code>{k}</code>
            </dt>
            <dd>{x}</dd>
          </div>
        ))}
      </dl>
      <p className="cw-proof">{PROOF[ext]}</p>
    </div>
  );
}

export function CodeWalks({ ids }: { ids: string[] }) {
  return (
    <>
      {ids.map((id) => (
        <CodeWalk key={id} id={id} />
      ))}
    </>
  );
}
