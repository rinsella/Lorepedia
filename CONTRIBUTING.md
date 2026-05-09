# Contributing to Lorepedia

Thanks for your interest! Lorepedia is built phase-by-phase — see the **Phased
Build Plan** in the project brief.

## Quick start

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run db:migrate && npm run db:seed
npm run dev
```

## Conventions

- TypeScript strict mode. No `any` unless justified with a comment.
- Server-side authorization on every mutation (use helpers in `src/lib/permissions.ts`).
- All forms validated with Zod (`src/lib/validations.ts`).
- Sanitize markdown via `src/lib/markdown.ts`. Never render unsanitized user HTML.
- Audit log every admin/superadmin mutation with `audit({ ... })`.

## Testing

```bash
npm run lint
npm run test
```

Open a PR with a clear description and a checklist of which acceptance criteria
your change satisfies.
