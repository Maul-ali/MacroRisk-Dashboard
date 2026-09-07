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
import { fetchLiveEia } from './fetchers/eia';
import { fetchLiveFx } from './fetchers/openFx';
import { fetchLiveCommodities } from './fetchers/commodities';
import { fetchLiveMacro, fetchLivePinkSheet } from './fetchers/worldbank';
import { fetchLiveNews } from './fetchers/news';
import { loadIndicatorCacheFromDb, saveIndicatorCacheToDb } from '../db/indicatorCache';
import { recordIndicatorHistory, get1MonthAgoValues, computeChange1M } from '../db/indicatorHistory';

let cachedIndicators: Indicator[] = [...FALLBACK_INDICATORS];
let cachedRiskScore: CompositeRiskScore = { ...FALLBACK_RISK_SCORE };
let cachedMarketPulse: MarketPulse[] = [...FALLBACK_MARKET_PULSE];
let cachedSystemTrust: SystemTrust = { ...FALLBACK_SYSTEM_TRUST };
let cachedNews: NewsArticle[] = [...FALLBACK_NEWS];
let lastSyncTimestamp: number = 0;

let refreshInFlight: Promise<void> | null = null;
let hydrationInFlight: Promise<void> | null = null;

const FETCHABLE_INDICATOR_IDS = new Set([
  'brent',
  'wti',
  'henry-hub',
  'phosphate-rock',
  'vix',
  'usd-idr',
  'usd-jpy',
  'cpi-yoy',
  'real-gdp',
  'real-gdp-yoy',
]);

