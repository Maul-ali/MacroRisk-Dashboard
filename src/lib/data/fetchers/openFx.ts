// ─── Open FX Fetcher ───
// Fetches real-time USD/IDR, USD/JPY, and EUR/USD rates from open public FX APIs (no key required).

export interface FxResult {
  id: string;
  rate: number;
  change1M: number | null;
  lastUpdated: string;
  source: string;
}

export async function fetchLiveFx(): Promise<Record<string, FxResult>> {
  const results: Record<string, FxResult> = {};
  const nowIso = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Primary: Open.er-api (Open Exchange Rates community feed)
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rates = data.rates || {};

      if (rates.IDR) {
        // USD/IDR rate
        results['usd-idr'] = {
          id: 'usd-idr',
          rate: Math.round(rates.IDR),
          change1M: null, // Computed from indicator_history
          lastUpdated: data.time_last_update_utc ? new Date(data.time_last_update_utc).toISOString() : nowIso,
          source: 'open.er-api.com (mid-market composite)',
        };
      }

      if (rates.JPY) {
        // USD/JPY rate
        results['usd-jpy'] = {
          id: 'usd-jpy',
          rate: Math.round(rates.JPY * 100) / 100,
          change1M: null, // Computed from indicator_history
          lastUpdated: nowIso,
          source: 'open.er-api.com (mid-market composite)',
        };
      }
    }
  } catch (err) {
    console.warn('[OpenFX Fetcher] Primary source failed, attempting fallback to Frankfurter:', err);

    // Secondary fallback: Frankfurter API (European Central Bank reference)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=IDR,JPY', {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.rates?.IDR) {
          results['usd-idr'] = {
            id: 'usd-idr',
            rate: Math.round(data.rates.IDR),
            change1M: null,
            lastUpdated: nowIso,
            source: 'ECB Reference Rates',
          };
        }
        if (data.rates?.JPY) {
          results['usd-jpy'] = {
            id: 'usd-jpy',
            rate: Math.round(data.rates.JPY * 100) / 100,
            change1M: null,
            lastUpdated: nowIso,
            source: 'ECB Reference Rates',
          };
        }
      }
    } catch (fallbackErr) {
      console.warn('[OpenFX Fetcher] All FX endpoints failed:', fallbackErr);
    }
  }

  return results;
}
