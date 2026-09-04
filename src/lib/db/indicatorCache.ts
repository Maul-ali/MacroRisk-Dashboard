// ─── Indicator Persistent Cache (Neon Postgres) ───

import { queryNeon } from './neonClient';
import type {
  Indicator,
  CompositeRiskScore,
  MarketPulse,
  SystemTrust,
  NewsArticle,
} from '../data/types';

let tableInitPromise: Promise<void> | null = null;

export async function ensureCacheTable(): Promise<void> {
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
        await queryNeon(`
          CREATE TABLE IF NOT EXISTS indicator_cache (
            id text PRIMARY KEY,
            payload jsonb NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now()
          );
        `);
      } catch (err) {
        console.warn('[IndicatorCache] Could not verify/create indicator_cache table:', err);
      }
    })();
  }
  return tableInitPromise;
}

export interface CachedDataPayload {
  indicators: Indicator[];
  riskScore: CompositeRiskScore;
  marketPulse: MarketPulse[];
  systemTrust: SystemTrust;
  news: NewsArticle[];
  lastSyncTimestamp: number;
}

export async function saveIndicatorCacheToDb(payload: CachedDataPayload): Promise<void> {
  try {
    await ensureCacheTable();
    const items = [
      { id: 'indicators', data: payload.indicators },
      { id: 'risk_score', data: payload.riskScore },
      { id: 'market_pulse', data: payload.marketPulse },
      { id: 'system_trust', data: payload.systemTrust },
      { id: 'news', data: payload.news },
      { id: 'meta', data: { lastSyncTimestamp: payload.lastSyncTimestamp } },
    ];

    for (const item of items) {
      await queryNeon(
        `INSERT INTO indicator_cache (id, payload, updated_at)
         VALUES ($1, $2::jsonb, now())
         ON CONFLICT (id) DO UPDATE SET
           payload = EXCLUDED.payload,
           updated_at = EXCLUDED.updated_at;`,
        [item.id, JSON.stringify(item.data)]
      );
    }
  } catch (err) {
    console.warn('[IndicatorCache] Failed to persist cache to Neon:', err);
  }
}

export async function loadIndicatorCacheFromDb(): Promise<CachedDataPayload | null> {
  try {
    await ensureCacheTable();
    const rows = await queryNeon<{ id: string; payload: any; updatedAt: string }>(
      `SELECT id, payload, updated_at as "updatedAt" FROM indicator_cache;`
    );

    if (!rows || rows.length === 0) return null;

    const map = new Map<string, any>();
    for (const row of rows) {
      const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
      map.set(row.id, payload);
    }

    if (!map.has('indicators')) return null;

    return {
      indicators: map.get('indicators') || [],
      riskScore: map.get('risk_score'),
      marketPulse: map.get('market_pulse') || [],
      systemTrust: map.get('system_trust'),
      news: map.get('news') || [],
      lastSyncTimestamp: map.get('meta')?.lastSyncTimestamp || 0,
    };
  } catch (err) {
    console.warn('[IndicatorCache] Failed to load cache from Neon:', err);
    return null;
  }
}
