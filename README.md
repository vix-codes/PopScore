# PopScore

PopScore is a full-stack movie review platform where users rate movies with popcorn instead of stars, write reviews, like other reviews, save favorites, and receive simple genre-based recommendations. An admin can manage the movie catalog.

This README is written for two audiences:

1. Someone who wants to run the project.
2. Someone who wants to study the project for viva, interview, or project presentation.

Repository: [github.com/vix-codes/PopScore](https://github.com/vix-codes/PopScore)

---

## Table of contents

- [Project summary](#project-summary)
- [Core features](#core-features)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Folder structure](#folder-structure)
- [How the app works](#how-the-app-works)
- [Authentication flow](#authentication-flow)
- [Review and rating flow](#review-and-rating-flow)
- [Recommendation logic](#recommendation-logic)
- [Data models](#data-models)
- [API reference](#api-reference)
- [Environment variables](#environment-variables)
- [Installation and local setup](#installation-and-local-setup)
- [How to run](#how-to-run)
- [Seed data and demo accounts](#seed-data-and-demo-accounts)
- [Key frontend pages and components](#key-frontend-pages-and-components)
- [Key backend modules](#key-backend-modules)
- [Important design decisions](#important-design-decisions)
- [Validation and security notes](#validation-and-security-notes)
- [Viva preparation](#viva-preparation)
- [Possible improvements](#possible-improvements)
- [Troubleshooting](#troubleshooting)
- [Scripts](#scripts)

---

## Project summary

PopScore is a MERN-style application with:

- a React frontend
- an Express backend
- a MongoDB database
- JWT-based authentication

The main idea is to make movie reviewing feel a little different from the usual 5-star systems by using popcorn ratings and a themed "popmeter" experience.

At a system level, the app supports:

- user signup and login
- role-based authorization (`user` and `admin`)
- movie browsing with search, genre filters, and sorting
- one review per user per movie
- likes on reviews
- favorites
- recommendation generation from a user's review history
- admin movie creation, update, and deletion

---

## Core features

### User-side features

- Register and log in
- Browse all available movies
- Search by title
- Filter by genre
- Sort by newest, rating, or year
- Open a movie details page
- Rate a movie from 1 to 5 popcorns
- Write a review
- Edit or delete your own review
- Like other users' reviews
- Save movies to favorites
- View your own profile and review history
- Get recommendations based on previously reviewed genres

### Admin-side features

- Create a movie
- Edit movie details
- Upload a movie poster image through the admin form
- Delete a movie and its related reviews

### System-side features

- Automatic average rating and review count recalculation
- Automatic sentiment tagging from rating
- JWT route protection
- CORS handling for deployed frontend/backend
- Poster validation so invalid posters are not accepted into the catalog

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 7, Axios, Vite 6 |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Authentication | JWT, bcryptjs |
| Styling | Plain CSS with component-scoped blocks and CSS variables |
| Tooling | npm, concurrently |

---

## Architecture overview

The project is split into two main applications:

### 1. Client

The `client` folder contains the React application.

Responsibilities:

- render UI
- manage route navigation
- store auth state in the browser
- call backend APIs using Axios
- show filtered/sorted movie lists
- handle login/logout/signup

### 2. Server

The `server` folder contains the Express API.

Responsibilities:

- validate requests
- authenticate users
- authorize admins
- talk to MongoDB
- calculate movie statistics
- generate recommendations
- return JSON responses

### 3. Database

MongoDB stores:

- users
- movies
- reviews

Relationships:

- one user can review many movies
- one movie can have many reviews
- one user can favorite many movies
- each user can review a specific movie only once

---

## Folder structure

```text
PopScore/
|-- package.json
|-- README.md
|-- client/
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- api/
|       |   `-- client.js
|       |-- components/
|       |-- context/
|       |-- pages/
|       |-- utils/
|       `-- main.jsx
`-- server/
    |-- package.json
    |-- index.js
    |-- bootstrap-env.js
    |-- config/
    |   `-- db.js
    |-- controllers/
    |-- middleware/
    |-- models/
    |-- routes/
    |-- seed/
    `-- utils/
```

---

## How the app works

### High-level request flow

1. User opens the React app.
2. React page calls an API using Axios.
3. Express receives the request.
4. Middleware checks auth if the route is protected.
5. Controller performs business logic.
6. Mongoose reads or writes MongoDB data.
7. Express sends JSON back.
8. React updates the UI.

Example:

```text
Home page -> GET /api/movies -> server controller -> MongoDB -> JSON response -> movie cards render
```

---

## Authentication flow

PopScore uses JWT-based authentication.

### Signup/login flow

1. User submits signup or login form.
2. Backend validates credentials.
3. Password is hashed using `bcryptjs` when stored.
4. On successful login/signup, backend returns:
   - a JWT token
   - user info
5. Frontend stores the token in `localStorage`.
6. Axios automatically attaches `Authorization: Bearer <token>` to future requests.

### Protected routes

Some routes require login:

- profile
- favorites
- create/edit/delete review
- like review
- recommendations

Admin-only routes:

- create movie
- update movie
- delete movie

The backend middleware in `server/middleware/auth.js` handles token verification and admin checks.

---

## Review and rating flow

### Review creation

When a user posts a review:

1. frontend sends `movieId`, `rating`, and optional `text`
2. backend creates a review document
3. backend derives `sentiment` from rating
4. backend recalculates:
   - `avgRating`
   - `reviewCount`
5. movie list/detail screens immediately reflect updated numbers

### Sentiment logic

The sentiment is generated from the numeric rating:

- `4` or `5` -> `positive`
- `3` -> `neutral`
- `1` or `2` -> `negative`

### One-review-per-user-per-movie rule

This is enforced using a compound uniqueness rule in the review model, so duplicate reviews are blocked at the database level too.

---

## Recommendation logic

Recommendations are intentionally simple and explainable.

### Logic used

1. Fetch all reviews by the logged-in user.
2. Extract genres from the movies the user reviewed.
3. Count how often each genre appears.
4. Take the top genres.
5. Find movies in those genres that the user has not already reviewed.
6. Sort them by rating/review strength.

### Fallback

If the user has not reviewed anything yet, the app falls back to top-rated movies.

This is a good viva point because it shows a recommendation system does not always need machine learning. A rules-based recommendation engine can still be useful and much easier to explain.

---

## Data models

### User model

Fields:

- `username`
- `email`
- `password`
- `role`
- `favorites`
- timestamps

Purpose:

- identify the user
- store hashed credentials
- mark admin access
- keep a list of saved movies

### Movie model

Fields:

- `title`
- `genre` (array)
- `year`
- `description`
- `posterUrl`
- `avgRating`
- `reviewCount`
- timestamps

Purpose:

- store catalog data
- store summary statistics for faster UI rendering

### Review model

Fields:

- `userId`
- `movieId`
- `rating`
- `text`
- `likes`
- `sentiment`
- timestamps

Purpose:

- connect a user to a movie opinion
- store rating content and engagement

Important rule:

- unique review per `(userId, movieId)`

---

## API reference

Base path: `/api`

Protected routes require:

```http
Authorization: Bearer <token>
```

### Auth routes

#### `POST /api/auth/register`

Body:

```json
{
  "username": "sam",
  "email": "sam@example.com",
  "password": "secret123"
}
```

Returns token + user object.

#### `POST /api/auth/login`

Body:

```json
{
  "email": "sam@example.com",
  "password": "secret123"
}
```

Returns token + user object.

### Movie routes

#### `GET /api/movies`

Optional query params:

- `search`
- `genre`
- `sort`

Sort values:

- `newest`
- `rating`
- `rating_asc`
- `year`
- `year_asc`

#### `GET /api/movies/top`

Returns top-rated movies.

#### `GET /api/movies/recommendations`

Protected. Returns personalized recommendations.

#### `GET /api/movies/:id`

Returns one movie plus rating breakdown.

#### `POST /api/movies`

Admin only. Creates a movie.

#### `PUT /api/movies/:id`

Admin only. Updates a movie.

#### `DELETE /api/movies/:id`

Admin only. Deletes a movie and related reviews.

### Review routes

#### `POST /api/reviews`

Protected. Create review.

#### `GET /api/reviews/:movieId`

Get all reviews for a movie.

#### `PUT /api/reviews/:id`

Protected. Owner can edit review.

#### `DELETE /api/reviews/:id`

Protected. Owner or admin can delete.

#### `POST /api/reviews/:id/like`

Protected. Increment review likes.

### User routes

#### `GET /api/users/profile`

Protected. Current user profile.

#### `GET /api/users/reviews`

Protected. Current user's reviews.

#### `GET /api/users/favorites`

Protected. Current user's favorite movies.

#### `POST /api/users/favorites/:movieId`

Protected. Toggle favorite.

### Health route

#### `GET /api/health`

Used to check whether the backend is up.

---

## Environment variables

Create `server/.env`.

### Required / important backend variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend port, default `5000` |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Optional DB name override |
| `JWT_SECRET` | Secret used to sign and verify tokens |
| `CLIENT_ORIGIN` | Allowed frontend origin(s) for CORS |

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/popscore?appName=Pop
MONGODB_DB_NAME=popscore
JWT_SECRET=your_super_secret_change_in_production
CLIENT_ORIGIN=https://your-vercel-frontend-url.vercel.app
```

### Frontend build variable

If frontend and backend are hosted separately:

```env
VITE_API_URL=https://your-api-host.up.railway.app
```

Important:

- do not add a trailing slash
- do not add `/api`

---

## Installation and local setup

From the project root:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

Or from root:

```bash
npm run install:all
```

---

## How to run

### Run backend only

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Run frontend only

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Run both together

```bash
cd ..
npm run dev
```

---

## Seed data and demo accounts

To reset and seed the database:

```bash
npm run seed
```

Important:

- seeding is destructive
- it clears existing users, movies, and reviews
- it repopulates the database with demo data

### Admin account

| Email | Password |
|---|---|
| `admin@popscore.com` | `admin123` |

### Demo user password

All demo non-admin users use:

```text
demo123
```

Examples:

- `demo@popscore.com`
- `film@popscore.com`
- `alice@popscore.com`
- `bob@popscore.com`

---

## Key frontend pages and components

### Main pages

- `/` -> Home page
- `/movie/:id` -> movie details
- `/login` -> login form
- `/signup` -> register form
- `/profile` -> user profile and own reviews
- `/favorites` -> saved movies
- `/admin` -> admin movie management

### Important components

#### `PopcornRating`

Responsible for interactive and read-only popcorn rating display.

#### `MovieCard`

Shows movie poster, title, genres, score, and popmeter.

#### `ReviewList`

Displays all reviews for a movie and supports like/edit/delete flows.

#### `FilterBar` and `SearchBar`

Allow client-side control of backend query filters.

#### `AuthContext`

Central frontend auth state manager.

It:

- stores token and user
- exposes `login`, `logout`, `refreshUser`
- keeps route behavior consistent

---

## Key backend modules

### `server/index.js`

Entry point of the Express server.

It:

- loads environment variables
- sets up middleware
- enables JSON parsing
- configures CORS
- mounts all route groups
- starts the server

### `server/config/db.js`

Connects Mongoose to MongoDB.

### `server/middleware/auth.js`

Contains:

- token verification middleware
- admin authorization middleware

### `server/controllers/`

Contains business logic for each route group.

Examples:

- login/register handling
- movie listing and filtering
- recommendation generation
- review creation and stats recalculation

### `server/utils/movieStats.js`

Handles movie statistics logic such as:

- average rating
- review count
- rating breakdown
- sentiment conversion

---

## Important design decisions

### Why store `avgRating` and `reviewCount` inside the movie document?

Because it makes movie list rendering fast.

If these values were calculated fresh for every movie card on every request, the API would be slower and more complex.

Tradeoff:

- extra update step after review changes
- faster reads for the UI

### Why use JWT instead of session-based auth?

Because JWT is easy to use in split deployments:

- frontend can be on Vercel
- backend can be on Railway

The token travels with requests and the backend stays stateless.

### Why use a rule-based recommendation system?

Because it is:

- easy to implement
- easy to explain
- fast to compute
- good enough for a student project demo

### Why validate poster images?

Because broken posters make the UI look incomplete and confusing. The backend now rejects invalid poster image values so only real image posters enter the catalog.

---

## Validation and security notes

### Passwords

- never stored in plain text
- hashed using bcrypt

### Tokens

- signed using `JWT_SECRET`
- verified on protected routes

### Admin-only logic

- movie create/update/delete is protected by admin middleware

### Poster validation

- admin cannot add a movie without a valid image poster
- uploaded image is cropped to poster aspect ratio in the frontend

### Review ownership

- user can edit/delete only their own review
- admin can delete reviews as part of broader moderation/deletion flow

---

## Viva preparation

This section is meant for project explanation practice.

### 1. What problem does this project solve?

PopScore solves the problem of building a community-based movie review system with authentication, user interaction, recommendations, and admin control in one integrated full-stack application.

### 2. Why did you choose React?

Because React makes it easy to build reusable UI components, manage page state, and create a smooth single-page application experience.

### 3. Why Express and MongoDB?

- Express keeps backend routing and middleware simple.
- MongoDB is flexible for document-based entities like users, movies, reviews, and favorites.

### 4. How is authentication implemented?

Authentication is implemented using JWT. On login or signup, the backend creates a token and sends it to the frontend. The frontend stores it and includes it in protected requests. Middleware verifies that token before allowing access.

### 5. How do you ensure one user cannot review the same movie twice?

The review model uses a unique constraint on `userId + movieId`, and the application logic also assumes one review per user per movie.

### 6. How are movie ratings updated?

Whenever a review is created, updated, or deleted, the backend recalculates the movie's `avgRating` and `reviewCount`.

### 7. How do recommendations work?

Recommendations are generated by looking at genres from the user's review history, ranking the most common genres, and suggesting unseen movies from those genres.

### 8. What is the role of `AuthContext`?

`AuthContext` centralizes login state and user data on the frontend so different pages can consistently know whether a user is logged in, who they are, and whether they are an admin.

### 9. Why did you use middleware?

Middleware separates reusable concerns such as auth validation and admin checks from route business logic, which keeps the code cleaner and easier to maintain.

### 10. What are the main modules of the project?

- models
- controllers
- routes
- middleware
- utils
- pages
- components
- context

### 11. What are the limitations of this project?

Possible limitations:

- recommendations are simple, not ML-based
- likes can be incremented repeatedly if not further restricted
- localStorage auth is simpler but less secure than httpOnly cookie auth
- image storage is not moved to a dedicated media storage service

### 12. If you had more time, what would you improve?

Strong answers:

- add pagination
- add comments/replies to reviews
- add watchlist vs favorites separation
- use cloud media storage
- add advanced recommendation logic
- add automated tests
- add rate limiting and stronger validation

---

## Possible improvements

- image storage with Cloudinary, S3, or similar
- pagination and infinite scrolling
- better review moderation
- comment threads on reviews
- per-user like tracking
- password reset flow
- email verification
- richer admin dashboard
- unit and integration tests
- caching for heavy routes
- analytics for popular genres and movies

---

## Troubleshooting

| Problem | Check |
|---|---|
| MongoDB connection fails | `MONGODB_URI`, Atlas IP allowlist, DB user/password |
| 401 on protected route | token missing, invalid, or `JWT_SECRET` changed |
| CORS error in production | `CLIENT_ORIGIN` not set correctly |
| Frontend not talking to backend | `VITE_API_URL` missing or wrong at frontend build time |
| Movies not loading | backend route, DB connection, or poster validation removing invalid movies |
| Admin create movie fails | ensure poster image is selected and valid |
| Empty catalog | run `npm run seed` or add movies through admin |

---

## Scripts

### Root scripts

| Command | Purpose |
|---|---|
| `npm run dev` | start frontend and backend together |
| `npm run server` | start backend only |
| `npm run client` | start frontend only |
| `npm run seed` | run seed script |
| `npm run build` | build frontend |

### Server scripts

| Command | Purpose |
|---|---|
| `npm start` | run backend in normal mode |
| `npm run dev` | run backend with watch mode |
| `npm run seed` | seed the database |

### Client scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | production build |
| `npm run preview` | preview production build locally |

---

## Short viva pitch

If you need a 30-second explanation:

> PopScore is a full-stack movie review web application built with React, Express, MongoDB, and JWT authentication. Users can browse movies, rate them with popcorn, write reviews, save favorites, and receive genre-based recommendations. Admins can manage the movie catalog. The project demonstrates CRUD operations, authentication, role-based authorization, REST API design, state management, and database relationships in one integrated system.

---

## License

Add a `LICENSE` file if you want to publish the project with explicit usage terms. Until then, normal copyright rules apply.

