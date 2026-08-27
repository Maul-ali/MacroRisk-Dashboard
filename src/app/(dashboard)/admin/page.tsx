import PageHeader from '@/components/shared/PageHeader';
import { getSourceHealth } from '@/lib/data/indicators';
import { clsx } from 'clsx';
import {
  Settings,
  Server,
  Scale,
  History,
  ShieldCheck,
  AlertTriangle,
  CircleDot,
  Clock,
} from 'lucide-react';

const RISK_WEIGHTS = [
  { category: 'Energy & Feedstock', weight: 30 },
  { category: 'Fertilizer Market', weight: 25 },
  { category: 'FX & Financial', weight: 15 },
  { category: 'Domestic Macro & Policy', weight: 15 },
  { category: 'Global Macro & Geopolitics', weight: 15 },
];

export default function AdminPage() {
  const sources = getSourceHealth();

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <ShieldCheck className="w-4 h-4 text-risk-low" />;
      case 'Degraded':
        return <AlertTriangle className="w-4 h-4 text-risk-elevated" />;
      case 'Partial':
        return <CircleDot className="w-4 h-4 text-text-muted" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-risk-low bg-risk-low/10';
      case 'Degraded':
        return 'text-risk-elevated bg-risk-elevated/10';
      case 'Partial':
        return 'text-text-muted bg-bg-tertiary';
      default:
        return 'text-text-muted bg-bg-tertiary';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        subtitle="Operational control panel — source health, risk weights, and governance"
        badge={{ label: 'Admin', variant: 'info' }}
      />

      {/* Source Health */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Server className="w-4 h-4" />
          System-Wide Source Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/30 hover:bg-bg-card-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                {statusIcon(source.status)}
                <div>
                  <span className="text-sm text-text-primary font-medium">
                    {source.name}
                  </span>
                  {source.notes && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {source.notes}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                  statusColor(source.status)
                )}
              >
                {source.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Weights Governance */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Risk Weight Governance
        </h3>
        <div className="space-y-3">
          {RISK_WEIGHTS.map((item) => (
            <div key={item.category} className="flex items-center gap-4">
              <span className="text-sm text-text-secondary flex-1">
                {item.category}
              </span>
              <div className="w-48 h-2 rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{
                    width: `${(item.weight / 30) * 100}%`,
                    opacity: 0.5 + item.weight / 60,
                  }}
                />
              </div>
              <span className="text-sm font-bold text-text-primary tabular-nums w-10 text-right">
                {item.weight}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-bg-tertiary/30 border border-border-subtle">
          <p className="text-xs text-text-muted flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Formula changes require versioning + audit log · Current: Formula v1.3
          </p>
        </div>
      </div>

      {/* System Controls */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          System Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-xl bg-chart-1/10 border border-chart-1/20 text-chart-1 text-sm font-medium hover:bg-chart-1/15 transition-colors text-left cursor-pointer">
            Trigger Manual Refresh
            <p className="text-xs text-chart-1/60 mt-1">Force re-fetch all live sources</p>
          </button>
          <button className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/20 text-chart-2 text-sm font-medium hover:bg-chart-2/15 transition-colors text-left cursor-pointer">
            Export Data Snapshot
            <p className="text-xs text-chart-2/60 mt-1">Download all indicators as JSON</p>
          </button>
          <button className="p-4 rounded-xl bg-chart-5/10 border border-chart-5/20 text-chart-5 text-sm font-medium hover:bg-chart-5/15 transition-colors text-left cursor-pointer">
            View Audit Log
            <p className="text-xs text-chart-5/60 mt-1">Formula changes and weight history</p>
          </button>
        </div>
      </div>
    </div>
  );
}
