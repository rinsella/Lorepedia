"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePage } from "../actions";

const initial = { ok: false, error: "" } as { ok?: boolean; error?: string; slug?: string };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50">
      {pending ? "Saving…" : label}
    </button>
  );
}

interface Props {
  page: {
    id: string;
    title: string;
    summary: string;
    contentMarkdown: string;
    status: string;
    visibility: string;
  };
}

export function EditPageForm({ page }: Props) {
  const [state, action] = useFormState(updatePage, initial);
  return (
    <form action={action} className="space-y-4 max-w-3xl">
      <input type="hidden" name="id" value={page.id} />
      <div>
        <label className="text-sm font-medium">Title</label>
        <input name="title" defaultValue={page.title} required maxLength={200} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
      </div>
      <div>
        <label className="text-sm font-medium">Summary</label>
        <input name="summary" defaultValue={page.summary} maxLength={500} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
      </div>
      <div>
        <label className="text-sm font-medium">Content (Markdown)</label>
        <textarea name="contentMarkdown" defaultValue={page.contentMarkdown} rows={20} className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
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
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-primary">Saved.</p> : null}
      <Submit label="Save changes" />
    </form>
  );
}
