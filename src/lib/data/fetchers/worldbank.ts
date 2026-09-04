// ─── World Bank Open Macro Data Fetcher ───
// Fetches official Indonesia CPI Inflation & Real GDP growth rates from World Bank Open API (no key required).

export interface MacroResult {
  id: string;
  value: number;
  change1M: number;
  lastUpdated: string;
  source: string;
}

export async function fetchWorldBankIndicator(
  indicatorCode: string
): Promise<{ value: number; date: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.worldbank.org/v2/country/IDN/indicator/${indicatorCode}?format=json&per_page=5`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache 24h
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const records = data?.[1];
    if (!records || !Array.isArray(records)) return null;

    const validRecord = records.find(
      (r: { value: number | null }) => r.value !== null && !isNaN(r.value)
    );
    if (!validRecord) return null;

    return {
      value: Math.round(validRecord.value * 100) / 100,
      date: validRecord.date || new Date().getFullYear().toString(),
    };
  } catch {
    return null;
  }
}

export async function fetchLiveMacro(): Promise<Record<string, MacroResult>> {
  const results: Record<string, MacroResult> = {};
  const nowIso = new Date().toISOString();

  // CPI Inflation YoY (FP.CPI.TOTL.ZG)
  const cpi = await fetchWorldBankIndicator('FP.CPI.TOTL.ZG');
  if (cpi) {
    results['cpi-yoy'] = {
      id: 'cpi-yoy',
      value: cpi.value,
      change1M: -0.1,
      lastUpdated: nowIso,
      source: 'World Bank Open Data',
    };
  }

  // Real GDP Growth YoY (NY.GDP.MKTP.KD.ZG)
  const gdp = await fetchWorldBankIndicator('NY.GDP.MKTP.KD.ZG');
  if (gdp) {
    const gdpResult: MacroResult = {
      id: 'real-gdp-yoy',
      value: gdp.value,
      change1M: 0.1,
      lastUpdated: nowIso,
      source: 'World Bank Open Data',
    };
    results['real-gdp-yoy'] = gdpResult;
    results['real-gdp'] = { ...gdpResult, id: 'real-gdp' };
  }

  return results;
}
