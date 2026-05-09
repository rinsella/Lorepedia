"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link2, Eye, EyeOff, Image as ImageIcon, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  worldSlug?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}

interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: (value: string, sel: { start: number; end: number }) => { value: string; cursor: number };
}

function wrap(prefix: string, suffix = prefix) {
  return (value: string, sel: { start: number; end: number }) => {
    const before = value.slice(0, sel.start);
    const middle = value.slice(sel.start, sel.end) || "text";
    const after = value.slice(sel.end);
    return {
      value: `${before}${prefix}${middle}${suffix}${after}`,
      cursor: before.length + prefix.length + middle.length + suffix.length,
    };
  };
}

function linePrefix(prefix: string) {
  return (value: string, sel: { start: number; end: number }) => {
    const before = value.slice(0, sel.start);
    const middle = value.slice(sel.start, sel.end) || "Heading";
    const after = value.slice(sel.end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const insert = `${before.slice(lineStart)}`.length === 0 ? prefix : `\n${prefix}`;
    return {
      value: `${before}${insert}${middle}${after}`,
      cursor: before.length + insert.length + middle.length,
    };
  };
}

const TOOLBAR: ToolbarButton[] = [
  { icon: Heading1, label: "Heading 1", action: linePrefix("# ") },
  { icon: Heading2, label: "Heading 2", action: linePrefix("## ") },
  { icon: Heading3, label: "Heading 3", action: linePrefix("### ") },
  { icon: Bold, label: "Bold", action: wrap("**") },
  { icon: Italic, label: "Italic", action: wrap("_") },
  { icon: Quote, label: "Quote", action: linePrefix("> ") },
  { icon: List, label: "Bullet list", action: linePrefix("- ") },
  { icon: ListOrdered, label: "Numbered list", action: linePrefix("1. ") },
  { icon: Code, label: "Code", action: wrap("`") },
  { icon: Link2, label: "Wikilink", action: wrap("[[", "]]") },
  { icon: ImageIcon, label: "Image", action: wrap("![alt](", ")") },
];

const TEMPLATES: Record<string, string> = {
  Character: `# {{name}}

> A brief one-line description.

## Background
Where they come from, what shaped them.

## Appearance
What they look like.

## Notable relationships
- [[Other Character]] — ally / rival / mentor

## Trivia
-`,
  Location: `# {{name}}

> A brief one-line description.

## Geography
Climate, terrain, surrounding regions.

## History
Founded, key events, current state.

## Notable inhabitants
- [[Character]]

## Connected to
- [[Other Location]]`,
  Faction: `# {{name}}

> A brief one-line description.

## Ideology
What they believe and fight for.

## Leadership
- [[Leader Name]] — title

## History
Founded, key turning points.

## Allies and enemies
- Allies: [[Other Faction]]
- Enemies: [[Rival Faction]]`,
  Event: `# {{name}}

**Date:** TBD
**Location:** [[Place]]

## Summary
What happened, in one paragraph.

## Causes
What led to it.

## Aftermath
What changed because of it.

## Participants
- [[Character]]`,
  Article: `# {{name}}

Free-form article. Use [[wikilinks]] to connect to other pages.`,
};

export function MarkdownEditor({
  name,
  defaultValue = "",
  worldSlug,
  rows = 22,
  placeholder = "Write your lore in Markdown. Use [[wikilinks]] to cross-reference pages…",
  className,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [showPreview, setShowPreview] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewing, setPreviewing] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const apply = useCallback(
    (action: ToolbarButton["action"]) => {
      const ta = taRef.current;
      if (!ta) return;
      const sel = { start: ta.selectionStart, end: ta.selectionEnd };
      const next = action(value, sel);
      setValue(next.value);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(next.cursor, next.cursor);
      });
    },
    [value],
  );

  const insertTemplate = (key: string) => {
    if (!confirm(`Replace current content with the "${key}" template?`)) return;
    setValue(TEMPLATES[key] ?? "");
  };

  // Debounced preview
  useEffect(() => {
    if (!showPreview) return;
    const t = setTimeout(async () => {
      setPreviewing(true);
      try {
        const res = await fetch("/api/markdown-preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ markdown: value, worldSlug }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewHtml(data.html ?? "");
        }
      } finally {
        setPreviewing(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [value, showPreview, worldSlug]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
        {TOOLBAR.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => apply(action)}
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition"
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <div className="relative inline-flex">
          <select
            onChange={(e) => {
              if (e.target.value) {
                insertTemplate(e.target.value);
                e.target.value = "";
              }
            }}
            className="h-8 rounded bg-background border px-2 text-xs hover:bg-accent"
            defaultValue=""
            title="Insert template"
          >
            <option value="" disabled>Insert template…</option>
            {Object.keys(TEMPLATES).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {wordCount} {wordCount === 1 ? "word" : "words"}
            {previewing && " · rendering…"}
          </span>
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-accent"
          >
            {showPreview ? <><EyeOff className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Hide preview</span></> : <><Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Preview</span></>}
          </button>
        </div>
      </div>
      <div className={cn("grid min-w-0", showPreview ? "md:grid-cols-2" : "grid-cols-1")}>
        <textarea
          ref={taRef}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-background px-3 sm:px-4 py-3 font-mono text-[13px] sm:text-sm leading-6 outline-none resize-y border-0 md:border-r min-h-[40vh]"
        />
        {showPreview && (
          <div className="bg-card overflow-auto max-h-[60vh] md:max-h-[80vh] border-t md:border-t-0">
            <div className="p-4 sm:p-5 prose-wiki" dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-muted-foreground italic'>Preview will appear here…</p>" }} />
            {!previewHtml && (
              <div className="px-5 pb-5 text-xs text-muted-foreground border-t pt-3 mt-2">
                <FileText className="inline h-3.5 w-3.5 mr-1" />
                Tip: Use <code className="font-mono">[[Page Title]]</code> to link to other pages in this world.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
