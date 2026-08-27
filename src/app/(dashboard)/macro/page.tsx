import PageHeader from '@/components/shared/PageHeader';
import CostContextChart from '@/components/charts/CostContextChart';
import { getIndicatorsByCategory, getAllIndicators } from '@/lib/data/indicators';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

export default function MacroPage() {
  const fxMacro = getIndicatorsByCategory('FX & Macro');
  const allIndicators = getAllIndicators();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Macro"
        subtitle="Core macroeconomic indicators — USD/IDR, CPI, GDP, and cross-currency context"
      />

      {/* Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {fxMacro.map((ind) => (
          <div key={ind.id} className="glass-card p-5 hover:bg-bg-card-hover transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                {ind.name}
              </span>
              <span className={clsx('freshness-badge', `freshness--${ind.freshness.toLowerCase()}`)}>
                {ind.freshness}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-2xl font-bold text-text-primary tabular-nums">
                {ind.displayValue}
              </span>
              {ind.change1M !== null && (
                <span
                  className={clsx(
                    'text-sm font-semibold tabular-nums',
                    ind.change1M > 0 ? 'change-positive' : ind.change1M < 0 ? 'change-negative' : 'change-neutral'
                  )}
                >
                  {ind.change1M > 0 ? '+' : ''}
                  {ind.change1M}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className={clsx('risk-badge', `risk-badge--${ind.riskBand.toLowerCase()}`)}>
                {ind.riskBand}
              </span>
              <span className="text-[11px] text-text-muted">{ind.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cost Context Chart */}
      <CostContextChart indicators={allIndicators} />
    </div>
  );
}
