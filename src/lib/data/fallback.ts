// ─── Fallback Data from FI_MacroRisk_Radar_Summary.md ───
// All 17 indicators with static values as last-known-good defaults.
// Each includes plausible history[] for chart rendering.

import {
  type Indicator,
  type CompositeRiskScore,
  type MarketPulse,
  type AlertRule,
  type NewsArticle,
  type SourceHealth,
  type SystemTrust,
} from './types';

// ─── Helper: generate plausible history ───
function generateHistory(
  currentValue: number,
  months: number = 12,
  volatility: number = 0.05
): { date: string; value: number }[] {
  const points: { date: string; value: number }[] = [];
  const now = new Date('2026-08-24');
  let val = currentValue * (1 - volatility * months * 0.3);

  for (let i = months; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const jitter = (Math.random() - 0.4) * volatility * val;
    val = Math.max(val + jitter, currentValue * 0.3);
    if (i === 0) val = currentValue;
    points.push({
      date: d.toISOString().split('T')[0],
      value: Math.round(val * 100) / 100,
    });
  }
  return points;
}

// ─── Indicators ───
export const FALLBACK_INDICATORS: Indicator[] = [
  // Energy
  {
    id: 'brent',
    name: 'Brent Crude',
    value: 95.29,
    displayValue: '$95.29/bbl',
    unit: '$/bbl',
    change1M: 37.6,
    source: 'U.S. EIA',
    freshness: 'Stale',
    lastUpdated: '2026-08-01T00:00:00Z',
    riskBand: 'Elevated',
    category: 'Energy',
    history: generateHistory(95.29, 12, 0.06),
  },
  {
    id: 'wti',
    name: 'WTI Crude',
    value: 86.48,
    displayValue: '$86.48/bbl',
    unit: '$/bbl',
    change1M: 22.6,
    source: 'U.S. EIA',
    freshness: 'Stale',
    lastUpdated: '2026-08-01T00:00:00Z',
    riskBand: 'Elevated',
    category: 'Energy',
    history: generateHistory(86.48, 12, 0.06),
  },
  {
    id: 'henry-hub',
    name: 'Henry Hub Natural Gas',
    value: 2.82,
    displayValue: '$2.82/MMBtu',
    unit: '$/MMBtu',
    change1M: -15.6,
    source: 'U.S. EIA',
    freshness: 'Stale',
    lastUpdated: '2026-08-01T00:00:00Z',
    riskBand: 'Guarded',
    category: 'Energy',
    history: generateHistory(2.82, 12, 0.1),
  },
  // Raw Materials
  {
    id: 'phosphate-rock',
    name: 'Phosphate Rock',
    value: 170,
    displayValue: '$170/mt',
    unit: '$/mt',
    change1M: 8.5,
    source: 'World Bank Pink Sheet',
    freshness: 'Fresh',
    lastUpdated: '2026-08-24T00:00:00Z',
    riskBand: 'Critical',
    category: 'Raw Material',
    history: generateHistory(170, 12, 0.04),
  },
  {
    id: 'sulfur',
    name: 'Sulfur',
    value: 180,
    displayValue: '$180/mt',
    unit: '$/mt',
    change1M: null,
    source: 'USGS',
    freshness: 'Estimated',
    lastUpdated: '2025-12-31T00:00:00Z',
    riskBand: 'Elevated',
    category: 'Raw Material',
    history: generateHistory(180, 12, 0.03),
  },
  {
    id: 'phosphoric-acid',
    name: 'Phosphoric Acid',
    value: 168.423,
    displayValue: 'Idx 168.423',
    unit: 'Index',
    change1M: 2.1,
    source: 'U.S. BLS',
    freshness: 'Stale',
    lastUpdated: '2026-07-15T00:00:00Z',
    riskBand: 'Elevated',
    category: 'Raw Material',
    history: generateHistory(168.423, 12, 0.03),
  },
  {
    id: 'sulfuric-acid',
    name: 'Sulfuric Acid',
    value: 256.679,
    displayValue: 'Idx 256.679',
    unit: 'Index',
    change1M: 0.9,
    source: 'U.S. BLS',
    freshness: 'Stale',
    lastUpdated: '2026-07-15T00:00:00Z',
    riskBand: 'Elevated',
    category: 'Raw Material',
    history: generateHistory(256.679, 12, 0.02),
  },
  // Fertilizers
  {
    id: 'ammonia',
    name: 'Ammonia',
    value: 775,
    displayValue: '$775/mt',
    unit: '$/mt',
    change1M: -3.7,
    source: 'USDA AMS/Green Markets',
    freshness: 'Stale',
    lastUpdated: '2026-07-20T00:00:00Z',
    riskBand: 'High',
    category: 'Fertilizer',
    history: generateHistory(775, 12, 0.05),
  },
  {
    id: 'urea',
    name: 'Urea',
    value: 389.88,
    displayValue: '$389.88/st',
    unit: '$/short ton',
    change1M: -31.6,
    source: 'USDA AMS/Green Markets',
    freshness: 'Stale',
    lastUpdated: '2026-07-20T00:00:00Z',
    riskBand: 'Guarded',
    category: 'Fertilizer',
    history: generateHistory(389.88, 12, 0.08),
  },
  {
    id: 'dap',
    name: 'DAP',
    value: 783.75,
    displayValue: '$783.75/st',
    unit: '$/short ton',
    change1M: 1.9,
    source: 'USDA AMS/Green Markets',
    freshness: 'Stale',
    lastUpdated: '2026-07-20T00:00:00Z',
    riskBand: 'High',
    category: 'Fertilizer',
    history: generateHistory(783.75, 12, 0.04),
  },
  {
    id: 'potash',
    name: 'Potash',
    value: 341.88,
    displayValue: '$341.88/st',
    unit: '$/short ton',
    change1M: 0.6,
    source: 'USDA AMS/Green Markets',
    freshness: 'Stale',
    lastUpdated: '2026-07-20T00:00:00Z',
    riskBand: 'Elevated',
    category: 'Fertilizer',
    history: generateHistory(341.88, 12, 0.03),
  },
  // FX & Macro
  {
    id: 'usd-idr',
    name: 'USD/IDR',
    value: 17705,
    displayValue: '17,705',
    unit: 'IDR',
    change1M: -0.4,
    source: 'BI JISDOR',
    freshness: 'Fresh',
    lastUpdated: '2026-08-21T00:00:00Z',
    riskBand: 'Guarded',
    category: 'FX & Macro',
    history: generateHistory(17705, 12, 0.02),
  },
  {
    id: 'cpi-yoy',
    name: 'CPI YoY',
    value: 3.34,
    displayValue: '3.34%',
    unit: '%',
    change1M: null,
    source: 'BPS',
    freshness: 'Stale',
    lastUpdated: '2026-06-30T00:00:00Z',
    riskBand: 'Guarded',
    category: 'FX & Macro',
    history: generateHistory(3.34, 12, 0.08),
  },
  {
    id: 'real-gdp-yoy',
    name: 'Real GDP YoY',
    value: 5.61,
    displayValue: '5.61%',
    unit: '%',
    change1M: null,
    source: 'BPS',
    freshness: 'Stale',
    lastUpdated: '2026-03-31T00:00:00Z',
    riskBand: 'Low',
    category: 'FX & Macro',
    history: generateHistory(5.61, 12, 0.03),
  },
  {
    id: 'usd-jpy',
    name: 'USD/JPY',
    value: 158.7,
    displayValue: '¥158.7',
    unit: 'JPY',
    change1M: -2.2,
    source: 'FRED',
    freshness: 'Fresh',
    lastUpdated: '2026-08-22T00:00:00Z',
    riskBand: 'Guarded',
    category: 'FX & Macro',
    history: generateHistory(158.7, 12, 0.03),
  },
  {
    id: 'vix',
    name: 'VIX',
    value: 15.13,
    displayValue: '15.13',
    unit: 'Index',
    change1M: -2.8,
    source: 'Cboe',
    freshness: 'Fresh',
    lastUpdated: '2026-08-22T00:00:00Z',
    riskBand: 'Low',
    category: 'FX & Macro',
    history: generateHistory(15.13, 12, 0.15),
  },
  {
    id: 'usd-broad',
    name: 'USD Broad Index',
    value: 118.9,
    displayValue: '118.9',
    unit: 'Index',
    change1M: -1.7,
    source: 'Federal Reserve',
    freshness: 'Fresh',
    lastUpdated: '2026-08-22T00:00:00Z',
    riskBand: 'Guarded',
    category: 'FX & Macro',
    history: generateHistory(118.9, 12, 0.02),
  },
];

