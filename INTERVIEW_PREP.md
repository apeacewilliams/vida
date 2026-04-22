# Interview Prep — VIDA Technical Task

## What Was Built

**VIDA** is an employee wellness (MSK) dashboard for HR/wellness teams. It shows a list of employees sorted by health risk, and lets users drill into each employee to view and update their wellness suggestions.

Core flows:
1. Home `/` — grid of employees, risk-sorted, with per-status suggestion counts
2. Employee detail `/employee/:id` — all suggestions for one employee grouped by status, each card has an interactive status dropdown
3. API `PATCH /api/suggestions/:id` — updates a suggestion's status (and optionally notes)

---

## Code Walkthrough Order

Use this sequence to explain the codebase top-to-bottom in a way that flows naturally.

### 1. Data model — `prisma/schema.prisma`
Start here to ground everything. Two tables: `Employee` (id, name, department, riskLevel) and `Suggestion` (id, employeeId, type, description, status, priority, source, dateCreated, dateUpdated, dateCompleted, notes).

Key point: **no Prisma enums** — all fields are plain `String`. This is intentional; SQLite has no native enum support and Prisma's string-backed enums add codegen complexity for little gain at this scale.

### 2. Type layer — `src/lib/types.ts`
Show how the plain-string decision is handled safely:
- `as const` arrays → derive union types with `(typeof X)[number]`
- `createNarrower` factory → generates a validator per domain type that throws on unknown values
- These narrowers are called at every Prisma read boundary so bad data fails fast

### 3. Shared utilities — `src/lib/risk.ts`, `src/lib/employee-ui.ts`
- `compareByRisk` — maps risk levels to sort indices; shared by both server component and API layer
- `AVATAR_STYLES`, `RISK_BADGE_STYLES`, `getInitials` — presentation constants colocated away from components to keep them lean

### 4. Server-side data fetching — `src/app/page.tsx` and `src/app/employee/[id]/page.tsx`
- Both are **async server components** — they query Prisma directly, no `useEffect`, no client fetch
- Home page does one `findMany` with `_count` for suggestion statuses
- Detail page does one `findUnique` with `include: { suggestions: true }`
- Params are `await`-ed (`const { id } = await params`) — Next.js 16 makes params a Promise

### 5. UI components — `src/components/`
- `Sidebar.tsx` — static, server component
- `EmployeeCard.tsx` — server component, renders risk badge, avatar, status count rows
- `badges.tsx` — `PriorityBadge`, `SourceBadge`, `STATUS_LABELS` — purely presentational
- `SuggestionCard.tsx` — the **only client component**; explain why it needs `"use client"` (interactive select + local state)

### 6. Optimistic UI & race safety — `SuggestionCard.tsx`
Walk through the `handleStatusChange` function step by step:
1. `narrowSuggestionStatus` validates the incoming value immediately
2. Abort any in-flight request via `abortRef.current?.abort()`
3. Set `localStatus` to new value immediately (optimistic)
4. Send `PATCH` with the new status
5. On failure: revert `localStatus` to `prevStatus`
6. On success: call `router.refresh()` to re-sync RSC tree
7. `setUpdating(false)` only if this controller is still the current one (avoids state leak from stale closures)

### 7. API route — `src/app/api/suggestions/[id]/route.ts`
- `isValidBody` validates the body before touching the DB
- Fetches existing suggestion first (to get `dateCompleted`) — avoids overwriting a real completion timestamp
- `dateCompleted` logic: set on first completion, preserved if already set, cleared if moving away from "completed"
- Calls `revalidatePath` on both home and detail page after mutation

### 8. Tests — `src/lib/*.test.ts` and `src/app/api/suggestions/[id]/route.test.ts`
- `types.test.ts` — narrower happy/sad paths
- `risk.test.ts` — sort order and unknown value edge cases
- `route.test.ts` — 400/404, `dateCompleted` preservation, notes handling

---

## Architectural Decisions & Trade-offs

### Decision 1: React Server Components for all data fetching

