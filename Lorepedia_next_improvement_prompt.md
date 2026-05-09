# Lorepedia.net — Fullstack Improvement Prompt for GitHub Copilot / Cursor AI

You are an expert fullstack product engineer, UI/UX designer, security-focused architect, and deployment engineer. You are continuing an existing Next.js + Prisma project named **Lorepedia**. The current application is already generated but is still incomplete, too minimal, and feels like an early scaffold. Your job is to transform it into a richer, production-ready online worldbuilding wiki platform for **lorepedia.net**.

## 0. Existing Project Context

The project currently uses:

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth/Auth.js credentials login
- bcrypt password hashing
- Role-based access: USER, VERIFIED_USER, MODERATOR, ADMIN, SUPERADMIN
- Public worlds under `/w/[worldSlug]`
- Public pages under `/w/[worldSlug]/[pageSlug]`
- User dashboard under `/dashboard`
- Admin dashboard under `/admin`
- Superadmin dashboard under `/superadmin`
- Prisma models already exist for worlds, pages, tags, categories, templates, page links, comments, reports, reactions, bookmarks, follows, notifications, media assets, timelines, maps, themes, audit logs, invites, site settings, and rate limits.

Important current files and routes:

- `src/app/page.tsx` landing page exists but looks simple and monotonous.
- `src/components/site-header.tsx` uses only a plain square icon, not a real logo.
- `src/app/globals.css` has a simple beige/purple theme, but the design still feels flat and repetitive.
- There is no `public/` folder with real logo files, favicon, Open Graph image, app icons, or manifest.
- There is no custom `src/app/not-found.tsx` 404 page.
- Admin pages exist but are minimal: `/admin`, `/admin/users`, `/admin/worlds`, `/admin/comments`, `/admin/reports`, `/admin/settings`, `/admin/audit`.
- Superadmin pages exist but are minimal: `/superadmin`, `/superadmin/admins`, `/superadmin/diagnostics`, `/superadmin/export`.
- User world pages exist but are still basic: `/dashboard/worlds`, `/dashboard/worlds/[slug]`, `/dashboard/worlds/[slug]/settings`, `/dashboard/worlds/[slug]/links`, `/dashboard/worlds/[slug]/export`, page create/edit pages.
- Current page editor is just a plain `<textarea>` with no preview, toolbar, template picker, infobox editor, autosave, or rich UI.
- Schema contains many advanced models, but several are not implemented in UI yet.
- Existing README says timelines UI, map upload, comments UI, and social follows are scaffolded but still “Coming soon”. Remove this weakness by implementing usable versions.
- `npm ci` may warn that `next@14.2.18` is outdated/security-sensitive. Upgrade Next.js and related packages safely to a patched compatible version if possible, without breaking the App Router project.

## 1. Main Product Vision

Build **Lorepedia.net** as an online Wikipedia-like platform for fictional universes, stories, novels, comics, anime concepts, RPG campaigns, games, and worldbuilding projects.

It should feel like:

- A beautiful online Wikipedia for lore.
- A creator dashboard for managing fictional worlds.
- A public discovery platform for community worlds.
- A private workspace for writers and game masters.
- A Notion/Obsidian-like wiki, but web-based and focused on lore.
- Inspired by the warm, elegant, editorial feel of `chronicler.pro`, but not a clone. Use similar spirit: calm, polished, serif headings, soft cards, immersive fantasy/archive feeling, parchment-like surfaces, tasteful gradients, subtle star/map/book motifs, and a clean modern SaaS layout.

The project must remain free/open for self-hosting and easy to deploy on:

- Railway
- Render
- VPS with Docker Compose
- Any Node.js server with PostgreSQL

## 2. Critical Problems to Fix

Fix these problems directly in the codebase:

### 2.1 Admin dashboard is too empty

The current `/admin` dashboard only shows four stats. Expand it into a real operational panel with:

- Rich stats cards:
  - Total users
  - New users this week
  - Active users in last 7 days
  - Suspended users
  - Total worlds
  - Public worlds
  - Private worlds
  - Total pages
  - Published pages
  - Draft pages
  - Open reports
  - Pending comments
  - Storage usage estimate
