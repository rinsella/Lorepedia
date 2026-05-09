# Deployment

Lorepedia ships ready for **Railway**, **Render**, and **self-hosted VPS / Docker Compose**.

## Common prerequisites

- A PostgreSQL database
- Strong `NEXTAUTH_SECRET` (e.g. `openssl rand -hex 32`)
- `APP_URL` matches your public URL (used for absolute links, OG tags, sitemap)
- Choose persistent storage:
  - `STORAGE_DRIVER=local` + persistent volume mounted at `LOCAL_UPLOAD_DIR`, **or**
  - `STORAGE_DRIVER=s3` and S3-compatible bucket + credentials

## Railway

1. **Create project → Deploy from repo**.
2. Add a **PostgreSQL** plugin. Railway injects `DATABASE_URL` automatically.
3. In the service Variables, set:
   - `NEXTAUTH_SECRET`, `APP_URL=https://lorepedia.net`, `NEXTAUTH_URL=$APP_URL`
   - `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`
4. The included `railway.json` builds with `npm install && npx prisma generate && npm run build`
   and starts with `npx prisma migrate deploy && npm run start`.
5. **First deploy:** open a Railway shell or run a one-off `npm run db:seed` to create the superadmin and demo world.
6. Connect your custom domain. Railway provisions SSL automatically.

## Render

1. Render reads `render.yaml` automatically — push the repo and **New + → Blueprint**.
2. The Blueprint provisions a managed Postgres database and the web service.
3. After first deploy, run `npm run db:seed` from the Shell tab.
4. Set `APP_URL` and `NEXTAUTH_URL` to your Render URL (or custom domain).

## VPS with Docker Compose

```bash
# 1. Clone repo
git clone https://github.com/your-org/lorepedia.git && cd lorepedia

# 2. Copy env
cp .env.example .env
# Edit .env: NEXTAUTH_SECRET, APP_URL, SUPERADMIN_*, DATABASE_URL (db service uses
# postgresql://postgres:postgres@db:5432/lorepedia by default)

# 3. Build + run
docker compose up -d --build

# 4. Seed once
docker compose exec app npx tsx prisma/seed.ts
```

### Reverse proxy (Caddy example)

```Caddyfile
lorepedia.net {
    encode zstd gzip
    reverse_proxy app:3000
}
```

Or an Nginx + Certbot setup:

```nginx
server {
    server_name lorepedia.net;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d lorepedia.net
```

### Backups

```bash
docker compose exec db pg_dump -U postgres lorepedia | gzip > backup-$(date +%F).sql.gz
```

Schedule with cron and ship to off-site storage.

### Persistent uploads

The compose file mounts a named volume at `/app/uploads`. Back this up alongside the database
**or** switch to S3/R2 by setting `STORAGE_DRIVER=s3` and S3 credentials.

## Migrating between hosts

1. Sign in as the superadmin.
2. Go to **Superadmin → Export & Migration → Download platform export (JSON)**.
3. Snapshot uploads (or copy from S3).
4. Provision the new host, restore the database via `pg_restore`, mount uploads, redeploy.

## Health checks

- App: `GET /` should return 200.
- Diagnostics page (superadmin only): `/superadmin/diagnostics`.
