"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPage } from "../actions";

const initial = { error: "" } as { error?: string };
const TYPES = ["ARTICLE", "CHARACTER", "LOCATION", "FACTION", "ITEM", "EVENT", "TIMELINE", "MAP", "NOTE", "BLOG_POST", "TEMPLATE"] as const;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50">
      {pending ? "Creating…" : "Create page"}
    </button>
  );
}

export function NewPageForm({ worldId }: { worldId: string }) {
  const [state, action] = useFormState(createPage, initial);
  return (
    <form action={action} className="space-y-4 max-w-3xl">
      <input type="hidden" name="worldId" value={worldId} />
      <div className="grid sm:grid-cols-[1fr_200px] gap-4">
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
      </div>
      <div>
        <label className="text-sm font-medium">Summary</label>
        <input name="summary" maxLength={500} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
      </div>
      <div>
        <label className="text-sm font-medium">Content (Markdown — use <code>[[wikilinks]]</code>)</label>
        <textarea name="contentMarkdown" rows={14} className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Visibility</label>
        <select name="visibility" className="mt-1 w-full rounded-md border bg-background px-3 py-2">
          <option value="PRIVATE">Private</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PUBLIC">Public</option>
        </select>
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Submit />
    </form>
  );
}
