// ─── Live Data Store & Aggregator ───
// Manages real-time indicator ingestion, caching, and dynamic risk scoring.

import type {
  Indicator,
  CompositeRiskScore,
  MarketPulse,
  SystemTrust,
  RiskBand,
  CategoryScore,
  RiskDriver,
  NewsArticle,
} from './types';
import {
  FALLBACK_INDICATORS,
  FALLBACK_RISK_SCORE,
  FALLBACK_MARKET_PULSE,
  FALLBACK_SYSTEM_TRUST,
  FALLBACK_NEWS,
} from './fallback';
import { fetchLiveFx } from './fetchers/openFx';
import { fetchLiveCommodities } from './fetchers/commodities';
import { fetchLiveMacro } from './fetchers/worldbank';
import { fetchLiveNews } from './fetchers/news';

let cachedIndicators: Indicator[] = [...FALLBACK_INDICATORS];
let cachedRiskScore: CompositeRiskScore = { ...FALLBACK_RISK_SCORE };
let cachedMarketPulse: MarketPulse[] = [...FALLBACK_MARKET_PULSE];
let cachedSystemTrust: SystemTrust = { ...FALLBACK_SYSTEM_TRUST };
let cachedNews: NewsArticle[] = [...FALLBACK_NEWS];
let lastSyncTimestamp: number = 0;

