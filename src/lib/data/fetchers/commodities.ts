// ─── Live Commodities & Market Sentiment Fetcher ───
// Fetches Brent, WTI, Henry Hub Gas, and VIX from open market endpoints.

export interface CommodityResult {
  id: string;
  price: number;
  change1M: number;
  lastUpdated: string;
  source: string;
}

const SYMBOLS: Record<string, { id: string; name: string; symbol: string }> = {
  brent: { id: 'brent', name: 'Brent Crude', symbol: 'BZ=F' },
  wti: { id: 'wti', name: 'WTI Crude', symbol: 'CL=F' },
  'henry-hub': { id: 'henry-hub', name: 'Henry Hub Natural Gas', symbol: 'NG=F' },
  vix: { id: 'vix', name: 'CBOE Volatility Index', symbol: '^VIX' },
};

export async function fetchCommodityQuote(symbol: string): Promise<{ price: number; change1M: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const latestPrice = meta?.regularMarketPrice;
    const quotes = result.indicators?.quote?.[0]?.close || [];
    const validQuotes = quotes.filter((q: number | null) => q !== null && !isNaN(q));

    let change1M = 0;
    if (validQuotes.length > 1 && latestPrice) {
      const monthStart = validQuotes[0];
      change1M = Math.round(((latestPrice - monthStart) / monthStart) * 1000) / 10;
    }

    if (latestPrice) {
      return { price: Math.round(latestPrice * 100) / 100, change1M };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchLiveCommodities(): Promise<Record<string, CommodityResult>> {
  const results: Record<string, CommodityResult> = {};
  const nowIso = new Date().toISOString();

  await Promise.all(
    Object.entries(SYMBOLS).map(async ([key, conf]) => {
      const quote = await fetchCommodityQuote(conf.symbol);
      if (quote) {
        results[key] = {
          id: conf.id,
          price: quote.price,
          change1M: quote.change1M,
          lastUpdated: nowIso,
          source: 'Yahoo Finance (unofficial endpoint)',
        };
      }
    })
  );

  return results;
}
