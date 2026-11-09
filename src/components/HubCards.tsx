import { toneClass } from "@/config/tones";
import Link from "next/link";
import type { NavItem } from "@/lib/nav-types";
import { Icon } from "./Icons";

/** A notebook with a tab and an icon on its cover: the picture on every module card. */
export function Book({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="bk" aria-hidden>
      <span className="bk-tab" />
      <span className="bk-cover">
        <small>{label}</small>
        <Icon name={icon} size={34} />
      </span>
    </span>
  );
}

/** Serif title with the last word in italics, as the template does. */
export function Title({ text }: { text: string }) {
  const w = text.split(" ");
  if (w.length < 2) return <>{text}</>;
  const last = w.pop();
  return (
    <>
      {w.join(" ")} <em>{last}</em>
    </>
  );
}

export function CardGrid({ items, start = 1, tag = "Start here" }: { items: NavItem[]; start?: number; tag?: string }) {
  return (
    <div className="cb-grid">
      {items.map((it, i) => (
        <Link key={it.href} href={it.href} className={`cb ${toneClass(start + i - 1)}`}>
          <Book icon={it.icon} label={it.title.split(" ")[0].toUpperCase().slice(0, 11)} />
          <span className="cb-tx">
            <small>{it.count ?? `Module ${String(start + i).padStart(2, "0")}`}</small>
            <b>
              <Title text={it.title} />
            </b>
            <span>{it.desc}</span>
            <i>{tag}</i>
          </span>
        </Link>
      ))}
    </div>
  );
}
