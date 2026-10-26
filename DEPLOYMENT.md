# Mary Kay GHL Sync Dashboard — Deployment Guide

## Overview

Two components:
1. **Backend** (already on Render) — Node.js + Puppeteer server that logs in to Mary Kay and syncs contacts to GHL
2. **Frontend** (deploy to Vercel) — React dashboard to control syncs and view live logs

---

## Step 1: Update Backend on Render (if not already done)

Update the following files in your Git repo on Render:

### `src/utils/logger.js` — Replace entire file
Adds in-memory log buffer and SSE subscription support for real-time log streaming.

### `src/api/routes.js` — Add these new endpoints
- `GET /api/logs` — Server-Sent Events stream for real-time logs
- `GET /api/logs/recent` — JSON endpoint for recent log entries
- CORS headers added to all responses (allows Vercel frontend to connect)

---

## Step 2: Deploy Frontend to Vercel

### Option A: GitHub Repo (Recommended)

1. Create a new GitHub repo and push the `mk-dashboard/` folder to it
2. Go to [Vercel](https://vercel.com/new) and import the repo
3. Vercel will auto-detect Vite — no build settings needed
4. Add this **Environment Variable** in Vercel Settings:
   - `VITE_BACKEND_URL` = your Render backend URL (e.g., `https://mk-ghl-sync.onrender.com`)
5. Do **not** add `VITE_API_KEY`. Vite embeds every `VITE_*` value into the public browser bundle.
6. In the Render backend, set `FRONTEND_ORIGINS` to the exact deployed Vercel origin, for example `https://your-dashboard.vercel.app`.
5. Click **Deploy**

### Option B: Direct Vercel CLI

```bash
cd mk-dashboard
npm install
npm run build
vercel deploy --prod
```

Then set env vars:
```bash
vercel env add VITE_BACKEND_URL production
```

---

## Step 3: Configure Vercel Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://your-app.onrender.com` | Your Render backend URL |

The dashboard access key is entered at runtime in the connection panel and is
kept in memory only. It is sent in the `x-api-key` header for REST calls. The
frontend first exchanges it for a short-lived stream ticket before opening
logs/progress SSE connections, so the long-lived key is not placed in a URL.
Do not commit the key, put it in a `VITE_*` variable, or store it in browser
localStorage.

After changing `VITE_BACKEND_URL`, trigger a new Vercel deployment. Changing a
Vercel environment variable without rebuilding does not update an already
deployed bundle. The frontend deliberately does not fall back to `localhost:3000` in a
production build. A stale localhost value saved in browser localStorage is
also ignored in production.

The Render URL must be reachable directly from the public internet. Verify it
before troubleshooting the frontend:

```bash
curl -i https://your-render-app.onrender.com/health
```

Expected result is a 2xx response from the backend. A Render `502 Bad
Gateway`, `503 Service Unavailable`, timeout, or connection reset is a backend
deployment/service problem, not a React connection-form problem. Check the
Render service status, start command, port binding (`process.env.PORT`), and
deployment logs first. The frontend now displays these conditions instead of
silently showing an empty client list.

---

## Frontend Features

1. **Connection Settings** — Enter backend URL and API key (saved to browser localStorage)
2. **Client List** — Shows all configured clients with their GHL location IDs
3. **Sync Controls** — "Sync All" or per-client "Sync" buttons
4. **Per-client CSV** — Download one client's GHL-ready contacts without uploading them to GHL
6. **Session Refresh** — Force-refresh a stale browser session
7. **Live Logs** — Real-time log stream via Server-Sent Events (SSE)
8. **Log Filters** — Filter by INFO, WARN, ERROR, or show ALL
9. **Sync Results** — Shows last sync status, contact counts, and error counts

---

## Architecture

```
[Vercel Frontend] ──REST API──> [Render Backend] ──Puppeteer──> [Mary Kay InTouch]
       │                             │                              │
       │              Server-Sent Events (SSE)                      │
       └──────────────────────────────┘                              │
                                                                     │
                                                      [GoHighLevel API]
```

The frontend communicates with the backend via:
- `POST /api/sync/:consultantNum` — Trigger sync
- `POST /api/sync/all` — Sync all clients
- `GET /api/status` — Poll sync progress
- `GET /api/logs` — SSE stream for live logs
- `GET /api/logs/recent` — Fetch recent logs as JSON
- `GET /api/clients` — List configured clients
- `GET /api/export/ghl-csv/:num` — Download one client's GHL-ready contacts as CSV without starting a GHL upload

---

## Local Development

```bash
# Backend
cd mk-ghl-sync
npm install
npm start

# Frontend (separate terminal)
cd mk-dashboard
pnpm install
pnpm dev
```

The frontend connects to `http://localhost:3000` by default.

## Per-client CSV export

The Clients tab includes **CSV (no upload)** on every client row. It calls the backend's existing `GET /api/export/ghl-csv/:num` route. The backend fetches and processes that one client's records and returns the GHL-ready CSV; it does not call the GoHighLevel upload service or start a sync job. The current backend does not expose an all-client CSV route, so the frontend does not show a broken portfolio export button.

The route should require the same `x-api-key` authentication as the other REST endpoints and respond with:

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="CONSULTANT_ghl_contacts.csv"
```

The route filters by the requested consultant/client number before serializing. It is a download-only diagnostic/export route; it is separate from `POST /api/sync/:consultantNum` and the GHL upload code.
