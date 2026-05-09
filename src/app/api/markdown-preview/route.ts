import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ html: "" }, { status: 401 });

  const { markdown, worldSlug } = await req.json().catch(() => ({}));
  if (typeof markdown !== "string") return NextResponse.json({ html: "" }, { status: 400 });

  let resolvedSlugs = new Set<string>();
  let slug = "preview";
  if (typeof worldSlug === "string" && worldSlug) {
    const world = await prisma.world.findUnique({ where: { slug: worldSlug }, select: { id: true, slug: true } });
    if (world) {
      slug = world.slug;
      const pages = await prisma.page.findMany({
        where: { worldId: world.id, deletedAt: null },
        select: { slug: true },
      });
      resolvedSlugs = new Set(pages.map((p) => p.slug));
    }
  }
  const html = await renderMarkdown(markdown.slice(0, 100_000), { worldSlug: slug, resolvedSlugs });
  return NextResponse.json({ html });
}
