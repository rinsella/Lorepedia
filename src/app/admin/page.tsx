import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge, VisibilityBadge } from "@/components/ui/badges";
import {
  Users, Globe2, BookOpen, MessageSquare, AlertTriangle,
  Activity, Shield, FileText, ArrowUpRight, EyeOff,
} from "lucide-react";

export const metadata = { title: "Admin · Overview" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await auth();

  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    users, usersNew, worlds, worldsPublic, pages, pagesPublished,
    comments, commentsHidden, reports, openReports,
    suspendedUsers, archivedWorlds, recentAudit, recentUsers, recentWorlds, recentReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since7 } } }),
    prisma.world.count({ where: { status: { not: "DELETED" } } }),
    prisma.world.count({ where: { visibility: "PUBLIC", status: "ACTIVE" } }),
    prisma.page.count({ where: { deletedAt: null } }),
    prisma.page.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: "HIDDEN" } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.world.count({ where: { status: "ARCHIVED" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { actor: { select: { email: true, username: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, username: true, role: true, status: true, createdAt: true },
    }),
    prisma.world.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { owner: { select: { email: true, username: true } }, _count: { select: { pages: true } } },
    }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { reporter: { select: { email: true, username: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Admin</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session?.user?.name ?? session?.user?.email}. Here’s the current state of Lorepedia.
        </p>
      </header>

      <section>
        <SectionHeader eyebrow="Platform" title="At a glance" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <StatCard label="Users" value={users} hint={`+${usersNew} this week`} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Worlds" value={worlds} hint={`${worldsPublic} public`} icon={<Globe2 className="h-5 w-5" />} accent="gold" />
          <StatCard label="Pages" value={pages} hint={`${pagesPublished} published`} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard label="Comments" value={comments} hint={`${commentsHidden} hidden`} icon={<MessageSquare className="h-5 w-5" />} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard label="Open reports" value={openReports} hint={`${reports} total`} icon={<AlertTriangle className="h-5 w-5" />} accent={openReports > 0 ? "destructive" : "muted"} />
          <StatCard label="Suspended users" value={suspendedUsers} icon={<EyeOff className="h-5 w-5" />} accent="muted" />
          <StatCard label="Archived worlds" value={archivedWorlds} icon={<FileText className="h-5 w-5" />} accent="muted" />
          <StatCard label="Audit events" value={recentAudit.length > 0 ? "live" : "—"} hint="last 12 shown below" icon={<Activity className="h-5 w-5" />} accent="primary" />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader
            title="Recent activity"
            eyebrow="Audit log"
            actions={<Link href="/admin/audit" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>}
          />
          <div className="rounded-lg border bg-card mt-4 divide-y">
            {recentAudit.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              recentAudit.map((a) => (
                <div key={a.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.actor?.username ?? a.actor?.email ?? "system"}
                      {a.target && ` · ${a.target.slice(0, 30)}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{a.createdAt.toISOString().slice(5, 16).replace("T", " ")}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <SectionHeader
            title="Open reports"
            eyebrow="Moderation"
            actions={<Link href="/admin/reports" className="text-xs text-primary hover:underline inline-flex items-center gap-1">Manage <ArrowUpRight className="h-3 w-3" /></Link>}
          />
          <div className="rounded-lg border bg-card mt-4 divide-y">
            {recentReports.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No open reports. The realm is at peace.</p>
            ) : (
              recentReports.map((r) => (
                <div key={r.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.targetType}: {r.targetId.slice(0, 12)}</p>
                    <p className="text-xs text-muted-foreground truncate">By {r.reporter.username ?? r.reporter.email} — {r.reason.slice(0, 60)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader title="Newest users" actions={<Link href="/admin/users" className="text-xs text-primary hover:underline">All users →</Link>} />
          <div className="rounded-lg border bg-card mt-4 divide-y">
            {recentUsers.map((u) => (
              <div key={u.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/admin/users?q=${encodeURIComponent(u.email)}`} className="font-medium hover:underline truncate block">
                    {u.username ?? u.email}
                  </Link>
                  <p className="text-xs text-muted-foreground">{u.email} · {u.role.toLowerCase()}</p>
                </div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title="Newest worlds" actions={<Link href="/admin/worlds" className="text-xs text-primary hover:underline">All worlds →</Link>} />
          <div className="rounded-lg border bg-card mt-4 divide-y">
            {recentWorlds.map((w) => (
              <div key={w.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/w/${w.slug}`} className="font-medium hover:underline truncate block">{w.name}</Link>
                  <p className="text-xs text-muted-foreground">by {w.owner.username ?? w.owner.email} · {w._count.pages} pages</p>
                </div>
                <VisibilityBadge visibility={w.visibility} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-serif font-semibold">Quick actions</p>
            <p className="text-xs text-muted-foreground">Jump to common admin tasks.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <Link href="/admin/reports" className="rounded-md border bg-background p-4 hover:border-primary/40 hover:bg-accent transition">
            <p className="font-medium text-sm">Review open reports</p>
            <p className="text-xs text-muted-foreground mt-0.5">{openReports} waiting</p>
          </Link>
          <Link href="/admin/comments" className="rounded-md border bg-background p-4 hover:border-primary/40 hover:bg-accent transition">
            <p className="font-medium text-sm">Moderate comments</p>
            <p className="text-xs text-muted-foreground mt-0.5">{commentsHidden} hidden</p>
          </Link>
          <Link href="/admin/settings" className="rounded-md border bg-background p-4 hover:border-primary/40 hover:bg-accent transition">
            <p className="font-medium text-sm">Site settings</p>
            <p className="text-xs text-muted-foreground mt-0.5">Branding, registration, limits</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