**What:** Every page fetches data directly in async server components using Prisma — no client-side `fetch`, no `SWR`, no React Query.

**Why:** No loading spinners on navigation, no client-side fetch waterfalls, no extra API endpoints just to serve page data. The HTML arrives pre-rendered with real data.

**Trade-off:** Server components can't hold state or attach event listeners. The moment interactivity is needed, you need a client component boundary. The discipline here is keeping that boundary as small as possible — only `SuggestionCard` is a client component.

**Alternative considered:** Full client-side SPA approach (all data fetched from API routes after page load). This would simplify the mental model for developers familiar with traditional React, but sacrifices the performance benefits and requires more API surface area.

---

### Decision 2: Plain string fields in Prisma schema instead of enums

**What:** `riskLevel`, `status`, `type`, `priority`, `source` are all `String` in the schema, not enum types.

**Why:** SQLite has no native enum support. Prisma's `@default` enum behaviour is inconsistent across adapters. Avoiding enums removes a layer of codegen and makes migrations simpler.

**Trade-off:** The DB can technically store any string, so the type guarantee lives entirely in application code rather than the schema. This is mitigated by the narrower pattern at every read boundary.

**Alternative:** Use Prisma enums anyway — Prisma maps them to string comparisons at the DB level with SQLite. This would give type safety in the Prisma client layer but adds complexity to migrations when values change and couples schema to Prisma's codegen.

---

### Decision 3: `createNarrower` factory pattern for runtime type validation

**What:** A generic factory `createNarrower(values)` takes a `readonly` array and returns a function that validates and narrows a raw string to the typed union.

**Why:** Avoids `as` casts. A bare `value as SuggestionStatus` is a lie to TypeScript — it compiles but provides no runtime safety. The narrower throws immediately on unexpected values, so bad data from the DB or API never silently propagates.

**Trade-off:** Errors thrown by narrowers are unhandled exceptions — they'd surface as 500s if unexpected DB data appeared. You could make them return `null | T` instead and handle the error more gracefully, but that pushes error handling into every call site.

**Alternative:** Zod / Valibot schema validation. More expressive, better error messages, battle-tested. The trade-off is adding a dependency for something that's ~15 lines of code here. For a larger app with complex nested shapes, the library is the right call.

---

### Decision 4: Optimistic UI with AbortController

**What:** Status changes update `localStatus` instantly. An `AbortController` cancels the previous in-flight request if the user changes again before the request resolves.

**Why:** Without optimistic updates, the dropdown would feel laggy — the user would have to wait for the network round-trip before seeing feedback. Without abort logic, rapid changes could result in stale responses winning: if the user clicks A→B→C quickly, the C response might arrive before B and overwrite it.

**Trade-off:** Extra complexity in the component. The `abortRef.current === controller` guard in `finally` is subtle — worth being able to explain why it's there (prevents setting `updating: false` for a request that was already superseded).

**Alternative:** Debounce the status change instead of aborting. Simpler, but adds latency. For a status selector (not a text field), abort-on-change is more responsive.

---

### Decision 5: SQLite via better-sqlite3 adapter

**What:** SQLite file at `prisma/dev.db`, accessed via the `PrismaBetterSqlite3` adapter.

**Why:** Zero infrastructure to run, fast for single-server deployments, committed to the repo so the reviewer can run the app with no setup.

**Trade-off:** Not horizontally scalable — SQLite is single-writer. `revalidatePath` + RSC refresh works perfectly here, but in a multi-instance deployment you'd need a real DB and a shared cache invalidation mechanism (e.g. Redis + webhooks).

**Alternative:** PostgreSQL with Prisma's standard adapter. Production-grade, multi-writer, but adds Docker or a managed DB to the local dev requirements. Wrong trade-off for a tech test.

---

### Decision 6: `revalidatePath` on the server + `router.refresh()` on the client

**What:** After a successful PATCH, the API calls `revalidatePath("/")` and `revalidatePath("/employee/:id")`. The client then calls `router.refresh()`.

