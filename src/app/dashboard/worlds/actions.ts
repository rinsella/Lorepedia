"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { worldCreateSchema } from "@/lib/validations";
import { isReservedSlug, slugify } from "@/lib/slug";
import { canDeleteWorld, canEditWorld } from "@/lib/permissions";
import { audit } from "@/lib/audit";

export async function createWorld(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = worldCreateSchema.safeParse({
    name: formData.get("name"),
    slug: String(formData.get("slug") ?? "").toLowerCase() || slugify(String(formData.get("name") ?? "")),
    description: formData.get("description") || undefined,
    visibility: formData.get("visibility") || "PRIVATE",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (isReservedSlug(parsed.data.slug)) return { error: "That slug is reserved." };

  // Quota
  const setting = await prisma.siteSetting.findUnique({ where: { key: "limits.maxWorldsPerUser" } });
  const max = typeof setting?.value === "number" ? (setting.value as number) : 10;
  const owned = await prisma.world.count({ where: { ownerId: user.id, status: { not: "DELETED" } } });
  if (owned >= max) return { error: `You can create at most ${max} worlds.` };

  const exists = await prisma.world.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return { error: "Slug already taken." };

  const world = await prisma.world.create({
    data: {
      ownerId: user.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  await audit({ actorId: user.id, action: "world.create", target: world.id });
  revalidatePath("/dashboard");
  redirect(`/dashboard/worlds/${world.slug}`);
}

export async function updateWorld(_: unknown, formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const world = await prisma.world.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!world) return { error: "Not found" };
  if (!canEditWorld(user, world, world.members)) return { error: "Forbidden" };

  const data: Record<string, unknown> = {};
  const name = formData.get("name");
  const description = formData.get("description");
  const visibility = formData.get("visibility");
  if (typeof name === "string" && name.trim()) data.name = name.trim().slice(0, 120);
  if (typeof description === "string") data.description = description.slice(0, 2000);
  if (typeof visibility === "string" && ["PRIVATE", "UNLISTED", "PUBLIC"].includes(visibility))
    data.visibility = visibility;

  await prisma.world.update({ where: { id }, data });
  await audit({ actorId: user.id, action: "world.update", target: id, metadata: data });
  revalidatePath(`/dashboard/worlds/${world.slug}`);
  return { ok: true };
}

export async function deleteWorld(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const world = await prisma.world.findUnique({ where: { id } });
  if (!world) return;
  if (!canDeleteWorld(user, world)) return;
  await prisma.world.update({ where: { id }, data: { status: "DELETED", deletedAt: new Date() } });
  await audit({ actorId: user.id, action: "world.delete", target: id });
  redirect("/dashboard");
}
