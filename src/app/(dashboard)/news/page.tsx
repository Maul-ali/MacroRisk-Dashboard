import PageHeader from '@/components/shared/PageHeader';
import { getNewsArticles } from '@/lib/data/indicators';
import NewsDigestCard from '@/components/news/NewsDigestCard';
import NewsGridWithSummary from '@/components/news/NewsGridWithSummary';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Intelligence"
        subtitle="Geopolitical, volcanic geohazards, and energy events feeding the risk score"
      />

      {/* AI Macro News Intelligence Digest */}
      <NewsDigestCard />

      {/* Live Articles Grid with Quick AI Summary */}
      <NewsGridWithSummary articles={articles} />
    </div>
  );
}

