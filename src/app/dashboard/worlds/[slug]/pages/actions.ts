"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { pageCreateSchema, pageUpdateSchema } from "@/lib/validations";
import { isReservedSlug, slugify } from "@/lib/slug";
import { canCreatePage, canEditPage, canPublishPage } from "@/lib/permissions";
import { syncPageLinks, refreshIncomingLinks } from "@/lib/links";
import { audit } from "@/lib/audit";

async function loadWorldWithMembers(worldId: string) {
  return prisma.world.findUnique({ where: { id: worldId }, include: { members: true } });
}

export async function createPage(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = pageCreateSchema.safeParse({
    worldId: formData.get("worldId"),
    title: formData.get("title"),
    type: formData.get("type") || "ARTICLE",
    summary: formData.get("summary") || undefined,
    contentMarkdown: formData.get("contentMarkdown") || "",
    visibility: formData.get("visibility") || "PRIVATE",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const world = await loadWorldWithMembers(parsed.data.worldId);
  if (!world) return { error: "World not found" };
  if (!canCreatePage(user, world, world.members)) return { error: "Forbidden" };

  let slug = slugify(parsed.data.title);
  if (isReservedSlug(slug)) slug = `${slug}-page`;
  // Ensure unique slug
  for (let i = 1; ; i++) {
    const exists = await prisma.page.findUnique({ where: { worldId_slug: { worldId: world.id, slug } } });
    if (!exists) break;
    slug = `${slugify(parsed.data.title)}-${i}`;
  }

  const page = await prisma.page.create({
    data: {
      worldId: world.id,
      title: parsed.data.title,
      slug,
      summary: parsed.data.summary,
      type: parsed.data.type,
      contentMarkdown: parsed.data.contentMarkdown,
      visibility: parsed.data.visibility,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  await syncPageLinks(page.id);
  await refreshIncomingLinks(world.id, slug, page.id);
  await audit({ actorId: user.id, action: "page.create", target: page.id });
  revalidatePath(`/dashboard/worlds/${world.slug}`);
  redirect(`/dashboard/worlds/${world.slug}/pages/${slug}`);
}

export async function updatePage(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = pageUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title") ?? undefined,
    summary: formData.get("summary") ?? undefined,
    contentMarkdown: formData.get("contentMarkdown") ?? undefined,
    status: formData.get("status") ?? undefined,
    visibility: formData.get("visibility") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const page = await prisma.page.findUnique({ where: { id: parsed.data.id } });
  if (!page) return { error: "Not found" };
  const world = await loadWorldWithMembers(page.worldId);
  if (!world) return { error: "Not found" };
  if (!canEditPage(user, world, page, world.members)) return { error: "Forbidden" };
  if (parsed.data.status === "PUBLISHED" && !canPublishPage(user, world, world.members)) {
    return { error: "You cannot publish pages in this world." };
  }

  const data: Record<string, unknown> = { updatedById: user.id };
  let titleChanged = false;
  let newSlug: string | null = null;

  if (parsed.data.title && parsed.data.title !== page.title) {
    data.title = parsed.data.title;
    let slug = slugify(parsed.data.title);
    if (isReservedSlug(slug)) slug = `${slug}-page`;
    if (slug !== page.slug) {
      for (let i = 1; ; i++) {
        const exists = await prisma.page.findUnique({ where: { worldId_slug: { worldId: world.id, slug } } });
        if (!exists || exists.id === page.id) break;
        slug = `${slugify(parsed.data.title)}-${i}`;
      }
      data.slug = slug;
      newSlug = slug;
      titleChanged = true;
    }
  }
  if (parsed.data.summary !== undefined) data.summary = parsed.data.summary;
  if (parsed.data.contentMarkdown !== undefined) data.contentMarkdown = parsed.data.contentMarkdown;
  if (parsed.data.visibility) data.visibility = parsed.data.visibility;
  if (parsed.data.status) {
    data.status = parsed.data.status;
    if (parsed.data.status === "PUBLISHED" && !page.publishedAt) data.publishedAt = new Date();
  }

  // Save a version snapshot before updating
  const lastVersion = await prisma.pageVersion.findFirst({
    where: { pageId: page.id },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  await prisma.pageVersion.create({
    data: {
      pageId: page.id,
      version: (lastVersion?.version ?? 0) + 1,
      title: page.title,
      contentMarkdown: page.contentMarkdown,
      authorId: user.id,
    },
  });

  const updated = await prisma.page.update({ where: { id: page.id }, data });
  await syncPageLinks(updated.id);
  if (titleChanged && newSlug) {
    // Old slug is now broken; new slug may resolve previously-broken links.
    await refreshIncomingLinks(world.id, page.slug, null);
    await refreshIncomingLinks(world.id, newSlug, updated.id);
  }
  await audit({ actorId: user.id, action: "page.update", target: page.id });
  revalidatePath(`/dashboard/worlds/${world.slug}`);
  revalidatePath(`/w/${world.slug}/${updated.slug}`);
  return { ok: true, slug: updated.slug };
}

export async function deletePage(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return;
  const world = await loadWorldWithMembers(page.worldId);
  if (!world) return;
  if (!canEditPage(user, world, page, world.members)) return;
  await prisma.page.update({ where: { id }, data: { deletedAt: new Date(), status: "DELETED" } });
  await refreshIncomingLinks(page.worldId, page.slug, null);
  await audit({ actorId: user.id, action: "page.delete", target: id });
  redirect(`/dashboard/worlds/${world.slug}`);
}