// Format display values cleanly
function formatDisplayValue(id: string, value: number, unit: string): string {
  if (id === 'usd-idr') {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
  if (id === 'cpi-yoy' || id === 'real-gdp' || id === 'real-gdp-yoy') {
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
function computeRiskBand(id: string, value: number, change1M: number | null): RiskBand {
  const change = change1M ?? 0;

  if (id === 'brent' || id === 'wti') {
    if (value >= 100 || change > 25) return 'Critical';
    if (value >= 85 || change > 15) return 'Elevated';
    if (value >= 70) return 'Guarded';
    return 'Low';
  }
  if (id === 'henry-hub') {
    if (value >= 6.0 || change > 35) return 'Critical';
    if (value >= 4.0 || change > 20) return 'Elevated';
    if (value >= 2.5) return 'Guarded';
    return 'Low';
  }
  if (id === 'usd-idr') {
    if (value >= 17000 || change > 4) return 'Critical';
    if (value >= 16300 || change > 2) return 'Elevated';
    if (value >= 15800) return 'Guarded';
    return 'Low';
  }
  if (id === 'usd-jpy') {
    if (value >= 160 || change > 5) return 'Critical';
    if (value >= 152 || change > 2.5) return 'Elevated';
    if (value >= 140) return 'Guarded';
    return 'Low';
  }
  if (id === 'usd-broad' || id === 'usd-broad-idx') {
    if (value >= 128) return 'Critical';
    if (value >= 124) return 'Elevated';
    if (value >= 118) return 'Guarded';
    return 'Low';
  }
  if (id === 'cpi-yoy') {
    if (value >= 5.5 || value < 1.0) return 'Critical';
    if (value >= 4.0) return 'Elevated';
    if (value >= 3.0) return 'Guarded';
    return 'Low';
  }
  if (id === 'real-gdp' || id === 'real-gdp-yoy') {
    if (value < 4.0) return 'Critical';
    if (value < 4.8) return 'Elevated';
    if (value < 5.2) return 'Guarded';
    return 'Low';
  }
  if (id === 'phosphate-rock') {
    if (value >= 250) return 'Critical';
    if (value >= 180) return 'Elevated';
    if (value >= 140) return 'Guarded';
    return 'Low';
  }
  if (id === 'vix') {
    if (value >= 30) return 'Critical';
    if (value >= 20) return 'Elevated';
    if (value >= 15) return 'Guarded';
    return 'Low';
  }

  // Indicators without a live fetcher retain their baseline risk band from fallback.ts
  const fallback = FALLBACK_INDICATORS.find((ind) => ind.id === id);
  return fallback?.riskBand ?? 'Guarded';
}

export async function refreshLiveData(): Promise<{
  indicators: Indicator[];
  riskScore: CompositeRiskScore;
  systemTrust: SystemTrust;
  news: NewsArticle[];
}> {
  try {
    const [fxData, eiaData, commodityData, macroData, newsData, pinkSheetData] =
      await Promise.allSettled([
        fetchLiveFx(),
        fetchLiveEia(),
        fetchLiveCommodities(),
        fetchLiveMacro(),
        fetchLiveNews(),
        fetchLivePinkSheet(),
      ]);

    const liveFx = fxData.status === 'fulfilled' ? fxData.value : {};
    const liveEia = eiaData.status === 'fulfilled' ? eiaData.value : {};
    const liveCommoditiesRaw = commodityData.status === 'fulfilled' ? commodityData.value : {};
    const liveCommodities = { ...liveCommoditiesRaw, ...liveEia };
    const liveMacro = macroData.status === 'fulfilled' ? macroData.value : {};
    const livePinkSheet = pinkSheetData.status === 'fulfilled' ? pinkSheetData.value : {};

    console.log(
      `[Commodities Feed Routing] Brent: ${liveCommodities['brent']?.source || 'none'} | WTI: ${liveCommodities['wti']?.source || 'none'} | Henry Hub: ${liveCommodities['henry-hub']?.source || 'none'} | Pink Sheet: ${livePinkSheet['phosphate-rock'] ? 'live' : 'none'}`
    );

    if (newsData.status === 'fulfilled' && newsData.value.length > 0) {
      cachedNews = newsData.value;
    }

    // Collect and record newly fetched history records to Neon Postgres
    const historyRecordsToSave: Array<{ id: string; value: number }> = [];
    if (liveFx['usd-idr']) historyRecordsToSave.push({ id: 'usd-idr', value: liveFx['usd-idr'].rate });
    if (liveFx['usd-jpy']) historyRecordsToSave.push({ id: 'usd-jpy', value: liveFx['usd-jpy'].rate });
    if (liveCommodities['brent']) historyRecordsToSave.push({ id: 'brent', value: liveCommodities['brent'].price });
    if (liveCommodities['wti']) historyRecordsToSave.push({ id: 'wti', value: liveCommodities['wti'].price });
    if (liveCommodities['henry-hub']) historyRecordsToSave.push({ id: 'henry-hub', value: liveCommodities['henry-hub'].price });
    if (liveCommodities['vix']) historyRecordsToSave.push({ id: 'vix', value: liveCommodities['vix'].price });
    if (liveMacro['cpi-yoy']) historyRecordsToSave.push({ id: 'cpi-yoy', value: liveMacro['cpi-yoy'].value });
    if (liveMacro['real-gdp-yoy']) historyRecordsToSave.push({ id: 'real-gdp-yoy', value: liveMacro['real-gdp-yoy'].value });
    if (livePinkSheet['phosphate-rock']) historyRecordsToSave.push({ id: 'phosphate-rock', value: livePinkSheet['phosphate-rock'].value });

    if (historyRecordsToSave.length > 0) {
      recordIndicatorHistory(historyRecordsToSave).catch((err) => {
        console.warn('[LiveStore] Failed to record indicator history:', err);
      });
    }

    // Query 1-month-ago historical baselines from database
    const monthAgoMap = await get1MonthAgoValues(Array.from(FETCHABLE_INDICATOR_IDS));

    let freshCount = 0;
    const totalSeries = cachedIndicators.length;

    // Merge into indicators list
    cachedIndicators = cachedIndicators.map((item) => {
      let updated = { ...item };

      if (liveFx[item.id]) {
        const fx = liveFx[item.id];
        const change1M = fx.change1M !== null ? fx.change1M : computeChange1M(fx.rate, monthAgoMap.get(item.id));
        updated.value = fx.rate;
        updated.displayValue = formatDisplayValue(item.id, fx.rate, item.unit);
        updated.change1M = change1M;
        updated.lastUpdated = fx.lastUpdated;
        updated.source = fx.source;
        updated.dataOrigin = 'live';
        updated.freshness = 'Fresh';
        updated.riskBand = computeRiskBand(item.id, fx.rate, change1M);
        freshCount++;
      } else if (liveCommodities[item.id]) {
        const comm = liveCommodities[item.id];
        const change1M = comm.change1M !== null ? comm.change1M : computeChange1M(comm.price, monthAgoMap.get(item.id));
        updated.value = comm.price;
        updated.displayValue = formatDisplayValue(item.id, comm.price, item.unit);
        updated.change1M = change1M;
        updated.lastUpdated = comm.lastUpdated;
        updated.source = comm.source;
        updated.dataOrigin = 'live';
        updated.freshness = 'Fresh';
        updated.riskBand = computeRiskBand(item.id, comm.price, change1M);
        freshCount++;
      } else if (livePinkSheet[item.id]) {
        const pink = livePinkSheet[item.id];
        const change1M = pink.change1M !== null ? pink.change1M : computeChange1M(pink.value, monthAgoMap.get(item.id));
        updated.value = pink.value;
        updated.displayValue = formatDisplayValue(item.id, pink.value, item.unit);
        updated.change1M = change1M;
        updated.lastUpdated = pink.lastUpdated;
        updated.source = pink.source;
        updated.dataOrigin = 'live';
        updated.freshness = 'Fresh';
        updated.riskBand = computeRiskBand(item.id, pink.value, change1M);
        freshCount++;
      } else if (liveMacro[item.id]) {
        const mac = liveMacro[item.id];
        const change1M = mac.change1M !== null ? mac.change1M : computeChange1M(mac.value, monthAgoMap.get(item.id));
        updated.value = mac.value;
        updated.displayValue = formatDisplayValue(item.id, mac.value, item.unit);
        updated.change1M = change1M;
        updated.lastUpdated = mac.lastUpdated;
        updated.source = mac.source;
        updated.dataOrigin = 'live';
        updated.freshness = 'Fresh';
        updated.riskBand = computeRiskBand(item.id, mac.value, change1M);
        freshCount++;
      } else {
        updated.dataOrigin = 'fallback';
        updated.freshness = FETCHABLE_INDICATOR_IDS.has(item.id) ? 'Stale' : 'Estimated';
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

    const brentChange =
      brent?.change1M !== null && brent?.change1M !== undefined
        ? `${brent.change1M > 0 ? '+' : ''}${brent.change1M}%`
        : '—';
    const usdIdrChange =
      usdIdr?.change1M !== null && usdIdr?.change1M !== undefined
        ? `${usdIdr.change1M > 0 ? '+' : ''}${usdIdr.change1M}%`
        : '—';

    const topDrivers: RiskDriver[] = [
      {
        name: `Brent ($${brent?.value || 82}/bbl)`,
        change: brentChange,
        impact: 2.2,
      },
      { name: `USD/IDR (${usdIdr?.displayValue || '16,250'})`, change: usdIdrChange, impact: 1.4 },
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

    // Persist cache to Neon Postgres
    saveIndicatorCacheToDb({
      indicators: cachedIndicators,
      riskScore: cachedRiskScore,
      marketPulse: cachedMarketPulse,
      systemTrust: cachedSystemTrust,
      news: cachedNews,
      lastSyncTimestamp,
    }).catch((err) => {
      console.warn('[LiveStore] Failed to persist cache to DB:', err);
    });
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

// Ensure store is hydrated from DB cache before first request
export async function ensureCacheHydrated(): Promise<void> {
  if (typeof window === 'undefined' && lastSyncTimestamp === 0) {
    if (!hydrationInFlight) {
      hydrationInFlight = (async () => {
        try {
          const dbCache = await loadIndicatorCacheFromDb();
          if (dbCache && dbCache.indicators && dbCache.indicators.length > 0) {
            cachedIndicators = dbCache.indicators;
            if (dbCache.riskScore) cachedRiskScore = dbCache.riskScore;
            if (dbCache.marketPulse && dbCache.marketPulse.length > 0) cachedMarketPulse = dbCache.marketPulse;
            if (dbCache.systemTrust) cachedSystemTrust = dbCache.systemTrust;
            if (dbCache.news && dbCache.news.length > 0) cachedNews = dbCache.news;
            if (dbCache.lastSyncTimestamp) lastSyncTimestamp = dbCache.lastSyncTimestamp;
          }
        } catch (err) {
          console.warn('[LiveStore] Error hydrating from Neon cache:', err);
        }
      })().finally(() => {
        hydrationInFlight = null;
      });
    }
    await hydrationInFlight;
  }
}

// ─── Promise-Locked Async Getters ───

export async function getLiveIndicatorsAsync(): Promise<Indicator[]> {
  await ensureCacheHydrated();
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData()
        .then(() => {})
        .finally(() => {
          refreshInFlight = null;
        });
    }
    await refreshInFlight;
  }
  return cachedIndicators;
}

export async function getLiveRiskScoreAsync(): Promise<CompositeRiskScore> {
  await ensureCacheHydrated();
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData()
        .then(() => {})
        .finally(() => {
          refreshInFlight = null;
        });
    }
    await refreshInFlight;
  }
  return cachedRiskScore;
}

export async function getLiveMarketPulseAsync(): Promise<MarketPulse[]> {
  await ensureCacheHydrated();
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData()
        .then(() => {})
        .finally(() => {
          refreshInFlight = null;
        });
    }
    await refreshInFlight;
  }
  return cachedMarketPulse;
}

export async function getLiveSystemTrustAsync(): Promise<SystemTrust> {
  await ensureCacheHydrated();
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData()
        .then(() => {})
        .finally(() => {
          refreshInFlight = null;
        });
    }
    await refreshInFlight;
  }
  return cachedSystemTrust;
}

export async function getLiveNewsAsync(): Promise<NewsArticle[]> {
  await ensureCacheHydrated();
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData()
        .then(() => {})
        .finally(() => {
          refreshInFlight = null;
        });
    }
    await refreshInFlight;
  }
  return cachedNews;
}

// ─── Fast Synchronous Fallback Getters ───
// Kept for synchronous client / utility contexts where async is unavailable.

export function getLiveIndicators(): Indicator[] {
  if (typeof window === 'undefined' && Date.now() - lastSyncTimestamp > 1800000) {
    if (!refreshInFlight) {
      refreshInFlight = refreshLiveData()
        .then(() => {})
        .finally(() => {
          refreshInFlight = null;
        });
    }
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
  return cachedNews;
}
