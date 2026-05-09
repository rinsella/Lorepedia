import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-12">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 justify-between">
        <div>© {new Date().getFullYear()} Lorepedia. All worlds belong to their creators.</div>
        <div className="flex gap-4">
          <Link href="/explore" className="hover:text-foreground">Explore</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
