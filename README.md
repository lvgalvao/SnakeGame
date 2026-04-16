# Snake Game

Classic snake game with admin login, public leaderboard, and persistent score storage.

- **Frontend**: React + Vite (`client/`)
- **Backend**: Node + Express + SQLite (`server/`)
- **Auth**: single env-configured admin, JWT bearer token

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Generate a bcrypt hash for the admin password and paste it into `.env`:

```bash
npm run hash -- 'your-password-here'
```

Edit `server/.env`:

```
ADMIN_USER=admin
ADMIN_PASS_HASH=<paste hash from above>
JWT_SECRET=<random 32+ char string>
PORT=3001
```

Start the server:

```bash
npm run dev    # auto-restarts on changes
# or: npm start
```

### 2. Client

```bash
cd client
npm install
npm run dev
```

Open <http://localhost:5173>.

## Playing

- **Arrow keys** or **WASD** to move.
- Eat red squares to grow.
- Hit a wall or yourself → game over.

## Admin features

After logging in at `/login`:

- Save your final score from the game-over screen.
- Delete entries on the leaderboard.

The leaderboard at `/leaderboard` is public; only admin sees the delete buttons and can save scores.

## API

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | none | `{ username, password }` |
| GET  | `/api/scores`     | none | — |
| POST | `/api/scores`     | admin | `{ player_name, score }` |
| DELETE | `/api/scores/:id` | admin | — |

Scores live in `server/data.sqlite`. Delete the file to wipe.
