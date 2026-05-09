import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { WorldCard } from "@/components/ui/world-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTypeBadge, StatusBadge } from "@/components/ui/badges";
import {
  Globe2, BookOpen, FileText, MessageSquare, PlusCircle, Sparkles,
  Compass, Bookmark as BookmarkIcon,
} from "lucide-react";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user.id;

  const [worlds, pageCount, draftCount, publishedCount, recentPages] = await Promise.all([
    prisma.world.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }], status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { _count: { select: { pages: true, members: true } } },
    }),
    prisma.page.count({ where: { createdById: userId, deletedAt: null } }),
    prisma.page.count({ where: { createdById: userId, status: "DRAFT", deletedAt: null } }),
    prisma.page.count({ where: { createdById: userId, status: "PUBLISHED", deletedAt: null } }),
    prisma.page.findMany({
      where: { createdById: userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { world: { select: { slug: true, name: true } } },
    }),
  ]);

  const onboarding = [
    { done: worlds.length > 0, label: "Create your first world", href: "/dashboard/worlds/new" },
    { done: pageCount > 0, label: "Write your first page", href: worlds[0] ? `/dashboard/worlds/${worlds[0].slug}/pages/new` : "/dashboard/worlds/new" },
    { done: publishedCount > 0, label: "Publish a page", href: worlds[0] ? `/dashboard/worlds/${worlds[0].slug}` : "/dashboard/worlds/new" },
    { done: worlds.some((w) => w.visibility === "PUBLIC"), label: "Make a world public", href: worlds[0] ? `/dashboard/worlds/${worlds[0].slug}/settings` : "/dashboard/worlds/new" },
  ];
  const onboardingDone = onboarding.filter((o) => o.done).length;

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Your archive</p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold mt-1 break-words">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}.
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You have written {pageCount} page{pageCount === 1 ? "" : "s"} across {worlds.length} world{worlds.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/worlds/new" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 sm:px-4 py-2 text-sm font-medium hover:opacity-90 flex-1 sm:flex-none justify-center">
            <PlusCircle className="h-4 w-4" /> New world
          </Link>
          <Link href="/explore" className="inline-flex items-center gap-2 rounded-md border bg-background px-3 sm:px-4 py-2 text-sm font-medium hover:bg-accent flex-1 sm:flex-none justify-center">
            <Compass className="h-4 w-4" /> Explore
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Worlds" value={worlds.length} icon={<Globe2 className="h-5 w-5" />} accent="primary" />
        <StatCard label="Total pages" value={pageCount} icon={<BookOpen className="h-5 w-5" />} accent="gold" />
        <StatCard label="Published" value={publishedCount} icon={<FileText className="h-5 w-5" />} hint={`${draftCount} drafts`} />
        <StatCard label="Comments" value={0} icon={<MessageSquare className="h-5 w-5" />} accent="muted" />
      </section>

      {onboardingDone < onboarding.length && (
        <section className="surface-parchment rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[hsl(var(--gold))]" />
              <h2 className="font-serif text-xl font-semibold">Get started</h2>
            </div>
            <span className="text-sm text-muted-foreground">{onboardingDone}/{onboarding.length} complete</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[hsl(var(--gold))] transition-all"
              style={{ width: `${(onboardingDone / onboarding.length) * 100}%` }}
            />
          </div>
          <ul className="mt-5 space-y-2">
            {onboarding.map((step) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className={`flex items-center gap-3 rounded-md p-3 hover:bg-accent transition ${step.done ? "opacity-60" : ""}`}
                >
                  <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs ${step.done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}>
                    {step.done ? "✓" : ""}
                  </span>
                  <span className={step.done ? "line-through" : "font-medium"}>{step.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHeader
          title="Your worlds"
          actions={<Link href="/dashboard/worlds/new" className="text-sm text-primary hover:underline">+ New world</Link>}
        />
        <div className="mt-5">
          {worlds.length === 0 ? (
            <EmptyState
              icon={<Globe2 className="h-5 w-5" />}
              title="No worlds yet."
              description="Create your first world to start building lore."
              actionLabel="Create world"
              actionHref="/dashboard/worlds/new"
            />
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {worlds.map((w) => (
                <li key={w.id}>
                  <WorldCard
                    href={`/dashboard/worlds/${w.slug}`}
                    name={w.name}
                    description={w.description}
                    visibility={w.visibility}
                    pageCount={w._count.pages}
                    memberCount={w._count.members}
                    cover={w.cover}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {recentPages.length > 0 && (
        <section>
          <SectionHeader title="Recently edited pages" />
          <div className="mt-4 rounded-lg border bg-card divide-y">
            {recentPages.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/worlds/${p.world.slug}/pages/${p.slug}`}
                className="flex items-center justify-between gap-3 p-4 hover:bg-accent/40 transition"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">in {p.world.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PageTypeBadge type={p.type} />
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
