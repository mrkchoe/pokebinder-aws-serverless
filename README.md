# TCG Inventory Platform

A **binder-style trading card inventory website** built with **Next.js 14** and a **normalized relational schema** (SQLite in local dev, Postgres-ready schema for production).

The repository still contains the original **PokéBinder (AWS Edition)** backend and infrastructure, but the primary experience is now a self-contained web app focused on inventory browsing.

## Demo Features

- **Landing page**
  - Project overview and feature highlights.
  - Screenshots section placeholder.
  - Clear call-to-action to open the binder view and a placeholder link to Binder.
- **Binder page (`/cards`)**
  - Searchable, filterable grid of cards.
  - Filters by **set**, **rarity**, and **type**.
  - Sort dropdown for **market value**, **release date**, and **name**.
  - Cards show artwork, set, rarity, type, market value, and owned quantity.
- **Card detail page (`/cards/:id`)**
  - Detailed view of a single card, including set, number, rarity, type, image, and market value.
  - Aggregated **owned quantity** from `inventory`.
  - List of inventory lots with quantity, condition, and acquired date.
- **Health check**
  - Simple JSON health endpoint at `/api/health`.

The legacy AWS-backed PokéBinder UI (Cognito auth, DynamoDB, Lambda, SAM) is kept under `backend/` and `infra/` for reference but is not required to run the TCG Inventory Platform.

## Architecture (ASCII)

### TCG Inventory Platform (Next.js + SQLite)

```
┌──────────────────────────────────────────────────────────────┐
│                  TCG Inventory Platform (Next.js)            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Browser (React, App Router)                               │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  /            Landing page                          │   │
│   │  /cards       Binder-style card grid + filters      │   │
│   │  /cards/:id   Card detail + owned quantity          │   │
│   └──────────────────────────────────────────────────────┘   │
│                      ▲                        ▲              │
│                      │ fetch()                │ fetch()      │
│                      │                        │              │
│   ┌──────────────────┴────────────────────────┴───────────┐  │
│   │           Next.js API Routes (Node runtime)          │  │
│   │   /api/health                                        │  │
│   │   /api/cards        – list + search/filter/sort      │  │
│   │   /api/cards/:id    – single card + inventory lots   │  │
│   │   /api/filters      – sets, rarities, types          │  │
│   └──────────────────────────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│   ┌──────────────────────────────────────────────────────┐  │
│   │   SQLite database (local dev)                       │  │
│   │   tables: sets, cards, inventory                    │  │
│   │   seed/reset via npm scripts                        │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Legacy: PokéBinder (AWS Edition)

The original AWS serverless architecture is preserved in the repo:

```
/frontend   Next.js app (Cognito auth, original binder UI)
/backend    Lambda handlers (TypeScript → dist/)
/infra      AWS SAM template (Cognito, API Gateway, Lambda, DynamoDB)
```

See `MIGRATION_PLAN.md` for how the project evolved from the AWS-centric design to the TCG Inventory Platform.

## Data Model Overview

The TCG Inventory Platform uses a normalized relational schema (SQLite locally, Postgres-compatible):

```text
sets
----
id            INTEGER PRIMARY KEY AUTOINCREMENT
name          TEXT NOT NULL UNIQUE
release_date  TEXT NOT NULL  -- ISO-8601 date string

cards
-----
id            INTEGER PRIMARY KEY AUTOINCREMENT
name          TEXT NOT NULL
set_id        INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE
number        TEXT NOT NULL
rarity        TEXT NOT NULL
type          TEXT NOT NULL
image_url     TEXT NOT NULL
market_value  REAL NOT NULL CHECK (market_value >= 0)
UNIQUE (set_id, number)

inventory
---------
id            INTEGER PRIMARY KEY AUTOINCREMENT
card_id       INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE
quantity      INTEGER NOT NULL CHECK (quantity >= 0)
condition     TEXT NOT NULL
acquired_at   TEXT NOT NULL  -- ISO-8601 datetime string
```

At least **3 sets** and **50+ cards** are seeded, along with sample inventory lots that back the owned quantity shown in the UI.

## Local Development

### Prerequisites

- **Node.js 20+**
- **npm** (comes with Node)

> The AWS CLI and SAM CLI are only needed if you want to work with the legacy PokéBinder (AWS Edition) backend. They are not required for the TCG Inventory Platform.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Initialize and seed the database

This will create a local SQLite file (`data/tcg_inventory.db`), apply the schema, and load seed data (sets, cards, inventory).

```bash
cd frontend
npm run db:seed
```

You can safely re-run this command; it will skip seeding if data already exists. To completely reset the database, use:

```bash
cd frontend
npm run db:reset
```

### 3. Start the dev server

```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000`:

- `/` – Landing page for **TCG Inventory Platform**.
- `/cards` – Binder-style card grid with search, filters, and sorting.
- `/cards/:id` – Card detail page for a specific card.
- `/api/health` – JSON health check (`{ "status": "ok" }`).

The legacy PokéBinder AWS-based features (Cognito auth, `/binder` UI, Lambda-backed API) remain, but they require AWS credentials and SAM to run; see below.

## Deployment (Vercel Recommended)

The simplest deployment path is to deploy the `frontend` Next.js app to **Vercel**.

### Option A: SQLite (demo / small usage)

For a demo or small personal use:

1. Ensure `data/tcg_inventory.db` is committed or generated in a build step.
2. On Vercel:
   - Import the `frontend` directory as a project.
   - Use the default **Next.js** build settings.
3. The API routes (`/api/cards`, `/api/cards/:id`, `/api/filters`, `/api/health`) will run on the Node.js runtime and access the SQLite file.

> Note: Vercel file systems are mostly read-only in serverless environments; for write-heavy or multi-user scenarios, use Option B.

### Option B: Postgres (recommended for production)

For production usage:

1. Provision a Postgres instance (e.g. **Vercel Postgres**, **RDS**, or any managed Postgres).
2. Create equivalent tables to the schema above in Postgres.
3. Replace the `better-sqlite3` usage in `frontend/src/server/db.ts` with a Postgres client (e.g. `pg` or an ORM like Prisma/Drizzle).
4. Configure connection strings via environment variables on Vercel.

The API route contracts and UI do not need to change; only the underlying implementation of the data access layer changes.

## Legacy PokéBinder (AWS Edition)

If you want to run or extend the original AWS-based multi-user binder:

1. **Build and deploy backend (SAM)**

   ```bash
   cd backend
   npm install
   npm run build
   cd ..
   sam build
   sam deploy --guided
   ```

   During `sam deploy --guided`, capture:

   - `ApiUrl` – API Gateway HTTP API base URL  
   - `UserPoolId` – Cognito User Pool ID  
   - `UserPoolClientId` – Cognito App Client ID  

2. **Configure frontend for AWS backend**

   ```bash
   cd frontend
   cp .env.example .env.local
   ```

   Update `.env.local` with your values. Then:

   ```bash
   cd frontend
   npm run dev
   ```

   Visit `http://localhost:3000`, sign up / sign in, and explore the original `/binder` experience (Cognito-authenticated, DynamoDB-backed).

## Health Check

- **Endpoint**: `/api/health`  
- **Response**: `{ "status": "ok" }`  
- Used as a simple readiness check in local dev or deployment environments.

## License

MIT.
