import type { ReactNode } from "react";
import type { CodeSample, Pair } from "@/content/types";
import { CopyCode } from "./CopyCode";
import { editorBodyHtml, fileName, langName } from "@/lib/highlight";

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="tbl">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? "k" : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Code({ sample, startLine = 1, fileName: name, hideTitle }: { sample: CodeSample; startLine?: number; fileName?: string; hideTitle?: boolean }) {
  const [title, lang, src] = sample;
  const lines = src.replace(/\n+$/, "").split("\n").length;
  return (
    <>
      {!hideTitle && <h3>{title}</h3>}
      <div className="editor" data-lang={lang}>
        <div className="ed-bar">
          <span className="ed-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="ed-tab">{name ?? fileName(title, lang)}</span>
          <span className="ed-lang">{langName(lang)}</span>
          <CopyCode text={src} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: editorBodyHtml(src, lang, startLine) }} />
        <div className="ed-status">
          <span>{startLine > 1 ? `lines ${startLine}–${startLine + lines - 1}` : `${lines} lines`}</span>
          <span>UTF-8</span>
          <span>{langName(lang)}</span>
        </div>
      </div>
    </>
  );
}

export function Faq({ items, className = "fu" }: { items: Pair[]; className?: string }) {
  return (
    <>
      {items.map(([q, a]) => (
        <details key={q} className={className}>
          <summary>{q}</summary>
          <div>{a}</div>
        </details>
      ))}
    </>
  );
}

export function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} data-toc={title}>
      <h2>
        <span className="n">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Footer({ children }: { children?: ReactNode }) {
  return (
    <footer>
      <div className="wrap">{children ?? "AI Engineer · written by Rizvan · mobile and systems engineering"}</div>
    </footer>
  );
}

/** Render the tiny markdown used in reels: **bold** and `code`. */
export function Md({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <b key={i}>{p.slice(2, -2)}</b>
        ) : p.startsWith("`") && p.endsWith("`") && p.length > 1 ? (
          <code key={i}>{p.slice(1, -1)}</code>
        ) : (
          p
        )
      )}
    </>
  );
}
