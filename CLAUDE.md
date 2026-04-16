# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Snake Game — a browser-based Snake game with a React frontend and an Express/SQLite backend. The two halves are fully decoupled: the client proxies `/api` requests to the server during development.

## Structure

```
client/   React + Vite frontend (port 5173 in dev)
server/   Express REST API      (port 3001)
```

## Commands

### Server (run from `server/`)
```bash
npm start          # production
npm run dev        # development with file-watch restart (node --watch)
```

### Client (run from `client/`)
```bash
npm run dev        # Vite dev server with HMR + /api proxy to localhost:3001
npm run build      # production build to client/dist/
npm run preview    # preview the production build locally
```

### Generate a bcrypt hash for the admin password
```bash
cd server && node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
# or via the package script:
npm run hash yourpassword
```

## Environment Setup

Copy `server/.env.example` to `server/.env` and fill in:

```
CLIENT_ORIGIN=http://localhost:5173
ADMIN_USER=admin
ADMIN_PASS_HASH=<bcrypt hash — use npm run hash>
JWT_SECRET=<random 32-byte secret>
PORT=3001
```

`CLIENT_ORIGIN` controls the CORS allowed origin — must match wherever the frontend is served from. The admin credentials are stored only in env vars; there is no user table in the database.

## Architecture

### Backend (`server/src/`)

- **`index.js`** — Express entry point; mounts `/api/auth` and `/api/scores`
- **`db.js`** — Opens (or creates) `server/data.sqlite` with WAL mode; runs `CREATE TABLE IF NOT EXISTS scores` on startup; exports the singleton `Database` instance
- **`auth.js`** — JWT helpers: `signToken(payload)` and `requireAdmin` middleware (role check on Bearer token)
- **`routes/auth.js`** — `POST /api/auth/login` — validates against env-var credentials, returns a 1-hour JWT
- **`routes/scores.js`** — `GET /api/scores` (public, top-50 by score), `POST /api/scores` (**public** — any player can save), `DELETE /api/scores/:id` (admin only)

The scores table has no user foreign key; any admin can delete any score. `POST /api/scores` validates that `score` is a non-negative integer ≤ 397 (the maximum achievable in a 20×20 grid with 3 starting segments).

### Frontend (`client/src/`)

- **`main.jsx`** — React root; wraps `<App>` in `<BrowserRouter>`
- **`auth.js`** — Session helpers that read/write `snake_token` and `snake_user` in `localStorage`; `isAdmin()` decodes the JWT payload client-side and checks expiry
- **`api.js`** — Thin `fetch` wrapper; attaches `Authorization: Bearer` header automatically; calls `clearSession()` on 401; exports `api.login`, `api.listScores`, `api.saveScore`, `api.deleteScore`
- **`components/Login.jsx`** — Admin login form
- **`components/NavBar.jsx`** — Nav with links to `/` and `/leaderboard`; shows logout button when `isAdmin()` is true

- **`components/SnakeGame.jsx`** — canvas game loop; constants `GRID=20`, `CELL=20`, `TICK_MS=130`; timer pauses on `visibilitychange`; `randomFood` returns `null` when the grid is full (triggers game over — handle this case if touching game logic)
- **`components/Leaderboard.jsx`** — public score table; admin sees Delete buttons
- **`components/App.jsx`** — routes `/` → SnakeGame, `/login` → Login, `/leaderboard` → Leaderboard

## Security constraints

- **CORS**: restricted to `CLIENT_ORIGIN` env var — do not widen to `*` in production.
- **Rate limiting**: `POST /api/auth/login` is limited to 10 requests per 15 minutes per IP (`express-rate-limit`).
- **Score cap**: server rejects any `POST /api/scores` with `score > 397` to prevent leaderboard abuse.
- **JWT_SECRET**: `signToken` and `requireAdmin` both throw explicitly if `JWT_SECRET` is not set — do not remove that guard.
- **bcrypt**: login uses `bcrypt.compare` (async) — do not replace with `compareSync`, which blocks the event loop.

## Design system

The UI follows a **retro-terminal / CRT phosphor** aesthetic. When adding or changing frontend components:

- Fonts are loaded via Google Fonts in `client/index.html`: **Orbitron** (headings, score, brand) and **Space Mono** (all body text).
- All colours and spacing are defined as CSS variables in `client/src/styles.css` — use variables, do not hardcode hex values.
- Key variables: `--glow` (`#39ff14` neon green), `--bg` (`#030a03`), `--danger` (`#ff4444`), `--font-display`, `--font-body`.
- The canvas scanline overlay is a CSS `::after` pseudo-element on `.canvas-wrap` — do not add a `z-index` to canvas or it will appear above the scanlines.

### Auth flow

1. Admin logs in via `POST /api/auth/login` with plaintext password
2. Server bcrypt-compares against `ADMIN_PASS_HASH` env var, issues a JWT (`role: 'admin'`, 1 h TTL)
3. Client stores token in `localStorage`; `isAdmin()` verifies role + expiry client-side
4. Protected API calls include `Authorization: Bearer <token>`; `requireAdmin` middleware verifies on the server
