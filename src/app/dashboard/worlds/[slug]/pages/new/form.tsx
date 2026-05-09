"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPage } from "../actions";
import { MarkdownEditor } from "@/components/editor/markdown-editor";

const initial = { error: "" } as { error?: string };
const TYPES = [
  "ARTICLE", "CHARACTER", "LOCATION", "FACTION", "ITEM", "EVENT",
  "BLOG_POST", "NOTE",
] as const;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50 font-medium">
      {pending ? "Creating…" : "Create page"}
    </button>
  );
}

export function NewPageForm({ worldId, worldSlug }: { worldId: string; worldSlug: string }) {
  const [state, action] = useFormState(createPage, initial);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="worldId" value={worldId} />
      <div className="grid sm:grid-cols-[1fr_200px_200px] gap-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input name="title" required maxLength={200} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select name="type" className="mt-1 w-full rounded-md border bg-background px-3 py-2">
            {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ").toLowerCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Visibility</label>
          <select name="visibility" defaultValue="PRIVATE" className="mt-1 w-full rounded-md border bg-background px-3 py-2">
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Summary <span className="text-muted-foreground font-normal">(one-line description)</span></label>
        <input name="summary" maxLength={500} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
      </div>
      <div>
        <label className="text-sm font-medium">Content (Markdown — use <code className="font-mono text-primary">[[wikilinks]]</code>)</label>
        <div className="mt-1">
          <MarkdownEditor name="contentMarkdown" worldSlug={worldSlug} rows={18} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Submit />
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
    </form>
  );
}
