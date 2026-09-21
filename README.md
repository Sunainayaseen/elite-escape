# Elite Escape Tourism

Travel agency website: a Next.js public site plus a FastAPI + PostgreSQL backend that also powers the admin dashboard.

| Part | Tech | Where |
| --- | --- | --- |
| Public site + admin UI | Next.js (App Router), Tailwind CSS v4, Framer Motion | `frontend/` |
| API | FastAPI, SQLAlchemy 2, Alembic, PostgreSQL | `backend/` |
| Local infrastructure | Docker Compose | `docker-compose.yml` |
| Production (API) | Docker Compose + Caddy (automatic HTTPS) on a VPS | `docker-compose.prod.yml`, `deploy/` |
| Production (site) | Vercel | `frontend/` |

The public pages read their content from the API (packages, categories, visa destinations, blog, site settings) and revalidate every minute, so changes made in the dashboard appear without a redeploy. If the API is unreachable, pages fall back to the bundled content in `frontend/src/lib/site-data.ts` instead of rendering empty.

Enquiry forms (contact, package, visa) and the newsletter post to the API. Every package or visa request lands in the single enquiry inbox.

## Local development

### 1. Backend (Docker, recommended)

```bash
cp backend/.env.example backend/.env   # set ADMIN_PASSWORD (and a real JWT_SECRET_KEY if you like)
docker compose up --build
```

The API container applies migrations and seeds starter data on every start, then serves on <http://localhost:8000> (interactive docs at `/docs` outside production). The seed only fills empty tables, so edits and deletions made in the dashboard are never overwritten.

### 1b. Backend without Docker

You need Python 3.11+ (64-bit). SQLite works for a quick local run; production uses PostgreSQL.

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate      # Windows; use .venv/bin/activate on macOS/Linux
pip install -r requirements-dev.txt
export DATABASE_URL=sqlite:///./local.db ADMIN_PASSWORD='choose-a-strong-password'
alembic upgrade head && python -m app.seed
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                          # http://localhost:3000
```

If `npm run dev` says `'next' is not recognized`, run `npm rebuild` once.

## Tests and checks

```bash
cd backend && python -m pytest -q          # API tests (in-memory SQLite, no Docker needed)
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

## Configuration

Backend variables are documented in `backend/.env.example`; production values live in `deploy/.env.prod.example`.

- In production (`ENVIRONMENT=production`) the API refuses to start unless `JWT_SECRET_KEY` is 32+ characters and `ADMIN_PASSWORD` is 12+ characters.
- The first admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first start. Later changes to those variables do not alter an existing account; change the password from the dashboard.
- Optional SMTP settings email the agency about new enquiries.

Frontend variables (`frontend/.env.local.example`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, and optionally `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` to show real Google reviews. The reviews section stays hidden until real reviews exist; the site never shows invented ratings or testimonials.

## Deployment

### API on the VPS

1. Point a DNS `A` record for your API hostname (for example `api.eliteescapetourism.com`) at the VPS and open ports 80 and 443.
2. Install Docker, clone the repository, then:

   ```bash
   cp deploy/.env.prod.example .env.prod      # replace every CHANGE_ME and review the rest
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
   ```

3. Check `https://<API_DOMAIN>/api/health` returns `{"status":"ok"}`.

Caddy obtains and renews the HTTPS certificate automatically. Postgres data, uploaded images and certificates live in named Docker volumes (`pgdata`, `uploads`, `caddy_data`), so back up at least `pgdata` and `uploads`:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec db pg_dump -U eliteescape eliteescape > backup.sql
```

To update: `git pull && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`. Migrations run automatically on start.

### Site on Vercel

1. Import the repository in Vercel and set the project root to `frontend`.
2. Set environment variables: `NEXT_PUBLIC_API_URL=https://<API_DOMAIN>`, `NEXT_PUBLIC_SITE_URL=https://<your site>`, plus the optional Google reviews keys.
3. Deploy, then add your domain. Add the final site origin(s) to `CORS_ORIGINS` in `.env.prod` and restart the API.

The admin dashboard calls same-origin `/api/admin/*` and `/uploads/*`, which Next.js rewrites to the API (destination taken from `NEXT_PUBLIC_API_URL` at build time). The admin session cookie is `HttpOnly`, `SameSite=Lax` and `Secure` in production, and every write needs the `X-CSRF-Token` header plus an allowed `Origin`. Set `FRONTEND_URL` and `CORS_ORIGINS` on the API to the public site origin, and keep `BEHIND_PROXY=true` (already set in `docker-compose.prod.yml`) so the rate limiter sees real client addresses. Uploaded images live in the `uploads` volume.

## Content integrity

Only facts the business has published belong on the site. Prices are per-person ranges with a currency, visa fees and processing times stay hidden until the agency supplies them ("Contact us" is shown instead), and there are no invented ratings, statistics or reviews. Keep it that way when adding content.

## Project layout

```
backend/app/            models, schemas, routers (public + admin), core (security, rate limit, settings), seed
backend/alembic/        database migrations
backend/tests/          pytest suite
frontend/src/app/       pages (App Router), including /admin
frontend/src/components home, holidays, contact, visa, layout, motion, admin
frontend/src/lib/       API client, data layer with fallbacks, bundled content
deploy/                 Caddyfile and production env template
```
