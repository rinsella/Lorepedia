import { PageTypeBadge } from "@/components/ui/badges";

interface InfoboxProps {
  title: string;
  type: string;
  summary?: string | null;
  data?: Record<string, unknown> | null;
  cover?: string | null;
}

function flatten(data: Record<string, unknown>): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined || v === "") continue;
    if (Array.isArray(v)) {
      out.push([k, v.map((x) => String(x)).join(", ")]);
    } else if (typeof v === "object") {
      out.push([k, JSON.stringify(v)]);
    } else {
      out.push([k, String(v)]);
    }
  }
  return out;
}

function humanKey(k: string): string {
  return k.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Infobox({ title, type, summary, data, cover }: InfoboxProps) {
  const rows = data && typeof data === "object" ? flatten(data) : [];
  if (rows.length === 0 && !summary && !cover && type === "ARTICLE") return null;
  return (
    <aside className="infobox not-prose">
      <div className="infobox-header">
        {title}
        <div className="mt-1.5">
          <PageTypeBadge type={type} className="bg-white/15 text-white" />
        </div>
      </div>
      {cover && (
        <img src={cover} alt={title} className="w-full max-h-56 object-cover" />
      )}
      {summary && (
        <div className="px-4 py-3 text-foreground/85 italic border-t">{summary}</div>
      )}
      {rows.length > 0 && (
        <div>
          {rows.map(([k, v]) => (
            <div className="infobox-row" key={k}>
              <span className="infobox-key">{humanKey(k)}</span>
              <span className="break-words">{v}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
