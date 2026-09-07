'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import PageHeader from '@/components/shared/PageHeader';
import { getCompositeRiskScoreSync } from '@/lib/data/indicators';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  Languages,
  Layers,
  Cpu,
  Bot,
  ArrowLeft,
  FileText,
  Clock,
} from 'lucide-react';

interface KeyDriver {
  title: string;
  impact: 'High' | 'Medium' | 'Critical';
  detail: string;
}

interface AIBriefData {
  headline: string;
  riskRating: string;
  executiveSummary: string;
  keyDrivers: KeyDriver[];
  criticalWatchpoints: string[];
  strategicActions: string[];
  corporateRiskNote: string;
}

type FocusArea = 'all' | 'energy' | 'fertilizer' | 'fx' | 'corporate';
type ModelOption = 'gemini-3.6-flash' | 'deepseek-chat' | 'deepseek-reasoner';

const FOCUS_OPTIONS: { key: FocusArea; label: string; description: string }[] = [
  { key: 'all', label: 'Komprehensif', description: 'Semua kategori risiko makro & korporasi' },
  { key: 'energy', label: 'Energi & Gas', description: 'Brent, WTI, Henry Hub, shipping' },
  { key: 'fertilizer', label: 'Pasar Pupuk', description: 'Urea, DAP, Ammonia, Phosphate Rock' },
  { key: 'fx', label: 'Kurs & Makro', description: 'USD/IDR, VIX, DXY, suku bunga' },
  { key: 'corporate', label: 'Profil Risiko', description: '43 parameter risiko korporasi' },
];

