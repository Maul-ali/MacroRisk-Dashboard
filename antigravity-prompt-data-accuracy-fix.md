# Prompt for Antigravity: Fix Data Accuracy & Source Honesty in MacroRisk Dashboard

Paste everything below into Antigravity as one task. Work through phases in order and report back after each one before moving to the next — don't silently continue.

---

## Context

This is a Next.js 16 (App Router) + TypeScript project called "MacroRisk Dashboard" for Fertilizer Indo. It shows live-ish macro/commodity indicators (USD/IDR, Brent, Urea, etc.) sourced from a mix of real fetchers (`src/lib/data/fetchers/*.ts`), a static fallback dataset (`src/lib/data/fallback.ts`), and an in-memory cache (`src/lib/data/liveStore.ts`).

I've audited it and found two categories of problems:

1. **Mislabeled or fabricated sources/freshness.** Several indicators display a source name (e.g. "BI JISDOR", "World Bank Pink Sheet", "U.S. EIA") and a `Fresh` badge that don't reflect what was actually fetched — some are never fetched at all and just show static fallback numbers forever.
2. **Actually stale/wrong data.** `change1M` percentages are hardcoded literals, the refresh function is fire-and-forget so pages can serve arbitrarily old cached data, and the cache lives in module memory which doesn't survive serverless cold starts or work across multiple instances.

Fix these without changing the visual design/layout of any page — this is a data-correctness and backend task only.

## Constraints throughout

- Don't touch `src/lib/data/riskProfileData.ts`, the risk-profile pages, or the Neon `risk_parameters` table/CRUD routes — that's a separate system, already correct, and out of scope.
- Don't remove or rename existing exported types (`Indicator`, `Freshness`, `SourceHealth`, etc.) in `src/lib/data/types.ts` unless a task below explicitly says to extend them.
- Every indicator must have an honest `source` string and `freshness` value that reflects what actually happened on the most recent fetch attempt — never a label implying a fetch that didn't run.
- After each phase, tell me what changed and how to verify it locally (e.g. which page/route to check, what `console.log` output to expect).

---

## Phase 1 — Honest source & freshness labeling (no new integrations)

**1a. Add a `dataOrigin` field.**
In `src/lib/data/types.ts`, extend `Indicator` with:
```ts
dataOrigin: 'live' | 'fallback';
```
Set this explicitly wherever an `Indicator` is constructed or merged in `src/lib/data/liveStore.ts` and `src/lib/data/fallback.ts` (default `'fallback'` in `fallback.ts`, set to `'live'` only inside the branches of `refreshLiveData()` that successfully merged a fetched value).

**1b. Freshness must derive from `dataOrigin`, not a static default.**
Currently `freshness: 'Fresh'` is hardcoded per-indicator in `fallback.ts` even for indicators nothing ever fetches (e.g. `phosphate-rock`). Change the freshness computation so:
- `dataOrigin === 'live'` → `'Fresh'`
- `dataOrigin === 'fallback'` and no fetcher exists for this indicator at all → `'Estimated'`
- `dataOrigin === 'fallback'` but a live fetch was attempted and failed → `'Stale'`

**1c. Fix `getLiveSystemTrust()` in `liveStore.ts`.**
It currently does:
```ts
} else if (item.id === 'phosphate-rock') {
  freshCount++;
}
```
Remove this special case. `freshCount` should only increment for indicators where `dataOrigin === 'live'` this cycle. The "System Trust — X% live" badge in the sidebar/overview should reflect reality.

**1d. Correct these specific mislabeled `source` strings:**

| File | Current (wrong) | Change to |
|---|---|---|
| `openFx.ts` (`usd-idr`) | `'Open Exchange Rates (BI Market Proxy)'` (live) / `'BI JISDOR'` (fallback) | `'open.er-api.com (mid-market composite)'` for live; keep `'BI JISDOR (last known)'` only for the fallback/static value, clearly marked as not live |
| `openFx.ts` (`usd-jpy`) | `'ECB / Global FX Feed'` | `'open.er-api.com (mid-market composite)'` — it's the same API call as USD/IDR, not ECB |
| `commodities.ts` (Yahoo fallback path) | `'Live Market Index Feed'` | `'Yahoo Finance (unofficial endpoint)'` |
| `fallback.ts` (`phosphate-rock`) | `'World Bank Pink Sheet'` + `freshness: 'Fresh'` | Keep source string but mark `dataOrigin: 'fallback'` and `freshness: 'Estimated'` per 1b, since nothing fetches this |
| `worldbank.ts` (`cpi-yoy`, `real-gdp`) | `'World Bank Open Data / BPS'` | `'World Bank Open Data'` — drop "/ BPS" since BPS's API is never called directly, only World Bank's mirror of it |

**1e. Do the same audit for every fertilizer indicator** (`urea`, `dap`, `ammonia`, `potash`, `sulfur`, `phosphoric-acid`, `sulfuric-acid` in `fallback.ts`) — none of these have a fetcher anywhere in `src/lib/data/fetchers/`. Confirm `dataOrigin: 'fallback'` and `freshness: 'Estimated'` for all of them per the rule in 1b.

**Verify:** Hit `GET /api/indicators` and confirm every indicator has a `dataOrigin` field, and that `freshness` for phosphate-rock/urea/dap/ammonia/potash/sulfur/phosphoric-acid/sulfuric-acid is `'Estimated'`, not `'Fresh'` or `'Stale'`.

---

## Phase 2 — Fix the fire-and-forget refresh + shared cache

