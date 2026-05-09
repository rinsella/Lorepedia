import Link from "next/link";
import {
  BookOpen, Link2, Layers, Compass, Shield, ScrollText, Globe2, Users,
  Map as MapIcon, Sparkles, Lock, Download, Github, ArrowRight,
} from "lucide-react";
import { BrandMark } from "@/components/brand/logo";
import { prisma } from "@/lib/db";

export const revalidate = 60;

async function getFeatured() {
  const worlds = await prisma.world.findMany({
    where: { visibility: "PUBLIC", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: { _count: { select: { pages: true } } },
  });
  return worlds;
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Pages, but for entire universes",
    body: "Characters, locations, factions, items, events, religions, languages — every page type you need, all linked.",
  },
  {
    icon: Link2,
    title: "[[Wikilinks]] that just work",
    body: "Type [[Aria Vance]] and connect everything. Backlinks, broken-link reports, and resolved cross-references appear automatically.",
  },
  {
    icon: Layers,
    title: "Templates & infoboxes",
    body: "Define your own page templates with structured fields. Render Wikipedia-style infoboxes on any page.",
  },
  {
    icon: ScrollText,
    title: "Timelines & maps",
    body: "Plot history along a timeline of events. Pin places to maps with interactive labels.",
  },
  {
    icon: Users,
    title: "Collaborators with roles",
    body: "Invite editors, contributors, or read-only viewers per world. Granular per-page visibility (private / unlisted / public).",
  },
  {
    icon: Lock,
    title: "Per-page privacy",
    body: "Keep secret lore private, share drafts unlisted, and publish the canon for everyone — all in one world.",
  },
  {
    icon: Download,
    title: "Your data is yours",
    body: "One-click ZIP export of every page as Markdown + JSON. Full account export. No lock-in.",
  },
  {
    icon: Shield,
    title: "Self-hostable",
    body: "Open codebase, Postgres + Next.js, deploy on your own infrastructure or run it on Vercel + Neon in minutes.",
  },
];

const AUDIENCES = [
  {
    icon: ScrollText,
    title: "Writers & novelists",
    body: "Track characters across drafts, keep timelines straight, never contradict yourself in chapter 47 again.",
  },
  {
    icon: MapIcon,
    title: "TTRPG game masters",
    body: "Run campaigns from one source of truth. Share the public canon with players, keep secrets hidden.",
  },
  {
    icon: Sparkles,
    title: "Worldbuilders & lore wikis",
    body: "Replace messy Notion docs and abandoned wikis with a real, living encyclopedia of your world.",
  },
  {
    icon: Globe2,
    title: "Indie game studios",
    body: "Centralize narrative design — onboarding new writers becomes a click, not a 200-page PDF.",
  },
];

