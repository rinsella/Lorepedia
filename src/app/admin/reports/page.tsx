import { prisma } from "@/lib/db";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { reporter: { select: { email: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Reports</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground">No reports.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {reports.map((r) => (
            <li key={r.id} className="p-3 text-sm">
              <p className="font-medium">{r.targetType}:{r.targetId}</p>
              <p>{r.reason}</p>
              <p className="text-xs text-muted-foreground">By {r.reporter.email} · {r.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
