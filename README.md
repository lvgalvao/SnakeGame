# Snake Game

Classic Snake game with a public leaderboard and admin panel. Anyone can play and save their score; only the admin can delete entries.

- **Frontend**: React + Vite (`client/`) — retro-terminal UI, canvas game
- **Backend**: Node.js + Express + SQLite (`server/`)
- **Auth**: single env-configured admin, JWT bearer token (1 h TTL)

---

## Requirements

- Node.js 18+
- npm 9+

---

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
CLIENT_ORIGIN=http://localhost:5173   # allowed CORS origin
ADMIN_USER=admin
ADMIN_PASS_HASH=<bcrypt hash>         # generate below
JWT_SECRET=<random 32+ char string>
PORT=3001
```

Generate a bcrypt hash for the admin password:

```bash
npm run hash -- 'your-password-here'
```

Start the server:

```bash
npm run dev     # auto-restarts on file changes
# or
npm start       # production
```

### 2. Client

```bash
cd client
npm install
npm run dev
```

Open <http://localhost:5173>.

---

## Playing

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move snake |
| — | Eat red squares to grow |
| — | Hit a wall or yourself → game over |

When the game ends, enter your name and click **Save record** (disabled if score is 0).
The game timer pauses automatically when the browser tab loses focus.

---

## Admin

Log in at `/login` with the credentials from `.env`.

- Admin session lasts **1 hour** (JWT).
- Only the admin sees **Delete** buttons on the leaderboard.
- Login is rate-limited to **10 attempts per 15 minutes**.

---

## API

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `POST` | `/api/auth/login` | — | `{ username, password }` | Returns JWT |
| `GET` | `/api/scores` | — | — | Top 50 scores |
| `POST` | `/api/scores` | — | `{ player_name, score }` | Save a score (max 397) |
| `DELETE` | `/api/scores/:id` | admin | — | Delete a score |

Score validation: `score` must be a non-negative integer ≤ 397 (maximum achievable in a 20×20 grid).

---

## Project structure

```
client/
  src/
    api.js              fetch wrapper with auto Bearer header
    auth.js             localStorage session helpers + client-side JWT decode
    components/
      SnakeGame.jsx     canvas game loop
      Leaderboard.jsx   public score table with admin delete
      Login.jsx         admin login form
      NavBar.jsx        top navigation
    styles.css          design system (retro-terminal theme)

server/
  src/
    index.js            Express entry point, CORS, routes
    db.js               SQLite setup (WAL mode, scores table)
    auth.js             JWT sign + requireAdmin middleware
    routes/
      auth.js           POST /api/auth/login (rate-limited)
      scores.js         GET / POST / DELETE /api/scores
  .env.example          environment variable template
  data.sqlite           created at first run (not committed)
```

---

## Data

Scores are stored in `server/data.sqlite`, created automatically on first run. Delete the file to reset all scores.
