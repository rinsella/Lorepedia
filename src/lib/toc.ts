import { slugify } from "./slug";

export interface TocItem {
  level: number; // 2 or 3
  text: string;
  slug: string;
  children: TocItem[];
}

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/gm;

/** Extract H2 / H3 headings from markdown for a table of contents. */
export function extractToc(markdown: string): TocItem[] {
  const flat: TocItem[] = [];
  const seen = new Map<string, number>();
  for (const m of markdown.matchAll(HEADING_RE)) {
    const level = m[1].length;
    const text = m[2].replace(/[*_`]/g, "").trim();
    if (!text) continue;
    const base = slugify(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const slug = n === 1 ? base : `${base}-${n}`;
    flat.push({ level, text, slug, children: [] });
  }
  // Build a tiny tree: H3s belong to the previous H2.
  const tree: TocItem[] = [];
  for (const item of flat) {
    if (item.level === 2 || tree.length === 0) {
      tree.push({ ...item, level: 2, children: [] });
    } else {
      tree[tree.length - 1].children.push(item);
    }
  }
  return tree;
}

/** Add `id` attributes to <h2>/<h3> elements that match the TOC slugs. */
export function applyHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_full, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return _full;
    const base = slugify(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
}
