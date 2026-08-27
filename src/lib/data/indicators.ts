// ─── Data Access Interface ───
// Unified interface for all indicator data. Reads from live store with automatic fallback.

import type {
  Indicator,
  CompositeRiskScore,
  MarketPulse,
  AlertRule,
  NewsArticle,
  SourceHealth,
  SystemTrust,
} from './types';
import {
  FALLBACK_ALERTS,
  FALLBACK_NEWS,
  FALLBACK_SOURCE_HEALTH,
  FALLBACK_RISK_HISTORY,
} from './fallback';
import {
  getLiveIndicators,
  getLiveRiskScore,
  getLiveMarketPulse,
  getLiveSystemTrust,
  getLiveNews,
  refreshLiveData,
} from './liveStore';

// ─── Indicators ───

export function getIndicator(id: string): Indicator | undefined {
  return getLiveIndicators().find((ind) => ind.id === id);
}

export function getAllIndicators(): Indicator[] {
  return getLiveIndicators();
}

export function getIndicatorsByCategory(category: string): Indicator[] {
  return getLiveIndicators().filter((ind) => ind.category === category);
}

// ─── Risk Score ───

export function getCompositeRiskScore(): CompositeRiskScore {
  return getLiveRiskScore();
}

export function getRiskHistory(): { date: string; score: number }[] {
  return FALLBACK_RISK_HISTORY;
}

// ─── Market Pulse ───

export function getMarketPulse(): MarketPulse[] {
  return getLiveMarketPulse();
}

// ─── Alerts ───

export function getAlertRules(): AlertRule[] {
  return FALLBACK_ALERTS;
}

// ─── News ───

export function getNewsArticles(): NewsArticle[] {
  return getLiveNews();
}

// ─── Source Health ───

export function getSourceHealth(): SourceHealth[] {
  return FALLBACK_SOURCE_HEALTH;
}

// ─── System Trust ───

export function getSystemTrust(): SystemTrust {
  return getLiveSystemTrust();
}

// ─── Dynamic Live Refresh Action ───

export async function refreshAllData() {
  return await refreshLiveData();
}
