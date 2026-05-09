# SkillSwap — Community Skill Exchange Platform

A full-stack web app where users offer skills they have in exchange for skills they want to learn. No money — just knowledge swapping.

## Architecture

```
┌──────────────────┐      HTTP / JSON      ┌──────────────────┐    Mongoose ODM    ┌──────────────────┐
│  React Frontend  │ ───────────────────►  │ Express Backend  │ ─────────────────► │     MongoDB      │
│  (Vite + Ctx API)│ ◄───────────────────  │ (JWT, REST API)  │ ◄───────────────── │ (local or Atlas) │
└──────────────────┘                       └──────────────────┘                    └──────────────────┘
```

- **Frontend**: React 18 + Vite, React Router, Context API, Axios.
- **Backend**: Node.js + Express, JWT auth, bcrypt, express-validator, Swagger UI.
- **Database**: **MongoDB** via **Mongoose** (NoSQL, document store).

## Data Models

### User
| field         | type     | notes                       |
|---------------|----------|-----------------------------|
| id            | string   | uuid                        |
| name          | string   |                             |
| email         | string   | unique                      |
| passwordHash  | string   | bcrypt                      |
| role          | enum     | `user` \| `admin`           |
| skillsOffered | string[] |                             |
| skillsWanted  | string[] |                             |

### Listing
| field       | type   | notes                          |
|-------------|--------|--------------------------------|
| id          | string | uuid                           |
| skillName   | string |                                |
| description | string |                                |
| category    | string | e.g. Programming, Music, Cooking |
| ownerId     | string | FK → User.id                   |
| createdAt   | string | ISO date                       |

### Request
| field       | type   | notes                                       |
|-------------|--------|---------------------------------------------|
| id          | string | uuid                                        |
| requesterId | string | FK → User.id                                |
| receiverId  | string | FK → User.id                                |
| listingId   | string | FK → Listing.id                             |
| offerSkill  | string | what the requester offers in exchange       |
| message     | string | free text                                   |
| status      | enum   | `pending` \| `approved` \| `rejected`       |
| createdAt   | string | ISO date                                    |

## Quick Start

### 0. Get a MongoDB connection string

You have two options — pick one:

**Option A — MongoDB Atlas (free cloud, no install)**
1. Sign up at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a free **M0** cluster.
3. Add a database user (Database Access) and allow your IP (Network Access → "Allow access from anywhere" for dev).
4. Click **Connect → Drivers**, copy the URI. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillswap`

**Option B — MongoDB locally (macOS via Homebrew)**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```
URI: `mongodb://127.0.0.1:27017/skillswap`

### 1. Configure backend
```bash
cd backend
cp .env.example .env          # then edit .env and paste your MONGODB_URI
npm install
npm run dev                   # http://localhost:4000  (Swagger at /api/docs)
```

### 2. Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

A demo admin + demo users are auto-seeded on first run:
- admin: `admin@skillswap.dev` / `admin123`
- users: `alice@demo.dev`, `bob@demo.dev`, `carla@demo.dev` (password: `password`)

## API Overview

See `backend/API.md` or visit `http://localhost:4000/api/docs` once the backend is running.

| Method | Path                       | Auth   | Description                   |
|--------|----------------------------|--------|-------------------------------|
| POST   | `/api/auth/register`       | —      | Create account                |
| POST   | `/api/auth/login`          | —      | Returns JWT                   |
| GET    | `/api/auth/me`             | Bearer | Current user                  |
| GET    | `/api/skills`              | —      | List/search/filter listings   |
| POST   | `/api/skills`              | Bearer | Create listing                |
| PUT    | `/api/skills/:id`          | Bearer | Edit own listing              |
| DELETE | `/api/skills/:id`          | Bearer | Delete own (or admin)         |
| POST   | `/api/requests`            | Bearer | Initiate exchange             |
| GET    | `/api/requests`            | Bearer | Incoming + outgoing           |
| PATCH  | `/api/requests/:id`        | Bearer | approve / reject              |
| GET    | `/api/admin/users`         | Admin  | List all users                |
| DELETE | `/api/admin/users/:id`     | Admin  | Remove user                   |

## Project Layout

```
website/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── seed.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Listing.js
│   │   │   └── Request.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validate.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── skills.js
│   │       ├── requests.js
│   │       └── admin.js
│   ├── .env.example
│   ├── API.md
│   ├── swagger.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```
