import PageHeader from '@/components/shared/PageHeader';
import { getNewsArticles } from '@/lib/data/indicators';
import { ExternalLink, MapPin, Tag } from 'lucide-react';
import { clsx } from 'clsx';

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Intelligence"
        subtitle="Geopolitical and energy events feeding the risk score"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
        {articles.map((article) => (
          <div
            key={article.id}
            className="glass-card p-5 hover:bg-bg-card-hover transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs text-text-muted font-medium">
                  {article.region}
                </span>
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-muted">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1">
                  {article.relevanceScore}%
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-text-primary mb-2 leading-snug group-hover:text-text-accent transition-colors">
              {article.title.replace(/<[^>]+>/g, '').replace(/https?:\/\/[^\s]+/g, '').trim()}
            </h3>

            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              {article.summary.replace(/<[^>]+>/g, '').replace(/href=["'][^"']*["']/g, '').replace(/https?:\/\/[^\s]+/g, '').trim()}
            </p>

            <div className="flex items-center justify-between">
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
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                {article.source}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
