import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import DOMPurify from "isomorphic-dompurify";
import { slugify } from "./slug";

const WIKILINK_RE = /\[\[([^\[\]\n|]+?)(?:\|([^\[\]\n]+?))?\]\]/g;

export interface ParsedWikilink {
  targetTitle: string;
  targetSlug: string;
  label: string;
}

/** Extract every wikilink from markdown source. */
export function extractWikilinks(markdown: string): ParsedWikilink[] {
  const out: ParsedWikilink[] = [];
  for (const m of markdown.matchAll(WIKILINK_RE)) {
    const title = m[1].trim();
    const label = (m[2] ?? title).trim();
    if (!title) continue;
    out.push({ targetTitle: title, targetSlug: slugify(title), label });
  }
  return out;
}

/**
 * Replace [[wikilinks]] with raw HTML anchors pointing at /w/<worldSlug>/<slug>.
 * resolvedSlugs is the set of slugs that exist for this world.
 */
export function replaceWikilinks(
  markdown: string,
  worldSlug: string,
  resolvedSlugs: Set<string>,
): string {
  return markdown.replace(WIKILINK_RE, (_full, rawTitle: string, rawLabel?: string) => {
    const title = rawTitle.trim();
    const label = (rawLabel ?? title).trim();
    const slug = slugify(title);
    const resolved = resolvedSlugs.has(slug);
    const cls = resolved ? "wikilink" : "wikilink wikilink-broken";
    return `<a href="/w/${encodeURIComponent(worldSlug)}/${encodeURIComponent(slug)}" class="${cls}" title="${escapeAttr(title)}">${escapeHtml(label)}</a>`;
  });
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface RenderOptions {
  worldSlug: string;
  resolvedSlugs: Set<string>;
}

/** Render markdown -> sanitized HTML, with wikilinks resolved. */
export async function renderMarkdown(markdown: string, opts: RenderOptions): Promise<string> {
  const withLinks = replaceWikilinks(markdown ?? "", opts.worldSlug, opts.resolvedSlugs);
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(withLinks);

  return DOMPurify.sanitize(String(processed), {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "class"],
  });
}
