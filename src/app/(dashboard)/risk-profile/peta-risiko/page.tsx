'use client';

import { clsx } from 'clsx';
import {
  Check,
  Info,
} from 'lucide-react';
import {
  RISK_MAP_RELATIONS,
  getStatusColor,
  getStatusBadgeClass,
  type RiskMapRelation,
} from '@/lib/data/riskProfileData';

const OUTCOME_COLUMNS = [
  { key: 'production' as const, label: 'Production' },
  { key: 'revenue' as const, label: 'Revenue' },
  { key: 'cost' as const, label: 'Cost' },
  { key: 'margin' as const, label: 'Margin' },
  { key: 'cashFlow' as const, label: 'Cash Flow' },
];

export default function PetaRisikoPage() {
  // Group by taxonomy
  const marketParams = RISK_MAP_RELATIONS.filter(
    (r) => r.taxonomy === 'Market and Macroeconomic Risk'
  );
  const operationalParams = RISK_MAP_RELATIONS.filter(
    (r) => r.taxonomy === 'Operational Risk'
  );

  // Count total relations
  const totalRelations = RISK_MAP_RELATIONS.reduce((acc, r) => {
    return (
      acc +
      (r.production ? 1 : 0) +
      (r.revenue ? 1 : 0) +
      (r.cost ? 1 : 0) +
      (r.margin ? 1 : 0) +
      (r.cashFlow ? 1 : 0)
    );
  }, 0);

  const renderRow = (r: RiskMapRelation, index: number) => (
    <tr key={r.parameterId} className="group" style={{ animationDelay: `${index * 30}ms` }}>
      <td>
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: getStatusColor(r.status) }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate max-w-[280px]">
              {r.parameterName}
            </p>
          </div>
        </div>
      </td>
      <td className="!py-0">
        <span className={clsx('risk-badge text-[9px]', getStatusBadgeClass(r.status))}>
          {r.status}
        </span>
      </td>
      {OUTCOME_COLUMNS.map((col) => (
        <td key={col.key} className="text-center">
          {r[col.key] ? (
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-lg transition-transform group-hover:scale-110"
              style={{
                background: `${getStatusColor(r.status)}15`,
              }}
            >
              <Check
                className="w-3.5 h-3.5"
                style={{ color: getStatusColor(r.status) }}
              />
            </span>
          ) : (
            <span className="text-text-muted/30 text-xs">—</span>
          )}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1.5">
              Enterprise Risk Management · Peta Risiko
            </p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Peta Risiko
            </h1>
            <p className="mt-1 text-sm text-text-secondary max-w-2xl">
              Visualisasi hubungan kausal 24 parameter risiko (Market &amp; Operational)
              terhadap 5 dimensi bisnis utama dengan {totalRelations} relasi yang teridentifikasi.
            </p>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-border-subtle bg-bg-tertiary/30 animate-fade-in">
        <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          Hubungan kausal ini adalah asumsi berdasarkan business logic untuk validasi desain,
          bukan hasil model statistik.
        </p>
      </div>

      {/* ── Summary Chips ── */}
      <div className="flex flex-wrap gap-3 stagger-children">
        {[
          { value: RISK_MAP_RELATIONS.length, label: 'parameter' },
          { value: totalRelations, label: 'relasi' },
          { value: 5, label: 'dimensi bisnis' },
        ].map((chip) => (
          <div
            key={chip.label}
            className="glass-card-sm px-4 py-2.5 flex items-center gap-2"
          >
            <span className="text-lg font-extrabold text-text-primary tabular-nums">
              {chip.value}
            </span>
            <span className="text-xs text-text-muted font-medium">
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Matrix Table ── */}
      <div className="glass-card p-6 overflow-x-auto animate-fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th className="min-w-[280px]">Parameter Risiko</th>
              <th className="min-w-[120px]">Status</th>
              {OUTCOME_COLUMNS.map((col) => (
                <th key={col.key} className="text-center min-w-[80px]">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Market Section Header */}
            <tr>
              <td
                colSpan={7}
                className="!py-3 !px-4 !border-b-0"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <p className="text-[10px] font-bold text-text-muted tracking-[0.08em] uppercase">
                  Market and Macroeconomic Risk
                  <span className="ml-2 text-text-secondary font-normal">
                    ({marketParams.length} parameter)
                  </span>
                </p>
              </td>
            </tr>
            {marketParams.map((r, i) => renderRow(r, i))}

            {/* Operational Section Header */}
            <tr>
              <td
                colSpan={7}
                className="!py-3 !px-4 !border-b-0"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <p className="text-[10px] font-bold text-text-muted tracking-[0.08em] uppercase">
                  Operational Risk
                  <span className="ml-2 text-text-secondary font-normal">
                    ({operationalParams.length} parameter)
                  </span>
                </p>
              </td>
            </tr>
            {operationalParams.map((r, i) => renderRow(r, marketParams.length + i))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
