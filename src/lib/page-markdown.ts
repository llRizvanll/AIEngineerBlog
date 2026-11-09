import { MARKDOWN_SKIP_SELECTORS } from "@/config/constants";
/* Turns the rendered page into Markdown, so any lesson, article or post can be handed to an AI tool.
   It reads the page's own HTML, so it works the same for every kind of page. Browser only. */

const squash = (s: string) => s.replace(/\s+/g, " ");

function inline(node: Node, base: string, heading = false): string {
  if (node.nodeType === Node.TEXT_NODE) return squash(node.textContent ?? "");
  if (!(node instanceof HTMLElement) || node.matches(MARKDOWN_SKIP_SELECTORS)) return "";
  const inner = () => Array.from(node.childNodes).map((c) => inline(c, base, heading)).join("");
  switch (node.tagName) {
    case "BR":
      return "\n";
    case "STRONG":
    case "B": {
      const t = inner().trim();
      return t ? `**${t}**` : "";
    }
    case "EM":
    case "I": {
      const t = inner().trim();
      return t ? `*${t}*` : "";
    }
    case "CODE":
      return `\`${(node.textContent ?? "").trim()}\``;
    case "A": {
      const t = inner().trim();
      const href = node.getAttribute("href");
      if (!t || !href || href.startsWith("#")) return t;
      return `[${t}](${new URL(href, base).href})`;
    }
    default: {
      // A span styled as its own line, like "Part 1" above a heading, needs a separator in plain text.
      const t = inner();
      if (!/^(block|flex|grid|list-item)$/.test(getComputedStyle(node).display) || !t.trim()) return t;
      return heading ? ` ${t.trim()}: ` : ` ${t.trim()} `;
    }
  }
}

function codeOf(el: HTMLElement): { lang: string; text: string } {
  const editor = el.closest(".editor") ?? el;
  const lines = editor.querySelectorAll(".ed-code");
  const text = lines.length ? Array.from(lines, (l) => l.textContent ?? "").join("\n") : el.textContent ?? "";
  return { lang: editor.getAttribute("data-lang") ?? "", text: text.replace(/\s+$/, "") };
}

function table(el: HTMLTableElement, base: string): string {
  const rows = Array.from(el.rows).map((r) => Array.from(r.cells).map((c) => inline(c, base).trim().replace(/\|/g, "\\|")));
  if (rows.length === 0) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const line = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? "").join(" | ")} |`;
  return [line(rows[0]), line(rows[0].map(() => "---")), ...rows.slice(1).map(line)].join("\n");
}

function blocks(node: Node, base: string, depth = 0): string[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = squash(node.textContent ?? "").trim();
    return t ? [t] : [];
  }
  if (!(node instanceof HTMLElement) || node.matches(MARKDOWN_SKIP_SELECTORS)) return [];
  const kids = () => Array.from(node.childNodes).flatMap((c) => blocks(c, base, depth));
  const tag = node.tagName;

  if (/^H[1-6]$/.test(tag)) {
    const t = inline(node, base, true).replace(/\s+/g, " ").replace(/\s+:/g, ":").trim().replace(/:$/, "");
    return t ? [`${"#".repeat(Math.min(Number(tag[1]) + 1, 6))} ${t}`] : [];
  }
  if (tag === "P" || tag === "SUMMARY" || tag === "FIGCAPTION") {
    const t = inline(node, base).trim();
    return t ? [tag === "SUMMARY" ? `**${t}**` : t] : [];
  }
  if (node.classList.contains("editor") || tag === "PRE") {
    const { lang, text } = codeOf(node);
    return text ? [`\`\`\`${lang}\n${text}\n\`\`\``] : [];
  }
  if (tag === "UL" || tag === "OL") {
    const items = Array.from(node.children).filter((c) => c.tagName === "LI") as HTMLElement[];
    const pad = "  ".repeat(depth);
    const out = items.map((li, i) => {
      const nested = Array.from(li.children).filter((c) => c.tagName === "UL" || c.tagName === "OL");
      const own = Array.from(li.childNodes).filter((c) => !nested.includes(c as Element));
      const text = own.map((c) => (c instanceof HTMLElement && /^(P|DIV|SPAN|LABEL|A)$/.test(c.tagName) ? inline(c, base) : inline(c, base))).join(" ").replace(/\s+/g, " ").trim();
      const sub = nested.flatMap((n) => blocks(n, base, depth + 1));
      return [`${pad}${tag === "OL" ? `${i + 1}.` : "-"} ${text}`, ...sub].join("\n");
    });
    return out.length ? [out.join("\n")] : [];
  }
  if (tag === "DL") {
    const lines: string[] = [];
    node.querySelectorAll("dt").forEach((dt) => {
      const dd = dt.nextElementSibling?.tagName === "DD" ? dt.nextElementSibling : dt.parentElement?.querySelector("dd");
      lines.push(`- **${inline(dt, base).trim()}**: ${dd ? inline(dd, base).trim() : ""}`);
    });
    return lines.length ? [lines.join("\n")] : [];
  }
  if (tag === "TABLE") return [table(node as HTMLTableElement, base)];
  if (tag === "DETAILS") {
    // Closed sections still hold their text, and an AI should see it all.
    return kids();
  }
  // Containers whose only content is inline text become a paragraph.
  const blockChild = Array.from(node.children).some((c) => !/^(A|B|STRONG|EM|I|CODE|SPAN|SMALL|BR|SUP|SUB|MARK|ABBR|TIME|LABEL)$/.test(c.tagName));
  if (!blockChild) {
    const t = inline(node, base).trim();
    return t ? [t] : [];
  }
  return kids();
}

export function pageMarkdown(root: Element, title: string, url: string): string {
  const body = blocks(root, url)
    .filter((b, i, all) => b !== all[i - 1])
    // The page title is added once at the top.
    .filter((b) => b !== `## ${title}`);
  return [`# ${title}`, "", `Source: ${url}`, "", ...body.flatMap((b) => [b, ""])].join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export const fileNameFor = (title: string) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "page"
  }.md`;
