import PageHeader from '@/components/shared/PageHeader';
import { getAllIndicators } from '@/lib/data/indicators';
import { clsx } from 'clsx';

export default async function CatalogPage() {
  const indicators = await getAllIndicators();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Catalog"
        subtitle="Master indicator list — raw data table behind the visual dashboard"
      />

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>Category</th>
              <th>Value</th>
              <th>1M Change</th>
              <th>Risk Band</th>
              <th>Source</th>
              <th>Freshness</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind) => (
              <tr key={ind.id}>
                <td className="!text-text-primary !font-medium">{ind.name}</td>
                <td>
                  <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-text-muted">
                    {ind.category}
                  </span>
                </td>
                <td className="!font-mono tabular-nums !text-text-primary">
                  {ind.displayValue}
                </td>
                <td>
                  {ind.change1M !== null ? (
                    <span
                      className={clsx(
                        'font-mono text-sm tabular-nums',
                        ind.change1M > 0
                          ? 'change-positive'
                          : ind.change1M < 0
                            ? 'change-negative'
                            : 'change-neutral'
                      )}
                    >
                      {ind.change1M > 0 ? '+' : ''}
                      {ind.change1M}%
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td>
                  <span
                    className={clsx(
                      'risk-badge',
                      `risk-badge--${ind.riskBand.toLowerCase()}`
                    )}
                  >
                    {ind.riskBand}
                  </span>
                </td>
                <td className="!text-[13px]">{ind.source}</td>
                <td>
                  <span
                    className={clsx(
                      'freshness-badge',
                      `freshness--${ind.freshness.toLowerCase()}`
                    )}
                  >
                    {ind.freshness}
                  </span>
                </td>
                <td className="!text-xs !text-text-muted">
                  {new Date(ind.lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
