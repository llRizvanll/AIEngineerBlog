/* Tiny, dependency-free syntax highlighter that renders an editor-style block
   (title bar, line-number gutter, status bar). Used by React code samples and
   by the hand-written Part 1 article, so both look identical. */

type Tok = "kw" | "str" | "num" | "com" | "fn" | "ty" | "prop" | "at" | "op" | "lit" | "var" | "tag" | "txt";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const KW = new Set(
  (
    "abstract actor as async await break case catch class const continue data def default defer del do else enum export extends extension " +
    "false final finally for from fun func function get guard if impl implements import in init inline interface internal is lambda let " +
    "match mut new nil none null object open operator override package private protected pub public raise readonly return sealed self " +
    "set some static struct super suspend switch this throw throws true try type typealias typeof undefined use val var void when where " +
    "while with yield keyof satisfies infer any never unknown string number boolean lateinit companion reified crossinline noinline vararg " +
    "elif except pass lambda nonlocal global assert True False None and or not int long char double float short byte " +
    "protocol defer weak unowned mutating fileprivate nonisolated inout rethrows associatedtype precondition repeat"
  ).split(" ")
);
const SQL_KW = new Set(
  (
    "select from where and or not insert into values update set delete create table index unique primary key references on conflict do " +
    "nothing returning join left right inner outer group by order having limit offset as is null default integer text blob real boolean " +
    "begin commit rollback transaction pragma if exists alter add column drop view trigger for each row without rowid using virtual " +
    "fts5 match desc asc distinct case when then else end union all count max min sum coalesce check foreign constraint serial bigint " +
    "timestamptz timestamp varchar jsonb uuid partition range with recursive lateral returning now interval cascade"
  ).split(" ")
);

const EXT: Record<string, string> = {
  kotlin: "kt", java: "java", swift: "swift", ts: "ts", tsx: "tsx", js: "js", sql: "sql", python: "py", json: "json", yaml: "yaml",
  http: "http", bash: "sh", markdown: "md", text: "txt",
};
const NAME: Record<string, string> = {
  kotlin: "Kotlin", java: "Java", swift: "Swift", ts: "TypeScript", tsx: "TypeScript JSX", js: "JavaScript", sql: "SQL", python: "Python",
  json: "JSON", yaml: "YAML", http: "HTTP", bash: "Shell", markdown: "Markdown", text: "Plain text",
};

function lineComment(lang: string) {
  if (lang === "sql") return "--";
  if (["python", "yaml", "bash"].includes(lang)) return "#";
  if (["json", "markdown", "text", "http"].includes(lang)) return null;
  return "//";
}

