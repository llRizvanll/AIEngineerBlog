"use client";

import { useEffect, type CSSProperties } from "react";

import { defaultPrefs, PREFS_KEY, useLocal, type Prefs } from "@/lib/store";
import { THEMES, CODE_FONTS, PALETTES, READ_FONTS, UI_FONTS } from "@/config/constants";

const varOf = (list: readonly { id: string; v: string }[], id: string) => (list.find((x) => x.id === id) ?? list[0]).v;

export function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  if (p.theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", p.theme);
  if (!p.palette || p.palette === "aurora") root.removeAttribute("data-palette");
  else root.setAttribute("data-palette", p.palette);
  root.style.setProperty("--rd-fs", p.size + "px");
  root.style.setProperty("--rd-lh", String(p.leading));
  root.style.setProperty("--f-sans", `var(${varOf(UI_FONTS, p.uiFont)})`);
  root.style.setProperty("--f-read", `var(${varOf(READ_FONTS, p.readFont)})`);
  root.style.setProperty("--f-mono", `var(${varOf(CODE_FONTS, p.codeFont)})`);
}

/** Inline script that runs before paint so saved appearance never flashes. */
export const prefsBootScript = `try{var p=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'{}'),r=document.documentElement,s=r.style,
F=${JSON.stringify(Object.fromEntries([...UI_FONTS, ...READ_FONTS, ...CODE_FONTS].map((f) => [f.id, f.v])))};
if(p.theme&&p.theme!=='system')r.setAttribute('data-theme',p.theme);
if(p.palette&&p.palette!=='aurora')r.setAttribute('data-palette',p.palette);
if(p.size)s.setProperty('--rd-fs',p.size+'px');if(p.leading)s.setProperty('--rd-lh',p.leading);
if(F[p.uiFont])s.setProperty('--f-sans','var('+F[p.uiFont]+')');
if(F[p.readFont])s.setProperty('--f-read','var('+F[p.readFont]+')');
if(F[p.codeFont])s.setProperty('--f-mono','var('+F[p.codeFont]+')');}catch(e){}`;

export function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stored, update, hydrated] = useLocal<Prefs>(PREFS_KEY, defaultPrefs);
  const prefs = { ...defaultPrefs, ...stored };
  useEffect(() => {
    if (hydrated) applyPrefs({ ...defaultPrefs, ...stored });
  }, [stored, hydrated]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => update((p) => ({ ...defaultPrefs, ...p, [key]: value }));

  return (
    <div className={"sp-panel" + (open ? " on" : "")} role="dialog" aria-label="Appearance settings" aria-hidden={!open}>
      <div className="sp-head">
        <b>Appearance</b>
        <button type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <label>Theme</label>
      <div className="seg">
        {THEMES.map((t) => (
          <button key={t} type="button" aria-pressed={prefs.theme === t} onClick={() => set("theme", t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <label>
        Colour palette <output>{PALETTES.find((x) => x.id === prefs.palette)?.name}</output>
      </label>
      <div className="swatches">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.name}
            aria-label={`${p.name} palette`}
            aria-pressed={prefs.palette === p.id}
            onClick={() => set("palette", p.id)}
            style={{ "--a": p.a, "--b": p.b } as CSSProperties}
          />
        ))}
      </div>

      <label>Interface font</label>
      <div className="font-grid">
        {UI_FONTS.map((f) => (
          <button key={f.id} type="button" aria-pressed={prefs.uiFont === f.id} onClick={() => set("uiFont", f.id)} style={{ fontFamily: `var(${f.v})` }}>
            <b>Aa</b>
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      <label>Reading font (articles)</label>
      <div className="font-grid">
        {READ_FONTS.map((f) => (
          <button key={f.id} type="button" aria-pressed={prefs.readFont === f.id} onClick={() => set("readFont", f.id)} style={{ fontFamily: `var(${f.v})` }}>
            <b>Aa</b>
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      <label>Code font</label>
      <div className="font-grid">
        {CODE_FONTS.map((f) => (
          <button key={f.id} type="button" aria-pressed={prefs.codeFont === f.id} onClick={() => set("codeFont", f.id)} style={{ fontFamily: `var(${f.v})` }}>
            <b>{"{}"}</b>
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      <label>
        Text size <output>{prefs.size}px</output>
      </label>
      <input type="range" min={16} max={24} step={1} value={prefs.size} onChange={(e) => set("size", +e.target.value)} />
      <label>
        Line height <output>{prefs.leading.toFixed(2)}</output>
      </label>
      <input type="range" min={1.4} max={1.9} step={0.05} value={prefs.leading} onChange={(e) => set("leading", +e.target.value)} />

      <div className="sp-prev">
        <p style={{ margin: 0, fontSize: "var(--rd-fs)", lineHeight: "var(--rd-lh)", fontFamily: "var(--font-read)" }}>
          Design every step so it is safe to kill and resume.
        </p>
        <code className="sp-code">if retries &lt; 5 {"{"} backoff(attempt) {"}"}</code>
        <span className="sp-grad" />
      </div>
      <button type="button" className="sp-reset" onClick={() => update(() => defaultPrefs)}>
        Reset to defaults
      </button>
    </div>
  );
}
