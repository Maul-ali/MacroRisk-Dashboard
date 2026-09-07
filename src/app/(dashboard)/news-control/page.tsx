import PageHeader from '@/components/shared/PageHeader';
import { getNewsArticles } from '@/lib/data/indicators';
import { Radio, Clock, Database, Shield, Tag, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TRACKED_TOPICS = [
  {
    group: 'Geopolitics',
    topics: ['Hormuz', 'Middle East', 'Iran-Israel', 'Russia-Ukraine', 'Sanctions'],
  },
  {
    group: 'Strategic Waterways',
    topics: ['Red Sea', 'Bab el-Mandeb', 'Suez', 'Black Sea', 'Malacca'],
  },
  {
    group: 'Economics',
    topics: ['Global Economy', 'Recession', 'Inflation', 'Rates', 'Trade Wars'],
  },
  {
    group: 'FI-Specific',
    topics: ['Urea', 'Ammonia', 'Natural Gas', 'Sulfur/Phosphate', 'Rupiah'],
  },
];

export default async function NewsControlPage() {
  const articles = await getNewsArticles();

  // Aggregate source counts dynamically
  const sourceCounts: Record<string, number> = {};
  articles.forEach((a) => {
    sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
  });

  const latestPublished =
    articles.length > 0
      ? new Date(articles[0].publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now';

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Data Control"
        subtitle="Ingestion pipeline, retention policy, source health, and topic tracking"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-4 h-4 text-chart-1" />
            <span className="text-xs text-text-muted font-medium">Active Articles</span>
          </div>
          <div className="text-2xl font-bold text-text-primary tabular-nums">{articles.length}</div>
          <div className="text-xs text-text-muted mt-1">Live from verified news feeds</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-4 h-4 text-chart-4" />
            <span className="text-xs text-text-muted font-medium">Ingestion Schedule</span>
          </div>
          <div className="text-lg font-bold text-text-primary">Continuous (SWR)</div>
          <div className="text-xs text-text-muted mt-1">Auto 30m · Manual on click</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-4 h-4 text-chart-5" />
            <span className="text-xs text-text-muted font-medium">Latest Ingestion</span>
          </div>
          <div className="text-lg font-bold text-text-primary tabular-nums">{latestPublished}</div>
          <div className="text-xs text-text-muted mt-1">Synced to Live Store</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-4 h-4 text-chart-2" />
            <span className="text-xs text-text-muted font-medium">Retention</span>
          </div>
          <div className="text-lg font-bold text-text-primary">180 days</div>
          <div className="text-xs text-text-muted mt-1">Max 100 articles</div>
        </div>
      </div>

      {/* Source Health */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">Live Source Health & Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-xs text-risk-low font-semibold mb-2 uppercase tracking-wider">Active Feeds</h4>
            <div className="space-y-2">
              {Object.entries(sourceCounts).map(([src, count]) => (
                <div key={src} className="flex items-center justify-between p-2 rounded-lg bg-risk-low/5">
                  <span className="text-sm text-text-secondary truncate max-w-[180px]">{src}</span>
                  <span className="text-xs font-semibold text-risk-low tabular-nums">{count} articles</span>
                </div>
              ))}
              {Object.keys(sourceCounts).length === 0 && (
                <div className="p-2 rounded-lg bg-risk-low/5">
                  <span className="text-sm text-text-secondary">UN News & Energy Wires</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-risk-elevated font-semibold mb-2 uppercase tracking-wider">Monitored Ingestion</h4>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-risk-elevated/5 flex items-center justify-between">
                <span className="text-sm text-text-secondary">Google News / RSS</span>
                <span className="text-xs text-risk-elevated font-medium">Active</span>
              </div>
              <div className="p-2 rounded-lg bg-risk-elevated/5 flex items-center justify-between">
                <span className="text-sm text-text-secondary">U.S. EIA News</span>
                <span className="text-xs text-risk-elevated font-medium">Active</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs text-text-muted font-semibold mb-2 uppercase tracking-wider">Planned Feeds</h4>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-bg-tertiary/50 flex items-center justify-between">
                <span className="text-sm text-text-muted">BPS Berita Resmi</span>
                <span className="text-xs text-text-muted">Pending</span>
              </div>
              <div className="p-2 rounded-lg bg-bg-tertiary/50 flex items-center justify-between">
                <span className="text-sm text-text-muted">USDA AMS Direct</span>
                <span className="text-xs text-text-muted">PDF Scraper</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracked Topics */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tracked Topics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRACKED_TOPICS.map((group) => (
            <div key={group.group}>
              <h4 className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                {group.group}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {group.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 rounded text-xs font-medium bg-bg-tertiary text-text-secondary hover:bg-bg-card-hover transition-colors"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Rules */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Quality Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-secondary">
          <div className="flex items-start gap-2">
            <span className="text-risk-low mt-0.5">✓</span>
            <span>Real-time continuous sync via Stale-While-Revalidate</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-risk-low mt-0.5">✓</span>
            <span>Official-domain + clickable original-URL verification</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-risk-low mt-0.5">✓</span>
            <span>Automated geographic and fertilizer relevance scoring</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-risk-low mt-0.5">✓</span>
            <span>Unified one-click refresh connected to live market indicators</span>
          </div>
        </div>
      </div>
    </div>
  );
}