// ─── Composite Risk Score ───
export const FALLBACK_RISK_SCORE: CompositeRiskScore = {
  score: 67,
  label: 'Elevated',
  change: 4,
  confidence: 86,
  confidenceLabel: 'High',
  categories: [
    { category: 'Energy & Feedstock', score: 78, weight: 0.30, trend: 'up' },
    { category: 'Fertilizer Market', score: 72, weight: 0.25, trend: 'up' },
    { category: 'FX & Financial', score: 63, weight: 0.15, trend: 'stable' },
    { category: 'Global Macro & Geopolitics', score: 61, weight: 0.15, trend: 'up' },
    { category: 'Domestic Macro & Policy', score: 46, weight: 0.15, trend: 'down' },
  ],
  topDrivers: [
    { name: 'Brent', change: '+37.6%', impact: 2.4 },
    { name: 'Urea', change: '-31.6%', impact: 1.8 },
    { name: 'Shipping risk news volume', change: '', impact: 1.2 },
    { name: 'USD/IDR', change: '', impact: 0.9 },
    { name: 'Domestic inflation', change: '', impact: -0.6 },
  ],
};

// ─── Market Pulse ───
export const FALLBACK_MARKET_PULSE: MarketPulse[] = [
  { id: 'usd-idr', label: 'USD/IDR', value: '17,705', change: '-0.4%' },
  { id: 'cpi', label: 'CPI YoY', value: '3.34%', change: '' },
  { id: 'gdp', label: 'Real GDP YoY', value: '5.61%', change: '' },
  { id: 'usd-jpy', label: 'USD/JPY', value: '158.7', change: '-2.2%' },
  { id: 'vix', label: 'VIX', value: '15.13', change: '-2.8%' },
  { id: 'usd-broad', label: 'USD Broad', value: '118.9', change: '-1.7%' },
  { id: 'brent', label: 'Brent', value: '$95.29', change: '+37.6%' },
  { id: 'wti', label: 'WTI', value: '$86.48', change: '+22.6%' },
];

