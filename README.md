PulseWatch — Uptime Monitoring Dashboard

Overview
- Full‑stack uptime monitoring app: track websites, visualize metrics, and get email alerts when outages occur.
- Tech: Express + Vite + React + Tailwind + Drizzle ORM (PostgreSQL) + node-cron + nodemailer.

Features
- Website monitors with configurable frequency (per‑site, minutes).
- Automatic checks, response time capture, and status logs (UP/DOWN).
- Email alerts on downtime and recovery (SMTP optional; logs to console in dev).
- Dashboard with summary, charts, incidents list, logs view, and settings.

Architecture
- Single Node process serves the API and, in dev, proxies the Vite client (HMR).
- Production build emits static assets to dist/public and a bundled server entry.
- Drizzle ORM manages schema and queries against PostgreSQL.
- `node-cron` schedules periodic monitor checks in‑process.

Folder Structure
- client/: Vite + React app (src/, components/, pages/, hooks/, lib/)
- server/: Express server, routes, monitors, email, DB bootstrap, dev Vite integration
- shared/: Cross‑shared schema (Drizzle tables + Zod insert schemas)
- script/: Build script combining Vite (client) + esbuild (server)

Prerequisites
- Node.js 20+
- npm 9+ (or pnpm/yarn if preferred)
- PostgreSQL 15+ (local service or Docker)

Quick Start (Local PostgreSQL)
1) Install dependencies
```bash
npm install
```

2) Create .env (see .env.example)
```bash
copy .env.example .env   # Windows PowerShell
# Then edit .env and set DATABASE_URL, e.g.:
# DATABASE_URL=postgresql://postgres@localhost:5432/pulsewatch
```

3) Create the database (PowerShell example)
```bash
psql -U postgres -c "CREATE DATABASE pulsewatch"
```

4) Push schema to DB
```bash
npm run db:push
```

5) Run in development
```bash
npm run dev
# App will serve API + client at http://localhost:5000
```

Docker (Optional) for PostgreSQL
If Docker Desktop is running, you can start a DB quickly:
```bash
docker run --name pulsewatch-db \ 
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pulsewatch \
  -p 5432:5432 -d postgres:16-alpine

# DATABASE_URL example for this container:
# postgresql://postgres:postgres@localhost:5432/pulsewatch
```

Environment Variables (.env)
- DATABASE_URL: Required. PostgreSQL connection string.
  - Render example: `postgresql://pulsewatch_xkrg_user:sssxanXCLplhOn1UQxhOhzpxdQAhtaYn@dpg-d51lhov6s9ss73ep4oa0-a:5432/pulsewatch_xkrg`
- PORT: Optional. Defaults to 5000.
- SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM: Optional for sending real emails.
  - In development without SMTP, emails are printed to the console by design.

Useful Scripts
- `npm run dev`: Start Express with Vite middleware for client HMR.
- `npm run db:push`: Apply schema to the PostgreSQL database via Drizzle.
- `npm run build`: Build client (Vite) + bundle server (esbuild) into dist/.
- `npm start`: Run the production server from dist/.
- `npm run check`: Type‑check the project.

Production Build & Run
```bash
npm run build
npm start
# Server listens on PORT (default 5000) and serves dist/public
```

API Overview (selected)
- Websites
  - GET /api/websites — list
  - GET /api/websites/:id — get
  - POST /api/websites — create (uses Zod validation)
  - PATCH /api/websites/:id — update (auto restarts/stops monitor)
  - DELETE /api/websites/:id — delete (stops monitor)
- Logs
  - GET /api/logs?limit=1000 — recent logs
  - GET /api/logs/:websiteId?limit=100 — logs for specific website
- Analytics
  - GET /api/analytics/uptime/:websiteId — uptime % for 24h/7d/30d
  - GET /api/analytics/summary — totals, up/down counts, avg response time (24h)
- Alerts
  - GET /api/alerts/emails — list configured emails
  - POST /api/alerts/emails — add email (unique)
  - PATCH /api/alerts/emails/:id — update (enabled/disabled)
  - DELETE /api/alerts/emails/:id — remove

Frontend
- Vite + React + Tailwind + shadcn/ui components.
- Routes (wouter): `/`, `/monitors`, `/logs`, `/alerts`, `/settings`.

Troubleshooting
- "DATABASE_URL must be set": Ensure .env exists and `dotenv` loads; set a valid PostgreSQL connection string.
- "database does not exist": Create the DB (e.g., `CREATE DATABASE pulsewatch`) and run `npm run db:push`.
- Windows host binding issues: The server binds with `app.listen(port)`; ensure nothing else uses the port.
- Docker errors: Start Docker Desktop first or run with local PostgreSQL.
- Peer dependency conflicts on npm install: Use `--legacy-peer-deps` if needed.

Security Notes
- Email alerts are optional and use SMTP credentials if provided. Without them, emails log to console.
- Monitors fetch external URLs; set reasonable frequencies and monitor trusted domains.

License
MIT
