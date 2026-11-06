/* Client-safe shape of the site map. Built on the server in lib/sections.ts. */

export interface NavItem {
  href: string;
  title: string;
  desc: string;
  icon: string;
  color: [string, string];
  /** e.g. "11 rounds": computed from content, never hand-written */
  count?: string;
  /** where this sits in the whole-to-parts ladder, e.g. "Level 1 · Macro" */
  level?: string;
  /** extra paths that should highlight this item */
  match?: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  blurb: string;
  items: NavItem[];
}