**2a. Make refresh properly awaited with a promise lock.**
In `liveStore.ts`, `getLiveIndicators()` currently does:
```ts
if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
  refreshLiveData().catch(() => {});
}
return cachedIndicators;
```
This returns stale data even when a refresh is possible. Replace with an async function + in-flight promise guard so concurrent callers await the same refresh instead of triggering duplicates:
```ts
let refreshInFlight: Promise<void> | null = null;

export async function getLiveIndicatorsAsync(): Promise<Indicator[]> {
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData().then(() => {}).finally(() => { refreshInFlight = null; });
    }
    await refreshInFlight;
  }
  return cachedIndicators;
}
```
Update every caller (`src/lib/data/indicators.ts`'s `getAllIndicators`/`getIndicator`/`getIndicatorsByCategory`, the `/api/indicators` route, and any Server Component page that reads indicators directly) to be `async` and `await` this. Keep a synchronous `getLiveIndicators()` wrapper only where a call site truly cannot be made async (document why, if so).

**2b. Move the cache out of module memory into Neon Postgres.**
Reuse the existing `queryNeon` client in `src/lib/db/neonClient.ts`. Create a small table (e.g. `indicator_cache`) with columns `id text primary key, payload jsonb, updated_at timestamptz`. On successful `refreshLiveData()`, upsert the full indicator array (and risk score / system trust / market pulse) into this table. On cold start / first call in a new instance, read from this table before falling back to `FALLBACK_INDICATORS`. This fixes different serverless instances (and different users) seeing different data at the same moment.

**Verify:** Deploy or run two separate `next dev` processes / hit the API from two different terminals in quick succession; confirm both return the same `lastUpdated` timestamps rather than independently-cached values.

---

## Phase 3 — Compute real `change1M` instead of hardcoding it

**3a. Add a history table.**
In the same Neon DB, create `indicator_history (indicator_id text, value numeric, fetched_at timestamptz)`. On every successful live fetch in `openFx.ts`, `commodities.ts`, `eia.ts`, and `worldbank.ts`, insert a row after computing the new value.

**3b. Replace hardcoded `change1M` literals.**
Remove:
```ts
change1M: -0.4, // Baseline estimated monthly delta
```
and similar in `openFx.ts`. Instead, query `indicator_history` for the row closest to `now - 30 days` for that `indicator_id`, and compute:
```ts
change1M = ((latest - monthAgoValue) / monthAgoValue) * 100
```
If no row exists ≥25 days old yet (e.g. freshly deployed), return `change1M: null` rather than a fabricated number — the UI already handles `null` (renders `—`) per `CatalogPage`/`MacroPage`.

**Verify:** Query `indicator_history` directly after a few refresh cycles and confirm `change1M` on `/api/indicators` changes over time based on real stored values, not a constant.

---

## Phase 4 — Real primary sources where feasible

**4a. Get and set a real `EIA_API_KEY`.**
Register at https://www.eia.gov/opendata/register.php (free), add `EIA_API_KEY` to `.env.local`. This makes `fetchLiveEia()` in `eia.ts` actually run instead of silently returning `{}` and falling through to the unofficial Yahoo endpoint. Confirm via console log which path (`EIA` vs `Yahoo fallback`) is firing for Brent/WTI/Henry Hub.

**4b. Add a World Bank Pink Sheet fetcher for phosphate rock (and optionally urea/DAP benchmark prices).**
Follow the existing pattern in `worldbank.ts` (`fetchWorldBankIndicator`) — the Pink Sheet is published monthly and has a stable download URL. Wire the result into `refreshLiveData()`'s `Promise.allSettled` array so `phosphate-rock`'s `dataOrigin` can actually become `'live'`.

**4c. For USDA AMS/Green Markets (Urea, DAP, Ammonia, Potash) and USGS Sulfur:**
These typically require either a paid feed or PDF scraping (the `news-control` page already lists USDA as "Planned Feed... PDF Scraper" — so this is a known gap, not new scope). If a real integration isn't feasible right now, leave these as `dataOrigin: 'fallback'` / `freshness: 'Estimated'` per Phase 1 — that is the *honest* end state for these, not a bug to keep chasing. Don't fabricate a fetcher that isn't backed by a real source.

**4d. Fix `computeRiskBand()` in `liveStore.ts`.**
It only has real thresholds for `brent`/`wti`, `usd-idr`, and `vix`; everything else falls through to a meaningless `return 'Guarded'`. Add real thresholds for at least `henry-hub`, `usd-jpy`, `usd-broad`, `cpi-yoy`, `real-gdp` based on reasonable historical bands (ask me for thresholds if you're not confident guessing them, rather than inventing numbers). For indicators with no live fetcher at all (fertilizers, phosphate rock), leave their `riskBand` as whatever is defined in `fallback.ts` rather than recomputing it — don't run `computeRiskBand` on data that was never actually fetched.

**Verify:** After adding the EIA key, confirm `source: 'U.S. EIA'` on Brent/WTI/Henry Hub in `/api/indicators`, and that risk bands for henry-hub/usd-jpy/cpi-yoy are no longer all defaulting to the same value.

---

## Phase 5 — Surface trust info in the UI (small, additive only)

- On `CatalogPage`, `MacroPage`, and `CommoditiesView`, show the `dataOrigin` next to the existing `freshness` badge (e.g. a small "estimated" tag when `dataOrigin === 'fallback'` and no fetcher exists) — reuse the existing `freshness-badge` CSS classes, just make sure the *value* they render is now accurate per Phase 1.
- No layout changes — this is just making sure the badges already in the UI say something true.

---

## Reporting

After each phase, tell me:
1. What files changed and why.
2. How to verify locally (exact route/page + what output confirms success).
3. Any indicator where you could not find a real free/public source and had to leave it as `'Estimated'` — list these explicitly so I know what's still a known gap rather than assuming everything is now live.
