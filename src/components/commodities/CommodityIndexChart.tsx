'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { clsx } from 'clsx';
import { type Indicator, type TimePeriod, type IndicatorCategory } from '@/lib/data/types';
import { TrendingUp, Layers, Eye, EyeOff, BarChart3 } from 'lucide-react';

interface CommodityIndexChartProps {
  indicators: Indicator[];
}

// ─── Color Palette (12+ distinct hues for commodity series) ───
const PALETTE = [
  '#f59e0b', // amber
  '#38bdf8', // sky
  '#a855f7', // purple
  '#22c55e', // green
  '#ec4899', // pink
  '#f97316', // orange
  '#06b6d4', // cyan
  '#e879f9', // fuchsia
  '#facc15', // yellow
  '#34d399', // emerald
  '#fb923c', // light-orange
  '#818cf8', // indigo
  '#2dd4bf', // teal
  '#f43f5e', // rose
];

const VALID_CATEGORIES: IndicatorCategory[] = ['Energy', 'Raw Material', 'Fertilizer'];
type CategoryFilter = 'All' | 'Energy' | 'Raw Material' | 'Fertilizer';

const DEFAULT_ACTIVE_IDS = ['brent', 'henry-hub', 'phosphate-rock', 'urea', 'dap'];

function getPeriodStartDate(period: TimePeriod): Date {
  // Reference date matching fallback.ts data anchor
  const now = new Date('2026-08-24');
  switch (period) {
    case '1M': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case '3M': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    case 'YTD':
      return new Date('2026-01-01');
    case '1Y': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    case '5Y': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 5);
      return d;
    }
  }
}

