## Migration Plan: PokéBinder → TCG Inventory Platform

### 1. Current Structure Summary

- **Monorepo layout**
  - `frontend/`: Next.js 14 App Router app (`page.tsx`, `/binder` routes, auth pages) using TypeScript, Tailwind, and shadcn-style UI components.
  - `backend/`: TypeScript AWS Lambda handlers (e.g. `handlers/binders.ts`) using DynamoDB single-table design, zod validation, and Cognito-based auth helper.
  - `infra/template.yaml`: AWS SAM template wiring Cognito, API Gateway HTTP API, DynamoDB table, and a single Lambda (`BindersFunction`).
- **Domain focus**
  - Product is currently **“PokéBinder (AWS Edition)”** – a multi-user Pokémon TCG binder with:
    - Cognito email/password auth.
    - Binders → pages → slots (3×3 grid) for card thumbnails.
    - Frontend-only search against the Pokémon TCG public API.
  - Data is in **DynamoDB**, optimized for serverless, not for relational querying.
- **Frontend behavior today**
  - Landing page is auth-focused (“Sign in / Sign up”).
  - `/binder` area shows binder list + drag-and-drop page grid.
  - Next.js `api/backend` route acts as a proxy to the AWS Lambda HTTP API using a bearer token from cookies.
- **Tooling**
  - `frontend` and `backend` each have their own `tsconfig.json` and `package.json`.
  - ESLint/Next lint set up in `frontend`; basic TypeScript build in `backend`.

### 2. Target Structure (TCG Inventory Platform)

Overall goal: **deployable, self-contained web app** called **“TCG Inventory Platform”** with a simple local workflow and a relational DB schema.

Planned target:

- **Architecture**
  - Keep a **single Next.js App Router app** in `frontend/` as the main deployable artifact (Vercel-friendly).
  - Introduce an **internal API layer** (Next.js route handlers under `frontend/src/app/api`) backed by a **relational database** (SQLite in dev, Postgres-compatible schema for prod).
  - Deprecate reliance on AWS SAM + DynamoDB for the primary experience (can keep infra folder for reference but not required for core TCG Inventory Platform).
- **Core features**
  - **Landing page** at `/`:
    - Rebranded as “TCG Inventory Platform”.
    - Product description, screenshots section placeholder, prominent link to **Binder** page.
  - **Binder page** at `/binder`:
    - Searchable + filterable **grid/list of cards** backed by local relational DB data.
    - Filters: **set**, **rarity**, **type**.
    - Sort dropdown: **market value**, **release date**, **card name**.
  - **Card detail** at `/cards/:id`:
    - Shows card metadata (name, set, number, rarity, type, image, market value).
    - Shows “Owned quantity” and condition data aggregated from `inventory`.
- **Data model (relational)**
  - `sets(id, name, release_date)`
  - `cards(id, name, set_id, number, rarity, type, image_url, market_value)`
  - `inventory(id, card_id, quantity, condition, acquired_at)`
  - SQLite for local dev; schema compatible with Postgres (no vendor-specific extensions).
- **Tooling and DX**
  - One main dev command from repo root (e.g. `cd frontend && npm run dev`) plus a DB setup/seed command.
  - Basic linting + formatting (Next.js ESLint + `prettier` config).
  - Simple **health check** API route (e.g. `/api/health`).

### 3. Step-by-Step Changes

1. **Introduce relational DB layer**
   - Choose **SQLite** via a lightweight ORM (e.g. direct `better-sqlite3` or a minimal query wrapper) inside `frontend`.
   - Add schema creation SQL covering `sets`, `cards`, and `inventory` with primary/foreign keys and constraints.
   - Add a **seed script** to populate:
     - At least **3 sets**.
     - At least **50 cards** spread across those sets with varying rarity, type, and market value.
     - Sample `inventory` rows for owned quantities.
   - Add a **reset script** (drop + recreate tables + reseed).

2. **Create Next.js API routes for inventory**
   - Add `/api/health` returning `{ status: "ok" }`.
   - Add `/api/cards`:
     - Supports query parameters for `search`, `set`, `rarity`, `type`, and `sort`.
     - Returns paginated (or capped) card list joined with set data and aggregated owned quantity.
   - Add `/api/cards/[id]`:
     - Returns a single card with its set and related inventory summary.

3. **Build Binder (cards) UI**
   - Replace or repurpose current `/binder` screen so that:
     - It displays a **grid or list** of cards driven by `/api/cards`.
     - Includes:
       - Search input.
       - Filters for **set**, **rarity**, **type** (populated from API/DB).
       - Sort dropdown (value, release date, name).
     - Uses existing button/input components where possible to keep styling consistent.

4. **Add card detail page**
   - Implement `/cards/[id]` route:
     - Fetches data from `/api/cards/[id]`.
     - Shows card metadata and images.
     - Shows owned quantity and condition from `inventory`.
     - Provides a simple, read-only view (no complex edit forms required for this migration).

5. **Rebrand and adjust landing page**
   - Update `RootLayout` metadata to `TCG Inventory Platform`.
   - Update `/` (`page.tsx`) content:
     - New heading and copy.
     - Section describing features (inventory tracking, filtering, etc.).
     - Screenshots / gallery placeholder.
     - Clear call-to-action button linking to `/binder`.

6. **Linting, formatting, and health check**
   - Ensure `frontend` has ESLint and a minimal `prettier` config.
   - Add `/api/health` route and document it in the README.

7. **Documentation and workflow**
   - Update top-level `README.md`:
     - Rename product to **TCG Inventory Platform**.
     - New **architecture diagram** focused on Next.js + SQLite/Postgres.
     - Data model overview with the `sets`, `cards`, and `inventory` tables.
     - Local setup:
       - Install dependencies.
       - Run DB migration/seed.
       - Start dev server.
     - Deployment steps (Vercel with SQLite file or Postgres).
   - Add **MIGRATION_PLAN.md** (this file) to describe the evolution from PokéBinder AWS stack to the TCG Inventory Platform.

8. **Optional / non-breaking preservation**
   - Keep existing `backend/` and `infra/` code untouched so AWS-based PokéBinder remains in git history and can be revisited.
   - Clearly mark in `README` that the canonical path forward is the **Next.js-based TCG Inventory Platform**, while the AWS SAM stack is legacy/optional.

### 4. What Will Be Preserved

- **Git history and existing code**
  - `backend/` Lambda handlers and DynamoDB helpers remain in place.
  - `infra/template.yaml` SAM template is kept as-is for reference.
  - Existing `/frontend` auth and binder components will not be deleted; they may be repurposed or left in place if not harmful.
- **Tech choices where practical**
  - Continue to use **Next.js 14 App Router** and TypeScript.
  - Reuse existing UI primitives (`button`, `input`, `card`, dialog components) and Tailwind styling classes for a consistent look.
- **Incremental, non-breaking approach**
  - Introduce new DB and API routes alongside existing ones rather than rewriting everything at once.
  - Avoid removing working AWS-specific logic; instead, prefer adding new paths and marking legacy areas in documentation.

