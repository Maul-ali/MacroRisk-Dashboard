'use client';

import React from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import type { NewsArticle } from '@/lib/data/types';

interface ArticleSummaryData {
  title: string;
  takeaways: string[];
  riskLevel: 'Low' | 'Elevated' | 'High' | 'Critical';
  affectedSectors: string[];
  actionableNote: string;
}

interface ArticleQuickSummaryModalProps {
  article: NewsArticle | null;
  summaryData: ArticleSummaryData | null;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
}

export default function ArticleQuickSummaryModal({
  article,
  summaryData,
  isLoading,
  error,
  onClose,
}: ArticleQuickSummaryModalProps) {
  if (!article) return null;

  const riskBadgeStyles = {
    Low: 'bg-risk-low/15 text-risk-low border-risk-low/30',
    Elevated: 'bg-risk-elevated/15 text-risk-elevated border-risk-elevated/30',
    High: 'bg-risk-high/15 text-risk-high border-risk-high/30',
    Critical: 'bg-risk-critical/15 text-risk-critical border-risk-critical/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="glass-card max-w-xl w-full border border-white/10 shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center text-chart-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">AI Executive Article Summary</h3>
              <p className="text-xs text-text-muted">High-precision macro risk synthesis via Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          <div>
            <h4 className="text-sm font-medium text-text-primary leading-snug mb-1">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{article.source}</span>
              <span>·</span>
              <span>{article.region}</span>
              <span>·</span>
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-chart-1 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-text-muted">Menganalisis dampak transmisi komoditas & risiko operasional...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-risk-critical/10 border border-risk-critical/30 text-risk-critical text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && summaryData && (
            <div className="space-y-4 animate-fade-in">
              {/* Risk level & sectors */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-bg-tertiary/40 border border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Tingkat Risiko:</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      riskBadgeStyles[summaryData.riskLevel] || riskBadgeStyles.Elevated
                    }`}
                  >
                    {summaryData.riskLevel} Risk
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {summaryData.affectedSectors.map((sec) => (
                    <span
                      key={sec}
                      className="text-[10px] px-2 py-0.5 rounded bg-bg-primary text-text-secondary border border-border/50 font-medium"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Takeaways */}
              <div>
                <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-chart-1" />
                  Poin Kunci Transmisi Risiko (Key Takeaways)
                </h5>
                <ul className="space-y-2">
                  {summaryData.takeaways.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-text-secondary leading-relaxed flex items-start gap-2 bg-bg-tertiary/20 p-2.5 rounded-md"
                    >
                      <span className="w-4 h-4 rounded-full bg-chart-1/10 text-chart-1 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Note */}
              <div className="p-3.5 rounded-lg bg-chart-1/10 border border-chart-1/20">
                <h5 className="text-xs font-semibold text-chart-1 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Rekomendasi Operasional Manajemen Risiko:
                </h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {summaryData.actionableNote}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-chart-1 hover:underline font-medium"
          >
            <span>Buka Berita Asli ({article.source})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-card-hover text-text-primary font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
