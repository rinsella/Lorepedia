import { prisma } from "@/lib/db";

export async function audit(opts: {
  actorId?: string | null;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: opts.actorId ?? null,
        action: opts.action,
        target: opts.target,
        metadata: (opts.metadata ?? {}) as any,
      },
    });
  } catch (e) {
    console.warn("[audit] failed:", e);
  }
}
