import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, username: true, name: true, bio: true, website: true,
      createdAt: true,
    },
  });
  const worlds = await prisma.world.findMany({
    where: { ownerId: session.user.id, status: { not: "DELETED" } },
    include: {
      pages: {
        where: { deletedAt: null },
        select: {
          id: true, title: true, slug: true, summary: true, type: true,
          status: true, visibility: true, contentMarkdown: true,
          publishedAt: true, createdAt: true, updatedAt: true,
        },
      },
      tags: true,
      categories: true,
      templates: true,
    },
  });

  return new NextResponse(JSON.stringify({ user, worlds }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lorepedia-${session.user.id}.json"`,
    },
  });
}
