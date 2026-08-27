// ─── FRED (Federal Reserve Economic Data) API Fetcher ───
// Fetches USD/JPY, USD Broad Index, and other macro series

export async function fetchFredSeries(seriesId: string, apiKey?: string): Promise<{ value: number; change1M: number } | null> {
  const key = apiKey || process.env.FRED_API_KEY;
  if (!key) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${key}&file_type=json&sort_order=desc&limit=30`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json = await res.json();
    const observations = json.observations;
    if (!observations || observations.length === 0) return null;

    const validObs = observations.filter((o: { value: string }) => o.value !== '.');
    if (validObs.length === 0) return null;

    const latest = parseFloat(validObs[0].value);
    const prev = validObs.length > 20 ? parseFloat(validObs[20].value) : parseFloat(validObs[validObs.length - 1].value);
    const change1M = prev ? Math.round(((latest - prev) / prev) * 1000) / 10 : 0;

    return { value: latest, change1M };
  } catch (err) {
    console.warn(`[FRED Fetcher] Failed to fetch ${seriesId}:`, err);
    return null;
  }
}