// ─── System Trust ───
export const FALLBACK_SYSTEM_TRUST: SystemTrust = {
  livePercentage: 71,
  fresh: 4,
  partial: 0,
  stale: 12,
};

// ─── Alert Rules ───
export const FALLBACK_ALERTS: AlertRule[] = [
  {
    id: 'energy-risk',
    name: 'Energy Risk',
    condition: 'Energy score ≥ 70',
    channels: 'In-app + Email',
    cooldown: '24h',
    lastTriggered: 'Today 08:31',
    isActive: true,
  },
  {
    id: 'rupiah-move',
    name: 'Rupiah Monthly Move',
    condition: 'USD/IDR moves >2%/month',
    channels: 'In-app',
    cooldown: '12h',
    lastTriggered: 'Never',
    isActive: true,
  },
  {
    id: 'china-urea',
    name: 'China Urea Restriction',
    condition: 'Keyword monitor',
    channels: 'Daily Digest',
    cooldown: '24h',
    lastTriggered: 'Today 07:32',
    isActive: true,
  },
  {
    id: 'stale-lng',
    name: 'Stale LNG Benchmark',
    condition: 'LNG data stale >45 days',
    channels: 'In-app',
    cooldown: '48h',
    lastTriggered: 'Jul 16, 09:10',
    isActive: true,
  },
];

