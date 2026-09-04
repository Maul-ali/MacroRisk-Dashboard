// ─── Indicator History & Real Change Computation (Neon Postgres) ───

import { queryNeon } from './neonClient';

let tableInitPromise: Promise<void> | null = null;

export async function ensureHistoryTable(): Promise<void> {
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
        await queryNeon(`
          CREATE TABLE IF NOT EXISTS indicator_history (
            id serial PRIMARY KEY,
            indicator_id text NOT NULL,
            value numeric NOT NULL,
            fetched_at timestamptz DEFAULT now() NOT NULL
          );
        `);
        await queryNeon(`
          CREATE INDEX IF NOT EXISTS idx_indicator_history_lookup 
          ON indicator_history(indicator_id, fetched_at DESC);
        `);
      } catch (err) {
        console.warn('[IndicatorHistory] Could not verify/create history table:', err);
      }
    })();
  }
  return tableInitPromise;
}

export interface HistoryRecord {
  id: string;
  value: number;
  fetchedAt?: string;
}

/**
 * Inserts live indicator measurements into indicator_history.
 */
export async function recordIndicatorHistory(records: HistoryRecord[]): Promise<void> {
  if (!records || records.length === 0) return;

  try {
    await ensureHistoryTable();
    for (const record of records) {
      if (record.value !== null && record.value !== undefined && !isNaN(record.value)) {
        await queryNeon(
          `INSERT INTO indicator_history (indicator_id, value, fetched_at)
           VALUES ($1, $2, now());`,
          [record.id, record.value]
        );
      }
    }
  } catch (err) {
    console.warn('[IndicatorHistory] Failed to record indicator history:', err);
  }
}

/**
 * Queries the historical row closest to (now - 30 days) that is at least 25 days old (up to 45 days).
 * Returns a Map of indicator_id -> historical value.
 */
export async function get1MonthAgoValues(indicatorIds: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!indicatorIds || indicatorIds.length === 0) return result;

  try {
    await ensureHistoryTable();

    // Query historical row closest to 30 days ago for indicators with points >= 25 days old
    const rows = await queryNeon<{ indicatorId: string; value: string | number }>(`
      SELECT DISTINCT ON (indicator_id) 
        indicator_id as "indicatorId", 
        value
      FROM indicator_history
      WHERE fetched_at <= now() - interval '25 days'
        AND fetched_at >= now() - interval '45 days'
      ORDER BY indicator_id, ABS(EXTRACT(EPOCH FROM (fetched_at - (now() - interval '30 days')))) ASC;
    `);

    if (rows && rows.length > 0) {
      for (const row of rows) {
        const numVal = Number(row.value);
        if (!isNaN(numVal) && numVal !== 0) {
          result.set(row.indicatorId, numVal);
        }
      }
    }
  } catch (err) {
    console.warn('[IndicatorHistory] Error fetching 1M ago history values:', err);
  }

  return result;
}

/**
 * Computes 1M percentage delta. Returns null if no historical baseline >= 25 days old exists.
 */
export function computeChange1M(
  currentValue: number,
  monthAgoValue: number | null | undefined
): number | null {
  if (
    monthAgoValue === null ||
    monthAgoValue === undefined ||
    isNaN(monthAgoValue) ||
    monthAgoValue === 0
  ) {
    return null;
  }
  return Math.round(((currentValue - monthAgoValue) / monthAgoValue) * 1000) / 10;
}
