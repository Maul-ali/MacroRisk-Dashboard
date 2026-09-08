'use client';

import React, { useState } from 'react';
import { ExternalLink, MapPin, Tag, Sparkles } from 'lucide-react';
import type { NewsArticle } from '@/lib/data/types';
import ArticleQuickSummaryModal from './ArticleQuickSummaryModal';

interface NewsGridWithSummaryProps {
  articles: NewsArticle[];
}

export default function NewsGridWithSummary({ articles }: NewsGridWithSummaryProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleOpenSummary = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setSummaryData(null);
    setSummaryError(null);
    setLoadingSummary(true);

    try {
      const res = await fetch('/api/ai/news-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          language: 'id',
          articleTitle: article.title,
          articleText: article.summary,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setSummaryData(json.data);
      } else {
        throw new Error('Format balasan AI tidak valid');
      }
    } catch (e: any) {
      console.error('Failed to summarize article:', e);
      setSummaryError(e.message || 'Gagal memuat ringkasan artikel.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
        {articles.map((article) => (
          <div
            key={article.id}
            className="glass-card p-5 hover:bg-bg-card-hover transition-all group flex flex-col justify-between"
          >
            <div>
              {/* Top metadata */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="text-xs text-text-muted font-medium truncate max-w-[150px]">
                    {article.region}
                  </span>
                  <span className="text-text-muted">·</span>
                  <span className="text-xs text-text-muted shrink-0">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1 border border-chart-1/20">
                    {article.relevanceScore}%
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-text-primary mb-2 leading-snug">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-chart-1 transition-colors inline-block"
                >
                  {article.title}
                </a>
              </h3>

              {/* Summary */}
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                {article.summary}
              </p>
            </div>

            {/* Bottom bar */}
            <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 mt-auto">
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-bg-tertiary text-text-muted"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* AI Quick Summary Trigger */}
                <button
                  onClick={() => handleOpenSummary(article)}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-chart-1/10 text-chart-1 hover:bg-chart-1/20 font-medium transition-colors border border-chart-1/20"
                  title="Ringkas dengan AI"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ringkas AI</span>
                </button>

                {/* Direct Source Link */}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                >
                  <span className="truncate max-w-[120px]">{article.source}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary Modal */}
      <ArticleQuickSummaryModal
        article={selectedArticle}
        summaryData={summaryData}
        isLoading={loadingSummary}
        error={summaryError}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}
