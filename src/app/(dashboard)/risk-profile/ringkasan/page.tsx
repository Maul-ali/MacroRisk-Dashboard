'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { clsx } from 'clsx';
import {
  Download,
  ChevronRight,
  ArrowRight,
  X,
  CalendarDays,
} from 'lucide-react';
import {
  RISK_PROFILE,
  getAttentionParameters,
  getStatusColor,
  getStatusBadgeClass,
  getStatusBgTint,
  type RiskParameter,
  type RiskStatus,
} from '@/lib/data/riskProfileData';

// ─── Status Cards Config ───

const STATUS_CARDS: {
  label: string;
  status: RiskStatus;
  countKey: keyof typeof RISK_PROFILE.statusCounts;
}[] = [
  { label: 'Within Limit', status: 'Within Limit', countKey: 'withinLimit' },
  { label: 'Within Appetite', status: 'Within Appetite', countKey: 'withinAppetite' },
  { label: 'Within Tolerance', status: 'Within Tolerance', countKey: 'withinTolerance' },
  { label: '> Tolerance', status: '> Tolerance', countKey: 'overTolerance' },
  { label: '> Trigger Level', status: '> Trigger Level', countKey: 'overTrigger' },
];

// ─── Filter Options ───

type FilterKey = 'all' | RiskStatus;

const FILTER_OPTIONS: { key: FilterKey; label: string; status?: RiskStatus }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'Within Appetite', label: 'Within Appetite', status: 'Within Appetite' },
  { key: 'Within Tolerance', label: 'Within Tolerance', status: 'Within Tolerance' },
  { key: '> Tolerance', label: '> Tolerance', status: '> Tolerance' },
  { key: '> Trigger Level', label: '> Trigger', status: '> Trigger Level' },
];

// ─── Threshold Modal ───

