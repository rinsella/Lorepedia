"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction } from "../actions";
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
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useFormState(registerAction, initial);
  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <Logo size="lg" href="/" />
      </div>
      <div className="surface-parchment rounded-xl p-8">
        <h1 className="font-serif text-3xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">Start building your world for free.</p>
        <form action={action} className="space-y-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div>
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Username <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input name="username" type="text" pattern="[A-Za-z0-9_-]{3,40}" className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Display name <span className="text-muted-foreground font-normal">(optional)</span></label>
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
        <p className="text-xs text-muted-foreground mt-4 text-center">
          By creating an account you agree to our <Link href="/legal/terms" className="underline hover:text-primary">Terms</Link> and <Link href="/legal/privacy" className="underline hover:text-primary">Privacy policy</Link>.
        </p>
      </div>
      <p className="text-sm mt-6 text-muted-foreground text-center">
        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
