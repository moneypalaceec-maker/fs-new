---
name: CryptoStake Casino stack
description: Key patterns and pitfalls for the full-stack crypto casino app
---

## Auth
- `req.auth` is NOT typed on Express `Request` — use `(req as any).auth as { userId?: string }` helper in every route file
- `@clerk/express` `requireAuth()` middleware is applied per-route, not globally
- Frontend: `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)` from `@clerk/react/internal` — never use raw env var
- `proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}` unconditional on ClerkProvider (empty in dev is intentional)

## DB
- All schema tables exported from `lib/db/src/schema/index.ts` and re-exported from `lib/db/src/index.ts`
- After adding new schema files, run `pnpm run typecheck:libs` before leaf workspace typechecks — otherwise `@workspace/db` exports appear missing
- `db.query.*` methods require the table to exist in the schema passed to drizzle — verify index exports match

## Routes
- All async Express route handlers need explicit `: Promise<void>` return type and `return;` after each `res.status(...)` call to satisfy TS exhaustiveness checks
- `req.params["id"]` returns `string | string[]` — always wrap with `String(...)` before `parseInt`

## Games
- House edge: 2% constant applied to all payouts
- Blackjack sessions stored in `game_sessions` table with `gameData` JSON column for deck state
- Dice: `winChance` is percentage (1-98), multiplier = `(100 / winChance) * (1 - houseEdge)`
- Slots: weighted random with `MULTIPLIERS` record keyed by `"sym-sym-sym"` joined string

## Frontend
- `qrcode.react` must be installed separately: `pnpm --filter @workspace/casino add qrcode.react`
- All page routes wired in `App.tsx` using `<ProtectedRoute>` wrapper with `<Show when="signed-in">` + `<Redirect to="/">`
- Theme: `--background: 260 60% 4%`, `--primary: 271 76% 53%`, `--accent: 180 100% 50%` (cyan)

**Why:** These patterns took >1 pass to get right and are non-obvious from the code.