export default function CommodityIndexChart({ indicators }: CommodityIndexChartProps) {
  // ─── Filter to commodity-only indicators with history ───
  const commodityIndicators = useMemo(
    () =>
      indicators.filter(
        (ind) =>
          VALID_CATEGORIES.includes(ind.category) && ind.history && ind.history.length > 0
      ),
    [indicators]
  );

  // ─── Stable color assignment by position in filtered list ───
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    commodityIndicators.forEach((ind, idx) => {
      map[ind.id] = PALETTE[idx % PALETTE.length];
    });
    return map;
  }, [commodityIndicators]);

  // ─── Initialize active series from defaults (fall back if ids missing) ───
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const availableIds = new Set(commodityIndicators.map((i) => i.id));

    // Start with desired defaults
    for (const id of DEFAULT_ACTIVE_IDS) {
      if (availableIds.has(id)) {
        initial[id] = true;
      }
    }

    // If we ended up with nothing (all desired ids missing), activate the first
    // indicator from each category to preserve the cross-category intent
    if (Object.keys(initial).length === 0) {
      const seen = new Set<string>();
      for (const ind of commodityIndicators) {
        if (!seen.has(ind.category)) {
          initial[ind.id] = true;
          seen.add(ind.category);
        }
      }
    }

    return initial;
  });

  const [period, setPeriod] = useState<TimePeriod>('1Y');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const toggleSeries = (id: string) => {
    setActiveSeries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Active indicator objects ───
  const activeIndicators = useMemo(
    () => commodityIndicators.filter((ind) => activeSeries[ind.id]),
    [commodityIndicators, activeSeries]
  );

  // ─── Build indexed chart data ───
  const chartData = useMemo(() => {
    if (activeIndicators.length === 0) return [];

    const periodStart = getPeriodStartDate(period);

    // For each active indicator, slice history to period window and compute indexed values
    const seriesData: Record<string, { date: string; indexed: number }[]> = {};

    for (const ind of activeIndicators) {
      const windowPoints = ind.history.filter((pt) => new Date(pt.date) >= periodStart);

      if (windowPoints.length === 0) {
        // Phase 2 edge case: no points at or after period start — use earliest available
        const fallbackPoints = [...ind.history].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        if (fallbackPoints.length === 0) continue;

        const baseline = fallbackPoints[0].value;
        if (baseline === 0) continue; // avoid division by zero

        seriesData[ind.id] = fallbackPoints.map((pt) => ({
          date: pt.date,
          indexed: Math.round((pt.value / baseline) * 100 * 10) / 10,
        }));
      } else {
        const baseline = windowPoints[0].value;
        if (baseline === 0) continue;

        seriesData[ind.id] = windowPoints.map((pt) => ({
          date: pt.date,
          indexed: Math.round((pt.value / baseline) * 100 * 10) / 10,
        }));
      }
    }

    // Collect all unique dates across active series
    const allDatesSet = new Set<string>();
    for (const pts of Object.values(seriesData)) {
      for (const pt of pts) {
        allDatesSet.add(pt.date);
      }
    }
    const allDates = [...allDatesSet].sort();

    // Build merged data points
    return allDates.map((date) => {
      const d = new Date(date);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const point: Record<string, number | string> = { date, monthLabel };

      for (const [id, pts] of Object.entries(seriesData)) {
        const match = pts.find((p) => p.date === date);
        if (match) {
          point[id] = match.indexed;
        }
      }

      return point;
    });
  }, [activeIndicators, period]);

  // ─── Compute dynamic divergence callout ───
  const divergenceCallout = useMemo(() => {
    if (chartData.length === 0 || activeIndicators.length < 2) return null;

    const lastPoint = chartData[chartData.length - 1];
    let maxVal = -Infinity;
    let minVal = Infinity;
    let maxName = '';
    let minName = '';

    for (const ind of activeIndicators) {
      const val = lastPoint[ind.id];
      if (typeof val !== 'number' || isNaN(val)) continue;

      if (val > maxVal) {
        maxVal = val;
        maxName = ind.name;
      }
      if (val < minVal) {
        minVal = val;
        minName = ind.name;
      }
    }

    if (!maxName || !minName || maxName === minName) return null;

    const spread = Math.round((maxVal - minVal) * 10) / 10;
    const maxDelta = Math.round((maxVal - 100) * 10) / 10;
    const minDelta = Math.round((minVal - 100) * 10) / 10;

    return {
      text: `${maxName} (${maxDelta >= 0 ? '+' : ''}${maxDelta} pts from baseline) and ${minName} (${minDelta >= 0 ? '+' : ''}${minDelta} pts) show a ${spread}-point spread — the widest divergence among active series.`,
    };
  }, [chartData, activeIndicators]);

  // ─── Pills visible based on category filter ───
  const visiblePills = useMemo(
    () =>
      categoryFilter === 'All'
        ? commodityIndicators
        : commodityIndicators.filter((ind) => ind.category === categoryFilter),
    [commodityIndicators, categoryFilter]
  );

  const hasActiveSeries = activeIndicators.length > 0;

  return (
    <div className="glass-card p-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-chart-4" />
            <h3 className="text-base font-bold text-text-primary">
              Commodity Index Comparison
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-chart-4/10 text-chart-4 font-semibold">
              Indexed Benchmark
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Cross-category indexed comparison — Energy, Raw Materials, and Fertilizer
            normalized to Period Start = 100 for margin-pressure analysis
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-bg-tertiary/70 p-1 rounded-lg border border-border-subtle self-start lg:self-auto">
          {(['1M', '3M', 'YTD', '1Y', '5Y'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                period === p
                  ? 'bg-chart-4 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-card'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs — soft filter on pill visibility only */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-bg-tertiary/40 border border-border-subtle w-fit">
        {(['All', 'Energy', 'Raw Material', 'Fertilizer'] as CategoryFilter[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
              categoryFilter === cat
                ? 'bg-bg-card text-text-primary shadow-sm border border-border-primary'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Series Toggle Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
        <span className="text-xs font-semibold text-text-muted mr-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> Series:
        </span>
        {visiblePills.map((ind) => {
          const isActive = !!activeSeries[ind.id];
          return (
            <button
              key={ind.id}
              onClick={() => toggleSeries(ind.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                isActive
                  ? 'bg-bg-card border-border-primary text-text-primary shadow-sm'
                  : 'bg-transparent border-transparent text-text-muted opacity-50 hover:opacity-80'
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colorMap[ind.id] }}
              />
              <span>{ind.name}</span>
              {isActive ? (
                <Eye className="w-3 h-3 text-text-muted" />
              ) : (
                <EyeOff className="w-3 h-3 text-text-muted" />
              )}
            </button>
          );
        })}
      </div>

      {/* Recharts Multi-line Chart */}
      <div className="h-[340px] w-full">
        {hasActiveSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 10']}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card-sm p-3.5 border border-border-primary shadow-2xl bg-bg-card/95 text-xs min-w-[200px]">
                        <p className="text-text-primary font-bold mb-2 pb-1 border-b border-border-subtle">
                          Index Snapshot ({label})
                        </p>
                        <div className="space-y-1.5">
                          {payload.map((entry) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-text-secondary">{entry.name}:</span>
                              </div>
                              <span className="font-mono font-bold text-text-primary tabular-nums">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Baseline 100 Reference Line */}
              <ReferenceLine
                y={100}
                stroke="rgba(148, 163, 184, 0.4)"
                strokeDasharray="4 4"
                label={{
                  value: 'Baseline (Period Start = 100)',
                  fill: '#94a3b8',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
              {activeIndicators.map((ind) => (
                <Line
                  key={ind.id}
                  type="monotone"
                  dataKey={ind.id}
                  name={ind.name}
                  stroke={colorMap[ind.id]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colorMap[ind.id], stroke: '#0b0e14', strokeWidth: 1.5 }}
                  activeDot={{
                    r: 5,
                    fill: colorMap[ind.id],
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          /* Phase 2: Empty state when no series active */
          <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-text-muted">
            <BarChart3 className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Select at least one series to compare</p>
            <p className="text-xs opacity-60">
              Use the toggle pills above to activate commodity series
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Divergence Callout */}
      {divergenceCallout && (
        <div className="mt-4 p-3 rounded-lg bg-bg-tertiary/20 border border-border-subtle text-xs text-text-muted flex items-start gap-2">
          <span className="text-chart-4 font-bold shrink-0">Key Divergence:</span>
          <span>{divergenceCallout.text}</span>
        </div>
      )}
      {!divergenceCallout && hasActiveSeries && activeIndicators.length < 2 && (
        <div className="mt-4 p-3 rounded-lg bg-bg-tertiary/20 border border-border-subtle text-xs text-text-muted">
          <span className="text-text-muted">
            Activate at least 2 series to see divergence analysis
          </span>
        </div>
      )}
    </div>
  );
}