// ─── News Articles ───
export const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Yemen conflict escalation disrupts Red Sea shipping routes',
    source: 'UN News',
    sourceUrl: 'https://news.un.org',
    publishedAt: '2026-08-23T14:00:00Z',
    region: 'Middle East',
    tags: ['Geopolitics', 'Shipping', 'Red Sea'],
    summary: 'Houthi actions continue to disrupt major shipping lanes through the Red Sea and Bab el-Mandeb strait, increasing freight costs for energy and fertilizer shipments.',
    relevanceScore: 92,
  },
  {
    id: 'n2',
    title: 'Iran-US tensions raise Strait of Hormuz disruption fears',
    source: 'UN News',
    sourceUrl: 'https://news.un.org',
    publishedAt: '2026-08-22T10:00:00Z',
    region: 'Middle East',
    tags: ['Geopolitics', 'Energy', 'Hormuz'],
    summary: 'Escalating diplomatic tensions between Iran and the US have raised concerns about potential disruptions to oil shipments through the Strait of Hormuz.',
    relevanceScore: 88,
  },
  {
    id: 'n3',
    title: 'China crude oil imports down in Q2 2026 amid higher prices',
    source: 'EIA',
    sourceUrl: 'https://www.eia.gov',
    publishedAt: '2026-08-21T08:00:00Z',
    region: 'China',
    tags: ['Energy', 'Trade', 'Demand'],
    summary: 'China\'s crude oil imports fell in Q2 2026, reflecting higher global prices and softened domestic demand, potentially easing global supply pressure.',
    relevanceScore: 85,
  },
  {
    id: 'n4',
    title: 'US sets record LNG export volumes in 2025',
    source: 'EIA',
    sourceUrl: 'https://www.eia.gov',
    publishedAt: '2026-08-20T12:00:00Z',
    region: 'US',
    tags: ['Energy', 'LNG', 'Exports'],
    summary: 'The United States achieved record liquefied natural gas export volumes in 2025, reshaping global energy trade patterns.',
    relevanceScore: 78,
  },
  {
    id: 'n5',
    title: 'Russia-Ukraine: missile strikes causing civilian casualties',
    source: 'UN News',
    sourceUrl: 'https://news.un.org',
    publishedAt: '2026-08-19T16:00:00Z',
    region: 'Europe',
    tags: ['Geopolitics', 'Russia-Ukraine', 'Conflict'],
    summary: 'Continued missile strikes in Ukraine have resulted in civilian casualties, maintaining geopolitical uncertainty in the Black Sea region.',
    relevanceScore: 75,
  },
  {
    id: 'n6',
    title: 'US record petroleum exports in April bolster global supply',
    source: 'EIA',
    sourceUrl: 'https://www.eia.gov',
    publishedAt: '2026-08-18T09:00:00Z',
    region: 'US',
    tags: ['Energy', 'Exports', 'Petroleum'],
    summary: 'Record US petroleum exports in April 2026 have partially offset supply concerns from Middle Eastern disruptions.',
    relevanceScore: 72,
  },
];

// ─── Source Health ───
export const FALLBACK_SOURCE_HEALTH: SourceHealth[] = [
  { name: 'Bank Indonesia FX', status: 'Healthy', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'ECB Global FX', status: 'Healthy', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'Cboe (VIX)', status: 'Healthy', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'Federal Reserve Global FX', status: 'Healthy', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'U.S. EIA Energy', status: 'Healthy', articleCount: 22, lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'World Bank Raw Materials', status: 'Healthy', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'BPS (Indonesia stats)', status: 'Degraded', notes: 'BPS fallback active', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'U.S. BLS (Sulfuric Acid)', status: 'Degraded', lastCheck: '2026-08-24T08:00:00Z' },
  { name: 'USGS Sulfur', status: 'Partial', notes: 'Annual estimates only, not live' },
  { name: 'USDA', status: 'Partial', notes: 'Needs token for stable quota' },
];

// ─── Risk Score History (for trajectory chart) ───
export const FALLBACK_RISK_HISTORY: { date: string; score: number }[] = (() => {
  const points: { date: string; score: number }[] = [];
  const now = new Date('2026-08-24');
  let score = 48;
  for (let i = 60; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const drift = (Math.random() - 0.35) * 4;
    score = Math.max(20, Math.min(95, score + drift));
    if (i === 0) score = 67;
    points.push({
      date: d.toISOString().split('T')[0],
      score: Math.round(score * 10) / 10,
    });
  }
  return points;
})();
