import { prisma } from "@/lib/db";

function safe(name: string) {
  return Boolean(process.env[name] && process.env[name]!.length > 0);
}

export default async function Diagnostics() {
  let dbOk = true;
  let dbError = "";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    dbOk = false;
    dbError = e?.message ?? String(e);
  }

  const checks = [
    { label: "DATABASE_URL set", ok: safe("DATABASE_URL") },
    { label: "NEXTAUTH_SECRET set", ok: safe("NEXTAUTH_SECRET") },
    { label: "APP_URL set", ok: safe("APP_URL") },
    { label: "Database reachable", ok: dbOk, detail: dbError },
    { label: "STORAGE_DRIVER", ok: !!process.env.STORAGE_DRIVER, detail: process.env.STORAGE_DRIVER ?? "unset" },
  ];

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="font-serif text-2xl font-semibold">Diagnostics</h1>
      <ul className="divide-y rounded-lg border bg-card text-sm">
        {checks.map((c) => (
          <li key={c.label} className="p-3 flex items-center justify-between">
            <span>{c.label}</span>
            <span className={c.ok ? "text-primary" : "text-destructive"}>
              {c.ok ? "OK" : "FAIL"}
              {c.detail ? <span className="text-xs text-muted-foreground ml-2">{c.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Secrets are never displayed; only presence is shown.</p>
    </div>
  );
}
