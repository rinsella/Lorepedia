# Lorepedia

> Build your fictional universe as a living wiki.

Lorepedia gives writers, game masters, and creators a beautiful online workspace
for characters, locations, factions, timelines, maps, and interconnected lore.

## Features

- Worlds with public / unlisted / private visibility
- Markdown editor with `[[wikilinks]]`
- Backlinks and broken-link diagnostics
- Page templates (character, location, faction, item, event)
- Tags and categories
- Role-based admin and superadmin panels
- Full audit log
- Markdown / JSON / ZIP export per world and per user
- SEO: dynamic metadata, Open Graph, Twitter cards, JSON-LD, sitemap, robots.txt
- Security: hashed passwords (bcrypt), CSP, server-side authorization, sanitized markdown,
  honeypots, database-backed rate limiting

Some advanced features (timelines UI, map upload, comments UI, social follows) are
scaffolded in the schema and APIs but currently labeled **Coming soon**.

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Configure env
cp .env.example .env
# edit .env — at minimum set DATABASE_URL, NEXTAUTH_SECRET, SUPERADMIN_EMAIL/PASSWORD

# 3. Start Postgres (or use Docker)
docker compose up -d db

# 4. Apply migrations + seed
npm run db:migrate
npm run db:seed

# 5. Run the dev server
npm run dev
# → http://localhost:3000
```

The seed script creates:

- A superadmin from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`
- A demo user (`demo@lorepedia.net` / `DemoUser123!`)
- A public demo world `Eldoria Archive` with cross-linked pages

## Build scripts

| Command              | What it does                            |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start dev server                        |
| `npm run build`      | Generate Prisma client + Next build     |
| `npm run start`      | Start production server                 |
| `npm run lint`       | ESLint                                  |
| `npm run test`       | Vitest unit tests                       |
| `npm run db:migrate` | Run Prisma migrations (dev)             |
| `npm run db:deploy`  | `prisma migrate deploy` (prod)          |
| `npm run db:seed`    | Seed database                           |
| `npm run db:studio`  | Prisma Studio                           |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway, Render, and VPS / Docker Compose
instructions.

## Security notes

- Always change `SUPERADMIN_PASSWORD` after first login.
- Set a strong random `NEXTAUTH_SECRET` (`openssl rand -hex 32`).
- Configure `STORAGE_DRIVER=s3` in production unless your host has a persistent
  volume — local uploads will be lost on redeploy.
- Enable HTTPS at your reverse proxy.

## License

Add your chosen license to `LICENSE`. This project is independent and not affiliated
with any other wiki product.
