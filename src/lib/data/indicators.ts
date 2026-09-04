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
  getLiveIndicatorsAsync,
  getLiveRiskScoreAsync,
  getLiveMarketPulseAsync,
  getLiveSystemTrustAsync,
  getLiveNewsAsync,
  refreshLiveData,
} from './liveStore';

// ─── Async Indicators Getters (Primary) ───

export async function getIndicator(id: string): Promise<Indicator | undefined> {
  const indicators = await getLiveIndicatorsAsync();
  return indicators.find((ind) => ind.id === id);
}

export async function getAllIndicators(): Promise<Indicator[]> {
  return await getLiveIndicatorsAsync();
}

export async function getIndicatorsByCategory(category: string): Promise<Indicator[]> {
  const indicators = await getLiveIndicatorsAsync();
  return indicators.filter((ind) => ind.category === category);
}

// ─── Async Risk Score, Pulse, Trust & News ───

export async function getCompositeRiskScore(): Promise<CompositeRiskScore> {
  return await getLiveRiskScoreAsync();
}

export function getRiskHistory(): { date: string; score: number }[] {
  return FALLBACK_RISK_HISTORY;
}

export async function getMarketPulse(): Promise<MarketPulse[]> {
  return await getLiveMarketPulseAsync();
}

export function getAlertRules(): AlertRule[] {
  return FALLBACK_ALERTS;
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  return await getLiveNewsAsync();
}

export function getSourceHealth(): SourceHealth[] {
  return FALLBACK_SOURCE_HEALTH;
}

export async function getSystemTrust(): Promise<SystemTrust> {
  return await getLiveSystemTrustAsync();
}

// ─── Synchronous Fallback Getters ───
// Use only when callers cannot await (e.g. legacy synchronous client components)

export function getIndicatorSync(id: string): Indicator | undefined {
  return getLiveIndicators().find((ind) => ind.id === id);
}

export function getAllIndicatorsSync(): Indicator[] {
  return getLiveIndicators();
}

export function getIndicatorsByCategorySync(category: string): Indicator[] {
  return getLiveIndicators().filter((ind) => ind.category === category);
}

export function getCompositeRiskScoreSync(): CompositeRiskScore {
  return getLiveRiskScore();
}

export function getMarketPulseSync(): MarketPulse[] {
  return getLiveMarketPulse();
}

export function getSystemTrustSync(): SystemTrust {
  return getLiveSystemTrust();
}

export function getNewsArticlesSync(): NewsArticle[] {
  return getLiveNews();
}

// ─── Dynamic Live Refresh Action ───

export async function refreshAllData() {
  return await refreshLiveData();
}
