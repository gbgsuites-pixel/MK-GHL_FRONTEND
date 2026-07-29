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
4. Add these **Environment Variables** in Vercel Settings:
   - `VITE_BACKEND_URL` = your Render backend URL (e.g., `https://mk-ghl-sync.onrender.com`)
   - `VITE_API_KEY` = your API secret key (e.g., `my-local-test-key`)
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
vercel env add VITE_API_KEY production
```

---

## Step 3: Configure Vercel Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://your-app.onrender.com` | Your Render backend URL |
| `VITE_API_KEY` | `my-local-test-key` | Same as `API_SECRET_KEY` in backend `.env` |

These can also be set directly in the UI (Settings > Environment Variables).

---

## Frontend Features

1. **Connection Settings** — Enter backend URL and API key (saved to browser localStorage)
2. **Client List** — Shows all configured clients with their GHL location IDs
3. **Sync Controls** — "Sync All" or per-client "Sync" buttons
4. **CSV Download** — Download GHL-ready contacts for any client
5. **Session Refresh** — Force-refresh a stale browser session
6. **Live Logs** — Real-time log stream via Server-Sent Events (SSE)
7. **Log Filters** — Filter by INFO, WARN, ERROR, or show ALL
8. **Sync Results** — Shows last sync status, contact counts, and error counts

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
- `GET /api/export/ghl-csv/:num` — Download CSV

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
