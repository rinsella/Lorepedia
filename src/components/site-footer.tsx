import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 mt-16 bg-background/60">
      <div className="container py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="md" />
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            A self-hostable worldbuilding wiki for writers, GMs, and creators.
            Build a living encyclopedia of your fictional universe — with
            wikilinks, infoboxes, timelines, and maps.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Product</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/explore" className="hover:text-primary">Explore worlds</Link></li>
            <li><Link href="/search" className="hover:text-primary">Global search</Link></li>
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/register" className="hover:text-primary">Create account</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Legal</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/legal/privacy" className="hover:text-primary">Privacy policy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-primary">Terms of service</Link></li>
            <li>
              <a
                href="https://github.com/rinsella/Lorepedia"
                className="inline-flex items-center gap-1.5 hover:text-primary"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-3.5 w-3.5" /> Source
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="gold-rule" />
      <div className="container py-5 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
        <span>© {new Date().getFullYear()} Lorepedia. All worlds belong to their creators.</span>
        <span className="font-serif italic">“Every legend deserves its archive.”</span>
      </div>
    </footer>
  );
}