- Recent activity feed from `AuditLog`
- Recent users table
- Recent worlds table
- Moderation queue preview
- Quick actions:
  - Manage users
  - Review reports
  - Review comments
  - Edit site settings
  - View audit log
- Helpful empty states when the database is new.

### 2.2 Admin users page is too basic

Enhance `/admin/users` into a useful management interface:

- Search by email, username, name.
- Filter by role and status.
- Sort by newest, oldest, last login, role, status.
- Pagination.
- User detail drawer/page at `/admin/users/[id]`.
- Actions:
  - Suspend user
  - Reinstate user
  - Verify user
  - Change role if the current actor has permission
  - Delete/soft-delete user if allowed
  - View user worlds
  - View user pages
  - View recent audit logs
- Prevent admins from modifying SUPERADMIN accounts unless actor is SUPERADMIN.
- Prevent self-demotion and self-suspension.
- Add clear confirmation UI for destructive actions.

### 2.3 Admin worlds page is too basic

Enhance `/admin/worlds`:

- Search by world name, slug, owner email.
- Filter by visibility and status.
- Pagination.
- World detail page at `/admin/worlds/[id]`.
- Actions:
  - View public world
  - View owner
  - Archive world
  - Restore world
  - Soft-delete world
  - Change visibility
  - Feature/unfeature world on Explore
  - Inspect pages, members, reports, comments
- Add admin notes or moderation notes if needed.

### 2.4 Comments and reports are not actually manageable

Current `/admin/comments` and `/admin/reports` mostly list records. Add full moderation workflows:

For comments:

- List comments with filters: visible, hidden, deleted, pending review.
- Hide comment.
- Restore comment.
- Delete comment.
- View linked page/world.
- Search comment body and author.

For reports:

- Filter: open, reviewing, actioned, rejected.
- Assign status.
- Add resolution note.
- View target entity when possible.
- Quick actions based on target type: hide comment, suspend user, archive page/world.
- Audit every moderation action.

### 2.5 Admin settings are not comprehensive

Expand `/admin/settings` into grouped settings with a better UI:

Groups:

1. General
   - Site name
   - Tagline
   - Homepage headline
   - Homepage subheadline
   - Contact email
   - Support URL
   - Default language
2. Registration
   - Enable/disable registration
   - Require email verification toggle, even if email sending is not yet configured
   - Require approval for new users
   - Allowed email domains optional
3. Limits
   - Max worlds per user
   - Max pages per world
   - Max upload size MB
   - Storage MB per user
   - Rate limit settings
4. Moderation
   - Comments enabled
   - Require comment approval
   - Public Explore enabled
   - Report abuse email
5. Security
   - Captcha provider: none / Turnstile / reCAPTCHA / hCaptcha
   - Captcha site key
   - Captcha secret key stored safely in settings or env fallback
   - Login rate limit
   - Registration rate limit
6. SEO
   - Default title
   - Default description
   - Open Graph image URL
   - Twitter handle
   - Robots index toggle
7. Branding
   - Logo text
   - Logo image URL/path
   - Favicon path
   - Accent theme preset
   - Footer text
8. Features
   - AI helper toggle placeholder
   - Public profiles toggle
   - Comments toggle
   - Timelines toggle
   - Maps toggle
   - Templates marketplace toggle placeholder

Use cards, tabs, or grouped panels. Avoid one long ugly form.

### 2.6 Superadmin is too weak

Superadmin must feel clearly more powerful than Admin.

Enhance `/superadmin` with:

- Platform health overview.
- Environment status.
- Database status.
- Queue/storage status placeholders.
- User/admin role summary.
- Last 20 critical audit logs.
- Quick links.

Enhance `/superadmin/admins`:

- Search any user, not only existing staff.
- Promote USER to MODERATOR/ADMIN/SUPERADMIN.
- Demote staff safely.
- Prevent removing last SUPERADMIN.
- Prevent self-demotion.
- Full audit logs.

Enhance `/superadmin/diagnostics`:

