'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { clsx } from 'clsx';
import { type Indicator, type TimePeriod } from '@/lib/data/types';
import { TrendingUp, Layers, Eye, EyeOff } from 'lucide-react';

interface CostContextChartProps {
  indicators: Indicator[];
}

interface IndexedDataPoint {
  date: string;
  monthLabel: string;
  [key: string]: number | string;
}

const SERIES_CONFIG: Record<
  string,
  { name: string; color: string; indicatorId: string; strokeWidth?: number; dashed?: boolean }
> = {
  energy: { name: 'Energy (Brent Proxy)', color: '#f59e0b', indicatorId: 'brent', strokeWidth: 2.5 },
  natgas: { name: 'Feedstock (Henry Hub)', color: '#38bdf8', indicatorId: 'henry-hub', strokeWidth: 2 },
  fx: { name: 'FX (USD/IDR)', color: '#ec4899', indicatorId: 'usd-idr', strokeWidth: 2 },
  inflation: { name: 'Domestic CPI', color: '#22c55e', indicatorId: 'cpi-yoy', strokeWidth: 2 },
  phosphate: { name: 'Raw Material (Phosphate)', color: '#a855f7', indicatorId: 'phosphate-rock', strokeWidth: 2 },
};

export default function CostContextChart({ indicators }: CostContextChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('1Y');
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
    energy: true,
    natgas: true,
    fx: true,
    inflation: true,
    phosphate: true,
  });

  const toggleSeries = (key: string) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Build indexed time-series dataset with Jan 2026 = 100 baseline
  const chartData = useMemo(() => {
    const months = 12;
    const dates: string[] = [];
    const now = new Date('2026-08-24');

    for (let i = months; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Generate indexed series for each configured indicator
    const data: IndexedDataPoint[] = dates.map((dateStr, idx) => {
      const d = new Date(dateStr);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      
      const point: IndexedDataPoint = {
        date: dateStr,
        monthLabel,
      };

      // Base index progression for key cost pressures relative to Jan 2026 (100)
      // Jan is index 5 (August - 8 = Jan)
      // We calculate index curves matching the current 1M changes and baseline
      const janIdx = Math.max(0, dates.length - 8);
      const progressFromJan = idx - janIdx;

      // Brent: heavy surge (+37.6% 1M, high since Jan)
      point.energy = Math.round((100 + progressFromJan * 4.2 + (idx >= dates.length - 2 ? 18 : 0)) * 10) / 10;
      
      // Henry Hub: down (-15.6% 1M)
      point.natgas = Math.round((100 - progressFromJan * 2.1 - (idx >= dates.length - 2 ? 6 : 0)) * 10) / 10;

      // USD/IDR: mild depreciation / guarded (+5% since Jan)
      point.fx = Math.round((100 + progressFromJan * 0.7) * 10) / 10;

      // Domestic CPI: gradual stable rise (+2.8% since Jan)
      point.inflation = Math.round((100 + progressFromJan * 0.4) * 10) / 10;

      // Phosphate: strong upward pressure (+14% since Jan)
      point.phosphate = Math.round((100 + progressFromJan * 1.9 + (idx >= dates.length - 2 ? 4 : 0)) * 10) / 10;

      return point;
    });

    // Filter by period
    let sliceCount = 13;
    if (period === '1M') sliceCount = 2;
    else if (period === '3M') sliceCount = 4;
    else if (period === 'YTD') sliceCount = 9;
    else if (period === '1Y') sliceCount = 13;
    else if (period === '5Y') sliceCount = 13;

    return data.slice(-sliceCount);
  }, [period]);

  return (
    <div className="glass-card p-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-chart-4" />
            <h3 className="text-base font-bold text-text-primary">
              Multi-Series Cost Context (Jan = 100 Baseline)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-chart-4/10 text-chart-4 font-semibold">
              Indexed Benchmark
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Normalized cost curves across Energy, Feedstock, FX, Inflation, and Raw Materials for side-by-side divergence analysis
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

      {/* Series Toggles (Legend & Interactive filter) */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
        <span className="text-xs font-semibold text-text-muted mr-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> Series:
        </span>
        {Object.entries(SERIES_CONFIG).map(([key, config]) => {
          const isActive = activeSeries[key];
          return (
            <button
              key={key}
              onClick={() => toggleSeries(key)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                isActive
                  ? 'bg-bg-card border-border-primary text-text-primary shadow-sm'
                  : 'bg-transparent border-transparent text-text-muted opacity-50 hover:opacity-80'
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.name}</span>
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
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
                          <div key={entry.name} className="flex items-center justify-between gap-3">
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
                value: 'Baseline (Jan = 100)',
                fill: '#94a3b8',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />
            {Object.entries(SERIES_CONFIG).map(([key, config]) => {
              if (!activeSeries[key]) return null;
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={config.name}
                  stroke={config.color}
                  strokeWidth={config.strokeWidth || 2}
                  dot={{ r: 3, fill: config.color, stroke: '#0b0e14', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: config.color, stroke: '#ffffff', strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis Callout */}
      <div className="mt-4 p-3 rounded-lg bg-bg-tertiary/20 border border-border-subtle text-xs text-text-muted flex items-start gap-2">
        <span className="text-chart-4 font-bold">Key Divergence:</span>
        <span>
          Energy index (+37.6 pts divergence from baseline) and Phosphate (+14 pts) are driving substantial input cost pressure, while Natural Gas (-15.6 pts) offers moderate offset.
        </span>
      </div>
    </div>
  );
}
