import { PrismaClient, UserRole, WorldVisibility, PageType, PageStatus, PageVisibility, WorldMemberRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugger from "github-slugger";

const prisma = new PrismaClient();
const slug = (s: string) => new slugger().slug(s);

async function upsertSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("[seed] SUPERADMIN_EMAIL/PASSWORD not set; skipping superadmin");
    return null;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.SUPERADMIN, passwordHash },
    create: {
      email,
      name: "Lorepedia Superadmin",
      username: "superadmin",
      role: UserRole.SUPERADMIN,
      passwordHash,
    },
  });
  console.log(`[seed] superadmin: ${email}`);
  return user;
}

async function upsertDemoUser() {
  const passwordHash = await bcrypt.hash("DemoUser123!", 12);
  return prisma.user.upsert({
    where: { email: "demo@lorepedia.net" },
    update: {},
    create: {
      email: "demo@lorepedia.net",
      name: "Demo Loremaster",
      username: "demo",
      role: UserRole.VERIFIED_USER,
      passwordHash,
    },
  });
}

async function seedSiteSettings() {
  const defaults: Record<string, unknown> = {
    "general.siteName": "Lorepedia",
    "general.tagline": "Your online universe wiki",
    "general.registrationEnabled": true,
    "general.maintenanceMode": false,
    "limits.maxWorldsPerUser": 10,
    "limits.maxUploadSizeMb": 10,
    "limits.storageMbPerUser": 500,
    "moderation.commentsEnabled": true,
    "moderation.requireApprovalForNewUsers": false,
    "security.captchaProvider": "none",
    "security.rateLimitEnabled": true,
    "seo.defaultTitle": "Lorepedia",
    "seo.defaultDescription": "Create your own online universe wiki.",
    "features.publicExplore": true,
    "features.aiHelper": false,
    "features.importMediaWiki": false,
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as any },
    });
  }
}

async function seedDemoWorld(ownerId: string) {
  const world = await prisma.world.upsert({
    where: { slug: "eldoria-archive" },
    update: {},
    create: {
      ownerId,
      name: "Eldoria Archive",
      slug: "eldoria-archive",
      description: "A demo world cataloguing the legends of the Eldorian continent.",
      visibility: WorldVisibility.PUBLIC,
      icon: null,
      language: "en",
    },
  });

  await prisma.worldMember.upsert({
    where: { worldId_userId: { worldId: world.id, userId: ownerId } },
    update: { role: WorldMemberRole.OWNER },
    create: { worldId: world.id, userId: ownerId, role: WorldMemberRole.OWNER },
  });

  const seedPages: Array<{ title: string; type: PageType; markdown: string; summary: string }> = [
    {
      title: "Kingdom of Arvandor",
      type: PageType.LOCATION,
      summary: "The high kingdom that anchors the western reaches of Eldoria.",
      markdown:
        "# Kingdom of Arvandor\n\nFounded after the [[War of Embers]], Arvandor is ruled by [[Queen Mirelle]] from the silver city of [[Highspire]].\n\n## History\nArvandor rose during the Second Age, when the noble houses united against the [[Ashen Legion]].",
    },
    {
      title: "Queen Mirelle",
      type: PageType.CHARACTER,
      summary: "Reigning queen of [[Kingdom of Arvandor]].",
      markdown:
        "# Queen Mirelle\n\nMirelle Vael of House Vael, born in [[Highspire]], crowned in 4172 after the death of her father.\n\n## Allies\n- [[Order of the Silver Quill]]\n- [[Highspire Guard]]",
    },
    {
      title: "Highspire",
      type: PageType.LOCATION,
      summary: "Capital of Arvandor.",
      markdown: "# Highspire\n\nThe silver city, capital of [[Kingdom of Arvandor]] and home of [[Queen Mirelle]].",
    },
    {
      title: "Ashen Legion",
      type: PageType.FACTION,
      summary: "An exiled order of war-mages.",
      markdown: "# Ashen Legion\n\nA militant order broken at the [[War of Embers]] but rumored to gather again in the eastern wastes.",
    },
    {
      title: "War of Embers",
      type: PageType.EVENT,
      summary: "Decisive war that birthed Arvandor.",
      markdown: "# War of Embers\n\nFought between the noble houses and the [[Ashen Legion]]. Ended with the founding of [[Kingdom of Arvandor]].",
    },
  ];

  for (const p of seedPages) {
    await prisma.page.upsert({
      where: { worldId_slug: { worldId: world.id, slug: slug(p.title) } },
      update: {},
      create: {
        worldId: world.id,
        title: p.title,
        slug: slug(p.title),
        summary: p.summary,
        type: p.type,
        status: PageStatus.PUBLISHED,
        visibility: PageVisibility.PUBLIC,
        contentMarkdown: p.markdown,
        publishedAt: new Date(),
        createdById: ownerId,
        updatedById: ownerId,
      },
    });
  }

  // Seed a couple of tags
  for (const t of ["lore", "demo", "arvandor"]) {
    await prisma.tag.upsert({
      where: { worldId_slug: { worldId: world.id, slug: slug(t) } },
      update: {},
      create: { worldId: world.id, name: t, slug: slug(t) },
    });
  }

  // Templates
  await prisma.template.create({
    data: {
      worldId: world.id,
      name: "Character",
      description: "Standard character sheet",
      type: PageType.CHARACTER,
      schemaJson: {
        fields: [
          "Name", "Aliases", "Species/Race", "Age", "Pronouns", "Occupation",
          "Affiliation", "Status", "Appearance", "Personality", "Backstory",
          "Goals", "Secrets", "Relationships", "Timeline", "Quotes", "Related Pages",
        ],
      },
      bodyMarkdown: "# {{Name}}\n\n## Appearance\n\n## Personality\n\n## Backstory\n",
    },
  });
}

async function main() {
  console.log("[seed] starting");
  await seedSiteSettings();
  const superadmin = await upsertSuperadmin();
  const demo = await upsertDemoUser();
  const ownerId = superadmin?.id ?? demo.id;
  if (process.env.PUBLIC_DEMO_WORLD_ENABLED !== "false") {
    await seedDemoWorld(ownerId);
  }
  console.log("[seed] done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
