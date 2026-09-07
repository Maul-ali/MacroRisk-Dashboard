// ─── Core Data Types for MacroRisk Dashboard ───

export type RiskBand = 'Low' | 'Guarded' | 'Elevated' | 'High' | 'Critical';

export type Freshness = 'Fresh' | 'Stale' | 'Estimated' | 'Partial';

export type IndicatorCategory =
  | 'Energy'
  | 'Raw Material'
  | 'Fertilizer'
  | 'FX & Macro';

export type ScoreCategory =
  | 'Energy & Feedstock'
  | 'Fertilizer Market'
  | 'FX & Financial'
  | 'Global Macro & Geopolitics'
  | 'Domestic Macro & Policy';

export interface HistoryPoint {
  date: string; // ISO date string
  value: number;
}

export interface Indicator {
  id: string;
  name: string;
  value: number;
  displayValue: string; // formatted string like "$95.29/bbl"
  unit: string;
  change1M: number | null; // percentage, e.g. 37.6 for +37.6%
  source: string;
  sourceUrl?: string;
  freshness: Freshness;
  dataOrigin: 'live' | 'fallback';
  lastUpdated: string; // ISO timestamp
  riskBand: RiskBand;
  category: IndicatorCategory;
  history: HistoryPoint[];
}

export interface CategoryScore {
  category: ScoreCategory;
  score: number; // 0-100
  weight: number; // 0-1 (e.g. 0.30 for 30%)
  trend: 'up' | 'down' | 'stable';
}

export interface CompositeRiskScore {
  score: number; // 0-100
  label: string; // "Elevated", "High", etc.
  change: number; // points change, e.g. +4
  confidence: number; // 0-100
  confidenceLabel: string; // "High", "Medium", "Low"
  categories: CategoryScore[];
  topDrivers: RiskDriver[];
}

export interface RiskDriver {
  name: string;
  change: string; // e.g. "+37.6%"
  impact: number; // points impact, e.g. +2.4
}

export interface MarketPulse {
  id: string;
  label: string;
  value: string;
  change: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  channels: string;
  cooldown: string;
  lastTriggered: string;
  isActive: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  region: string;
  tags: string[];
  summary: string;
  relevanceScore: number;
}

export interface SourceHealth {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Partial' | 'Pending';
  articleCount?: number;
  lastCheck?: string;
  notes?: string;
}

export interface SystemTrust {
  livePercentage: number;
  fresh: number;
  partial: number;
  stale: number;
}

export type TimePeriod = '1M' | '3M' | 'YTD' | '1Y' | '5Y';
