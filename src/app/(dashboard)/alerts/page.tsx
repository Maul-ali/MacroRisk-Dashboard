import PageHeader from '@/components/shared/PageHeader';
import { getAlertRules } from '@/lib/data/indicators';
import { Bell, BellRing, CheckCircle2, Clock, Mail, Smartphone } from 'lucide-react';
import { clsx } from 'clsx';

export default function AlertsPage() {
  const alerts = getAlertRules();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        subtitle="2 triggered today · 4 active rules · 94% delivery success"
        badge={{ label: '2 Triggered', variant: 'Elevated' }}
      />

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-risk-elevated/10 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-risk-elevated" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">2</div>
            <div className="text-xs text-text-muted">Triggered Today</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-chart-1" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">4</div>
            <div className="text-xs text-text-muted">Active Rules</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-risk-low/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-risk-low" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">94%</div>
            <div className="text-xs text-text-muted">Delivery Success</div>
          </div>
        </div>
      </div>

      {/* Alert Rules Table */}
      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Condition</th>
              <th>Channels</th>
              <th>Cooldown</th>
              <th>Last Triggered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td className="!text-text-primary !font-medium">{alert.name}</td>
                <td className="!font-mono !text-[13px]">{alert.condition}</td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {alert.channels.includes('In-app') && (
                      <Smartphone className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    {alert.channels.includes('Email') && (
                      <Mail className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    <span className="text-xs text-text-secondary">{alert.channels}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-xs">{alert.cooldown}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={clsx(
                      'text-xs font-medium',
                      alert.lastTriggered.startsWith('Today')
                        ? 'text-risk-elevated'
                        : alert.lastTriggered === 'Never'
                          ? 'text-text-muted'
                          : 'text-text-secondary'
                    )}
                  >
                    {alert.lastTriggered}
                  </span>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-risk-low/10 text-risk-low">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
