// ─── U.S. EIA API Fetcher ───
// Fetches Brent, WTI, and Henry Hub spot prices from the EIA Open Data API (v2).
// Used as the PRIMARY source; commodities.ts (Yahoo Finance) is the fallback.

interface EiaSeriesResponse {
  response?: {
    data?: Array<{
      period: string;
      value: number | string;
    }>;
  };
}

interface EiaSeriesConfig {
  id: string;
  endpoint: string; // v2 route, e.g. 'petroleum/pri/spt'
  seriesId: string; // facets[series][] value
}

// NOTE: verify these against https://www.eia.gov/opendata/browser/ if data looks off —
// I couldn't hit api.eia.gov from my sandbox to confirm live, but the fallback to Yahoo
// means a wrong series ID here just means EIA silently sits out, not a broken app.
const EIA_SERIES: Record<string, EiaSeriesConfig> = {
  brent: { id: 'brent', endpoint: 'petroleum/pri/spt', seriesId: 'RBRTE' },
  wti: { id: 'wti', endpoint: 'petroleum/pri/spt', seriesId: 'RWTC' },
  'henry-hub': { id: 'henry-hub', endpoint: 'natural-gas/pri/fut', seriesId: 'RNGC1' },
};

async function fetchSeries(
  config: EiaSeriesConfig,
  key: string
): Promise<{ value: number; change1M: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.eia.gov/v2/${config.endpoint}/data/?api_key=${key}&frequency=daily&data[0]=value&facets[series][]=${config.seriesId}&sort[0][column]=period&sort[0][direction]=desc&length=30`;

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json: EiaSeriesResponse = await res.json();
    const data = json.response?.data;
    if (!data || data.length === 0) return null;

    const validData = data.filter(
      (d) => d.value !== null && d.value !== '' && !isNaN(Number(d.value))
    );
    if (validData.length === 0) return null;

    const latest = Number(validData[0].value);
    const prevMonth =
      validData.length > 20
        ? Number(validData[20].value)
        : Number(validData[validData.length - 1].value);
    const change1M = prevMonth
      ? Math.round(((latest - prevMonth) / prevMonth) * 1000) / 10
      : 0;

    return { value: latest, change1M };
  } catch (err) {
    console.warn(`[EIA Fetcher] Failed to fetch ${config.id}:`, err);
    return null;
  }
}

// Kept for backward compatibility with any existing single-series callers
export async function fetchEiaSeries(
  seriesId: string,
  apiKey?: string
): Promise<{ value: number; change1M: number } | null> {
  const key = apiKey || process.env.EIA_API_KEY;
  if (!key) return null;
  return fetchSeries({ id: seriesId, endpoint: 'petroleum/pri/spt', seriesId }, key);
}

export interface EiaResult {
  id: string;
  price: number;
  change1M: number;
  lastUpdated: string;
  source: string;
}

export async function fetchLiveEia(apiKey?: string): Promise<Record<string, EiaResult>> {
  const results: Record<string, EiaResult> = {};
  const key = apiKey || process.env.EIA_API_KEY;
  if (!key) return results; // no key → return empty, caller falls back to Yahoo

  const nowIso = new Date().toISOString();

  await Promise.all(
    Object.values(EIA_SERIES).map(async (config) => {
      const quote = await fetchSeries(config, key);
      if (quote) {
        results[config.id] = {
          id: config.id,
          price: Math.round(quote.value * 100) / 100,
          change1M: quote.change1M,
          lastUpdated: nowIso,
          source: 'U.S. EIA',
        };
      }
    })
  );

  return results;
}