const FAQ = [
  {
    q: "Is it free?",
    a: "Yes. Lorepedia is open and self-hostable. The hosted demo is free during early access.",
  },
  {
    q: "Can I keep my world private?",
    a: "Absolutely. Worlds and pages have three visibility levels: private (only you & invited members), unlisted (link-only), and public (indexed in Explore).",
  },
  {
    q: "Do I own my content?",
    a: "Always. You can export your account or any individual world as a ZIP of Markdown + JSON at any time.",
  },
  {
    q: "Does it support Markdown?",
    a: "Yes — full GitHub-flavored Markdown with tables, code, lists, and our [[wikilink]] syntax for cross-references between pages.",
  },
  {
    q: "Can I host it myself?",
    a: "Yes. The full stack is Next.js + Postgres. Clone the repo, set DATABASE_URL, run prisma migrate, and you're live.",
  },
  {
    q: "What about LLM scraping?",
    a: "Each world chooses whether to allow indexing. Private worlds always send noindex headers and are gated by authentication.",
  },
];

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute -top-32 left-1/3 h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-20 right-10 h-[30rem] w-[30rem] rounded-full bg-[hsl(var(--gold)/0.25)] blur-3xl" />
        </div>
        <div className="container py-20 md:py-28 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <BrandMark size={18} />
            <span>The worldbuilder’s wiki, reimagined.</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            Build your <span className="text-primary">fictional universe</span><br className="hidden md:block" />
            as a <span className="italic underline decoration-[hsl(var(--gold))] decoration-4 underline-offset-4">living wiki</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            Lorepedia is a self-hostable worldbuilding wiki for writers, GMs, and creators.
            Link characters, places, factions, and events with <code className="font-mono text-base text-primary">[[wikilinks]]</code>,
            publish a living encyclopedia, and never lose a thread of lore again.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium shadow-lg shadow-primary/20 hover:opacity-90"
            >
              Start your world — it’s free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-md border bg-background/80 backdrop-blur px-6 py-3 font-medium hover:bg-accent"
            >
              <Compass className="h-4 w-4" /> Explore demo worlds
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            No credit card. Self-hostable. Your lore stays yours.
          </p>
        </div>
      </section>

      {/* What is Lorepedia */}
      <section className="container py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">What is Lorepedia</p>
            <h2 className="font-serif text-4xl font-semibold mt-2 leading-tight">
              A real wiki for the worlds you invent.
            </h2>
            <p className="text-muted-foreground mt-5 leading-relaxed">
              Notes apps weren’t built for fiction. Wikis weren’t built for writers.
              Lorepedia gives you the structure of Wikipedia, the linking of Obsidian,
              and the workflow of a publishing tool — with privacy controls designed
              for unfinished, secret, and canonical lore living side by side.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex gap-2"><span className="text-[hsl(var(--gold))]">✦</span> Free, open, and self-hostable.</p>
              <p className="flex gap-2"><span className="text-[hsl(var(--gold))]">✦</span> Markdown + wikilinks, no proprietary format.</p>
              <p className="flex gap-2"><span className="text-[hsl(var(--gold))]">✦</span> Per-page privacy: private / unlisted / public.</p>
              <p className="flex gap-2"><span className="text-[hsl(var(--gold))]">✦</span> Export your entire universe in one click.</p>
            </div>
          </div>
          <div className="surface-parchment rounded-xl p-6 font-mono text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="h-2 w-2 rounded-full bg-destructive/70" />
              <span className="h-2 w-2 rounded-full bg-amber-500/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
              <span className="ml-2">eldoria/aria-vance.md</span>
            </div>
            <pre className="whitespace-pre-wrap text-foreground/90">
{`# Aria Vance

Princess of [[Eldoria]], heir to the
silver throne. Sworn rival of
[[The Ashen Court]] and former
apprentice of [[Master Calenor]].

## Notable events
- Born in [[Year 471 of the Concord]]
- Survived the [[Siege of Vermillion]]
- Forged the [[Sun-Wrought Blade]]`}
            </pre>
          </div>
        </div>
      </section>

      {/* Featured worlds */}
      {featured.length > 0 && (
        <section className="container py-16 max-w-6xl">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Demo worlds</p>
              <h2 className="font-serif text-3xl font-semibold mt-1">See what you can build.</h2>
            </div>
            <Link href="/explore" className="text-sm text-primary hover:underline">Browse all →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((w) => (
              <Link
                key={w.id}
                href={`/w/${w.slug}`}
                className="group block overflow-hidden rounded-lg border bg-card hover:border-primary/40 transition shadow-sm hover:shadow-md"
              >
                <div className="h-28 bg-gradient-to-br from-primary/25 via-accent to-[hsl(var(--gold)/0.25)]" aria-hidden />
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold group-hover:text-primary">{w.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{w.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">{w._count.pages} pages</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-y border-border/70 bg-card/40">
        <div className="container py-20 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Features</p>
            <h2 className="font-serif text-4xl font-semibold mt-2">Everything a worldbuilder needs.</h2>
            <p className="text-muted-foreground mt-3">From your first lone protagonist to a sprawling multi-author saga.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-parchment rounded-lg p-5">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-base font-semibold leading-snug">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="container py-20 max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Who it’s for</p>
          <h2 className="font-serif text-4xl font-semibold mt-2">If you build worlds, you need this.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDIENCES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-lg border bg-card p-6">
              <Icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-serif text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Self-hosting */}
      <section className="bg-gradient-to-br from-primary to-[hsl(252,55%,30%)] text-primary-foreground">
        <div className="container py-16 max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Self-hosting</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-2">Run it yourself in five minutes.</h2>
            <p className="opacity-90 mt-4 leading-relaxed">
              Lorepedia is built on Next.js + Postgres. Clone the repo, set
              <code className="mx-1 rounded bg-white/15 px-1.5 py-0.5 font-mono text-sm">DATABASE_URL</code>,
              run migrations, and you have a private wiki for your studio,
              your campaign, or your novel — fully under your control.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="https://github.com/rinsella/Lorepedia"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-5 py-2.5 font-medium hover:bg-white/90"
              >
                <Github className="h-4 w-4" /> View source on GitHub
              </a>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-2.5 font-medium hover:bg-white/10">
                Read the docs
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-black/30 p-5 font-mono text-xs leading-relaxed">
            <p className="opacity-60"># 1. clone & install</p>
            <p>git clone https://github.com/rinsella/Lorepedia</p>
            <p>cd Lorepedia && npm install</p>
            <p className="mt-3 opacity-60"># 2. configure</p>
            <p>cp .env.example .env</p>
            <p className="opacity-60"># …set DATABASE_URL & AUTH_SECRET</p>
            <p className="mt-3 opacity-60"># 3. run</p>
            <p>npx prisma migrate deploy</p>
            <p>npm run build && npm start</p>
            <p className="mt-3 text-[hsl(var(--gold))]">→ http://localhost:3000</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-20 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">FAQ</p>
          <h2 className="font-serif text-4xl font-semibold mt-2">Questions, answered.</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border bg-card p-5 open:bg-accent/40 transition"
            >
              <summary className="font-serif text-lg font-semibold cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-24 max-w-3xl text-center">
        <div className="surface-parchment rounded-2xl p-12">
          <BrandMark size={48} className="mx-auto" />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-5">
            Your universe is waiting to be archived.
          </h2>
          <p className="text-muted-foreground mt-3">
            Start free. No credit card. Export anytime.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-6 rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium shadow-lg shadow-primary/20 hover:opacity-90"
          >
            Create your first world <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
