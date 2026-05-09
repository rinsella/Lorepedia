import { prisma } from "@/lib/db";

/**
 * Simple database-backed sliding-window rate limiter.
 * Key strategy: `${bucket}:${identifier}` (e.g. "login:ip:1.2.3.4").
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: boolean; remaining: number; reset: Date }> {
  const now = Date.now();
  const windowEnd = new Date(Math.ceil((now + 1) / opts.windowMs) * opts.windowMs);

  const existing = await prisma.rateLimit.upsert({
    where: { key_windowEnd: { key: opts.key, windowEnd } },
    update: { count: { increment: 1 } },
    create: { key: opts.key, count: 1, windowEnd },
  });

  // Best-effort cleanup of expired rows (cheap probabilistic gc).
  if (Math.random() < 0.01) {
    await prisma.rateLimit
      .deleteMany({ where: { windowEnd: { lt: new Date(now - opts.windowMs) } } })
      .catch(() => {});
  }

  const ok = existing.count <= opts.limit;
  return { ok, remaining: Math.max(0, opts.limit - existing.count), reset: windowEnd };
}

export function clientIp(headers: Headers): string {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