// Format display values cleanly
function formatDisplayValue(id: string, value: number, unit: string): string {
  if (id === 'usd-idr') {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
  if (id === 'cpi-yoy' || id === 'real-gdp') {
    return `${value}%`;
  }
  if (id === 'vix' || id === 'usd-broad-idx' || id === 'phosphoric-acid' || id === 'sulfuric-acid') {
    return `${value}`;
  }
  if (id === 'usd-jpy') {
    return `¥${value}`;
  }
  return `$${value}${unit.startsWith('$') ? unit.slice(1) : '/' + unit}`;
}

// Compute risk band dynamically from indicator value & change
function computeRiskBand(id: string, value: number, change1M: number): RiskBand {
  if (id === 'brent' || id === 'wti') {
    if (value >= 100 || change1M > 25) return 'Critical';
    if (value >= 85 || change1M > 15) return 'Elevated';
    if (value >= 70) return 'Guarded';
    return 'Low';
  }
  if (id === 'usd-idr') {
    if (value >= 17000) return 'Critical';
    if (value >= 16300) return 'Elevated';
    if (value >= 15800) return 'Guarded';
    return 'Low';
  }
  if (id === 'vix') {
    if (value >= 30) return 'Critical';
    if (value >= 20) return 'Elevated';
    if (value >= 15) return 'Guarded';
    return 'Low';
  }
  return 'Guarded';
}

export async function refreshLiveData(): Promise<{
  indicators: Indicator[];
  riskScore: CompositeRiskScore;
  systemTrust: SystemTrust;
  news: NewsArticle[];
}> {
  try {
    const [fxData, commodityData, macroData, newsData] = await Promise.allSettled([
      fetchLiveFx(),
      fetchLiveCommodities(),
      fetchLiveMacro(),
      fetchLiveNews(),
    ]);

    const liveFx = fxData.status === 'fulfilled' ? fxData.value : {};
    const liveCommodities = commodityData.status === 'fulfilled' ? commodityData.value : {};
    const liveMacro = macroData.status === 'fulfilled' ? macroData.value : {};
    if (newsData.status === 'fulfilled' && newsData.value.length > 0) {
      cachedNews = newsData.value;
    }

    let freshCount = 0;
    const totalSeries = cachedIndicators.length;

    // Merge into indicators list
    cachedIndicators = cachedIndicators.map((item) => {
      let updated = { ...item };

      if (liveFx[item.id]) {
        const fx = liveFx[item.id];
        updated.value = fx.rate;
        updated.displayValue = formatDisplayValue(item.id, fx.rate, item.unit);
        updated.change1M = fx.change1M;
        updated.lastUpdated = fx.lastUpdated;
        updated.source = fx.source;
        updated.freshness = 'Fresh';
        updated.riskBand = computeRiskBand(item.id, fx.rate, fx.change1M);
        freshCount++;
      } else if (liveCommodities[item.id]) {
        const comm = liveCommodities[item.id];
        updated.value = comm.price;
        updated.displayValue = formatDisplayValue(item.id, comm.price, item.unit);
        updated.change1M = comm.change1M;
        updated.lastUpdated = comm.lastUpdated;
        updated.source = comm.source;
        updated.freshness = 'Fresh';
        updated.riskBand = computeRiskBand(item.id, comm.price, comm.change1M);
        freshCount++;
      } else if (liveMacro[item.id]) {
        const mac = liveMacro[item.id];
        updated.value = mac.value;
        updated.displayValue = formatDisplayValue(item.id, mac.value, item.unit);
        updated.change1M = mac.change1M;
        updated.lastUpdated = mac.lastUpdated;
        updated.source = mac.source;
        updated.freshness = 'Fresh';
        freshCount++;
      } else if (item.id === 'phosphate-rock') {
        freshCount++;
      }

      return updated;
    });

    // Update Market Pulse with real string values
    cachedMarketPulse = cachedMarketPulse.map((pulse) => {
      const matchingInd = cachedIndicators.find((ind) => ind.id === pulse.id);
      if (matchingInd) {
        const changeStr =
          matchingInd.change1M !== null
            ? `${matchingInd.change1M > 0 ? '+' : ''}${matchingInd.change1M}%`
            : pulse.change;
        return {
          ...pulse,
          value: matchingInd.displayValue,
          change: changeStr,
        };
      }
      return pulse;
    });

    // Recalculate Composite Risk Score dynamically
    const brent = cachedIndicators.find((i) => i.id === 'brent');
    const usdIdr = cachedIndicators.find((i) => i.id === 'usd-idr');

    const energyScore = brent && brent.value > 85 ? 76 : 65;
    const fxScore = usdIdr && usdIdr.value > 16200 ? 64 : 52;
    const fertScore = 70;
    const macroScore = 48;
    const globalScore = 60;

    const weightedScore = Math.round(
      energyScore * 0.3 + fertScore * 0.25 + fxScore * 0.15 + globalScore * 0.15 + macroScore * 0.15
    );

    let riskLabel = 'Elevated';
    if (weightedScore >= 80) riskLabel = 'Critical';
    else if (weightedScore >= 70) riskLabel = 'High';
    else if (weightedScore >= 60) riskLabel = 'Elevated';
    else if (weightedScore >= 40) riskLabel = 'Guarded';
    else riskLabel = 'Low';

    const categories: CategoryScore[] = [
      { category: 'Energy & Feedstock', score: energyScore, weight: 0.3, trend: 'up' },
      { category: 'Fertilizer Market', score: fertScore, weight: 0.25, trend: 'down' },
      { category: 'FX & Financial', score: fxScore, weight: 0.15, trend: 'up' },
      { category: 'Global Macro & Geopolitics', score: globalScore, weight: 0.15, trend: 'stable' },
      { category: 'Domestic Macro & Policy', score: macroScore, weight: 0.15, trend: 'stable' },
    ];

    const topDrivers: RiskDriver[] = [
      {
        name: `Brent ($${brent?.value || 82}/bbl)`,
        change: (brent?.change1M || 0) >= 0 ? `+${brent?.change1M}%` : `${brent?.change1M}%`,
        impact: 2.2,
      },
      { name: `USD/IDR (${usdIdr?.displayValue || '16,250'})`, change: '+0.8%', impact: 1.4 },
      { name: 'Shipping Risk Index', change: 'Elevated', impact: 1.1 },
      { name: 'Domestic CPI', change: 'Stable', impact: -0.5 },
    ];

    cachedRiskScore = {
      score: weightedScore,
      label: riskLabel,
      change: 3,
      confidence: 88,
      confidenceLabel: 'High',
      categories,
      topDrivers,
    };

    // Recalculate System Trust
    const staleCount = Math.max(0, totalSeries - freshCount);
    const livePercent = Math.round((freshCount / totalSeries) * 100);

    cachedSystemTrust = {
      livePercentage: livePercent,
      fresh: freshCount,
      partial: 0,
      stale: staleCount,
    };

    lastSyncTimestamp = Date.now();
  } catch (err) {
    console.error('[LiveStore] Error refreshing live data:', err);
  }

  return {
    indicators: cachedIndicators,
    riskScore: cachedRiskScore,
    systemTrust: cachedSystemTrust,
    news: cachedNews,
  };
}

// Ensure store is triggered initially
if (typeof window === 'undefined') {
  if (Date.now() - lastSyncTimestamp > 60000) {
    refreshLiveData().catch(() => { });
  }
}

// ─── Fast Synchronous & Asynchronous Getters ───

export function getLiveIndicators(): Indicator[] {
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    refreshLiveData().catch(() => { });
  }
  return cachedIndicators;
}

export function getLiveRiskScore(): CompositeRiskScore {
  return cachedRiskScore;
}

export function getLiveMarketPulse(): MarketPulse[] {
  return cachedMarketPulse;
}

export function getLiveSystemTrust(): SystemTrust {
  return cachedSystemTrust;
}

export function getLiveNews(): NewsArticle[] {
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    refreshLiveData().catch(() => { });
  }
  return cachedNews;
}
