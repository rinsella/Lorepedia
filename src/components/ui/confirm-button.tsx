"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ConfirmButtonProps {
  message: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "ghost";
}

export function ConfirmButton({ message, children, className, variant = "default" }: ConfirmButtonProps) {
  const { pending } = useFormStatus();
  const styles =
    variant === "destructive"
      ? "text-destructive hover:bg-destructive/10"
      : variant === "ghost"
        ? "text-foreground hover:bg-accent"
        : "text-primary hover:bg-primary/10";
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={cn("rounded px-2 py-1 text-sm font-medium disabled:opacity-50 transition", styles, className)}
    >
      {pending ? "…" : children}
    </button>
  );
}
