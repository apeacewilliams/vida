<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16 / React 19 / Prisma 7 (better-sqlite3 adapter) / Tailwind v4 / Biome

## Key conventions

- **Params are async** — route params are `Promise<{ id: string }>`, always `await params` before use
- **Server components by default** — only add `"use client"` when interactivity is required
- **Data fetching in RSCs** — fetch via Prisma directly in server components; avoid client-side fetch waterfalls
- **Cache invalidation** — call `revalidatePath` from `next/cache` in API routes after mutations; use `router.refresh()` from `next/navigation` in client components after successful PATCH
- **No auth** — intentionally omitted (tech test)

## Data layer

- DB: `prisma/dev.db` (SQLite) — both `prisma.config.ts` and `src/lib/prisma.ts` point here
- All schema fields are plain strings (no Prisma enums) — use narrow helpers in `src/lib/types.ts` (`narrowRiskLevel`, `narrowSuggestionStatus`, etc.) at every DB read boundary instead of bare `as` casts
- Prisma client singleton: `src/lib/prisma.ts`

## Shared utilities

| File | Exports |
|------|---------|
| `src/lib/types.ts` | All domain types, `SUGGESTION_STATUSES`, narrow helpers |
| `src/lib/risk.ts` | `compareByRisk` — shared sort comparator for employees |
| `src/lib/employee-ui.ts` | `AVATAR_STYLES`, `RISK_BADGE_STYLES`, `getInitials` |

## Scripts

```
npm run dev       # start dev server
npm run build     # production build
npm run lint      # biome check
npm run format    # biome format --write
```
