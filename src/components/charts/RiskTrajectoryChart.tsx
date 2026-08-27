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
  ReferenceLine,
} from 'recharts';
import { clsx } from 'clsx';
import { type TimePeriod } from '@/lib/data/types';
import { TrendingUp, ShieldAlert } from 'lucide-react';

interface RiskTrajectoryChartProps {
  initialHistory: { date: string; score: number }[];
}

export default function RiskTrajectoryChart({ initialHistory }: RiskTrajectoryChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('1Y');

  // Filter history based on period
  const filteredData = useMemo(() => {
    if (!initialHistory || initialHistory.length === 0) return [];
    
    let monthsToKeep = 12;
    if (period === '1M') monthsToKeep = 1;
    else if (period === '3M') monthsToKeep = 3;
    else if (period === 'YTD') {
      const now = new Date('2026-08-24');
      monthsToKeep = now.getMonth() + 1; // ~8 months
    } else if (period === '1Y') monthsToKeep = 12;
    else if (period === '5Y') monthsToKeep = 60;

    // Assuming monthly data points in history
    const sliceCount = Math.min(initialHistory.length, Math.max(2, monthsToKeep + 1));
    return initialHistory.slice(-sliceCount);
  }, [initialHistory, period]);

  const latestScore = filteredData.length > 0 ? filteredData[filteredData.length - 1].score : 67;
  const startScore = filteredData.length > 0 ? filteredData[0].score : 50;
  const changeInPeriod = (latestScore - startScore).toFixed(1);

  return (
    <div className="glass-card p-6">
      {/* Header with Title & Period Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-chart-1" />
            <h3 className="text-base font-bold text-text-primary">
              Composite Risk Trajectory
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-risk-elevated/10 text-risk-elevated font-semibold">
              Elevated Zone (60–80)
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Historical composite FI Macro Risk Score (0-100) trend over selected timeframe
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-bg-tertiary/70 p-1 rounded-lg border border-border-subtle self-start sm:self-auto">
          {(['1M', '3M', 'YTD', '1Y', '5Y'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
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

      {/* Trajectory Stats Sub-bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
        <div>
          <span className="text-[11px] text-text-muted uppercase font-medium">Period Start</span>
          <div className="text-sm font-bold text-text-secondary tabular-nums">{startScore} / 100</div>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase font-medium">Current Index</span>
          <div className="text-sm font-bold text-text-primary tabular-nums">{latestScore} / 100</div>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase font-medium">Period Δ</span>
          <div className={clsx('text-sm font-bold tabular-nums', Number(changeInPeriod) >= 0 ? 'text-risk-elevated' : 'text-risk-low')}>
            {Number(changeInPeriod) >= 0 ? `+${changeInPeriod}` : changeInPeriod} pts
          </div>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase font-medium">Risk Status</span>
          <div className="text-sm font-bold text-risk-elevated flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Elevated
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
              tickFormatter={(str) => {
                try {
                  const d = new Date(str);
                  return d.toLocaleDateString('en-US', { month: 'short', year: period === '5Y' ? '2-digit' : undefined });
                } catch {
                  return str;
                }
              }}
            />
            <YAxis
              domain={[20, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
              ticks={[20, 40, 60, 80, 100]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const dateStr = label ? new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
                  return (
                    <div className="glass-card-sm p-3 border border-border-primary shadow-xl bg-bg-card/95 text-xs">
                      <p className="text-text-muted font-medium mb-1">{dateStr}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-risk-elevated" />
                        <span className="text-text-secondary">FI Risk Score:</span>
                        <span className="font-bold text-text-primary text-sm tabular-nums">{val}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Risk Zone Reference Lines */}
            <ReferenceLine y={80} stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="3 3" label={{ value: 'Critical (80)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={60} stroke="rgba(245, 158, 11, 0.3)" strokeDasharray="3 3" label={{ value: 'Elevated (60)', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={40} stroke="rgba(59, 130, 246, 0.3)" strokeDasharray="3 3" label={{ value: 'Guarded (40)', fill: '#3b82f6', fontSize: 10, position: 'insideTopRight' }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#0b0e14', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
