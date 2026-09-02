'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Download,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import {
  RISK_PROFILE,
  TAXONOMY_ORDER,
  getStatusColor,
  getStatusBadgeClass,
  getStatusBgTint,
  type RiskParameter,
  type RiskStatus,
  type RiskTaxonomy,
} from '@/lib/data/riskProfileData';

// ─── Status Filter Tabs ───
type StatusFilter = 'all' | RiskStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string; countKey?: keyof typeof RISK_PROFILE.statusCounts }[] = [
  { key: 'all', label: 'Semua (43)' },
  { key: 'Within Limit', label: 'Within Limit (31)', countKey: 'withinLimit' },
  { key: 'Within Appetite', label: 'Within Appetite (3)', countKey: 'withinAppetite' },
  { key: 'Within Tolerance', label: 'Within Tolerance (2)', countKey: 'withinTolerance' },
  { key: '> Tolerance', label: '> Tolerance (6)', countKey: 'overTolerance' },
  { key: '> Trigger Level', label: '> Trigger (1)', countKey: 'overTrigger' },
];

function ThresholdContent() {
  const searchParams = useSearchParams();
  const initialTaxonomy = searchParams.get('taxonomy') as RiskTaxonomy | null;

  const [dbParameters, setDbParameters] = useState<RiskParameter[]>(RISK_PROFILE.parameters);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>(initialTaxonomy || 'all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedParam, setSelectedParam] = useState<RiskParameter | null>(null);

  // Fetch parameters from Neon Database
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/risk-profile/parameters');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbParameters(json.data);
        }
      } catch (err) {
        console.error('Failed to load parameters from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const parameters = dbParameters;

  // Dynamic status distribution
  const statusCounts = useMemo(() => ({
    withinLimit: parameters.filter((p) => p.status === 'Within Limit').length,
    withinAppetite: parameters.filter((p) => p.status === 'Within Appetite').length,
    withinTolerance: parameters.filter((p) => p.status === 'Within Tolerance').length,
    overTolerance: parameters.filter((p) => p.status === '> Tolerance').length,
    overTrigger: parameters.filter((p) => p.status === '> Trigger Level').length,
  }), [parameters]);

  // Filtered parameters
  const filteredParameters = useMemo(() => {
    return parameters.filter((p) => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Taxonomy filter
      if (selectedTaxonomy !== 'all' && p.taxonomy !== selectedTaxonomy) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesTaxonomy = p.taxonomy.toLowerCase().includes(q);
        const matchesVal = p.currentValue.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesTaxonomy && !matchesVal) return false;
      }

      return true;
    });
  }, [parameters, statusFilter, selectedTaxonomy, searchQuery]);

  // Export to CSV helper
  const handleExportCsv = () => {
    const headers = ['ID', 'Parameter', 'Taksonomi', 'Status', 'Realisasi', 'Periode', 'Limit', 'Appetite', 'Tolerance', 'Trigger'];
    const rows = filteredParameters.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.taxonomy}"`,
      p.status,
      `"${p.currentValue}"`,
      p.period,
      `"${p.limitThreshold || '-'}"`,
      `"${p.appetiteThreshold || '-'}"`,
      `"${p.toleranceThreshold || '-'}"`,
      `"${p.triggerThreshold || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Risk_Profile_Thresholds_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1">
              Enterprise Risk Management · Juni 2026
            </p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Threshold &amp; Parameter Risiko
            </h1>
            <p className="mt-1 text-sm text-text-secondary max-w-3xl">
              Daftar komprehensif 43 parameter risiko korporasi, status posisi realisasi, dan koridor batasan Limit, Appetite, Tolerance, serta Trigger Level.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-primary bg-bg-tertiary/40 hover:bg-bg-card-hover text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-chart-1" />
              Export CSV ({filteredParameters.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Control & Filter Bar ── */}
      <div className="glass-card p-4 space-y-3 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari parameter, ID, atau kata kunci..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-bg-tertiary/70 border border-border-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:border-chart-1 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Taxonomy Filter + View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Taxonomy Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Taksonomi:</span>
              <select
                value={selectedTaxonomy}
                onChange={(e) => setSelectedTaxonomy(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary/80 border border-border-primary text-text-primary focus:outline-none focus:border-chart-1 cursor-pointer max-w-[220px] truncate"
              >
                <option value="all">Semua Taksonomi ({parameters.length})</option>
                {TAXONOMY_ORDER.map((tax) => {
                  const count = parameters.filter((p) => p.taxonomy === tax).length;
                  return (
                    <option key={tax} value={tax}>
                      {tax} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-bg-tertiary/60 border border-border-subtle">
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                  viewMode === 'table'
                    ? 'bg-bg-card text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-secondary'
                )}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                  viewMode === 'cards'
                    ? 'bg-bg-card text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-secondary'
                )}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="pt-2 border-t border-border-subtle/50 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((tab) => {
            const isActive = statusFilter === tab.key;
            const tabCount = tab.key === 'all' ? parameters.length : (statusCounts as any)[tab.countKey || ''];
            const displayLabel = tab.key === 'all' ? `Semua (${parameters.length})` : `${tab.label} (${tabCount ?? 0})`;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={clsx(
                  'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5',
                  isActive
                    ? 'bg-bg-card text-text-primary border border-border-primary shadow-xs font-bold'
                    : 'bg-bg-tertiary/50 text-text-muted hover:text-text-secondary border border-transparent'
                )}
              >
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table View ── */}
      {viewMode === 'table' ? (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12 text-center">ID</th>
                  <th className="min-w-[260px]">Parameter Risiko</th>
                  <th className="min-w-[130px]">Realisasi (Juni)</th>
                  <th className="min-w-[140px]">Status</th>
                  <th className="min-w-[120px]">Within Limit</th>
                  <th className="min-w-[120px]">Risk Appetite</th>
                  <th className="min-w-[120px]">Risk Tolerance</th>
                  <th className="min-w-[120px]">Trigger Level</th>
                  <th className="w-16 text-center">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredParameters.length > 0 ? (
                  filteredParameters.map((param) => {
                    const statusColor = getStatusColor(param.status);
                    return (
                      <tr
                        key={param.id}
                        onClick={() => setSelectedParam(param)}
                        className="cursor-pointer hover:bg-bg-card-hover transition-colors group"
                      >
                        <td className="text-center font-mono text-[11px] text-text-muted">
                          {param.id}
                        </td>
                        <td>
                          <div>
                            <p className="text-sm font-semibold text-text-primary group-hover:text-text-accent transition-colors">
                              {param.name}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                              {param.taxonomy}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm font-bold text-text-primary font-mono tabular-nums">
                            {param.currentValue}
                          </span>
                        </td>
                        <td>
                          <span className={clsx('risk-badge text-[10px]', getStatusBadgeClass(param.status))}>
                            {param.status}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-risk-low font-medium">
                          {param.limitThreshold || '—'}
                        </td>
                        <td className="font-mono text-xs text-chart-4 font-medium">
                          {param.appetiteThreshold || '—'}
                        </td>
                        <td className="font-mono text-xs text-risk-elevated font-medium">
                          {param.toleranceThreshold || '—'}
                        </td>
                        <td className="font-mono text-xs text-risk-critical font-medium">
                          {param.triggerThreshold || '—'}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParam(param);
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-text-muted">
                      Tidak ada parameter yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Cards View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {filteredParameters.map((param) => {
            const statusColor = getStatusColor(param.status);
            return (
              <div
                key={param.id}
                onClick={() => setSelectedParam(param)}
                className="glass-card p-5 relative overflow-hidden cursor-pointer hover:shadow-lg hover:border-border-primary transition-all group flex flex-col justify-between"
              >
                {/* Top status bar accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: statusColor }} />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
                      {param.taxonomy}
                    </span>
                    <span className={clsx('risk-badge text-[9px] shrink-0', getStatusBadgeClass(param.status))}>
                      {param.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-primary group-hover:text-text-accent transition-colors mb-3 leading-snug">
                    {param.name}
                  </h3>

                  {/* Realisasi Box */}
                  <div className="p-3 rounded-xl bg-bg-tertiary/60 mb-3 flex items-baseline justify-between">
                    <span className="text-xs text-text-muted font-medium">Realisasi Juni</span>
                    <span className="text-base font-extrabold text-text-primary font-mono">
                      {param.currentValue}
                    </span>
                  </div>

                  {/* Thresholds Mini Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                    <div className="p-2 rounded-lg bg-bg-tertiary/40 border border-border-subtle/50">
                      <span className="text-text-muted block text-[10px]">Within Limit</span>
                      <span className="font-semibold text-risk-low font-mono">
                        {param.limitThreshold || '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-tertiary/40 border border-border-subtle/50">
                      <span className="text-text-muted block text-[10px]">Risk Appetite</span>
                      <span className="font-semibold text-chart-4 font-mono">
                        {param.appetiteThreshold || '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-tertiary/40 border border-border-subtle/50">
                      <span className="text-text-muted block text-[10px]">Risk Tolerance</span>
                      <span className="font-semibold text-risk-elevated font-mono">
                        {param.toleranceThreshold || '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-tertiary/40 border border-border-subtle/50">
                      <span className="text-text-muted block text-[10px]">Trigger Level</span>
                      <span className="font-semibold text-risk-critical font-mono">
                        {param.triggerThreshold || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs text-chart-1 font-semibold group-hover:underline">
                  <span>Lihat rincian lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedParam(null)}
          />
          <div className="glass-card relative z-10 w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-semibold text-text-muted tracking-widest uppercase mb-1">
                  Detail Parameter &amp; Threshold ({selectedParam.id})
                </p>
                <h3 className="text-lg font-bold text-text-primary">
                  {selectedParam.name}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {selectedParam.taxonomy} · Periode {selectedParam.period} 2026
                </p>
              </div>
              <button
                onClick={() => setSelectedParam(null)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Realisasi */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-tertiary/60 mb-5">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: getStatusColor(selectedParam.status) }}
              />
              <div className="flex-1">
                <p className="text-xs text-text-muted">Realisasi Posisi Saat Ini</p>
                <p className="text-xl font-bold text-text-primary font-mono">
                  {selectedParam.currentValue}
                </p>
              </div>
              <span className={clsx('risk-badge', getStatusBadgeClass(selectedParam.status))}>
                {selectedParam.status}
              </span>
            </div>

            {/* Threshold Specifications */}
            <div className="space-y-2.5 mb-5">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Batasan Koridor Threshold
              </p>
              {[
                { label: 'Within Limit', desc: 'Batas operasional aman yang disetujui', value: selectedParam.limitThreshold, color: 'var(--risk-low)' },
                { label: 'Risk Appetite', desc: 'Tingkat risiko optimal yang dapat diterima', value: selectedParam.appetiteThreshold, color: 'var(--chart-4)' },
                { label: 'Risk Tolerance', desc: 'Batas variasi maksimum sebelum eskalasi', value: selectedParam.toleranceThreshold, color: 'var(--risk-elevated)' },
                { label: 'Trigger Level', desc: 'Nilai kritis tindakan korektif manajemen', value: selectedParam.triggerThreshold, color: 'var(--risk-critical)' },
              ].map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary/40 border border-border-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{t.label}</p>
                      <p className="text-[10px] text-text-muted">{t.desc}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-text-primary font-mono tabular-nums">
                    {t.value || '—'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border-subtle flex justify-end">
              <button
                onClick={() => setSelectedParam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-tertiary hover:bg-bg-card-hover border border-border-primary text-text-primary transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThresholdPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Memuat data threshold...</div>}>
      <ThresholdContent />
    </Suspense>
  );
}
