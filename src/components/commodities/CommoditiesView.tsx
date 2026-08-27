'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { clsx } from 'clsx';
import { type Indicator, type TimePeriod } from '@/lib/data/types';
import { BarChart3, TrendingUp, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CommoditiesViewProps {
  indicators: Indicator[];
}

export default function CommoditiesView({ indicators }: CommoditiesViewProps) {
  // Default to Phosphate Rock (Critical band item)
  const [selectedId, setSelectedId] = useState<string>('phosphate-rock');
  const [period, setPeriod] = useState<TimePeriod>('1Y');

  const selectedIndicator = useMemo(() => {
    return (
      indicators.find((ind) => ind.id === selectedId) ||
      indicators.find((ind) => ind.id === 'phosphate-rock') ||
      indicators[0]
    );
  }, [indicators, selectedId]);

  const grouped = useMemo(() => {
    return {
      Energy: indicators.filter((i) => i.category === 'Energy'),
      'Raw Material': indicators.filter((i) => i.category === 'Raw Material'),
      Fertilizer: indicators.filter((i) => i.category === 'Fertilizer'),
    };
  }, [indicators]);

  // Filter history data based on period
  const historyData = useMemo(() => {
    if (!selectedIndicator || !selectedIndicator.history) return [];

    let monthsToKeep = 12;
    if (period === '1M') monthsToKeep = 1;
    else if (period === '3M') monthsToKeep = 3;
    else if (period === 'YTD') monthsToKeep = 8;
    else if (period === '1Y') monthsToKeep = 12;
    else if (period === '5Y') monthsToKeep = 60;

    const sliceCount = Math.min(selectedIndicator.history.length, Math.max(2, monthsToKeep + 1));
    return selectedIndicator.history.slice(-sliceCount);
  }, [selectedIndicator, period]);

  const priceColor =
    selectedIndicator.riskBand === 'Critical'
      ? '#ef4444'
      : selectedIndicator.riskBand === 'High'
        ? '#f97316'
        : selectedIndicator.riskBand === 'Elevated'
          ? '#f59e0b'
          : selectedIndicator.riskBand === 'Guarded'
            ? '#3b82f6'
            : '#22c55e';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Interactive Table (2 Columns) */}
      <div className="xl:col-span-2 glass-card overflow-hidden">
        <div className="p-4 border-b border-border-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-chart-1" />
            <span className="text-sm font-semibold text-text-primary">
              Commodity Price Matrix
            </span>
          </div>
          <span className="text-xs text-text-muted">
            Click any row to view historical chart
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Price</th>
                <th>1M Δ</th>
                <th>Risk Band</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([category, items]) => (
                <tr key={`group-${category}`} className="!bg-transparent">
                  <td colSpan={6} className="!p-0">
                    <div className="w-full">
                      <div className="py-2 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-bg-tertiary/40 border-y border-border-primary/50">
                        {category} ({items.length})
                      </div>
                      <table className="w-full">
                        <tbody>
                          {items.map((ind) => {
                            const isSelected = ind.id === selectedId;
                            return (
                              <tr
                                key={ind.id}
                                onClick={() => setSelectedId(ind.id)}
                                className={clsx(
                                  'cursor-pointer transition-all',
                                  isSelected
                                    ? '!bg-chart-1/15 border-l-4 !border-l-chart-1 font-medium'
                                    : 'hover:bg-bg-card-hover'
                                )}
                              >
                                <td className="!text-text-primary !font-medium py-3 px-4 w-[28%]">
                                  <div className="flex items-center gap-2">
                                    <span>{ind.name}</span>
                                    {isSelected && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-chart-1 animate-pulse" />
                                    )}
                                  </div>
                                </td>
                                <td className="!font-mono !text-text-primary tabular-nums py-3 px-4 w-[20%]">
                                  {ind.displayValue}
                                </td>
                                <td className="py-3 px-4 w-[16%]">
                                  {ind.change1M !== null ? (
                                    <span
                                      className={clsx(
                                        'font-mono text-xs font-semibold tabular-nums inline-flex items-center gap-0.5',
                                        ind.change1M > 0
                                          ? 'change-positive'
                                          : ind.change1M < 0
                                            ? 'change-negative'
                                            : 'change-neutral'
                                      )}
                                    >
                                      {ind.change1M > 0 ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                      ) : ind.change1M < 0 ? (
                                        <ArrowDownRight className="w-3 h-3" />
                                      ) : null}
                                      {ind.change1M > 0 ? '+' : ''}
                                      {ind.change1M}%
                                    </span>
                                  ) : (
                                    <span className="text-text-muted text-xs">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 w-[16%]">
                                  <span
                                    className={clsx(
                                      'risk-badge !text-[10px] !py-0.5 !px-2',
                                      `risk-badge--${ind.riskBand.toLowerCase()}`
                                    )}
                                  >
                                    {ind.riskBand}
                                  </span>
                                </td>
                                <td className="!text-xs text-text-secondary py-3 px-4 w-[12%]">
                                  {ind.source}
                                </td>
                                <td className="py-3 px-4 w-[8%]">
                                  <span
                                    className={clsx(
                                      'freshness-badge',
                                      `freshness--${ind.freshness.toLowerCase()}`
                                    )}
                                  >
                                    {ind.freshness}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Commodity Historical Price Chart Panel (1 Column) */}
      <div className="xl:col-span-1 glass-card p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                {selectedIndicator.category} Price History
              </span>
              <h3 className="text-lg font-bold text-text-primary mt-0.5">
                {selectedIndicator.name}
              </h3>
            </div>
            <span
              className={clsx(
                'risk-badge',
                `risk-badge--${selectedIndicator.riskBand.toLowerCase()}`
              )}
            >
              {selectedIndicator.riskBand}
            </span>
          </div>

          {/* Current Stats */}
          <div className="p-4 rounded-xl bg-bg-tertiary/40 border border-border-subtle mb-5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-black text-text-primary tabular-nums">
                {selectedIndicator.displayValue}
              </span>
              {selectedIndicator.change1M !== null && (
                <span
                  className={clsx(
                    'text-sm font-bold tabular-nums',
                    selectedIndicator.change1M > 0
                      ? 'text-risk-low'
                      : 'text-risk-critical'
                  )}
                >
                  {selectedIndicator.change1M > 0 ? '+' : ''}
                  {selectedIndicator.change1M}% 1M
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted mt-2 pt-2 border-t border-border-subtle">
              <span>Source: {selectedIndicator.source}</span>
              <span className="capitalize">{selectedIndicator.freshness}</span>
            </div>
          </div>

          {/* Period selector for per-component chart */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-text-muted">Timeframe:</span>
            <div className="flex gap-1 bg-bg-tertiary/60 p-1 rounded-lg border border-border-subtle">
              {(['1M', '3M', 'YTD', '1Y', '5Y'] as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={clsx(
                    'px-2.5 py-0.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
                    period === p
                      ? 'bg-chart-1 text-white shadow-sm'
                      : 'text-text-muted hover:text-text-secondary hover:bg-bg-card'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Area Chart for selected item */}
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="commPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={priceColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={priceColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                  tickFormatter={(str) => {
                    try {
                      return new Date(str).toLocaleDateString('en-US', { month: 'short' });
                    } catch {
                      return str;
                    }
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                  domain={['dataMin - (dataMin * 0.05)', 'dataMax + (dataMax * 0.05)']}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value as number;
                      const dateStr = label
                        ? new Date(label).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                        : '';
                      return (
                        <div className="glass-card-sm p-3 border border-border-primary shadow-xl bg-bg-card/95 text-xs">
                          <p className="text-text-muted font-medium mb-1">{dateStr}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: priceColor }}
                            />
                            <span className="text-text-secondary">{selectedIndicator.name}:</span>
                            <span className="font-bold text-text-primary tabular-nums">
                              {val} {selectedIndicator.unit}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={priceColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#commPriceGradient)"
                  activeDot={{ r: 5, fill: priceColor, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Note if Estimated */}
        {selectedIndicator.freshness === 'Estimated' && (
          <div className="mt-4 p-2.5 rounded-lg bg-bg-tertiary/40 border border-border-subtle text-[11px] text-text-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>
              Values are estimated/annual benchmark. Live tracking requires paid market tier.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
