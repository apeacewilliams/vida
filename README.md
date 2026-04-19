# VIDA Suggestions Board

A simple admin dashboard for viewing and managing employee MSK (musculoskeletal) suggestions, built as part of a take-home exercise.

## Running the application

```bash
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed data is already committed at `prisma/dev.db` — no migration step is needed.

## Features

- **Employee list** — sorted by risk level (high → medium → low), with per-employee suggestion counts broken down by status
- **Employee detail** — suggestions grouped by status (Overdue → In Progress → Pending → Completed), sorted by priority within each group
- **Inline status updates** — optimistic UI with automatic rollback on failure; rapid changes are race-safe via `AbortController`

## Assumptions

- **No authentication** — intentionally omitted per the brief; a real deployment would add session-based auth before exposing this to users
- **Risk level is read-only** — seeded per employee and not editable through this interface
- **"Overdue" is manually assigned** — automated deadline-based status transitions as deadlines are not part the sample data

## Architecture

**Stack:** Next.js 16 · React 19 · Prisma 7 (SQLite via better-sqlite3) · Tailwind v4 · Biome · Vitest

### React Server Components first

Data fetching happens directly in server components via Prisma — no client-side fetch waterfalls, no loading spinners for page data. The only client component is `SuggestionCard`, which opts into `"use client"` solely for the status selector interaction.

### Type safety at DB boundaries

The Prisma schema uses plain strings throughout (SQLite has no native enum type). A `createNarrower` factory in `src/lib/types.ts` generates validators that narrow raw `string` values to typed unions at every read boundary, throwing on unexpected values rather than silently propagating bad data.

### Optimistic UI

Status changes in `SuggestionCard` update local state immediately and revert on failure. An `AbortController` cancels in-flight requests when the user changes status again before the previous request resolves, preventing stale updates from overwriting newer ones.

### Cache invalidation

After a successful PATCH, `revalidatePath` marks both the home page and the relevant employee detail page as stale. The client calls `router.refresh()` to re-fetch the RSC tree, keeping the UI in sync without a full page reload.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run lint      # biome check
npm run format    # biome format --write
npm test          # vitest run
```
