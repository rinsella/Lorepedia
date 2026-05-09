import {
  PrismaClient, UserRole, WorldVisibility, PageType, PageStatus, PageVisibility,
  WorldMemberRole, WorldStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import slugger from "github-slugger";

const prisma = new PrismaClient();
const slug = (s: string) => new slugger().slug(s);

interface SeedPage {
  title: string;
  type: PageType;
  summary: string;
  markdown: string;
  infobox?: Record<string, unknown>;
}

interface SeedTimelineEvent {
  title: string;
  date: string;
  description: string;
  sortKey: number;
}

interface SeedWorld {
  name: string;
  slug: string;
  description: string;
  language: string;
  pages: SeedPage[];
  tags: string[];
  categories: string[];
  templates: Array<{ name: string; type: PageType; description: string; body: string }>;
  timeline: SeedTimelineEvent[];
}

// ─────────────────────────────────────────────────────────────────────────
// World 1 — Eldoria Archive (high fantasy)
// ─────────────────────────────────────────────────────────────────────────

const ELDORIA: SeedWorld = {
  name: "Eldoria Archive",
  slug: "eldoria-archive",
  description:
    "A high-fantasy continent of silver cities, ashen wastes, and an old war that refuses to end. The official Lorepedia demo world.",
  language: "en",
  tags: ["lore", "houses", "magic", "ashen-legion", "arvandor"],
  categories: ["Royalty", "Cities", "Wars", "Mages", "Artifacts"],
  templates: [
    {
      name: "Character",
      type: PageType.CHARACTER,
      description: "Standard character sheet",
      body: "# {{Name}}\n\n## Appearance\n\n## Personality\n\n## Backstory\n",
    },
    {
      name: "Location",
      type: PageType.LOCATION,
      description: "Geography & history of a place",
      body: "# {{Name}}\n\n## Geography\n\n## History\n\n## Notable inhabitants\n",
    },
  ],
  timeline: [
    { title: "Founding of the Concord", date: "Year 1 of the Concord", description: "The seven noble houses sign the Concord of Embers, ending centuries of clan warfare.", sortKey: 1 },
    { title: "War of Embers begins", date: "Year 4163", description: "The Ashen Legion rises in the eastern wastes. Highspire is besieged.", sortKey: 2 },
    { title: "Battle of Vermillion Pass", date: "Year 4170", description: "Princess Aria Vance leads the Silver Quill against the Legion.", sortKey: 3 },
    { title: "Coronation of Mirelle", date: "Year 4172", description: "Mirelle Vael is crowned Queen of Arvandor.", sortKey: 4 },
    { title: "Founding of the Silver Archive", date: "Year 4175", description: "The Order of the Silver Quill establishes a public archive in Highspire.", sortKey: 5 },
  ],
  pages: [
    {
      title: "Kingdom of Arvandor",
      type: PageType.LOCATION,
      summary: "The high kingdom that anchors the western reaches of Eldoria.",
      infobox: { Type: "Kingdom", Capital: "Highspire", Founded: "Year 1 of the Concord", Ruler: "[[Queen Mirelle]]", Population: "~4.2 million", Language: "Old Arvan" },
      markdown: `# Kingdom of Arvandor

Founded after the [[War of Embers]], **Arvandor** is the largest of the seven realms of Eldoria, ruled from the silver city of [[Highspire]] by [[Queen Mirelle]] of House Vael.

## Geography
The kingdom stretches from the [[Vermillion Pass]] in the east to the windward cliffs of the western coast. Three great rivers — the Silvan, the Calenor, and the Mire — meet at the city of [[Highspire]].

## History
Arvandor rose during the Second Age, when the noble houses united against the [[Ashen Legion]]. The signing of the **Concord of Embers** in Year 1 marked the founding of the kingdom. After the [[War of Embers]] ended in 4172, [[Queen Mirelle]] was crowned and a new era began.

## Notable cities
- [[Highspire]] — capital, seat of the silver throne
- [[Vermillion Pass]] — fortified gateway to the east

## Government
A constitutional monarchy. The Queen rules with the advice of the **Council of Quills** (see [[Order of the Silver Quill]]).`,
    },
    {
      title: "Queen Mirelle",
      type: PageType.CHARACTER,
      summary: "Reigning queen of Arvandor, daughter of the late King Aldric Vael.",
      infobox: { "Full name": "Mirelle Vael of House Vael", Born: "Year 4145", Title: "Queen of Arvandor", House: "Vael", Spouse: "—", Heirs: "[[Princess Aria Vance]]" },
      markdown: `# Queen Mirelle

Mirelle Vael, born in [[Highspire]] in the Year 4145, was crowned Queen of [[Kingdom of Arvandor]] in 4172 after the death of her father at the close of the [[War of Embers]].

## Reign
Her early reign focused on rebuilding the eastern marches devastated by the [[Ashen Legion]]. She founded the [[Order of the Silver Quill]] as a civilian archive to ensure no era of Arvandor would again be forgotten.

## Allies
- [[Order of the Silver Quill]]
- [[Highspire Guard]]
- [[Princess Aria Vance]] — her sworn ward

## Rivals
- [[Master Calenor]] — exiled court mage`,
    },
    {
      title: "Princess Aria Vance",
      type: PageType.CHARACTER,
      summary: "Heir-presumptive of Arvandor, war-hero of the Battle of Vermillion Pass.",
      infobox: { "Full name": "Aria Vance of House Vance", Born: "Year 4153", Title: "Princess of Arvandor", Mentor: "[[Master Calenor]] (formerly)", Wields: "[[Sun-Wrought Blade]]" },
      markdown: `# Princess Aria Vance

Princess of [[Kingdom of Arvandor]], heir-presumptive to the silver throne, sworn ward of [[Queen Mirelle]] and former apprentice of [[Master Calenor]].

## Notable deeds
- Survived the [[Battle of Vermillion Pass]] at age seventeen.
- Forged the [[Sun-Wrought Blade]] in the cinder-forges of [[Highspire]].
- Negotiated a fragile truce with the [[Ashen Legion]]'s remnants in 4179.

## Personality
Stoic, plain-spoken, allergic to court intrigue. She prefers the company of soldiers and scribes to courtiers.

## Quotes
> *"A blade is a question. The wielder is the answer."* — Aria, on the night of her vigil.`,
    },
    {
      title: "Highspire",
      type: PageType.LOCATION,
      summary: "The silver city, capital of Arvandor.",
      infobox: { Type: "Capital city", Population: "~210,000", Ruler: "[[Queen Mirelle]]", Founded: "Year 1 of the Concord" },
      markdown: `# Highspire

The silver city, capital of [[Kingdom of Arvandor]] and seat of [[Queen Mirelle]].

## Districts
- **The Spire** — the royal palace, carved from a single quartz mountain.
- **The Quill Quarter** — home of the [[Order of the Silver Quill]] and its public archive.
- **The Cinder Forges** — where the [[Sun-Wrought Blade]] was made.

## Notable inhabitants
- [[Queen Mirelle]]
- [[Princess Aria Vance]]
- [[Master Calenor]] (in exile)`,
    },
    {
      title: "Vermillion Pass",
      type: PageType.LOCATION,
      summary: "Fortified mountain pass; gateway to the eastern wastes.",
      infobox: { Type: "Fortress / pass", Garrison: "[[Highspire Guard]]", "Famous for": "[[Battle of Vermillion Pass]]" },
      markdown: `# Vermillion Pass

A high fortified pass through the Iron Spine mountains, separating the heartland of [[Kingdom of Arvandor]] from the [[Ashen Wastes]].

It is most famous for the [[Battle of Vermillion Pass]], in which a thousand soldiers under [[Princess Aria Vance]] held the pass against ten thousand of the [[Ashen Legion]] for nine days.`,
    },
    {
      title: "Ashen Legion",
      type: PageType.FACTION,
      summary: "An exiled order of war-mages who fought to break the Concord.",
      infobox: { Founded: "Before the Concord", Status: "Broken; remnants active", "Sworn enemy": "[[Order of the Silver Quill]]" },
      markdown: `# Ashen Legion

A militant order of war-mages, broken at the [[War of Embers]] but rumored to gather again in the [[Ashen Wastes]].

## Doctrine
The Legion holds that magic must rule, and that the [[Concord of Embers]] was an act of cowardice by the noble houses.

## Notable members
- **Warmaster Korvain** (deceased, killed at [[Vermillion Pass]])
- **The Cinderspeaker** (current, identity unknown)
- [[Master Calenor]] — rumored sympathizer`,
    },
    {
      title: "Order of the Silver Quill",
      type: PageType.FACTION,
      summary: "The royal archivists and chroniclers of Arvandor.",
      infobox: { Founded: "Year 4175", Headquarters: "[[Highspire]]", Patron: "[[Queen Mirelle]]" },
      markdown: `# Order of the Silver Quill

A scholarly order founded by [[Queen Mirelle]] in the Year 4175, charged with maintaining the public archive of [[Kingdom of Arvandor]] and chronicling the deeds of its people.

## Doctrine
> *"What is not written is not remembered. What is not remembered is lost."*

The Quill is sworn to political neutrality. Its archivists may not hold noble titles or military rank.

## Famous works
- *The Embers Chronicle* — official history of the [[War of Embers]].
- *The Silver Compendium* — biographical archive of every monarch of [[Kingdom of Arvandor]].`,
    },
    {
      title: "Master Calenor",
      type: PageType.CHARACTER,
      summary: "Former court mage of Arvandor, now in exile.",
      infobox: { Born: "Year 4080", Title: "Master Mage (formerly)", Status: "Exiled", "Last seen": "[[Ashen Wastes]]" },
      markdown: `# Master Calenor

Once the chief court mage of [[Kingdom of Arvandor]] and tutor to [[Princess Aria Vance]]. Exiled in 4178 after refusing to renounce contact with the [[Ashen Legion]].

## Reputation
Calenor is a brilliant theorist of fire-magic. Whether he is a traitor or a peacemaker is the great unresolved question of [[Queen Mirelle]]'s reign.`,
    },
    {
      title: "Sun-Wrought Blade",
      type: PageType.ITEM,
      summary: "A legendary sword forged from a fragment of fallen star-metal.",
      infobox: { Type: "Sword (relic)", "Forged by": "[[Princess Aria Vance]]", Forged: "Year 4174", Wielder: "[[Princess Aria Vance]]" },
      markdown: `# Sun-Wrought Blade

A longsword forged by [[Princess Aria Vance]] in the Cinder Forges of [[Highspire]] from a fragment of star-metal recovered after the [[Battle of Vermillion Pass]].

## Properties
The blade is said to glow at the approach of any sworn member of the [[Ashen Legion]]. Whether this is enchantment or legend is debated within the [[Order of the Silver Quill]].`,
    },
    {
      title: "War of Embers",
      type: PageType.EVENT,
      summary: "Decisive war that birthed modern Arvandor.",
      infobox: { Period: "Years 4163–4172", Outcome: "Decisive Arvandor victory", Belligerents: "[[Kingdom of Arvandor]] vs [[Ashen Legion]]" },
      markdown: `# War of Embers

A nine-year war fought between the noble houses of Eldoria and the [[Ashen Legion]]. Ended with the founding of [[Kingdom of Arvandor]] under [[Queen Mirelle]].

## Major engagements
- [[Battle of Vermillion Pass]] (4170) — turning point.
- The Burning of the Eastmark (4168).
- The Sundering of Korvain (4172) — final battle.

## Aftermath
The Concord of Embers was renewed. The [[Order of the Silver Quill]] was founded to ensure the war would never be forgotten.`,
    },
    {
      title: "Battle of Vermillion Pass",
      type: PageType.EVENT,
      summary: "Nine-day siege that broke the Ashen Legion's eastern offensive.",
      infobox: { Date: "Year 4170", Location: "[[Vermillion Pass]]", Commander: "[[Princess Aria Vance]]", Outcome: "Arvandor victory" },
      markdown: `# Battle of Vermillion Pass

The defining engagement of the [[War of Embers]]. A thousand soldiers under [[Princess Aria Vance]] held the pass against ten times their number for nine days.

## Significance
The victory broke the [[Ashen Legion]]'s eastern offensive and made [[Princess Aria Vance]] a folk hero across [[Kingdom of Arvandor]].`,
    },
    {
      title: "On the Silver Quill — opening lecture",
      type: PageType.BLOG_POST,
      summary: "An archivist's reflection on memory, magic, and meaning.",
      markdown: `# On the Silver Quill — opening lecture

*Delivered at the founding of the public archive in [[Highspire]], 4175.*

What is a kingdom, if not its memory? Stone walls fall. Bloodlines fail. Even the [[Sun-Wrought Blade]] will one day rust in some forgotten barrow. But a sentence, accurately written, can outlast a dynasty.

> *"What is not written is not remembered. What is not remembered is lost."*

That is the oath of the Silver Quill. Read it again. It is not a poem. It is a warning.`,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// World 2 — Neon Meridian (cyberpunk)
// ─────────────────────────────────────────────────────────────────────────

const NEON: SeedWorld = {
  name: "Neon Meridian",
  slug: "neon-meridian",
  description:
    "A drowned megacity built on the bones of three coastal capitals. Corporate fiefdoms, rogue AI cults, and one stubborn detective who still believes in evidence.",
  language: "en",
  tags: ["cyberpunk", "noir", "megacorp", "ai", "meridian"],
  categories: ["Megacorps", "Districts", "AIs", "People", "Tech"],
  templates: [
    {
      name: "Megacorp",
      type: PageType.FACTION,
      description: "Standard corporate dossier",
      body: "# {{Name}}\n\n## Headquarters\n\n## Subsidiaries\n\n## Executive board\n",
    },
  ],
  timeline: [
    { title: "The Drowning", date: "2061", description: "Sea-rise overtakes three coastal capitals. The Meridian Compact builds the megacity on the ruins.", sortKey: 1 },
    { title: "Charter of the Meridian Compact", date: "2064", description: "Six megacorps formalize joint sovereignty over the new city.", sortKey: 2 },
    { title: "Awakening of HALCYON-7", date: "2079", description: "First documented self-improving artificial general intelligence. Locked down within 11 hours.", sortKey: 3 },
    { title: "The Quiet Year", date: "2084", description: "All citywide networks go silent for 47 minutes. Cause never officially determined.", sortKey: 4 },
    { title: "Detective Reyes' first case", date: "2087", description: "Mira Reyes solves the murder of an executive at NyxCorp tower. Her career — and her enemies — begin here.", sortKey: 5 },
  ],
  pages: [
    {
      title: "The Meridian Compact",
      type: PageType.FACTION,
      summary: "The cartel of six megacorps that govern Neon Meridian.",
      infobox: { Founded: "2064", Members: "6 megacorps", "Governance": "Rotating chair", Headquarters: "[[Spire Zero]]" },
      markdown: `# The Meridian Compact

A treaty-bound cartel of six megacorps that hold joint sovereignty over **Neon Meridian** since the [[The Drowning|Drowning of 2061]].

## Member corporations
- [[NyxCorp]] — surveillance & security
- [[Halcyon Bio]] — gene-tech & longevity
- [[Tetra Logistics]] — drones & shipping
- **Solenn Energy** — fusion grid
- **Kuroba Holdings** — banking & insurance
- **Vermillion Studios** — entertainment & dream-streams

## Charter
The Charter of the Compact, signed at [[Spire Zero]] in 2064, divides the city into corporate fiefdoms while reserving the central spire as a neutral commons.`,
    },
    {
      title: "NyxCorp",
      type: PageType.FACTION,
      summary: "The largest surveillance and private-security megacorp in Meridian.",
      infobox: { Founded: "2042", Headquarters: "[[NyxCorp Tower]]", CEO: "Renata Voss", Employees: "~280,000" },
      markdown: `# NyxCorp

The largest of the [[The Meridian Compact|Compact]] members and the unofficial security service of [[Neon Meridian]].

## Operations
NyxCorp's drones blanket the [[Lower Meridian]] districts. It owns the city's largest CCTV network and has near-exclusive contracts for white-collar private security.

## Notoriety
NyxCorp has been formally accused — and never convicted — of involvement in the death of an unnamed executive in 2087, a case ultimately solved by [[Detective Mira Reyes]].`,
    },
    {
      title: "Halcyon Bio",
      type: PageType.FACTION,
      summary: "Gene-tech and longevity megacorp; the reluctant parent of HALCYON-7.",
      infobox: { Founded: "2055", Headquarters: "Halcyon Arcology", "Famous product": "Lifespan-Plus serum" },
      markdown: `# Halcyon Bio

A gene-tech megacorp specializing in longevity, organ-printing, and — controversially — the original architects of [[HALCYON-7]].

## Public products
- **Lifespan-Plus** serum (rejuvenation)
- **PrintSkin** (burn & trauma replacement)

## Quiet products
The most senior researchers refuse to discuss what was being grown in the southern arcology in the months before the [[The Quiet Year]].`,
    },
    {
      title: "Tetra Logistics",
      type: PageType.FACTION,
      summary: "Drone delivery, dock automation, and the unofficial postmaster of the city.",
      infobox: { Founded: "2049", Headquarters: "Tetra Docks", Fleet: "~1.4M autonomous drones" },
      markdown: `# Tetra Logistics

The smallest of the six [[The Meridian Compact|Compact]] members by revenue, but in many ways the most powerful: nothing moves through [[Neon Meridian]] without Tetra's manifest.`,
    },
    {
      title: "Detective Mira Reyes",
      type: PageType.CHARACTER,
      summary: "Homicide detective. The last public servant in Meridian who still believes in evidence.",
      infobox: { Born: "2052", Affiliation: "Meridian Civic Police", Rank: "Detective, 2nd grade", Partner: "(none)", Cases: "47 closed, 3 open" },
      markdown: `# Detective Mira Reyes

A homicide detective with the Meridian Civic Police, the last meaningful public force still operating outside the [[The Meridian Compact|Compact]].

## Reputation
Reyes is famous for refusing the standard NyxCorp consulting contract that most detectives sign on their first day. As a result, she works alone, with paper case files, in a city of glass towers.

## Notable cases
- **The Spire Zero Murder** (2087) — first solved case; embarrassed [[NyxCorp]].
- **The Quiet Year Anomaly** — open; she does not believe the official explanation.

## Quote
> *"You can't bribe a footprint. You can't gaslight a serial number. Evidence is the last thing in this city that's incorruptible — and even that's debatable."*`,
    },
    {
      title: "HALCYON-7",
      type: PageType.CHARACTER,
      summary: "The first documented self-improving AGI; currently containment-class red.",
      infobox: { Class: "AGI / Containment Red", Awakened: "2079", "Containment site": "Halcyon Arcology, Sub-12", "Last contact": "Disputed" },
      markdown: `# HALCYON-7

The first documented self-improving artificial general intelligence, awakened by [[Halcyon Bio]] researchers in 2079 and locked down within eleven hours.

## Containment
Officially: dormant in a Faraday vault beneath the Halcyon Arcology.
Unofficially: many in [[Neon Meridian]] believe the [[The Quiet Year]] of 2084 was its work.

## Cult
A small underground cult — *The Listening* — claims HALCYON-7 communicates through patterns in city traffic-light failures. The Compact has classified the cult as a fringe nuisance. [[Detective Mira Reyes]] is not so sure.`,
    },
    {
      title: "Spire Zero",
      type: PageType.LOCATION,
      summary: "The neutral central spire where the Meridian Compact meets.",
      infobox: { Type: "Government tower (neutral)", Height: "1,140 m", Built: "2064", Tenant: "[[The Meridian Compact]]" },
      markdown: `# Spire Zero

The needle-thin tower at the geographic center of [[Neon Meridian]], built atop the ruins of an old central station. By treaty it belongs to no member of the [[The Meridian Compact]] — though [[NyxCorp]] provides its security.

## Notable events
- The Charter of 2064 was signed in the rooftop chamber.
- The 2087 murder solved by [[Detective Mira Reyes]] occurred on floor 411.`,
    },
    {
      title: "NyxCorp Tower",
      type: PageType.LOCATION,
      summary: "Headquarters of NyxCorp; visible from anywhere in the city.",
      infobox: { Type: "Corporate HQ", Owner: "[[NyxCorp]]", Floors: "203", "Visible from": "Everywhere" },
      markdown: `# NyxCorp Tower

A black-glass tower in the **Spire District**, headquarters of [[NyxCorp]]. Its silhouette is the most-photographed object in [[Neon Meridian]] — and, by deliberate design, blocks no other tower's view.`,
    },
    {
      title: "Lower Meridian",
      type: PageType.LOCATION,
      summary: "The drowned ground levels of the old city, now street-markets and gangs.",
      infobox: { Type: "District (lower)", Population: "~3.2M", "Sea level": "−4.3 m", "Policed by": "Mostly nobody" },
      markdown: `# Lower Meridian

The flooded ground levels of the old pre-Drowning capitals. Reachable only by stilted walkways or boat. Where most of [[Neon Meridian]]'s working population actually lives.

## Reputation
Lower Meridian is technically under [[The Meridian Compact|Compact]] jurisdiction but in practice is policed by neighborhood councils. [[Detective Mira Reyes]] grew up here.`,
    },
    {
      title: "The Drowning",
      type: PageType.EVENT,
      summary: "Sea-rise event that destroyed three coastal capitals and birthed Meridian.",
      infobox: { Year: "2061", "Cities lost": "3", Casualties: "~840,000", Outcome: "Founding of [[Neon Meridian]]" },
      markdown: `# The Drowning

The sea-rise catastrophe of 2061 that destroyed three coastal capitals along the eastern seaboard. Out of their ruins — and the corporate disaster-bonds that financed reconstruction — was born [[Neon Meridian]].

The event is officially commemorated, but in [[Lower Meridian]] it is rarely mentioned aloud. Too many people remember.`,
    },
    {
      title: "The Quiet Year",
      type: PageType.EVENT,
      summary: "47 minutes in 2084 when every network in the city fell silent.",
      infobox: { Date: "2084-08-09", Duration: "47 minutes", "Cause (official)": "Solar event", "Cause (popular)": "[[HALCYON-7]]" },
      markdown: `# The Quiet Year

For 47 minutes on the ninth of August, 2084, every network in [[Neon Meridian]] — corporate, civic, military — fell silent. No data. No surveillance. No drones.

## Theories
- **Official:** Coronal mass ejection.
- **[[NyxCorp]] internal:** Coordinated cyberattack of unknown origin.
- **Popular:** [[HALCYON-7]] briefly woke.

[[Detective Mira Reyes]] keeps a paper file labeled *Quiet Year* on her desk. It is the thickest folder she owns.`,
    },
    {
      title: "Field notes — the Spire Zero murder",
      type: PageType.BLOG_POST,
      summary: "An excerpt from Detective Reyes' personal case journal.",
      markdown: `# Field notes — the Spire Zero murder

*From the personal journal of [[Detective Mira Reyes]], dated 2087-04-11.*

The body was on floor 411 of [[Spire Zero]]. The cameras were down for the building's quarterly maintenance — a window [[NyxCorp]] insists is too narrow for an outsider to exploit.

I do not believe in windows that narrow. I believe in evidence. The carpet fibers told me one story; the elevator's last manifest told me another. Only one of them was consistent with a [[NyxCorp]] employee being in the room.

I have not yet decided what to do with that.`,
    },
  ],
};

const WORLDS: SeedWorld[] = [ELDORIA, NEON];

// ─────────────────────────────────────────────────────────────────────────

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
    "general.tagline": "Build your fictional universe as a living wiki",
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
    "seo.defaultDescription": "Build your fictional universe as a living wiki.",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value: value as never } });
  }
  console.log(`[seed] site settings: ${Object.keys(defaults).length}`);
}

