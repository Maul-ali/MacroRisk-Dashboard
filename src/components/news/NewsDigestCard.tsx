'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Flame,
  Ship,
  TrendingDown,
  Globe,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface DigestData {
  headline: string;
  executiveSummary: string;
  keyRisks: Array<{
    category: string;
    severity: 'Critical' | 'High' | 'Elevated';
    summary: string;
  }>;
  commodityImpact: {
    naturalGas: string;
    ureaAndAmmonia: string;
    sulfurAndPhosphate: string;
    logisticsAndShipping: string;
  };
  recommendedActions: string[];
  synthesizedAt: string;
}

export default function NewsDigestCard() {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load from local storage cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`fi_news_digest_${language}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Cache valid for 3 hours
        if (parsed.synthesizedAt && Date.now() - new Date(parsed.synthesizedAt).getTime() < 10800000) {
          setDigest(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [language]);

  const handleGenerate = async (forceLang?: 'id' | 'en') => {
    const activeLang = forceLang || language;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/news-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'digest', language: activeLang }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setDigest(json.data);
        localStorage.setItem(`fi_news_digest_${activeLang}`, JSON.stringify(json.data));
      }
    } catch (e: any) {
      console.error('Failed to generate news digest:', e);
      setError(e.message || 'Gagal menghasilkan ringkasan AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (newLang: 'id' | 'en') => {
    setLanguage(newLang);
    handleGenerate(newLang);
  };

  return (
    <div className="glass-card p-6 border border-chart-1/30 relative overflow-hidden bg-gradient-to-br from-chart-1/5 via-bg-card to-bg-card">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-chart-1/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-chart-1/15 border border-chart-1/30 flex items-center justify-center text-chart-1 shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">
                {language === 'id' ? 'Ringkasan Intelijen Berita Makro (AI)' : 'AI Macro News Intelligence Digest'}
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-chart-1/15 text-chart-1 border border-chart-1/30">
                Gemini 3.6
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {language === 'id'
                ? 'Sintesis otomatis berita global: transmisi harga gas, geohazard gunung api, logistik maritim & pupuk'
                : 'Automated synthesis across active feeds: gas prices, volcanic geohazards, shipping chokepoints & fertilizer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center rounded-lg bg-bg-tertiary p-0.5 border border-border/50 text-xs">
            <button
              onClick={() => handleLangChange('id')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                language === 'id'
                  ? 'bg-chart-1 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => handleLangChange('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                language === 'en'
                  ? 'bg-chart-1 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              EN
            </button>
          </div>

          {/* Action button */}
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chart-1 hover:bg-chart-1/90 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading
                ? language === 'id'
                  ? 'Menyintesis Berita...'
                  : 'Synthesizing...'
                : digest
                ? language === 'id'
                  ? 'Perbarui Sintesis'
                  : 'Refresh Digest'
                : language === 'id'
                ? 'Ringkas Berita Terkini'
                : 'Generate Digest'}
            </span>
          </button>

          {digest && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-card-hover text-text-muted transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-risk-critical/10 border border-risk-critical/30 text-risk-critical text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial empty state */}
      {!digest && !loading && !error && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-xs text-text-secondary max-w-md">
            {language === 'id'
              ? 'Klik tombol "Ringkas Berita Terkini" untuk menyintesis seluruh artikel aktif (erupsi gunung api, selat Hormuz/Laut Merah, pasokan gas, dan harga pupuk) ke dalam ringkasan eksekutif C-Level.'
              : 'Click "Generate Digest" to synthesize all active live feeds (volcanic events, Hormuz/Red Sea routes, natural gas supplies, and fertilizer prices) into an executive-ready brief.'}
          </p>
          <button
            onClick={() => handleGenerate()}
            className="px-4 py-2 rounded-lg bg-chart-1 text-white text-xs font-semibold shadow hover:bg-chart-1/90 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'id' ? 'Ringkas Berita Terkini dengan AI' : 'Synthesize Live News with AI'}</span>
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !digest && (
        <div className="py-8 space-y-4 animate-pulse">
          <div className="h-6 bg-chart-1/10 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-bg-tertiary rounded w-full" />
            <div className="h-4 bg-bg-tertiary rounded w-5/6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-tertiary/50 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Populated Content */}
      {digest && isExpanded && (
        <div className="mt-5 space-y-5 animate-fade-in relative z-10">
          {/* Executive Headline */}
          <div className="p-4 rounded-xl bg-chart-1/10 border border-chart-1/30">
            <div className="text-[11px] font-bold text-chart-1 uppercase tracking-wider mb-1">
              {language === 'id' ? 'Sorotan Utama Eksekutif' : 'Executive Key Highlight'}
            </div>
            <h3 className="text-sm md:text-base font-bold text-text-primary leading-snug">
              {digest.headline}
            </h3>
          </div>

          {/* Executive Situation Summary */}
          <div className="text-xs text-text-secondary leading-relaxed space-y-2 bg-bg-tertiary/30 p-4 rounded-xl border border-border/30">
            <p className="whitespace-pre-line">{digest.executiveSummary}</p>
          </div>

          {/* Key Risks Breakdown */}
          {digest.keyRisks && digest.keyRisks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-chart-4" />
                {language === 'id' ? 'Fokus Ancaman Makro & Geohazard' : 'Emerging Macro & Geohazard Threats'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {digest.keyRisks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-bg-tertiary/40 border border-border/40 hover:border-border transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-text-primary">{risk.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          risk.severity === 'Critical'
                            ? 'bg-risk-critical/15 text-risk-critical border-risk-critical/30'
                            : risk.severity === 'High'
                            ? 'bg-risk-high/15 text-risk-high border-risk-high/30'
                            : 'bg-risk-elevated/15 text-risk-elevated border-risk-elevated/30'
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{risk.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commodity & Supply Chain Impact Matrix */}
          {digest.commodityImpact && (
            <div>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-chart-1" />
                {language === 'id' ? 'Matriks Transmisi Komoditas & Logistik' : 'Commodity & Logistics Transmission Matrix'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-bg-tertiary/30 border border-border/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-chart-4 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    Gas Alam / Feedstock
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {digest.commodityImpact.naturalGas}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-tertiary/30 border border-border/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-chart-1 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    Urea & Ammonia
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {digest.commodityImpact.ureaAndAmmonia}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-tertiary/30 border border-border/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-chart-5 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    Sulfur & Fosfat
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {digest.commodityImpact.sulfurAndPhosphate}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-tertiary/30 border border-border/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-chart-2 mb-1">
                    <Ship className="w-3.5 h-3.5" />
                    Logistik & Rute Kapal
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {digest.commodityImpact.logisticsAndShipping}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prioritized Operational Actions */}
          {digest.recommendedActions && digest.recommendedActions.length > 0 && (
            <div className="p-4 rounded-xl bg-chart-1/5 border border-chart-1/20">
              <h4 className="text-xs font-bold text-chart-1 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {language === 'id' ? 'Rekomendasi Tindakan Strategis Direksi' : 'Board Strategic Recommendations'}
              </h4>
              <ul className="space-y-2">
                {digest.recommendedActions.map((act, i) => (
                  <li key={i} className="text-xs text-text-primary flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-chart-1 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-text-muted text-right">
            {language === 'id' ? 'Disintesis pada: ' : 'Synthesized at: '}
            {new Date(digest.synthesizedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      )}
    </div>
  );
}
