'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
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
  ChevronDown,
  ChevronUp,
  Cpu,
  Bot,
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

const FOCUS_OPTIONS: { key: FocusArea; label: string }[] = [
  { key: 'all', label: 'Komprehensif' },
  { key: 'energy', label: 'Energi & Gas' },
  { key: 'fertilizer', label: 'Pasar Pupuk' },
  { key: 'fx', label: 'Kurs & Makro' },
  { key: 'corporate', label: 'Profil Risiko' },
];

const MODEL_OPTIONS: { key: ModelOption; label: string; provider: 'Google' | 'DeepSeek' }[] = [
  { key: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', provider: 'Google' },
  { key: 'deepseek-chat', label: 'DeepSeek Chat V3', provider: 'DeepSeek' },
  { key: 'deepseek-reasoner', label: 'DeepSeek R1 Reasoner', provider: 'DeepSeek' },
];

export default function AIBriefWidget() {
  const [focus, setFocus] = useState<FocusArea>('all');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [model, setModel] = useState<ModelOption>('gemini-3.6-flash');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<AIBriefData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>('gemini-3.6-flash');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

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
    <div
      className="glass-card p-6 relative overflow-hidden border border-border-primary shadow-lg transition-all animate-fade-in"
      style={{
        background:
          'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.04), var(--bg-card))',
      }}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-chart-1/10 to-transparent blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-chart-1 to-chart-2 flex items-center justify-center shadow-glow-blue text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">
                AI Executive Briefing
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-chart-1/15 text-chart-1 border border-chart-1/30 uppercase tracking-wider">
                <Bot className="w-2.5 h-2.5" />
                {MODEL_OPTIONS.find((m) => m.key === activeModelName)?.label || activeModelName}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Sintesis otomatis intelijen makro, komoditas energi, dan 43 parameter profil risiko korporasi.
            </p>
          </div>
        </div>

        {/* Controls: Model, Focus, Language & Generate */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1 bg-bg-tertiary/70 border border-border-primary rounded-xl px-2 py-1">
            <Cpu className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={model}
              onChange={(e) => {
                const newModel = e.target.value as ModelOption;
                setModel(newModel);
                handleGenerate(focus, language, newModel);
              }}
              disabled={loading}
              className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer pr-1"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.key} value={m.key} className="bg-bg-card text-text-primary">
                  {m.label} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Focus Pills */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-bg-tertiary/70 border border-border-subtle">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setFocus(opt.key);
                  handleGenerate(opt.key, language, model);
                }}
                disabled={loading}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50',
                  focus === opt.key
                    ? 'bg-bg-card text-text-primary shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => {
              const newLang = language === 'id' ? 'en' : 'id';
              setLanguage(newLang);
              handleGenerate(focus, newLang, model);
            }}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bg-tertiary/60 border border-border-primary text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Ganti Bahasa (ID / EN)"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Refresh / Generate Button */}
          <button
            onClick={() => handleGenerate(focus, language, model)}
            disabled={loading}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer',
              loading
                ? 'bg-bg-tertiary text-text-muted border border-border-primary'
                : 'bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 shadow-glow-blue'
            )}
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>{loading ? 'Menganalisis...' : 'Generate Brief'}</span>
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      {isExpanded && (
        <div className="mt-5 space-y-5 animate-fade-in">
          {/* Loading State */}
          {loading && (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center gap-3 text-sm text-text-muted">
                <Sparkles className="w-5 h-5 text-chart-1 animate-pulse" />
                <span className="font-medium animate-pulse">
                  {MODEL_OPTIONS.find((m) => m.key === model)?.label} sedang menganalisis {FOCUS_OPTIONS.find((f) => f.key === focus)?.label}...
                </span>
              </div>
              <div className="space-y-2 max-w-2xl mx-auto">
                <div className="h-4 bg-bg-tertiary/80 rounded-md animate-pulse" />
                <div className="h-4 bg-bg-tertiary/60 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-bg-tertiary/40 rounded-md w-4/6 animate-pulse" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-xl border border-risk-critical/30 bg-risk-critical/5 text-xs text-risk-critical flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Gagal memuat briefing otomatis:</p>
                <p className="opacity-90 mt-0.5">{error}</p>
                <button
                  onClick={() => handleGenerate(focus, language, model)}
                  className="mt-2 font-bold underline hover:opacity-80 cursor-pointer"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}

          {/* Loaded Content */}
          {brief && !loading && (
            <>
              {/* Headline Banner */}
              <div className="p-4 rounded-xl bg-bg-tertiary/60 border border-border-subtle flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[280px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-chart-1 mb-0.5">
                    Executive Headline
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-text-primary">
                    {brief.headline}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="risk-badge risk-badge--elevated text-xs">
                    Rating: {brief.riskRating}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-bg-card hover:bg-bg-card-hover border border-border-primary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-risk-low" />
                        <span className="text-risk-low">Tersalin</span>
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
              <div>
                <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {brief.executiveSummary}
                </p>
              </div>

              {/* Key Risk Drivers Grid */}
              {brief.keyDrivers && brief.keyDrivers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <TrendingUp className="w-4 h-4 text-chart-1" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Faktor Pendorong Risiko Utama
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brief.keyDrivers.map((driver, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-bg-tertiary/40 border border-border-subtle flex flex-col justify-between space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-text-primary">
                            {driver.title}
                          </p>
                          <span
                            className={clsx(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0',
                              getImpactBadgeClass(driver.impact)
                            )}
                          >
                            {driver.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          {driver.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Corporate Risk Insight Box */}
              {brief.corporateRiskNote && (
                <div className="p-3.5 rounded-xl border border-chart-4/30 bg-chart-4/5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-chart-4">
                        Koneksi ke 43 Parameter Profil Risiko Korporasi
                      </p>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                        {brief.corporateRiskNote}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/risk-profile/ringkasan"
                    className="flex items-center gap-1 text-[11px] font-bold text-chart-4 hover:underline shrink-0"
                  >
                    <span>Buka Profil Risiko</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Two Column: Critical Watchpoints & Strategic Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Watchpoints */}
                <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Compass className="w-4 h-4 text-chart-5" />
                    <h4 className="text-xs font-bold text-text-primary">
                      Critical Watchpoints (Pantauan Kunci)
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {brief.criticalWatchpoints.map((wp, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-1.5 shrink-0" />
                        <span className="leading-snug">{wp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strategic Actions */}
                <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-2.5">
                    <ShieldCheck className="w-4 h-4 text-risk-low" />
                    <h4 className="text-xs font-bold text-text-primary">
                      Rekomendasi Aksi Strategis
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {brief.strategicActions.map((action, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                        <span className="leading-snug">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Timestamp & Model Badge */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-muted border-t border-border-subtle/50">
                <span className="flex items-center gap-1.5">
                  <span>Model aktif:</span>
                  <span className="font-semibold text-text-secondary">
                    {MODEL_OPTIONS.find((m) => m.key === activeModelName)?.label || activeModelName}
                  </span>
                </span>
                <span>
                  Terakhir diperbarui:{' '}
                  {generatedAt
                    ? new Date(generatedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }) + ' WIB'
                    : 'Baru saja'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
