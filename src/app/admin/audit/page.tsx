import { prisma } from "@/lib/db";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Audit log</h1>
      <ul className="divide-y rounded-lg border bg-card text-sm">
        {logs.map((l) => (
          <li key={l.id} className="p-3 flex items-center justify-between">
            <div>
              <span className="font-mono">{l.action}</span> {l.target ? <span className="text-muted-foreground">→ {l.target}</span> : null}
              <p className="text-xs text-muted-foreground">{l.actor?.email ?? "system"} · {l.createdAt.toISOString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
