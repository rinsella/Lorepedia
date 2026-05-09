"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction } from "../actions";

const initial = { error: "" } as { error?: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium disabled:opacity-50"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useFormState(registerAction, initial);
  return (
    <div className="container max-w-md py-16">
      <h1 className="font-serif text-3xl font-semibold mb-2">Create your account</h1>
      <p className="text-sm text-muted-foreground mb-6">Start building your world for free.</p>
      <form action={action} className="space-y-4">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <div>
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Username (optional)</label>
          <input name="username" type="text" pattern="[A-Za-z0-9_-]{3,40}" className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Display name (optional)</label>
          <input name="name" type="text" className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters.</p>
        </div>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Submit />
      </form>
      <p className="text-sm mt-6 text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary underline">Sign in</Link>
      </p>
    </div>
  );
}
