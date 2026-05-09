import { NextResponse } from "next/server";
import archiver from "archiver";
import { Readable } from "node:stream";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditWorld } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });
  if (!world) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canEditWorld(session?.user, world, world.members)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pages = await prisma.page.findMany({
    where: { worldId: world.id, deletedAt: null },
  });
  const tags = await prisma.tag.findMany({ where: { worldId: world.id } });
  const categories = await prisma.category.findMany({ where: { worldId: world.id } });
  const templates = await prisma.template.findMany({ where: { worldId: world.id } });

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (c) => chunks.push(c));
  const done = new Promise<void>((resolve, reject) => {
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });

  archive.append(
    JSON.stringify(
      { world: { ...world, members: undefined }, tags, categories, templates },
      null,
      2,
    ),
    { name: "world.json" },
  );
  for (const p of pages) {
    const front = [
      "---",
      `title: ${JSON.stringify(p.title)}`,
      `slug: ${p.slug}`,
      `type: ${p.type}`,
      `status: ${p.status}`,
      `visibility: ${p.visibility}`,
      p.summary ? `summary: ${JSON.stringify(p.summary)}` : null,
      p.publishedAt ? `publishedAt: ${p.publishedAt.toISOString()}` : null,
      "---",
      "",
    ]
      .filter(Boolean)
      .join("\n");
    archive.append(front + p.contentMarkdown, { name: `pages/${p.slug}.md` });
  }
  archive.append(JSON.stringify(pages, null, 2), { name: "pages.json" });

  await archive.finalize();
  await done;

  const buf = Buffer.concat(chunks);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${world.slug}.zip"`,
    },
  });
}
