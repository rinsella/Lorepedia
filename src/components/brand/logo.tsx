import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className, size = 28 }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-lg shadow-sm ring-1 ring-black/5",
        "bg-gradient-to-br from-[#5b3fb6] to-[#3a256e]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62}>
        <path
          d="M32 14l3 7 7.5.7-5.7 5.1 1.7 7.4L32 30.5l-6.5 3.7 1.7-7.4L21.5 21.7 29 21l3-7z"
          fill="#f5d98a"
        />
      </svg>
    </span>
  );
}

interface LogoProps {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ href = "/", size = "md", className, showWordmark = true }: LogoProps) {
  const dim = size === "sm" ? 24 : size === "lg" ? 40 : 30;
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  const inner = (
    <span className={cn("inline-flex items-center gap-2 font-serif font-semibold", text, className)}>
      <BrandMark size={dim} />
      {showWordmark && <span className="tracking-tight">Lorepedia</span>}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Lorepedia home">
      {inner}
    </Link>
  );
}
