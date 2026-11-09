import { Code } from "@/components/ui";
import { CODE } from "@/content/code-docs";
import { codeOf } from "@/lib/code-source";
import { CODE_EXT_LANG } from "@/config/constants";
import { CODE_PROOF } from "@/content/ui-copy";

export function CodeWalk({ id }: { id: string }) {
  const d = CODE[id];
  if (!d) throw new Error(`unknown code doc ${id}`);
  const ext = d.file.split(".").pop()!;
  return (
    <div className="cw">
      <h3>{d.title}</h3>
      <p className="cw-lead">{d.lead}</p>
      <Code sample={[d.title, CODE_EXT_LANG[ext] ?? "text", codeOf(d)]} fileName={d.file} hideTitle />
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
      <p className="cw-proof">{CODE_PROOF[ext]}</p>
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
