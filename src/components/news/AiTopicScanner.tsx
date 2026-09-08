'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Flame, Compass, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';

interface TrendingTopic {
  name: string;
  status: 'Trending' | 'Escalating' | 'Active';
  relevance: string;
  searchQuery: string;
}

interface TopicGroup {
  group: string;
  urgency: 'Critical' | 'High' | 'Moderate';
  description: string;
  topics: TrendingTopic[];
}

interface TrendingResponse {
  scannedAt: string;
  totalTrendingCount: number;
  summary: string;
  groups: TopicGroup[];
}

export default function AiTopicScanner() {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/trending-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        throw new Error('Format balasan AI tidak valid');
      }
    } catch (e: any) {
      console.error('Failed to scan trending topics:', e);
      setError(e.message || 'Gagal memindai topik trending.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyStyles = {
    Critical: 'bg-risk-critical/15 text-risk-critical border-risk-critical/30',
    High: 'bg-risk-high/15 text-risk-high border-risk-high/30',
    Moderate: 'bg-risk-elevated/15 text-risk-elevated border-risk-elevated/30',
  };

  return (
    <div className="glass-card p-6 border border-chart-1/30 relative overflow-hidden bg-gradient-to-br from-chart-1/5 via-bg-card to-bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-chart-1/15 border border-chart-1/30 flex items-center justify-center text-chart-1">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">
                AI Trending Macro Topics Explorer
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-chart-1/15 text-chart-1 border border-chart-1/30">
                Gemini 3.6
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Pindai otomatis risiko global & geohazard terkini (gunung api, selat maritim, kuota pupuk, gas)
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-chart-1 hover:bg-chart-1/90 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Memindai Lanskap Risiko...' : data ? 'Pindai Ulang dengan AI' : 'Pindai Topik Trending dengan AI'}</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-risk-critical/10 border border-risk-critical/30 text-risk-critical text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-text-secondary max-w-lg mx-auto">
            Gunakan model AI Gemini untuk menganalisis dinamika risiko global secara real-time dan menghasilkan rekomendasi kata kunci pemantauan terbaru (termasuk erupsi gunung api aktif, choke-points pelayaran, dan fluktuasi harga gas).
          </p>
        </div>
      )}

      {loading && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-chart-1 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted">Menganalisis sinyal intelijen & tren makro global...</p>
        </div>
      )}

      {data && !loading && (
        <div className="mt-5 space-y-5 animate-fade-in">
          {/* Summary Box */}
          <div className="p-3.5 rounded-lg bg-bg-tertiary/40 border border-border/40 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Ringkasan AI: </span>
            {data.summary}
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.groups.map((group, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-bg-tertiary/30 border border-border/40 hover:border-border transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-text-primary">{group.group}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        urgencyStyles[group.urgency] || urgencyStyles.Moderate
                      }`}
                    >
                      {group.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="space-y-2">
                    {group.topics.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2 rounded-lg bg-bg-primary/50 border border-border/30 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-medium text-text-primary text-[11px] leading-tight">
                            {t.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-chart-1/10 text-chart-1 font-semibold shrink-0">
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-tight mb-1.5">
                          {t.relevance}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-chart-1 font-mono bg-bg-tertiary px-1.5 py-0.5 rounded truncate">
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{t.searchQuery}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border/30">
                  <Link
                    href="/news"
                    className="text-[11px] text-chart-1 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Cari di Berita Langsung</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-text-muted text-right">
            Terakhir dipindai:{' '}
            {new Date(data.scannedAt).toLocaleDateString('id-ID', {
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
