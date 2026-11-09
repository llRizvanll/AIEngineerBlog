"use client";

import type { StudyMode } from "@/types/ui";
import { STORAGE } from "@/config/storage";
import { useEffect, useRef, useState } from "react";
import { fileNameFor, pageMarkdown } from "@/lib/page-markdown";
import { track } from "@/lib/track";
import { STUDY_MAX_LINK, STUDY_TOOLS_MAIN, STUDY_TOOLS_OTHER, type Tool } from "@/config/constants";
import { STUDY_MODES, STUDY_PROMPTS } from "@/content/ui-copy";

function Mark({ id }: { id: string }) {
  switch (id) {
    case "claude":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g stroke="#D97757" strokeWidth="2.6" strokeLinecap="round">
            {[0, 30, 60, 90, 120, 150].map((a) => (
              <line key={a} x1="12" y1="3.5" x2="12" y2="20.5" transform={`rotate(${a} 12 12)`} />
            ))}
          </g>
        </svg>
      );
    case "chatgpt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.7">
            {[0, 60, 120].map((a) => (
              <ellipse key={a} cx="12" cy="12" rx="8.5" ry="4.2" transform={`rotate(${a} 12 12)`} />
            ))}
          </g>
        </svg>
      );
    case "gemini":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="sa-gem" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4285F4" />
              <stop offset="0.55" stopColor="#9B72CB" />
              <stop offset="1" stopColor="#D96570" />
            </linearGradient>
          </defs>
          <path fill="url(#sa-gem)" d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" />
        </svg>
      );
    case "perplexity":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g fill="none" stroke="#20808D" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M12 2v20M5 8.5h14v7H5zM5 8.5 12 3l7 5.5M5 15.5 12 21l7-5.5" />
          </g>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
        </svg>
      );
  }
}

/**
 * "Study with AI" for any page. It turns the page into Markdown, then opens the chosen AI tool with a study prompt,
 * copies everything to the clipboard as a fallback, or saves and shares a .md file.
 * Pass `markdown` when the visible page doesn't hold the full text (for example, a page with tabs).
 */
export function StudyWithAI({ root = "main", title, markdown }: { root?: string; title?: string; markdown?: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<StudyMode>("explain");
  const [toast, setToast] = useState("");
  const [canShare, setCanShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    try {
      const m = localStorage.getItem(STORAGE.studyMode);
      if (m === "quiz" || m === "interview" || m === "explain") setMode(m);
    } catch {}
    try {
      setCanShare(typeof navigator.canShare === "function" && navigator.canShare({ files: [new File(["x"], "x.md", { type: "text/markdown" })] }));
    } catch {}
    return () => clearTimeout(timer.current);
  }, []);

  const say = (msg: string) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 6000);
  };

  const build = () => {
    const url = location.origin + location.pathname;
    const name = title ?? document.querySelector("h1")?.textContent?.trim() ?? document.title;
    if (markdown) return { md: `# ${name}\n\nSource: ${url}\n\n${markdown.trim()}\n`, name, url };
    const el = document.querySelector(root) ?? document.querySelector("main") ?? document.body;
    return { md: pageMarkdown(el, name, url), name, url };
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const go = async (tool: Tool) => {
    const { md, name, url } = build();
    const full = `${STUDY_PROMPTS[mode]}\n\n---\n\n${md}`;
    const copied = await copy(full);
    let href = tool.open;
    let note: string;
    if (tool.prefill && encodeURIComponent(full).length <= STUDY_MAX_LINK) {
      href = tool.prefill(full);
      note = `Opened ${tool.name} with this page. Check the message, then send it.`;
    } else if (tool.prefill) {
      href = tool.prefill(`${STUDY_PROMPTS[mode]}\n\nThe page is "${name}" (${url}). I'll paste its full text in my next message.`);
      note = copied ? `Opened ${tool.name}. The page is long, so it's on your clipboard: paste it in as your next message.` : `Opened ${tool.name}. The page is too long for a link, so use Download .md and attach the file.`;
    } else {
      note = copied ? `Opened ${tool.name}. The prompt and page are on your clipboard: paste them into the chat.` : `Opened ${tool.name}. Copying failed, so use Download .md and attach the file.`;
    }
    window.open(href, "_blank", "noopener,noreferrer");
    track("study_with_ai", { tool: tool.id, mode, page: location.pathname });
    say(note);
  };

  const download = () => {
    const { md, name } = build();
    const blob = new Blob([`${STUDY_PROMPTS[mode]}\n\n---\n\n${md}`], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileNameFor(name);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    track("study_with_ai", { tool: "download", mode, page: location.pathname });
    say(`Saved ${fileNameFor(name)}. Attach it in any AI chat.`);
  };

  const share = async () => {
    const { md, name } = build();
    const file = new File([`${STUDY_PROMPTS[mode]}\n\n---\n\n${md}`], fileNameFor(name), { type: "text/markdown" });
    try {
      await navigator.share({ files: [file], title: name });
      track("study_with_ai", { tool: "share", mode, page: location.pathname });
    } catch {
      /* the reader closed the share sheet */
    }
  };

  const copyOnly = async () => {
    const { md } = build();
    const ok = await copy(`${STUDY_PROMPTS[mode]}\n\n---\n\n${md}`);
    track("study_with_ai", { tool: "copy", mode, page: location.pathname });
    say(ok ? "Copied as Markdown. Paste it into any AI chat." : "Copying failed. Use Download .md instead.");
  };

  const pickMode = (m: StudyMode) => {
    setMode(m);
    try {
      localStorage.setItem(STORAGE.studyMode, m);
    } catch {}
  };

  return (
    <div className="sa" data-md-skip>
      <div className="sa-row">
        <span className="sa-label">Study with AI</span>
        <div className="sa-tools">
          {STUDY_TOOLS_MAIN.map((t) => (
            <button key={t.id} type="button" className="sa-tool" onClick={() => go(t)} aria-label={`Study this page with ${t.name}`} title={`Study with ${t.name}`}>
              <Mark id={t.id} />
              <span>{t.name}</span>
            </button>
          ))}
          <button type="button" className="sa-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            More
          </button>
        </div>
      </div>
      {open && (
        <div className="sa-panel">
          <div className="sa-modes" role="radiogroup" aria-label="What should the AI do?">
            {STUDY_MODES.map(([m, label]) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => pickMode(m)}>
                {label}
              </button>
            ))}
          </div>
          <p className="sa-hint">Other AI tools open in a new tab, with the prompt and page on your clipboard to paste.</p>
          <div className="sa-tools sa-other">
            {STUDY_TOOLS_OTHER.map((t) => (
              <button key={t.id} type="button" className="sa-tool" onClick={() => go(t)} aria-label={`Study this page with ${t.name}`}>
                <Mark id={t.id} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          <div className="sa-files">
            <button type="button" className="btn ghost" onClick={copyOnly}>
              Copy as Markdown
            </button>
            <button type="button" className="btn ghost" onClick={download}>
              Download .md
            </button>
            {canShare && (
              <button type="button" className="btn ghost" onClick={share}>
                Share .md to an app
              </button>
            )}
          </div>
        </div>
      )}
      <p className="sa-toast" role="status" aria-live="polite">
        {toast}
      </p>
    </div>
  );
}
