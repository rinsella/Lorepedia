"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction } from "../actions";
import { Logo } from "@/components/brand/logo";

const initial = { error: "" } as { error?: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-primary text-primary-foreground py-2.5 font-medium disabled:opacity-50 hover:opacity-90 shadow-sm shadow-primary/20"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, initial);
  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <Logo size="lg" href="/" />
      </div>
      <div className="surface-parchment rounded-xl p-8">
        <h1 className="font-serif text-3xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to your worlds.</p>
        <form action={action} className="space-y-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div>
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input name="password" type="password" required className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Submit />
        </form>
      </div>
      <p className="text-sm mt-6 text-muted-foreground text-center">
        New here? <Link href="/register" className="text-primary font-medium hover:underline">Create account</Link>
      </p>
    </div>
  );
}