- DATABASE_URL presence and connection check.
- NEXTAUTH_SECRET presence.
- APP_URL presence.
- Storage driver status.
- Node version.
- Next.js version.
- Prisma version.
- Database provider.
- Counts of users/worlds/pages.
- Disk/storage warning placeholder for VPS/local mode.
- Security header check explanation.
- Do not reveal secrets.

Enhance `/superadmin/export`:

- Keep existing JSON export.
- Add import page at `/superadmin/import`.
- Add full migration backup flow:
  - Upload JSON export.
  - Validate export version.
  - Dry-run preview.
  - Import with safe upsert.
  - Option to skip users/passwords.
  - Option to import only worlds/pages/settings.
- Add export buttons:
  - Full platform JSON
  - Public content JSON
  - Settings JSON
  - Audit logs JSON
  - Worlds/pages ZIP if feasible

### 2.7 UI theme is too monotonous

Redesign the UI system. Keep the same app, but make it feel premium and distinctive.

Design direction:

- Use an elegant lore/archive/fantasy-library visual identity.
- Warm parchment background with subtle radial gradients.
- Dark ink typography.
- Purple/indigo magical accent.
- Gold/amber secondary accent.
- Serif headings, clean sans body.
- Soft shadows, rounded cards, thin borders.
- Pattern/texture effect using CSS only, no heavy image dependency.
- More varied layouts: hero sections, split panels, stat cards, feature grids, world cards, timeline cards.
- Add dark mode support if possible, or at least prepare variables.
- Use visual motifs: book, feather, compass, stars, map grid, archive shelves.
- Do not make everything plain white cards on beige.

Improve these pages:

- Landing page `/`
- Explore `/explore`
- Public world `/w/[worldSlug]`
- Public page `/w/[worldSlug]/[pageSlug]`
- Dashboard `/dashboard`
- Admin `/admin`
- Superadmin `/superadmin`
- Login/register pages
- 404 page
- Legal pages

### 2.8 Website has little content

Add richer built-in content and demo content.

Seed script should create:

- 1 superadmin if env exists.
- 1 demo user.
- At least 2 public demo worlds:
  1. Eldoria Archive — fantasy world.
  2. Neon Meridian — sci-fi/cyberpunk world.
- Each demo world should have 10–15 pages minimum:
  - Characters
  - Locations
  - Factions
  - Items/artifacts
  - Events
  - Blog/lore posts
- Pages must use `[[wikilinks]]` heavily to show the value of backlinks and broken links.
- Add tags and categories.
- Add templates for character, location, faction, item, event, timeline, blog post.
- Add a few timeline events if timeline UI is implemented.
- Add sample comments if comments are enabled.

Improve static content pages:

- `/about` should explain the product properly.
- `/legal/privacy` and `/legal/terms` should be more complete but still editable placeholder legal docs.
- Landing page should include sections:
  - Hero
  - What is Lorepedia?
  - Who it is for
  - Feature showcase
  - Demo world preview
  - Admin/self-hosting friendly section
  - CTA
  - FAQ

### 2.9 Missing logo, favicon, app icons, manifest

Create a real branding asset setup.

Add `public/` folder with:

- `favicon.ico` if possible. If generating ICO is difficult, add PNG/SVG plus Next metadata icons.
- `icon.svg`
- `logo.svg`
- `logo-mark.svg`
- `apple-touch-icon.png` if possible or SVG fallback.
- `og-image.svg` or `opengraph-image.tsx`.
- `manifest.webmanifest`.

Logo concept:

- Brand name: Lorepedia
- Domain: lorepedia.net
- Symbol: open book + compass/star + wiki/archive feel.
- Must work in header, favicon, social share, and dashboard sidebar.
- Use inline SVG assets so the project has no binary dependency if easier.

Update:

- `src/app/layout.tsx` metadata icons.
- Header to use the actual logo mark.
- Footer to use logo.
- Login/register pages to use logo.
- Open Graph metadata.

### 2.10 Missing custom 404 and error pages

Add:

- `src/app/not-found.tsx`
- `src/app/error.tsx` client component
- `src/app/global-error.tsx` if appropriate
- Optional `src/app/(auth)/not-found.tsx` is not necessary.

404 design:

- Lorepedia themed.
- Message: “Page lost in the archives.”
- Search/explore button.
- Dashboard button if logged in.
- Home button.
- Nice illustration using CSS/SVG.

