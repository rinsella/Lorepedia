"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createWorld } from "../actions";

const initial = { error: "" } as { error?: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50">
      {pending ? "Creating…" : "Create world"}
    </button>
  );
}

export default function NewWorldPage() {
  const [state, action] = useFormState(createWorld, initial);
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Create a world</h1>
      <form action={action} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input name="name" required maxLength={120} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <input name="slug" pattern="[a-z0-9-]{2,80}" placeholder="my-world" className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          <p className="text-xs text-muted-foreground mt-1">Lowercase, numbers, dashes. Leave blank to derive from name.</p>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" maxLength={2000} rows={4} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Visibility</label>
          <select name="visibility" className="mt-1 w-full rounded-md border bg-background px-3 py-2">
            <option value="PRIVATE">Private — only members can see this world</option>
            <option value="UNLISTED">Unlisted — only people with the link</option>
            <option value="PUBLIC">Public — discoverable in Explore</option>
          </select>
        </div>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Submit />
      </form>
    </div>
  );
}