function ThresholdModal({
  parameter,
  onClose,
}: {
  parameter: RiskParameter;
  onClose: () => void;
}) {
  const thresholds = [
    { label: 'Limit', value: parameter.limitThreshold, color: 'var(--risk-low)' },
    { label: 'Appetite', value: parameter.appetiteThreshold, color: 'var(--chart-4)' },
    { label: 'Tolerance', value: parameter.toleranceThreshold, color: 'var(--risk-elevated)' },
    { label: 'Trigger', value: parameter.triggerThreshold, color: 'var(--risk-critical)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="glass-card relative z-10 w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold text-text-muted tracking-widest uppercase mb-1">
              Detail Threshold
            </p>
            <h3 className="text-lg font-bold text-text-primary">
              {parameter.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {parameter.taxonomy} · {parameter.period} 2026
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Value */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-tertiary/60 mb-4">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: getStatusColor(parameter.status) }}
          />
          <div className="flex-1">
            <p className="text-xs text-text-muted">Nilai Saat Ini</p>
            <p className="text-xl font-bold text-text-primary">
              {parameter.currentValue}
            </p>
          </div>
          <span className={clsx('risk-badge', getStatusBadgeClass(parameter.status))}>
            {parameter.status}
          </span>
        </div>

        {/* Thresholds */}
        <div className="space-y-2">
          {thresholds.map((t) => (
            <div
              key={t.label}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/40 hover:bg-bg-card-hover transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: t.color }}
                />
                <span className="text-sm text-text-secondary font-medium">
                  {t.label}
                </span>
              </div>
              <span className="text-sm font-semibold text-text-primary font-mono tabular-nums">
                {t.value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function RingkasanPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedParameter, setSelectedParameter] = useState<RiskParameter | null>(null);

  const attentionParams = getAttentionParameters();
  const filteredParams =
    activeFilter === 'all'
      ? attentionParams
      : attentionParams.filter((p) => p.status === activeFilter);

  const getFilterCount = (key: FilterKey) => {
    if (key === 'all') return attentionParams.length;
    return attentionParams.filter((p) => p.status === key).length;
  };

  // Taxonomy column values for table cells
  const getTaxonomyCellBg = (count: number, status: RiskStatus) => {
    if (count === 0) return undefined;
    return getStatusBgTint(status);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1.5">
              Enterprise Risk Management · Juni 2026
            </p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Profil Risiko Korporasi Fertilizer Indo
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Ringkasan 43 parameter risiko dan posisi setiap realisasi terhadap threshold.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-primary bg-bg-tertiary/40 hover:bg-bg-card-hover text-sm font-medium text-text-secondary hover:text-text-primary transition-all cursor-pointer">
            <Download className="w-4 h-4" />
            Export view
          </button>
        </div>
      </div>

      {/* ── Dummy Data Banner ── */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 animate-fade-in">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-400 font-medium">
            Data dummy tahap pertama · Periode Juni 2026
          </span>
        </div>
        <span className="text-xs text-text-muted">
          Klik kartu atau baris untuk melihat threshold
        </span>
      </div>

      {/* ── Score + Status Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 stagger-children">
        {/* Hero Score Card */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
            borderColor: 'rgba(20, 184, 166, 0.2)',
          }}
        >
          <div>
            <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-3">
              Nilai Profil Risiko
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold tabular-nums" style={{ color: 'var(--chart-4)' }}>
                {RISK_PROFILE.score.toFixed(3)}
              </span>
              <span className="text-sm font-medium text-text-muted">
                {RISK_PROFILE.scoreUnit}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--chart-4)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--chart-4)' }}>
                {RISK_PROFILE.status}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Skor komposit profil risiko perusahaan berdasarkan evaluasi {RISK_PROFILE.totalParameters} parameter.
            </p>
          </div>
          <button
            className="flex items-center gap-1 mt-4 text-xs font-semibold transition-colors cursor-pointer hover:opacity-80"
            style={{ color: 'var(--chart-4)' }}
          >
            Lihat {RISK_PROFILE.totalParameters} threshold
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Status Cards */}
        {STATUS_CARDS.map((card) => {
          const count = RISK_PROFILE.statusCounts[card.countKey];
          const pct = ((count / RISK_PROFILE.totalParameters) * 100).toFixed(1);
          const color = getStatusColor(card.status);

          return (
            <div key={card.countKey} className="glass-card p-5 relative overflow-hidden group">
              {/* Top color border */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: color }}
              />
              <p className="text-[10px] font-semibold text-text-muted tracking-[0.06em] uppercase mb-2">
                {card.label}
              </p>
              <p className="text-3xl font-extrabold tabular-nums" style={{ color }}>
                {count}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {pct}% dari {RISK_PROFILE.totalParameters} parameter
              </p>
              {/* Circle button */}
              <div
                className="absolute bottom-3 right-3 flex items-center justify-center w-7 h-7 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: `${color}20` }}
              >
                <ChevronRight className="w-3.5 h-3.5" style={{ color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Two-Column: Taxonomy + Management Attention ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 stagger-children">
        {/* ── Left: Risk Taxonomy Table ── */}
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1">
                Risk Taxonomy
              </p>
              <h3 className="text-base font-bold text-text-primary">
                Status parameter per taksonomi
              </h3>
            </div>
            <span className="text-[11px] text-text-muted">
              Klik baris untuk threshold
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="min-w-[200px]">Taksonomi Risiko</th>
                  <th className="text-center w-16">Limit</th>
                  <th className="text-center w-16">Appetite</th>
                  <th className="text-center w-16">Tolerance</th>
                  <th className="text-center w-16">{'>'}Tolerance</th>
                  <th className="text-center w-16">{'>'}Trigger</th>
                  <th className="text-center w-16">Total</th>
                </tr>
              </thead>
              <tbody>
                {RISK_PROFILE.taxonomyBreakdown.map((row) => (
                  <tr
                    key={row.taxonomy}
                    className="cursor-pointer group"
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <span className="text-sm font-medium text-text-primary">
                            {row.taxonomy}
                          </span>
                          <p className="text-[11px] text-text-muted">
                            Lihat threshold {row.total} parameter
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="text-center font-semibold text-sm"
                      style={{
                        background: getTaxonomyCellBg(row.limit, 'Within Limit'),
                        color: row.limit > 0 ? getStatusColor('Within Limit') : undefined,
                      }}
                    >
                      {row.limit}
                    </td>
                    <td
                      className="text-center font-semibold text-sm"
                      style={{
                        background: getTaxonomyCellBg(row.appetite, 'Within Appetite'),
                        color: row.appetite > 0 ? getStatusColor('Within Appetite') : undefined,
                      }}
                    >
                      {row.appetite}
                    </td>
                    <td
                      className="text-center font-semibold text-sm"
                      style={{
                        background: getTaxonomyCellBg(row.tolerance, 'Within Tolerance'),
                        color: row.tolerance > 0 ? getStatusColor('Within Tolerance') : undefined,
                      }}
                    >
                      {row.tolerance}
                    </td>
                    <td
                      className="text-center font-semibold text-sm"
                      style={{
                        background: getTaxonomyCellBg(row.overTolerance, '> Tolerance'),
                        color: row.overTolerance > 0 ? getStatusColor('> Tolerance') : undefined,
                      }}
                    >
                      {row.overTolerance}
                    </td>
                    <td
                      className="text-center font-semibold text-sm"
                      style={{
                        background: getTaxonomyCellBg(row.overTrigger, '> Trigger Level'),
                        color: row.overTrigger > 0 ? getStatusColor('> Trigger Level') : undefined,
                      }}
                    >
                      {row.overTrigger}
                    </td>
                    <td className="text-center font-bold text-sm text-text-primary">
                      {row.total}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-border-primary">
                  <td className="font-bold text-sm text-text-primary">Total</td>
                  <td className="text-center font-bold text-sm" style={{ color: getStatusColor('Within Limit') }}>
                    {RISK_PROFILE.statusCounts.withinLimit}
                  </td>
                  <td className="text-center font-bold text-sm" style={{ color: getStatusColor('Within Appetite') }}>
                    {RISK_PROFILE.statusCounts.withinAppetite}
                  </td>
                  <td className="text-center font-bold text-sm" style={{ color: getStatusColor('Within Tolerance') }}>
                    {RISK_PROFILE.statusCounts.withinTolerance}
                  </td>
                  <td className="text-center font-bold text-sm" style={{ color: getStatusColor('> Tolerance') }}>
                    {RISK_PROFILE.statusCounts.overTolerance}
                  </td>
                  <td className="text-center font-bold text-sm" style={{ color: getStatusColor('> Trigger Level') }}>
                    {RISK_PROFILE.statusCounts.overTrigger}
                  </td>
                  <td className="text-center font-extrabold text-sm text-text-primary">
                    {RISK_PROFILE.totalParameters}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Management Attention ── */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1">
                Management Attention
              </p>
              <h3 className="text-base font-bold text-text-primary">
                Parameter yang perlu perhatian
              </h3>
            </div>
            <span className="risk-badge risk-badge--elevated text-[10px]">
              {attentionParams.length} parameter
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTER_OPTIONS.map((opt) => {
              const count = getFilterCount(opt.key);
              const isActive = activeFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setActiveFilter(opt.key)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border',
                    isActive
                      ? 'bg-bg-card border-border-primary text-text-primary shadow-sm'
                      : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-bg-tertiary/50'
                  )}
                >
                  {opt.status && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: getStatusColor(opt.status) }}
                    />
                  )}
                  {opt.label}
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Parameter List */}
          <div className="flex-1 overflow-y-auto max-h-[440px] space-y-1 pr-1">
            {filteredParams.map((param) => (
              <button
                key={param.id}
                onClick={() => setSelectedParameter(param)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer text-left group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: getStatusColor(param.status) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {param.name}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    {param.taxonomy} · {param.period} · {param.currentValue}
                  </p>
                </div>
                <span className={clsx('risk-badge text-[9px] shrink-0', getStatusBadgeClass(param.status))}>
                  {param.status}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Threshold Detail Modal ── */}
      {selectedParameter && (
        <ThresholdModal
          parameter={selectedParameter}
          onClose={() => setSelectedParameter(null)}
        />
      )}
    </div>
  );
}
