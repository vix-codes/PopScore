# PopScore

**PopScore** is a community-driven movie review platform: browse films, rate them with **popcorn (1–5)** instead of stars, read and like reviews, manage favorites, and get **genre-based recommendations** from your review history. An **admin** role can manage the movie catalog.

Live-style demo target: modern dark “cinema” UI, responsive layout, loading states, and JWT-secured routes.

Repository: [github.com/vix-codes/PopScore](https://github.com/vix-codes/PopScore)

**Live API + app (Railway):** [https://popscore-production.up.railway.app](https://popscore-production.up.railway.app)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture & folder structure](#architecture--folder-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Installation](#installation)
- [Running locally](#running-locally)
- [Database seed & demo accounts](#database-seed--demo-accounts)
- [API reference](#api-reference)
- [Data models](#data-models)
- [Frontend](#frontend)
- [Production deployment notes](#production-deployment-notes)
- [Troubleshooting](#troubleshooting)

---

## Features

| Area | Details |
|------|---------|
| **Auth** | Register / login with **JWT** (stored in `localStorage`) and **bcrypt**-hashed passwords |
| **Movies** | List with **search**, **multi-genre filter**, **sort** (rating, year, newest); **top 5 trending**; single movie with **rating breakdown** |
| **Reviews** | One review per user per movie; **1–5 popcorn** rating; optional text; **sentiment** derived from rating (≥4 positive, 3 neutral, ≤2 negative); **likes**; edit/delete own review |
| **Ratings** | **avgRating** and **reviewCount** on each movie **recalculated** after every review create/update/delete |
| **Users** | Profile, **favorites** (toggle per movie), **my reviews** list |
| **Recommendations** | Logged-in users get movies in genres they have reviewed (excluding already-reviewed titles); fallback to top-rated if no history |
| **Admin** | Create / update / delete movies |
| **UX** | Dark theme, animations, skeleton-style loaders, debounced search, disabled buttons while submitting |

---

## Tech stack

| Layer | Technology |
|--------|------------|
| **Frontend** | React 18 (hooks), React Router 7, Axios, Vite 6, CSS (custom properties / component-scoped blocks) |
| **Backend** | Node.js, Express 4, ES modules |
| **Database** | MongoDB, Mongoose 8 |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` |

---

## Architecture & folder structure

```
PopScore/
├── package.json              # Root scripts (dev, seed, build)
├── client/                   # Vite + React SPA
│   ├── src/
│   │   ├── api/client.js     # Axios instance + JWT header
│   │   ├── context/          # AuthContext
│   │   ├── components/       # Navbar, MovieCard, PopcornRating, …
│   │   └── pages/            # Home, MovieDetails, Login, Signup, Admin, Profile, Favorites
│   └── vite.config.js        # Dev server + /api → backend proxy
├── server/
│   ├── index.js              # Express app entry
│   ├── config/db.js          # Mongoose connection
│   ├── models/               # User, Movie, Review
│   ├── middleware/auth.js    # JWT auth, optional auth, admin guard
│   ├── controllers/
│   ├── routes/
│   ├── utils/movieStats.js   # Sentiment helper, avg/reviewCount, rating breakdown
│   └── seed/                 # seed.js + moviesData.js (large catalog)
└── .gitignore                # Excludes node_modules, dist, .env, …
```

---

## Prerequisites

- **Node.js** 18+ (22 LTS is fine)
- **MongoDB** — local (`mongodb://127.0.0.1:27017/...`) or **MongoDB Atlas** (`mongodb+srv://...`)
- **npm** (ships with Node)

---

## Environment variables

Create **`server/.env`** (never commit real secrets). Copy from `server/.env.example`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default **5000**) |
| `MONGODB_URI` | Full MongoDB connection string. **`DATABASE_URL`** and **`MONGO_URI`** are accepted as aliases. |
| `MONGODB_DB_NAME` | Optional. Defaults to **`popscore`**. Use if your URI has no database in the path (common Atlas copy-paste ends with `...net/?appName=...`). |
| `JWT_SECRET` | Strong secret for signing tokens |
| `CLIENT_ORIGIN` | Optional. Comma-separated **frontend** URLs allowed by CORS (e.g. your Vercel app). Local `localhost:5173` is always allowed. |

Example shape (placeholders only):

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/popscore?appName=Pop
JWT_SECRET=your_super_secret_change_in_production
CLIENT_ORIGIN=https://your-app.vercel.app
```

**Split deploy (hosted UI + hosted API):** set **`VITE_API_URL`** in the client build environment to your API origin **without** a trailing slash (e.g. `https://api.yourapp.com`). The app will call `{VITE_API_URL}/api/...`. Copy `client/.env.example` to `client/.env` for local overrides.

**Atlas tips:** allow your IP (or `0.0.0.0/0` for development only), use a dedicated DB user with least privilege, and rotate credentials if they are ever exposed.

---

## Installation

From the **repository root**:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

Or use the convenience script (Unix-style shells; on Windows PowerShell you can run the three installs separately as above):

```bash
npm run install:all
```

---

## Running locally

**Terminal 1 — API** (from `server/`):

```bash
cd server
npm run dev
```

API: `http://localhost:5000` (or your `PORT`).

**Terminal 2 — client** (from `client/`):

```bash
cd client
npm run dev
```

App: `http://localhost:5173` — Vite proxies **`/api`** to the backend (see `client/vite.config.js`).

**Single command** from root (requires root `npm install` for `concurrently`):

```bash
npm run dev
```

---

## Database seed & demo accounts

Resets the database and loads a **large demo catalog** (~**90+ movies**, **800+ reviews**, **14** community accounts plus **1 admin**).

```bash
npm run seed
```

### Admin (movie CRUD + reviews)

| Email | Password |
|--------|----------|
| **`admin@popscore.com`** | **`admin123`** |

Use this account to open **Admin** in the nav and add/edit/delete movies.

### Demo community accounts

Password for **every** seeded non-admin user: **`demo123`**

| Email | Username |
|--------|----------|
| `demo@popscore.com` | democritic |
| `film@popscore.com` | filmfan |
| `alice@popscore.com` | popcornqueen |
| `bob@popscore.com` | reelbuff |
| `casey@popscore.com` | nightowl |
| `dana@popscore.com` | cinephile_d |
| `mia@popscore.com` | marathon_mia |
| `jay@popscore.com` | silent_j |
| `opus@popscore.com` | oscar_opus |
| `tara@popscore.com` | trailerpark |
| `ivy@popscore.com` | imax_ivy |
| `ned@popscore.com` | filmnoir_ned |
| `sam@popscore.com` | sundance_sam |
| `bex@popscore.com` | blockbuster_bex |

Seeding **clears** existing `Review`, `Movie`, and `User` documents, then inserts fresh data. Run only when you intend to reset the database.

---

## API reference

Base path: **`/api`**.  
Protected routes expect header: **`Authorization: Bearer <token>`**.

### Auth — `/api/auth`

| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/register` | `{ username, email, password }` | No |
| POST | `/login` | `{ email, password }` | No |

Response includes `token` and `user` (`id`, `username`, `email`, `role`, `favorites`).

### Movies — `/api/movies`

| Method | Path | Query / body | Auth |
|--------|------|----------------|------|
| GET | `/` | `search`, `genre` (comma-separated or repeated), `sort`: `newest` (omit), `rating`, `rating_asc`, `year`, `year_asc` | No |
| GET | `/top` | — | No — top 5 by rating + review count |
| GET | `/recommendations` | — | **Yes** — smart picks from reviewed genres |
| GET | `/:id` | — | No — includes `ratingBreakdown` `{1..5: count}` |
| POST | `/` | `{ title, genre[], year, description, posterUrl }` | **Admin** |
| PUT | `/:id` | Same fields (partial OK in controller) | **Admin** |
| DELETE | `/:id` | — | **Admin** |

### Reviews — `/api/reviews`

| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/` | `{ movieId, rating (1–5), text? }` | **Yes** — one per user per movie; sentiment set automatically |
| GET | `/:movieId` | — | No — list for movie (newest first), with `username` |
| PUT | `/:id` | `{ rating?, text? }` | **Yes** — owner only |
| DELETE | `/:id` | — | **Yes** — owner or **admin** |
| POST | `/:id/like` | — | **Yes** — increments `likes` |

After create/update/delete, movie **avgRating** and **reviewCount** are updated server-side.

### Users — `/api/users`

| Method | Path | Auth |
|--------|------|------|
| GET | `/profile` | **Yes** |
| GET | `/reviews` | **Yes** — current user’s reviews + populated movie |
| GET | `/favorites` | **Yes** — populated favorite movies |
| POST | `/favorites/:movieId` | **Yes** — toggles favorite |

### Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/health` | `{ ok: true }` |

---

## Data models

### User

- `username`, `email`, `password` (hashed), `role`: `user` | `admin`, `favorites`: `[ObjectId]` → Movie  
- Timestamps via Mongoose

### Movie

- `title`, `genre` (string array), `year`, `description`, `posterUrl`, `avgRating`, `reviewCount`  
- Timestamps

### Review

- `userId`, `movieId`, `rating` (1–5), `text`, `likes` (default 0), `sentiment`: `positive` | `neutral` | `negative`  
- **Unique** compound index on `(userId, movieId)`  
- Timestamps

---

## Frontend

### Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home — trending, recommendations (if logged in), filters, grid | Public |
| `/movie/:id` | Details — poster, stats, breakdown, reviews, favorite, review form | Public |
| `/login`, `/signup` | Auth | Public |
| `/profile` | User info + all reviews | **Logged in** |
| `/favorites` | Saved movies | **Logged in** |
| `/admin` | Movie CRUD | **Admin** |

### Components

`Navbar`, `MovieCard`, `PopcornRating`, `ReviewForm`, `ReviewList`, `FilterBar`, `SearchBar`, `Loader` (+ skeleton-style grid/detail placeholders).

### API client

Axios uses **`/api`** in development (Vite proxy). With **`VITE_API_URL`** set at build time, requests go to `{VITE_API_URL}/api`. Set **`CLIENT_ORIGIN`** on the server to your deployed frontend URL(s) so CORS allows login and authenticated calls.

---

## Production deployment notes

1. **Build the client:** set `VITE_API_URL` to your API host if the UI is not served from the same origin, then `npm run build` → `client/dist/`.
2. **Run the server:** `cd server && npm start` (`PORT`, `MONGODB_URI`, `JWT_SECRET`, optional `CLIENT_ORIGIN`).
3. **CORS:** set **`CLIENT_ORIGIN`** (comma-separated) to your production site(s); localhost dev origins stay allowed in code.
4. **Same-origin option:** serve `client/dist` from Express or one reverse proxy so relative `/api` still works without `VITE_API_URL`.
5. **Seed:** On first deploy, if the database has **no movies and no users**, the server **auto-seeds** demo data. To **reset** everything, run `npm run seed` locally (destructive).

### Railway (API service)

Railway containers have **no MongoDB on `127.0.0.1`**. You must set:

| Variable | Value |
|----------|--------|
| **`MONGODB_URI`** | Full Atlas string, e.g. `mongodb+srv://USER:PASS@cluster.mongodb.net/popscore?appName=Pop` |
| **`JWT_SECRET`** | Long random string |
| **`CLIENT_ORIGIN`** | Your frontend URL(s), comma-separated (e.g. Vercel) |
| **`NODE_ENV`** | `production` (often set automatically) |

The server also reads **`DATABASE_URL`** if Railway or a plugin injects that instead of `MONGODB_URI`.

In Atlas: **Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)** for cloud hosts, or Railway’s outbound IPs if you prefer.

Redeploy after saving variables. If `MONGODB_URI` is missing in production, the app now exits with an explicit error instead of looping on `ECONNREFUSED 127.0.0.1:27017`.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| `ECONNREFUSED 127.0.0.1:27017` on Railway / Render | **`MONGODB_URI`** (or **`DATABASE_URL`**) not set in the service environment — add your Atlas connection string |
| Railway / Atlas “database missing” or empty data | Put **`/popscore`** before `?` in the URI, or set **`MONGODB_DB_NAME=popscore`** in Railway. Then run **`npm run seed`** once so collections exist. |
| `MongoServerError` / connection refused | `MONGODB_URI`, Atlas IP allowlist, user/password |
| 401 on protected routes | Token in `localStorage`, `JWT_SECRET` unchanged between login and verify |
| CORS errors / login works locally but not on Vercel | Set **`CLIENT_ORIGIN`** on the API to your site URL; set **`VITE_API_URL`** when building the client for split hosting |
| Empty catalog after deploy | Run seed or create movies via admin |
| Reviews not updating averages | Confirm `movieId` is valid; check server logs for errors |

---

## Scripts summary (root `package.json`)

| Script | Action |
|--------|--------|
| `npm run dev` | API + Vite together |
| `npm run server` | API only |
| `npm run client` | Frontend only |
| `npm run seed` | Run `server/seed/seed.js` |
| `npm run build` | Production build of the client |

---

## License

Add a `LICENSE` file if you plan to open-source or clarify terms; until then, default copyright applies to your organization or account.

---

**PopScore** — *rate with popcorn, not stars.*