Error page:

- Friendly error message.
- Retry button.
- Link to home.
- Do not expose stack traces.

### 2.11 User dashboard is too plain

Improve `/dashboard`:

- Stats cards:
  - Worlds owned
  - Worlds joined
  - Pages authored
  - Drafts
  - Published pages
  - Bookmarks
- Recent worlds with better cards.
- Recent pages edited by user.
- Quick actions:
  - New world
  - New page in recent world
  - Explore public worlds
  - Export my data
- Onboarding checklist:
  - Create first world
  - Create first page
  - Publish a page
  - Add wikilinks
  - Customize world
- Better empty states.

Improve `/dashboard/worlds/[slug]`:

- World overview cards.
- Pages table with search/filter by type/status/visibility.
- Better tabs/navigation:
  - Overview
  - Pages
  - Templates
  - Tags
  - Categories
  - Timeline
  - Maps
  - Members
  - Comments
  - Broken Links
  - Settings
  - Export
- Implement at least essential versions of these tabs/routes.

### 2.12 Page editor is too basic

Replace or enhance textarea editor with a better writing experience.

Minimum implementation:

- Markdown textarea plus live preview side-by-side.
- Toolbar buttons inserting markdown:
  - heading
  - bold
  - italic
  - quote
  - bullet list
  - numbered list
  - code block
  - wikilink
  - infobox placeholder
- Template picker based on PageType.
- Summary field.
- Type, status, visibility controls.
- Autosave draft indicator if feasible.
- Unsaved changes warning if feasible.
- Preview should render sanitized markdown with wikilinks.

Better implementation if time allows:

- TipTap or MDX editor is optional, but do not overcomplicate if it breaks deployment.
- Add keyboard shortcuts.
- Add word count / character count.
- Add broken link preview.

### 2.13 Public wiki pages need more Wikipedia-like content layout

Improve `/w/[worldSlug]`:

- World cover/header visual.
- World description.
- Page counts by type.
- Search pages inside the world.
- Categories/tags list.
- Featured pages.
- Recently updated pages.
- Timeline preview if available.

Improve `/w/[worldSlug]/[pageSlug]`:

- Wikipedia-like article layout:
  - Breadcrumb
  - Title
  - Summary
  - Page type badge
  - Infobox on the right for desktop
  - Table of contents generated from headings
  - Main article content
  - Tags/categories
  - Backlinks
  - Related pages
  - Last updated
  - Report button
  - Comment section if enabled
- If `infoboxJson` exists, render it nicely.
- If no infobox exists, allow fallback based on PageType metadata.
- Keep security: sanitize markdown.

### 2.14 Explore page is too empty

Improve `/explore`:

- Hero header.
- Search.
- Filters:
  - world type/category placeholder
  - visibility public only
  - language
  - newest/recently updated/most pages
- Featured worlds section.
- Popular tags section.
- World cards with icon/cover fallback.
- Empty state with CTA to create a world.

### 2.15 Missing media/upload implementation

The Prisma schema has `MediaAsset`, but UI is absent.

Implement a basic media manager:

- Route: `/dashboard/worlds/[slug]/media`
- Upload interface if feasible.
- Store locally in development under `public/uploads` or use configured storage driver placeholder.
- For production, support env-ready S3-compatible storage variables:
  - `S3_ENDPOINT`
  - `S3_REGION`
  - `S3_BUCKET`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `S3_PUBLIC_BASE_URL`
- If full upload is too much, implement UI and service abstraction with clear TODO but no broken buttons.

### 2.16 Timelines and maps should no longer just be schema-only

Implement simple timelines:

- Route: `/dashboard/worlds/[slug]/timeline`
- Add timeline events with title, date string, sort key, description, optional linked page.
- Public timeline display at `/w/[worldSlug]` or `/w/[worldSlug]/timeline`.

Implement simple maps:

- Route: `/dashboard/worlds/[slug]/maps`
- Allow creating a map record with name and image URL/key.
- Allow list of pins with x/y, label, description, optional linked page.
- Public view can display image and pin overlay if feasible.
- If image upload is not implemented, support image URL first.