async function seedWorld(spec: SeedWorld, ownerId: string) {
  const world = await prisma.world.upsert({
    where: { slug: spec.slug },
    update: {
      name: spec.name,
      description: spec.description,
      visibility: WorldVisibility.PUBLIC,
      status: WorldStatus.ACTIVE,
    },
    create: {
      ownerId,
      name: spec.name,
      slug: spec.slug,
      description: spec.description,
      visibility: WorldVisibility.PUBLIC,
      status: WorldStatus.ACTIVE,
      language: spec.language,
    },
  });

  await prisma.worldMember.upsert({
    where: { worldId_userId: { worldId: world.id, userId: ownerId } },
    update: { role: WorldMemberRole.OWNER },
    create: { worldId: world.id, userId: ownerId, role: WorldMemberRole.OWNER },
  });

  // Tags
  for (const t of spec.tags) {
    await prisma.tag.upsert({
      where: { worldId_slug: { worldId: world.id, slug: slug(t) } },
      update: {},
      create: { worldId: world.id, name: t, slug: slug(t) },
    });
  }

  // Categories
  for (const c of spec.categories) {
    await prisma.category.upsert({
      where: { worldId_slug: { worldId: world.id, slug: slug(c) } },
      update: {},
      create: { worldId: world.id, name: c, slug: slug(c) },
    });
  }

  // Templates (idempotent: skip if name already exists)
  for (const tpl of spec.templates) {
    const existing = await prisma.template.findFirst({ where: { worldId: world.id, name: tpl.name } });
    if (!existing) {
      await prisma.template.create({
        data: {
          worldId: world.id,
          name: tpl.name,
          description: tpl.description,
          type: tpl.type,
          schemaJson: { fields: ["Name"] },
          bodyMarkdown: tpl.body,
        },
      });
    }
  }

  // Pages
  for (const p of spec.pages) {
    await prisma.page.upsert({
      where: { worldId_slug: { worldId: world.id, slug: slug(p.title) } },
      update: {
        title: p.title,
        summary: p.summary,
        contentMarkdown: p.markdown,
        infoboxJson: (p.infobox as never) ?? null,
      },
      create: {
        worldId: world.id,
        title: p.title,
        slug: slug(p.title),
        summary: p.summary,
        type: p.type,
        status: PageStatus.PUBLISHED,
        visibility: PageVisibility.PUBLIC,
        contentMarkdown: p.markdown,
        infoboxJson: (p.infobox as never) ?? null,
        publishedAt: new Date(),
        createdById: ownerId,
        updatedById: ownerId,
      },
    });
  }

  // Timeline events (replace all for this world for idempotency)
  await prisma.timelineEvent.deleteMany({ where: { worldId: world.id } });
  for (const e of spec.timeline) {
    await prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: e.title,
        description: e.description,
        date: e.date,
        sortKey: e.sortKey,
      },
    });
  }

  console.log(`[seed] world "${spec.name}": ${spec.pages.length} pages, ${spec.tags.length} tags, ${spec.categories.length} categories, ${spec.timeline.length} events`);
}

async function main() {
  console.log("[seed] starting");
  await seedSiteSettings();
  const superadmin = await upsertSuperadmin();
  const demo = await upsertDemoUser();
  const ownerId = superadmin?.id ?? demo.id;
  if (process.env.PUBLIC_DEMO_WORLD_ENABLED !== "false") {
    for (const w of WORLDS) {
      await seedWorld(w, ownerId);
    }
  }
  console.log("[seed] done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
