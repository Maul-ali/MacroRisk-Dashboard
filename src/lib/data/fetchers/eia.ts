// ─── U.S. EIA API Fetcher ───
// Fetches Brent, WTI, and Henry Hub prices with fallback support

interface EiaSeriesResponse {
  response?: {
    data?: Array<{
      period: string;
      value: number | string;
    }>;
  };
}

export async function fetchEiaSeries(seriesId: string, apiKey?: string): Promise<{ value: number; change1M: number } | null> {
  const key = apiKey || process.env.EIA_API_KEY;
  if (!key) {
    // Return null if no key configured — fallback will be used
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const url = `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${key}&frequency=daily&data[0]=value&facets[series][]=${seriesId}&sort[0][column]=period&sort[0][direction]=desc&length=30`;
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json: EiaSeriesResponse = await res.json();
    const data = json.response?.data;
    if (!data || data.length === 0) return null;

    const latest = Number(data[0].value);
    const prevMonth = data.length > 20 ? Number(data[20].value) : Number(data[data.length - 1].value);
    const change1M = prevMonth ? Math.round(((latest - prevMonth) / prevMonth) * 1000) / 10 : 0;

    return { value: latest, change1M };
  } catch (err) {
    console.warn(`[EIA Fetcher] Failed to fetch ${seriesId}:`, err);
    return null;
  }
}
