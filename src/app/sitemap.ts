import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const worlds = await prisma.world.findMany({
    where: { visibility: "PUBLIC", status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });
  const pages = await prisma.page.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      deletedAt: null,
      world: { visibility: "PUBLIC", status: "ACTIVE" },
    },
    select: { slug: true, updatedAt: true, world: { select: { slug: true } } },
    take: 5000,
  });

  return [
    { url: absoluteUrl("/"), lastModified: new Date() },
    { url: absoluteUrl("/explore"), lastModified: new Date() },
    ...worlds.map((w) => ({
      url: absoluteUrl(`/w/${w.slug}`),
      lastModified: w.updatedAt,
    })),
    ...pages.map((p) => ({
      url: absoluteUrl(`/w/${p.world.slug}/${p.slug}`),
      lastModified: p.updatedAt,
    })),
  ];
}
