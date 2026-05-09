import { prisma } from "@/lib/db";

export default async function AdminHome() {
  const [users, worlds, pages, reports] = await Promise.all([
    prisma.user.count(),
    prisma.world.count({ where: { status: { not: "DELETED" } } }),
    prisma.page.count({ where: { deletedAt: null } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);
  const stats = [
    { label: "Users", value: users },
    { label: "Worlds", value: worlds },
    { label: "Pages", value: pages },
    { label: "Open reports", value: reports },
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Admin</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
