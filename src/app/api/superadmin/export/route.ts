import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessSuperadmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!canAccessSuperadmin(session?.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Pull all data EXCEPT sensitive fields. Password hashes and Auth.js tokens excluded.
  const [users, worlds, members, pages, links, tags, pageTags, categories, templates, comments, reactions, bookmarks, settings, audits, themes] =
    await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, email: true, username: true, name: true, image: true, bio: true,
          website: true, role: true, status: true, createdAt: true, updatedAt: true,
        },
      }),
      prisma.world.findMany(),
      prisma.worldMember.findMany(),
      prisma.page.findMany(),
      prisma.pageLink.findMany(),
      prisma.tag.findMany(),
      prisma.pageTag.findMany(),
      prisma.category.findMany(),
      prisma.template.findMany(),
      prisma.comment.findMany(),
      prisma.reaction.findMany(),
      prisma.bookmark.findMany(),
      prisma.siteSetting.findMany(),
      prisma.auditLog.findMany({ take: 5000, orderBy: { createdAt: "desc" } }),
      prisma.theme.findMany(),
    ]);

  await audit({ actorId: session!.user.id, action: "superadmin.export" });

  const payload = {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    users, worlds, members, pages, links, tags, pageTags, categories,
    templates, comments, reactions, bookmarks, settings, audits, themes,
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lorepedia-export-${Date.now()}.json"`,
    },
  });
}