/** Tokenise one line. `state.block` carries an open block comment across lines. */
function tokenize(line: string, lang: string, state: { block: boolean }): [Tok, string][] {
  const out: [Tok, string][] = [];
  const push = (t: Tok, v: string) => v && out.push([t, v]);
  const lc = lineComment(lang);
  const cLike = lc === "//";
  let i = 0;

  if (lang === "text" || lang === "markdown") {
    if (lang === "markdown" && /^\s*#/.test(line)) return [["kw", line]];
    return [["txt", line]];
  }
  if (lang === "http") {
    const m = line.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(\S+)(.*)$/);
    if (m) return [["kw", m[1]], ["txt", m[2]], ["str", m[3]], ["com", m[4]]];
    const s = line.match(/^(HTTP\/[\d.]+)(\s+)(\d+)(.*)$/);
    if (s) return [["com", s[1]], ["txt", s[2]], ["num", s[3]], ["fn", s[4]]];
    const h = line.match(/^([\w-]+)(:)(.*)$/);
    if (h) return [["prop", h[1]], ["op", h[2]], ["str", h[3]]];
    // a JSON body line
    lang = "json";
  }

  while (i < line.length) {
    const rest = line.slice(i);
    if (state.block) {
      const end = rest.indexOf("*/");
      if (end < 0) { push("com", rest); break; }
      push("com", rest.slice(0, end + 2)); i += end + 2; state.block = false; continue;
    }
    if (cLike && rest.startsWith("/*")) { state.block = true; continue; }
    if (lc && rest.startsWith(lc) && (lc !== "#" || i === 0 || /\s/.test(line[i - 1]))) {
      push("com", rest); break;
    }
    const str = rest.match(/^("""[\s\S]*?"""|"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|`(?:\\.|[^`\\])*`?)/);
    if (str) {
      const after = line.slice(i + str[0].length);
      const isKey = (lang === "json" || lang === "yaml") && /^\s*:/.test(after);
      push(isKey ? "prop" : "str", str[0]); i += str[0].length; continue;
    }
    if (lang === "yaml") {
      const k = rest.match(/^(\s*-?\s*)([\w.-]+)(?=\s*:)/);
      if (k && i === 0) { push("txt", k[1]); push("prop", k[2]); i += k[0].length; continue; }
    }
    const at = rest.match(/^@[\w.]+/);
    if (at && lang !== "sql") { push("at", at[0]); i += at[0].length; continue; }
    const v = rest.match(/^\$\{?\w+\}?/);
    if (v && (lang === "bash" || lang === "sql")) { push("var", v[0]); i += v[0].length; continue; }
    const num = rest.match(/^(0x[\da-fA-F_]+|\d[\d_]*(\.\d+)?([eE][+-]?\d+)?[LlfFuU]?)\b/);
    if (num && !/\w/.test(line[i - 1] || "")) { push("num", num[0]); i += num[0].length; continue; }
    const tag = rest.match(/^<\/?[A-Za-z][\w.]*/);
    if (tag && lang === "tsx" && /[\s(={,>]|^$/.test(line[i - 1] || "")) { push("op", tag[0].slice(0, tag[0][1] === "/" ? 2 : 1)); push("tag", tag[0].replace(/^<\/?/, "")); i += tag[0].length; continue; }
    const id = rest.match(/^[A-Za-z_][\w]*/);
    if (id) {
      const w = id[0];
      const nextCh = line.slice(i + w.length).match(/^\s*(\S)/)?.[1];
      const prev = line.slice(0, i).trimEnd().slice(-1);
      let t: Tok = "txt";
      if (lang === "sql") t = SQL_KW.has(w.toLowerCase()) ? "kw" : nextCh === "(" ? "fn" : "txt";
      else if (lang === "json") t = ["true", "false", "null"].includes(w) ? "lit" : "txt";
      else if (["true", "false", "null", "nil", "None", "True", "False", "undefined"].includes(w)) t = "lit";
      else if (KW.has(w)) t = "kw";
      else if (nextCh === "(") t = "fn";
      else if (/^[A-Z]/.test(w)) t = "ty";
      else if (prev === ".") t = "prop";
      push(t, w); i += w.length; continue;
    }
    const op = rest.match(/^(=>|->|\?\.|\?:|!!|::|===|!==|==|!=|<=|>=|&&|\|\||[-+*/%=<>!&|^~?:])/);
    if (op) { push("op", op[0]); i += op[0].length; continue; }
    push("txt", line[i]); i++;
  }
  return out;
}

export function langName(lang: string) {
  const l = lang.toLowerCase();
  return NAME[l] ?? lang;
}

export function fileName(title: string, lang: string) {
  const l = lang.toLowerCase();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w && !["a", "an", "the", "and", "of", "for", "to", "with", "in", "on"].includes(w))
    .slice(0, 3)
    .join("-");
  return `${slug || "snippet"}.${EXT[l] ?? "txt"}`;
}

/** Highlighted lines as HTML strings (one per source line). */
export function highlightLines(src: string, lang: string): string[] {
  const l = lang.toLowerCase();
  const state = { block: false };
  return src.replace(/\t/g, "  ").split("\n").map((line) =>
    tokenize(line, l, state)
      .map(([t, v]) => (t === "txt" ? esc(v) : `<span class="t-${t}">${esc(v)}</span>`))
      .join("")
  );
}

/** The editor body: gutter + code. The title bar is rendered by the caller. */
export function editorBodyHtml(src: string, lang: string, startLine = 1, highlight: number[] = []): string {
  const lines = highlightLines(src.replace(/\n+$/, ""), lang);
  return (
    '<div class="ed-body"><pre class="ed-pre"><code>' +
    lines
      .map(
        (h, i) =>
          `<span class="ed-line${highlight.includes(i) ? " ed-hl" : ""}"><span class="ed-ln">${i + startLine}</span><span class="ed-code">${h || " "}</span></span>`
      )
      .join("") +
    "</code></pre></div>"
  );
}

/** A full editor as an HTML string (used for the authored Part 1 article). */
export function editorHtml(src: string, lang: string, title = "snippet"): string {
  const lines = src.replace(/\n+$/, "").split("\n").length;
  return (
    `<div class="editor" data-lang="${esc(lang)}">` +
    `<div class="ed-bar"><span class="ed-dots"><i></i><i></i><i></i></span><span class="ed-tab">${esc(fileName(title, lang))}</span>` +
    `<span class="ed-lang">${esc(langName(lang))}</span><button type="button" class="ed-copy" data-ed-copy>Copy</button></div>` +
    editorBodyHtml(src, lang) +
    `<div class="ed-status"><span>${lines} lines</span><span>UTF-8</span><span>${esc(langName(lang))}</span></div></div>`
  );
}

/** Rough language guess for code that arrives without a label. */
export function guessLang(src: string): string {
  if (/^\s*(CREATE|SELECT|INSERT|UPDATE|PRAGMA|BEGIN)\b/im.test(src)) return "sql";
  if (/\bfun\s+\w+|\bval\s+\w+|WorkManager|CoroutineWorker/.test(src)) return "kotlin";
  if (/\bfunc\s+\w+|\bguard\s+let|URLSession|BGTask/.test(src)) return "swift";
  if (/^(GET|POST|PUT|PATCH|DELETE)\s+\//m.test(src)) return "http";
  if (/\b(const|let|async|await|interface)\b|=>/.test(src)) return "ts";
  if (/^\s*[{[]/.test(src)) return "json";
  return "text";
}
