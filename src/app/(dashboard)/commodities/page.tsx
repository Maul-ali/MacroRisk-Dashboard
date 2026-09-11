import PageHeader from '@/components/shared/PageHeader';
import CommoditiesView from '@/components/commodities/CommoditiesView';
import CommodityIndexChart from '@/components/commodities/CommodityIndexChart';
import { getAllIndicators } from '@/lib/data/indicators';
import { getHistorySeriesForIndicators } from '@/lib/db/indicatorHistory';

export const dynamic = 'force-dynamic';

const COMMODITY_CATEGORIES = ['Energy', 'Raw Material', 'Fertilizer'];

export default async function CommoditiesPage() {
  const allIndicators = await getAllIndicators();

  // Phase 3: Query recorded live history from Neon DB for commodity indicators
  const commodityIds = allIndicators
    .filter((ind) => COMMODITY_CATEGORIES.includes(ind.category))
    .map((ind) => ind.id);

  const liveHistoryMap = await getHistorySeriesForIndicators(commodityIds);

  // Merge live history into indicator history, falling back to static history for indicators with no live rows
  const enrichedIndicators = allIndicators.map((ind) => {
    const livePoints = liveHistoryMap.get(ind.id);
    if (!livePoints || livePoints.length === 0) {
      // No live database rows (e.g. fertilizers, sulfur, acids) — keep static fallback history
      return ind;
    }

    const earliestLiveDate = livePoints[0].date;

    // Retain baseline historical points that predate live tracking
    const baselineHistory = (ind.history || []).filter(
      (pt) => pt.date < earliestLiveDate
    );

    // Combine baseline + recorded live ticks from Neon
    const combinedHistory = [...baselineHistory, ...livePoints];

    // Ensure the latest point reflects the current live value
    const todayStr = new Date().toISOString().split('T')[0];
    const lastPoint = combinedHistory[combinedHistory.length - 1];
    if (lastPoint && lastPoint.date !== todayStr) {
      combinedHistory.push({
        date: todayStr,
        value: ind.value,
      });
    } else if (lastPoint) {
      lastPoint.value = ind.value;
    }

    return {
      ...ind,
      history: combinedHistory,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commodities"
        subtitle="Full commodity price board — click a row to view its historical price chart"
      />

      <CommoditiesView indicators={enrichedIndicators} />
      <CommodityIndexChart indicators={enrichedIndicators} />
    </div>
  );
}