**Why:** RSC pages are cached by Next.js. Without `revalidatePath`, the page wouldn't re-fetch data even after a mutation. `router.refresh()` tells the client to re-request the RSC payload from the server, which now returns fresh data.

**Trade-off:** Two-step invalidation (server + client) is slightly more code than a traditional `fetch`+`setState` pattern. But it keeps the data fetching in server components and avoids having to duplicate fetch logic on the client.

**Alternative:** Move to full client-side state management (Zustand, Jotai, React Query). Works fine but loses the server rendering benefits and adds client bundle weight.

---

## Likely Interview Questions

### "Why only one client component?"
> RSC lets you do data fetching and rendering on the server, which is faster and simpler. I kept `"use client"` to the minimum surface that actually needs interactivity — the status dropdown. Everything else is static output from the server.

### "How does the optimistic update work if two users are editing at the same time?"
> It doesn't handle that — there's no real-time sync or locking. The last write wins at the DB level. For this scope that's fine; adding real-time sync would require WebSockets or SSE plus a conflict strategy, which would be overkill here.

### "Why not use Zod for validation?"
> I used a lightweight factory pattern instead of pulling in Zod. For flat string unions with no nesting, `createNarrower` is 10 lines and covers the runtime safety need. In a production app with complex nested request bodies, Zod's composability and error messages are worth the dependency.

### "What would you change if this needed to scale?"
> Three things: swap SQLite for PostgreSQL, add auth (this intentionally omits it per the spec), and move the `revalidatePath` calls to a background queue if mutation volume gets high enough that cache churn becomes a concern.

### "How did you decide how to group suggestions on the detail page?"
> By status, in the order users care about most urgency-first: Overdue → In Progress → Pending → Completed. The grouping is done in the server component so there's no client-side sort on render.

### "Why `dateCompleted ?? now` instead of just `now`?"
> Idempotency. If a suggestion is already completed and someone re-saves it as completed (e.g. via a retry), you don't want to overwrite the original completion timestamp. `existing.dateCompleted ?? now` preserves the first recorded completion time.

### "What does the `abortRef.current === controller` guard do in the `finally` block?"
> If the user changes status twice quickly, there are two controllers. The first request gets aborted; its `finally` runs but we don't want it to clear the `updating` state because the second request is still in flight. The guard ensures only the most recent controller owns the `updating` flag.

---

## Notes from Other Conversations

> _Add notes here from recruiter calls, hiring manager chats, Slack threads, or anything that gives you context on what the interviewers care about._

---

### Conversation 1 — [Date / Person]

```
Notes:
```

---

### Conversation 2 — [Date / Person]

```
Notes:
```

---

### Conversation 3 — [Date / Person]

```
Notes:
```

---

## Open Questions to Prepare For

- [ ] Can you talk through any part of the code without looking at it?
- [ ] What would a loading/error state look like for the status update?
- [ ] How would you add the ability to create a new suggestion from the UI?
- [ ] What test is missing that you'd add given more time?
- [ ] How would you handle the `narrowSuggestionStatus` throw if invalid data came in from the select?

---

## Quick Reference — Key Files

| What | File |
|------|------|
| Data model | `prisma/schema.prisma` |
| Domain types + narrowers | `src/lib/types.ts` |
| Risk sort comparator | `src/lib/risk.ts` |
| Avatar/badge styles | `src/lib/employee-ui.ts` |
| Prisma singleton | `src/lib/prisma.ts` |
| Home page (RSC) | `src/app/page.tsx` |
| Employee detail page (RSC) | `src/app/employee/[id]/page.tsx` |
| Status update API | `src/app/api/suggestions/[id]/route.ts` |
| Interactive card (client) | `src/components/SuggestionCard.tsx` |
| Badge components | `src/components/badges.tsx` |
| API route tests | `src/app/api/suggestions/[id]/route.test.ts` |
| Type narrower tests | `src/lib/types.test.ts` |
| Risk sort tests | `src/lib/risk.test.ts` |
