# Prompt for Antigravity: Migrate Risk Profile data to Neon + Drizzle

Paste everything below into Antigravity as one task.

---

## Context

This is a Next.js 16 (App Router) + TypeScript project called "MacroRisk Dashboard." It has a
"Risk Profile" section (`/risk-profile/*`) that currently uses fully hardcoded/static data from
`src/lib/data/riskProfileData.ts`. I want to migrate this to a real database and build CRUD
functionality on top of it.

I have already:
- Created a Neon (serverless Postgres) project
- Put the **pooled** connection string in `.env.local` as `DATABASE_URL`
- Confirmed `.env*` is already in `.gitignore`
- Installed `@neondatabase/serverless`, `drizzle-orm`, and `drizzle-kit` (dev dependency)

## Stack decisions (do not deviate)

- Database: Neon (serverless Postgres), accessed via the pooled connection string
- Driver: `@neondatabase/serverless`
- ORM: Drizzle ORM (`drizzle-orm` + `drizzle-kit`)
- Backend: Next.js API routes, App Router style (`src/app/api/.../route.ts`)
- Local dev only for now — connecting to Neon's cloud DB from `localhost:3000`, not deployed yet

## Task 1 — Drizzle schema

Create `src/lib/db/schema.ts` defining a `risk_parameters` table that matches this existing
TypeScript interface (currently in `src/lib/data/riskProfileData.ts`):

```ts
export type RiskStatus =
  | 'Within Limit'
  | 'Within Appetite'
  | 'Within Tolerance'
  | '> Tolerance'
  | '> Trigger Level';

export type RiskTaxonomy =
  | 'Strategic Risk'
  | 'Market and Macroeconomic Risk'
  | 'Financial Risk'
  | 'Credit/Counterparty Risk'
  | 'Operational Risk'
  | 'Investment/Project Risk'
  | 'Reputational Risk'
  | 'Regulatory, Legal & Compliance Risk';

export interface RiskParameter {
  id: string;
  name: string;
  taxonomy: RiskTaxonomy;
  status: RiskStatus;
  currentValue: string;
  period: string;
  appetiteThreshold?: string;
  toleranceThreshold?: string;
  limitThreshold?: string;
  triggerThreshold?: string;
}
```

Requirements:
- Use Postgres enums (`pgEnum`) for `RiskStatus` and `RiskTaxonomy`, matching the string values
  above exactly (including the `>` characters).
- `id`: keep as text/varchar primary key (the existing static data uses string ids like
  `"strategic-01"` — preserve that id scheme rather than switching to a serial/uuid, so seeded
  rows keep their original ids).
- `name`, `currentValue`, `period`: required text columns.
- `appetiteThreshold`, `toleranceThreshold`, `limitThreshold`, `triggerThreshold`: nullable text
  columns (they're optional in the interface).
- Add `createdAt` and `updatedAt` timestamp columns (default now, and update `updatedAt` on
  writes) since this table will now support CRUD instead of being static.

## Task 2 — Drizzle client singleton

Create `src/lib/db/index.ts`:
- Use the `neon-http` driver (`drizzle-orm/neon-http` + `neon` from `@neondatabase/serverless`),
  since these are simple request/response API routes, not long transactions — HTTP mode is the
  right fit and avoids connection/pooling issues in serverless functions.
- Read `DATABASE_URL` from `process.env`, throw a clear error at import time if it's missing.
- Export a single `db` instance other files import, so we don't create a new client per request.

## Task 3 — Drizzle config + generate/push migration

- Create `drizzle.config.ts` at the project root pointing at `src/lib/db/schema.ts`, dialect
  `postgresql`, reading `DATABASE_URL` from env.
- Add npm scripts to `package.json`:
  - `"db:generate": "drizzle-kit generate"`
  - `"db:push": "drizzle-kit push"`
  - `"db:studio": "drizzle-kit studio"` (useful for me to eyeball data in a GUI later)
- Run `npm run db:generate` then `npm run db:push` to actually create the `risk_parameters`
  table (and the two enum types) in my live Neon database. Confirm the table exists afterward
  (e.g. via `drizzle-kit studio` or a quick query) and show me the result.

## Task 4 — Seed script

Create a script (e.g. `src/lib/db/seed.ts`, run via `tsx` or `ts-node`) that:
- Imports the existing 43-parameter array from `src/lib/data/riskProfileData.ts` (do not
  delete or modify that file yet — just read the array out of it, or ask me to paste it if it's
  not cleanly exportable as-is).
- Inserts all 43 rows into `risk_parameters` via Drizzle's `insert().values()`, using
  `onConflictDoNothing()` or similar so the script is safe to re-run without duplicating data.
- Add an npm script `"db:seed": "tsx src/lib/db/seed.ts"` (install `tsx` as a dev dependency if
  not already present) and load `.env.local` in the script (e.g. via `dotenv/config` at the top)
  since standalone scripts don't get Next.js's automatic env loading.
- Run it and confirm 43 rows landed in the table.

## Task 5 — CRUD API routes

Create:
- `src/app/api/risk-profile/parameters/route.ts`
  - `GET`: return all rows from `risk_parameters`
  - `POST`: create a new row from the JSON body; validate required fields
    (`id`, `name`, `taxonomy`, `status`, `currentValue`, `period`) are present and that
    `taxonomy`/`status` are valid enum values before inserting; return 400 with a clear message
    otherwise
- `src/app/api/risk-profile/parameters/[id]/route.ts`
  - `GET`: return one row by id, 404 if not found
  - `PATCH`: partial update from JSON body, update `updatedAt`, 404 if not found
  - `DELETE`: delete by id, 404 if not found

Use standard Next.js App Router route handler conventions (`NextRequest`/`NextResponse`), return
JSON with sensible status codes, and wrap DB calls in try/catch returning 500 with a generic
error message on unexpected failures (don't leak raw DB error internals to the client).

## Task 6 — Wire up the existing page

Update `src/app/(dashboard)/risk-profile/ringkasan/page.tsx` (and any sibling risk-profile pages
that import from `riskProfileData.ts` for the `parameters` array specifically — leave
`getStatusColor` and other pure helper functions in that file as-is, they're not data) to fetch
from `GET /api/risk-profile/parameters` instead of importing the static array directly.

- Check whether this page is currently a Server Component or has `'use client'` at the top, and
  use the appropriate fetch pattern for that (server-side fetch/DB call directly if it's a server
  component and colocated with the API anyway, or `fetch` + `useEffect`/a small data-fetching
  hook if it's a client component) — tell me which approach you're using and why.
- Preserve existing loading/empty states if any exist; add a basic loading indicator if none did.
- Do not change the visual design or layout — only the data source.

## Constraints throughout

- Don't touch unrelated dashboard sections (macro, commodities, news, etc.) or their data
  fetchers.
- Don't remove `riskProfileData.ts`'s type exports (`RiskParameter`, `RiskStatus`,
  `RiskTaxonomy`, `TaxonomyStatusRow`, `CorporateRiskProfile`) or helper functions
  (`getStatusColor`, etc.) — other components likely still import those.
- After each major step (schema push, seed, API routes, page wiring), tell me what you did and
  how to verify it (e.g. "run `npm run dev` and visit `/risk-profile/ringkasan`") before moving
  on, rather than silently continuing.
- If `DATABASE_URL` is missing or the Neon connection fails, stop and tell me — don't fall back
  to mock data silently.