const MODEL_OPTIONS: { key: ModelOption; label: string; provider: 'Google' | 'DeepSeek'; badge: string }[] = [
  { key: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', provider: 'Google', badge: 'Recommended' },
  { key: 'deepseek-chat', label: 'DeepSeek Chat V3', provider: 'DeepSeek', badge: 'Fast' },
  { key: 'deepseek-reasoner', label: 'DeepSeek R1 Reasoner', provider: 'DeepSeek', badge: 'Deep Analysis' },
];

export default function AIBriefingPage() {
  const risk = getCompositeRiskScoreSync();
  const [focus, setFocus] = useState<FocusArea>('all');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [model, setModel] = useState<ModelOption>('gemini-3.6-flash');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<AIBriefData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>('gemini-3.6-flash');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [briefHistory, setBriefHistory] = useState<number>(0);

  // Generate brief function
  const handleGenerate = async (
    selectedFocus = focus,
    selectedLang = language,
    selectedModel = model
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: selectedFocus,
          language: selectedLang,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Gagal menghasilkan AI brief.');
      }

      setBrief(data.brief);
      setGeneratedAt(data.generatedAt);
      setActiveModelName(data.model || selectedModel);
      setBriefHistory((prev) => prev + 1);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memanggil AI provider.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first load
  useEffect(() => {
    handleGenerate('all', 'id', 'gemini-3.6-flash');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Copy text handler
  const handleCopy = () => {
    if (!brief) return;
    const formattedText = `
[AI EXECUTIVE BRIEFING - PT FERTILIZER INDO]
${brief.headline}
Rating Risiko: ${brief.riskRating}
Model AI: ${activeModelName}
Waktu Generasi: ${generatedAt ? new Date(generatedAt).toLocaleString('id-ID') : '-'}

RINGKASAN EKSEKUTIF:
${brief.executiveSummary}

FAKTOR PENDORONG UTAMA:
${brief.keyDrivers.map((d) => `• [${d.impact}] ${d.title}: ${d.detail}`).join('\n')}

INSIGHT PROFIL RISIKO KORPORASI:
${brief.corporateRiskNote}

HAL YANG PERLU DIAWASI (CRITICAL WATCHPOINTS):
${brief.criticalWatchpoints.map((w) => `• ${w}`).join('\n')}

REKOMENDASI AKSI STRATEGIS:
${brief.strategicActions.map((a) => `• ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getImpactBadgeClass = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical':
        return 'bg-risk-critical/15 text-risk-critical border-risk-critical/30';
      case 'high':
        return 'bg-risk-elevated/15 text-risk-elevated border-risk-elevated/30';
      default:
        return 'bg-chart-1/15 text-chart-1 border-chart-1/30';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Executive Briefing"
        subtitle="Sintesis intelijen makro otomatis dengan multi-model AI — C-level risk narrative"
        badge={{ label: risk.label, variant: risk.label as 'Elevated' }}
      >
        <Link
          href="/overview"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-primary bg-bg-card hover:bg-bg-card-hover text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Overview</span>
        </Link>
      </PageHeader>

      {/* ── Controls Bar ── */}
      <div
        className="glass-card p-5 border border-border-primary relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(139, 92, 246, 0.03), var(--bg-card))',
        }}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-chart-1/8 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-start gap-5 relative z-10">
          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1.5">
              <Cpu className="w-3 h-3" /> Model AI
            </label>
            <div className="flex flex-wrap gap-2">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModel(m.key)}
                  disabled={loading}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer disabled:opacity-50',
                    model === m.key
                      ? 'bg-chart-1/10 border-chart-1/40 text-chart-1 shadow-xs'
                      : 'bg-bg-tertiary/40 border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-primary'
                  )}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="font-semibold">{m.label}</span>
                  <span className={clsx(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                    model === m.key ? 'bg-chart-1/20 text-chart-1' : 'bg-bg-tertiary text-text-muted'
                  )}>
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Area Selector */}
          <div className="space-y-2 flex-1 min-w-[300px]">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Fokus Analisis
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFocus(opt.key)}
                  disabled={loading}
                  className={clsx(
                    'px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-50 group',
                    focus === opt.key
                      ? 'bg-chart-2/10 border-chart-2/40 text-chart-2 shadow-xs'
                      : 'bg-bg-tertiary/40 border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-primary'
                  )}
                >
                  <span className="font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Aksi</label>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => {
                  setLanguage(language === 'id' ? 'en' : 'id');
                }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-tertiary/60 border border-border-primary text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                title="Ganti Bahasa (ID / EN)"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language.toUpperCase()}</span>
              </button>

              {/* Generate Button */}
              <button
                onClick={() => handleGenerate(focus, language, model)}
                disabled={loading}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-70',
                  loading
                    ? 'bg-bg-tertiary text-text-muted border border-border-primary'
                    : 'bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 shadow-glow-blue'
                )}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Brief</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Brief counter */}
        {briefHistory > 0 && (
          <div className="mt-3 pt-3 border-t border-border-subtle/50 flex items-center gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Brief ke-{briefHistory} sesi ini
            </span>
            {generatedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(generatedAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })} WIB
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              {MODEL_OPTIONS.find((m) => m.key === activeModelName)?.label || activeModelName}
            </span>
          </div>
        )}
      </div>

      {/* ── Content Area ── */}
      <div
        className="glass-card p-6 relative overflow-hidden border border-border-primary shadow-lg transition-all animate-fade-in"
        style={{
          background:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04), var(--bg-card))',
        }}
      >
        {/* Top Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-chart-1/10 to-transparent blur-3xl pointer-events-none" />

        {/* Loading State */}
        {loading && (
          <div className="py-12 space-y-5 relative z-10">
            <div className="flex items-center justify-center gap-3 text-sm text-text-muted">
              <Sparkles className="w-6 h-6 text-chart-1 animate-pulse" />
              <span className="font-medium animate-pulse">
                {MODEL_OPTIONS.find((m) => m.key === model)?.label} sedang menganalisis {FOCUS_OPTIONS.find((f) => f.key === focus)?.label}...
              </span>
            </div>
            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="h-5 bg-bg-tertiary/80 rounded-lg animate-pulse" />
              <div className="h-4 bg-bg-tertiary/60 rounded-lg w-5/6 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-4 bg-bg-tertiary/40 rounded-lg w-4/6 animate-pulse" style={{ animationDelay: '300ms' }} />
              <div className="h-4 bg-bg-tertiary/30 rounded-lg w-3/6 animate-pulse" style={{ animationDelay: '450ms' }} />
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-bg-tertiary/25 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-5 rounded-xl border border-risk-critical/30 bg-risk-critical/5 text-sm text-risk-critical flex items-start gap-3 relative z-10">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Gagal memuat AI briefing:</p>
              <p className="opacity-90 mt-1 text-xs">{error}</p>
              <button
                onClick={() => handleGenerate(focus, language, model)}
                className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold bg-risk-critical/10 hover:bg-risk-critical/20 border border-risk-critical/30 transition-colors cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {brief && !loading && (
          <div className="space-y-6 relative z-10 animate-fade-in">
            {/* Headline Banner */}
            <div className="p-5 rounded-xl bg-bg-tertiary/60 border border-border-subtle flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-chart-1 mb-1">
                  Executive Headline
                </p>
                <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                  {brief.headline}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="risk-badge risk-badge--elevated text-xs">
                  Rating: {brief.riskRating}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-card hover:bg-bg-card-hover border border-border-primary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-risk-low" />
                      <span className="text-risk-low">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Brief</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-5 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Ringkasan Eksekutif
              </p>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {brief.executiveSummary}
              </p>
            </div>

            {/* Key Risk Drivers Grid */}
            {brief.keyDrivers && brief.keyDrivers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-chart-1" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Faktor Pendorong Risiko Utama
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {brief.keyDrivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-bg-tertiary/40 border border-border-subtle flex flex-col justify-between space-y-2 hover:border-border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-text-primary">
                          {driver.title}
                        </p>
                        <span
                          className={clsx(
                            'text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0',
                            getImpactBadgeClass(driver.impact)
                          )}
                        >
                          {driver.impact}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {driver.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corporate Risk Insight Box */}
            {brief.corporateRiskNote && (
              <div className="p-4 rounded-xl border border-chart-4/30 bg-chart-4/5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-chart-4">
                      Koneksi ke 43 Parameter Profil Risiko Korporasi
                    </p>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {brief.corporateRiskNote}
                    </p>
                  </div>
                </div>
                <Link
                  href="/risk-profile/ringkasan"
                  className="flex items-center gap-1 text-xs font-bold text-chart-4 hover:underline shrink-0"
                >
                  <span>Buka Profil Risiko</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Two Column: Critical Watchpoints & Strategic Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Watchpoints */}
              <div className="p-5 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="w-4.5 h-4.5 text-chart-5" />
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Critical Watchpoints
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {brief.criticalWatchpoints.map((wp, idx) => (
                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-1.5 shrink-0" />
                      <span className="leading-snug">{wp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Actions */}
              <div className="p-5 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-risk-low" />
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Rekomendasi Aksi Strategis
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {brief.strategicActions.map((action, idx) => (
                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                      <span className="leading-snug">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer: Model & Timestamp */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-text-muted border-t border-border-subtle/50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3 h-3" />
                  Model aktif:{' '}
                  <span className="font-semibold text-text-secondary">
                    {MODEL_OPTIONS.find((m) => m.key === activeModelName)?.label || activeModelName}
                  </span>
                </span>
                <span className="text-border-primary">·</span>
                <span>
                  Terakhir:{' '}
                  {generatedAt
                    ? new Date(generatedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }) + ' WIB'
                    : 'Baru saja'}
                </span>
              </div>
              <span className="italic">
                Disclaimer: AI-generated analysis. Verify with primary data sources.
              </span>
            </div>
          </div>
        )}

        {/* Empty State (no brief and not loading) */}
        {!brief && !loading && !error && (
          <div className="py-16 text-center relative z-10">
            <Sparkles className="w-12 h-12 mx-auto text-chart-1/40 mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Siap Menghasilkan AI Briefing
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              Pilih model AI, fokus analisis, dan bahasa, lalu klik &quot;Generate Brief&quot; untuk menghasilkan ringkasan eksekutif.
            </p>
            <button
              onClick={() => handleGenerate(focus, language, model)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 shadow-glow-blue transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Brief Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
