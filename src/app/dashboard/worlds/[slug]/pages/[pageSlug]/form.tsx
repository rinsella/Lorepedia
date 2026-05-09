"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePage } from "../actions";
import { MarkdownEditor } from "@/components/editor/markdown-editor";

const initial = { ok: false, error: "" } as { ok?: boolean; error?: string; slug?: string };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50 font-medium">
      {pending ? "Saving…" : label}
    </button>
  );
}

interface Props {
  worldSlug: string;
  page: {
    id: string;
    title: string;
    summary: string;
    contentMarkdown: string;
    status: string;
    visibility: string;
  };
}

export function EditPageForm({ worldSlug, page }: Props) {
  const [state, action] = useFormState(updatePage, initial);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={page.id} />
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input name="title" defaultValue={page.title} required maxLength={200} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select name="status" defaultValue={page.status} className="mt-1 w-full rounded-md border bg-background px-3 py-2">
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">In review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Visibility</label>
          <select name="visibility" defaultValue={page.visibility} className="mt-1 w-full rounded-md border bg-background px-3 py-2">
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Summary</label>
        <input name="summary" defaultValue={page.summary} maxLength={500} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
      </div>
      <div>
        <label className="text-sm font-medium">Content (Markdown — use <code className="font-mono text-primary">[[wikilinks]]</code>)</label>
        <div className="mt-1">
          <MarkdownEditor name="contentMarkdown" defaultValue={page.contentMarkdown} worldSlug={worldSlug} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Submit label="Save changes" />
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state?.ok ? <p className="text-sm text-emerald-700 dark:text-emerald-400">✓ Saved.</p> : null}
      </div>
    </form>
  );
}