### 2.17 Members and collaboration are missing

Implement members UI:

- Route: `/dashboard/worlds/[slug]/members`
- Show members and roles.
- Owner/co-owner can change roles.
- Invite by email using `Invite` model.
- Generate invite token link.
- Route: `/invite/[token]` to accept invitation after login.
- Respect WorldMemberRole permission hierarchy.

### 2.18 Tags, categories, templates UI missing

Implement:

- `/dashboard/worlds/[slug]/tags`
- `/dashboard/worlds/[slug]/categories`
- `/dashboard/worlds/[slug]/templates`

Tags:

- Create/edit/delete tags.
- Assign tags in page editor.

Categories:

- Create/edit/delete categories.
- Parent category support if simple.
- Assign category in page editor.

Templates:

- List templates.
- Create/edit/delete template.
- Use template when creating a page.
- Seed default templates for common lore page types.

### 2.19 Search is too limited

Add search functionality:

- Global public search route `/search?q=`.
- Search public worlds and public pages.
- World-level search route `/w/[worldSlug]/search?q=`.
- Dashboard world page search/filter.
- Use simple PostgreSQL `contains` queries first; optional full-text search later.

### 2.20 SEO and metadata improvement

Improve:

- Dynamic Open Graph image support.
- Better `sitemap.ts`: include public worlds and public pages.
- Better `robots.ts` using settings.
- Canonical URLs based on `APP_URL`.
- Structured data for world pages and article pages.
- `manifest.webmanifest`.
- Metadata icons.

### 2.21 Security and production hardening

Do not break existing security. Improve:

- Keep markdown sanitization.
- Protect all server actions with permission checks.
- Add CSRF-conscious server actions using built-in Next patterns.
- Never expose secrets in diagnostics.
- Add confirmation for destructive admin/superadmin actions.
- Ensure suspended users cannot login.
- If a user is suspended while logged in, block dashboard/admin actions.
- Ensure private/unlisted visibility rules are consistent.
- Add rate limit toggles but keep safe defaults.
- Captcha support should be configured but optional.

### 2.22 Deployment must stay easy

Update deployment docs and configs:

- Railway
- Render
- VPS Docker Compose
- Generic Node.js

Ensure:

- `npm run build` works.
- `npm run start` works.
- `npm run db:deploy` works.
- `npm run db:seed` works.
- Dockerfile works.
- `render.yaml` is correct.
- `railway.json` is correct.
- `.env.example` includes all required and optional env vars.

Add a production checklist:

- Set `DATABASE_URL`
- Set `NEXTAUTH_SECRET`
- Set `APP_URL=https://lorepedia.net`
- Set `SUPERADMIN_EMAIL`
- Set `SUPERADMIN_PASSWORD`
- Run migrations
- Run seed
- Configure storage
- Configure reverse proxy / HTTPS

## 3. Required New Routes / Pages

Add or complete these routes:

Public:

- `/not-found` via `src/app/not-found.tsx`
- `/search`
- `/w/[worldSlug]/search`
- `/w/[worldSlug]/timeline`
- `/w/[worldSlug]/maps`
- `/w/[worldSlug]/tags/[tagSlug]`
- `/w/[worldSlug]/categories/[categorySlug]`

User dashboard:

- `/dashboard/worlds/[slug]/overview` or use main page as overview
- `/dashboard/worlds/[slug]/pages` if separate from overview
- `/dashboard/worlds/[slug]/templates`
- `/dashboard/worlds/[slug]/tags`
- `/dashboard/worlds/[slug]/categories`
- `/dashboard/worlds/[slug]/timeline`
- `/dashboard/worlds/[slug]/maps`
- `/dashboard/worlds/[slug]/media`
- `/dashboard/worlds/[slug]/members`
- `/dashboard/worlds/[slug]/comments`

Admin:

- `/admin/users/[id]`
- `/admin/worlds/[id]`
- `/admin/pages` optional
- `/admin/media` optional
- `/admin/settings/branding` optional if settings are split

Superadmin:

- `/superadmin/import`
- `/superadmin/settings` optional
- `/superadmin/maintenance` optional

Auth/invites:

- `/invite/[token]`

## 4. Components to Add

Create reusable components:

- `Logo`
- `BrandMark`
- `EmptyState`
- `StatCard`
- `SectionHeader`
- `DashboardShell`
- `AdminShell`
- `WorldTabs`
- `WorldCard`
- `PageCard`
- `PageTypeBadge`
- `StatusBadge`
- `VisibilityBadge`
- `ConfirmButton` or confirm dialog
- `MarkdownEditor`
- `MarkdownPreview`
- `InfoboxRenderer`
- `TableOfContents`
- `BacklinksList`
- `RelatedPages`
- `AuditLogList`
- `SettingsCard`
- `SearchBox`
- `Pagination`
- `FilterBar`
- `TimelineView`
- `MapPinViewer`

Use accessible HTML. Avoid overengineering. Prefer server components for data fetching and client components only where interaction is needed.

## 5. Data Model Adjustments

Use the existing Prisma schema when possible. Add fields only if truly needed.

Recommended additions if needed:

- `World.featured Boolean @default(false)`
- `World.coverImage String?` or use existing `cover`
- `World.genre String?`
- `World.featuredAt DateTime?`
- `Report.resolutionNote String?`
- `Report.assignedToId String?`
- `Comment.moderationNote String?`
- `Notification` already exists; use it if feasible.

If you add schema fields:

- Update Prisma migration.
- Update seed.
- Update admin forms.
- Keep backward compatibility.

## 6. Implementation Priorities

Work in this order:

1. Make the project build successfully.
2. Add branding assets, favicon, metadata icons, manifest.
3. Redesign global UI/theme and header/footer.
4. Add 404/error pages.
5. Expand admin dashboard, users, worlds, comments, reports, settings.
6. Expand superadmin dashboard, admins, diagnostics, export/import.
7. Improve user dashboard and world dashboard tabs.
8. Improve page editor with preview/toolbars/templates.
9. Improve public world/page layout.
10. Add richer seed/demo content.
11. Add search, timeline, tags, categories, templates, members.
12. Improve deployment docs and env examples.
13. Run lint/build/tests and fix all TypeScript errors.

## 7. Acceptance Criteria

The work is complete only when:

- `npm run build` passes.
- `npm run lint` passes or documented non-critical warnings are fixed.
- `npm run test` passes.
- No route links in navigation lead to missing pages.
- Admin dashboard has real management tools, not only stats.
- Superadmin has clearly broader powers than admin.
- Logo and favicon exist and are used.
- 404 page exists and is themed.
- Landing page is visually richer and no longer monotonous.
- Explore and public wiki pages look closer to a polished online encyclopedia.
- Page editor has live preview and markdown helper toolbar.
- Demo content makes the site feel alive after seeding.
- `.env.example` is complete.
- Deployment docs are updated for Railway, Render, VPS/Docker.
- All admin/superadmin actions are permission-checked and audited.

## 8. Style and UX Details

Use copywriting that sounds polished and product-ready.

Examples:

- “Build your universe as a living wiki.”
- “A private archive for stories, worlds, and legends.”
- “Connect characters, places, factions, items, and events with wikilinks.”
- “Publish your lore when ready, or keep it private forever.”
- “Page lost in the archives.”

Avoid generic placeholder text like “Lorem ipsum” on visible pages. Use Lorepedia-specific copy.

## 9. Important Constraints

- Do not remove existing functionality unless replacing it with a better version.
- Do not break authentication.
- Do not expose password hashes, session tokens, or secrets in exports/diagnostics.
- Do not create fake buttons that do nothing without explaining disabled/coming-soon status.
- Do not rely on paid external services.
- Keep the app self-hostable and free.
- Keep deployment simple.
- Keep TypeScript strict enough and avoid `any` where reasonable.
- Prefer clean implementation over unnecessary complexity.

## 10. Final Output Expected From Copilot/Cursor

After applying changes, provide:

1. Summary of major improvements.
2. List of changed/added files.
3. Any new environment variables.
4. Database migration notes.
5. How to run locally.
6. How to deploy to Railway/Render/VPS.
7. Known limitations if any.

Now implement all improvements directly in the existing repository.
