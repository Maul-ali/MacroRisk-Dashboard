import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';

export const dynamic = 'force-dynamic';
import RiskTrajectoryChart from '@/components/charts/RiskTrajectoryChart';
import {
  getCompositeRiskScore,
  getMarketPulse,
  getSystemTrust,
  getRiskHistory,
} from '@/lib/data/indicators';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Zap,
  Droplets,
  DollarSign,
  Globe,
  Building2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { clsx } from 'clsx';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Energy & Feedstock': Zap,
  'Fertilizer Market': Droplets,
  'FX & Financial': DollarSign,
  'Global Macro & Geopolitics': Globe,
  'Domestic Macro & Policy': Building2,
};

export default async function OverviewPage() {
  const [risk, pulse, trust] = await Promise.all([
    getCompositeRiskScore(),
    getMarketPulse(),
    getSystemTrust(),
  ]);

  const riskColor =
    risk.score >= 80
      ? 'var(--risk-critical)'
      : risk.score >= 65
        ? 'var(--risk-elevated)'
        : risk.score >= 50
          ? 'var(--risk-guarded)'
          : 'var(--risk-low)';

  const riskGradientBg =
    risk.score >= 80
      ? 'rgba(239, 68, 68, 0.14)'
      : risk.score >= 65
        ? 'rgba(245, 158, 11, 0.14)'
        : risk.score >= 50
          ? 'rgba(59, 130, 246, 0.14)'
          : 'rgba(34, 197, 94, 0.14)';



  // SVG ring params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - risk.score / 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="FI Macro Risk Score — composite risk assessment across all categories"
        badge={{ label: risk.label, variant: risk.label as 'Elevated' }}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/briefing"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 transition-opacity shadow-glow-blue"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Briefing</span>
          </Link>
          <Link
            href="/risk-profile/ringkasan"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-chart-4/40 bg-chart-4/10 hover:bg-chart-4/20 text-xs font-semibold text-chart-4 transition-all shadow-xs"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Profil Risiko Korporasi</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-chart-4/20 text-chart-4 font-bold">
              1.588 PPR-2
            </span>
          </Link>
        </div>
      </PageHeader>

      {/* ── Score Card + Category Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        {/* Main Score Card */}
        <div
          className="glass-card p-8 flex flex-col items-center justify-center text-center lg:col-span-1 relative overflow-hidden border"
          style={{
            background: `linear-gradient(135deg, ${riskGradientBg}, var(--bg-card))`,
          }}
        >
          {/* Score Ring */}
          <div className="score-ring mb-4">
            <svg width="164" height="164" viewBox="0 0 164 164">
              <circle
                cx="82"
                cy="82"
                r={radius}
                fill="none"
                stroke="var(--border-primary)"
                strokeWidth="8"
              />
              <circle
                cx="82"
                cy="82"
                r={radius}
                fill="none"
                stroke={riskColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: 'stroke-dashoffset 1s ease-out',
                  filter: `drop-shadow(0 0 8px ${riskColor}40)`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl font-extrabold"
                style={{ color: riskColor }}
              >
                {risk.score}
              </span>
              <span className="text-xs text-text-muted font-medium">/100</span>
            </div>
          </div>

          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: riskColor }}
          >
            {risk.label}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {risk.change > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-risk-elevated" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-risk-low" />
            )}
            <span className="text-sm text-text-secondary">
              {risk.change > 0 ? '+' : ''}
              {risk.change} pts
            </span>
          </div>
          <div className="mt-3 text-xs text-text-muted">
            Confidence:{' '}
            <span className="text-text-secondary font-semibold">
              {risk.confidence}%
            </span>{' '}
            ({risk.confidenceLabel})
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {risk.categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.category] || Activity;
              const barColor =
                cat.score >= 75
                  ? 'var(--risk-high)'
                  : cat.score >= 60
                    ? 'var(--risk-elevated)'
                    : cat.score >= 45
                      ? 'var(--risk-guarded)'
                      : 'var(--risk-low)';

              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary font-medium">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">
                        {Math.round(cat.weight * 100)}%
                      </span>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: barColor }}
                      >
                        {cat.score}
                      </span>
                      {cat.trend === 'up' && (
                        <TrendingUp className="w-3 h-3 text-risk-elevated" />
                      )}
                      {cat.trend === 'down' && (
                        <TrendingDown className="w-3 h-3 text-risk-low" />
                      )}
                      {cat.trend === 'stable' && (
                        <Minus className="w-3 h-3 text-text-muted" />
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${cat.score}%`,
                        background: barColor,
                        boxShadow: `0 0 8px ${barColor}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AI Executive Briefing CTA Banner ── */}
      <Link
        href="/briefing"
        className="block group"
      >
        <div
          className="glass-card p-6 relative overflow-hidden border border-chart-1/20 hover:border-chart-1/40 transition-all cursor-pointer"
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.06), var(--bg-card))',
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-chart-1/10 to-transparent blur-3xl pointer-events-none group-hover:from-chart-1/15 transition-all" />
          <div className="absolute bottom-0 left-0 w-64 h-24 bg-gradient-to-r from-chart-2/8 to-transparent blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-chart-1 to-chart-2 flex items-center justify-center shadow-glow-blue text-white group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-text-primary">
                    AI Executive Briefing
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-chart-1/15 text-chart-1 border border-chart-1/30 uppercase tracking-wider">
                    <Bot className="w-2.5 h-2.5" />
                    Multi-Model AI
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Sintesis otomatis intelijen makro, komoditas energi, dan 43 parameter profil risiko korporasi menggunakan Google Gemini & DeepSeek.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-chart-1 group-hover:translate-x-1 transition-transform">
              <span className="text-xs font-bold hidden sm:inline">Buka Briefing</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>

      {/* ── Risk Trajectory Chart ── */}
      <RiskTrajectoryChart initialHistory={getRiskHistory()} />

      {/* ── Top Drivers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">
            Top Risk Drivers
          </h3>
          <div className="space-y-3">
            {risk.topDrivers.map((driver, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-tertiary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-muted w-5">
                    #{i + 1}
                  </span>
                  <span className="text-sm text-text-primary font-medium">
                    {driver.name}
                  </span>
                  {driver.change && (
                    <span
                      className={clsx(
                        'text-xs font-mono',
                        driver.change.startsWith('+')
                          ? 'change-positive'
                          : 'change-negative'
                      )}
                    >
                      {driver.change}
                    </span>
                  )}
                </div>
                <span
                  className={clsx(
                    'text-sm font-bold tabular-nums',
                    driver.impact > 0
                      ? 'text-risk-elevated'
                      : 'text-risk-low'
                  )}
                >
                  {driver.impact > 0 ? '+' : ''}
                  {driver.impact} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Pulse */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">
            Market Pulse
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pulse.map((item) => {
              const isPositive = item.change.startsWith('+');
              const isNegative = item.change.startsWith('-');
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-card-hover transition-colors"
                >
                  <div className="text-[11px] text-text-muted font-medium mb-1">
                    {item.label}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-text-primary tabular-nums">
                      {item.value}
                    </span>
                    {item.change && (
                      <span
                        className={clsx(
                          'text-xs font-medium tabular-nums',
                          isPositive && 'change-positive',
                          isNegative && 'change-negative',
                          !isPositive && !isNegative && 'change-neutral'
                        )}
                      >
                        {item.change}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── System Trust ── */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted font-medium">
              System Trust
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full bg-risk-low"
                  style={{ width: `${trust.livePercentage}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary font-semibold tabular-nums">
                {trust.livePercentage}% live
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-text-muted">
            <span>
              <span className="text-risk-low font-semibold">{trust.fresh}</span>{' '}
              Fresh
            </span>
            <span>
              <span className="text-risk-elevated font-semibold">
                {trust.partial}
              </span>{' '}
              Partial
            </span>
            <span>
              <span className="text-text-muted font-semibold">
                {trust.stale}
              </span>{' '}
              Stale
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
