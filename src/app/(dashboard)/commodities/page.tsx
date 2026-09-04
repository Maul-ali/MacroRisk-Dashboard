import PageHeader from '@/components/shared/PageHeader';
import CommoditiesView from '@/components/commodities/CommoditiesView';
import { getAllIndicators } from '@/lib/data/indicators';

export default async function CommoditiesPage() {
  const allIndicators = await getAllIndicators();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commodities"
        subtitle="Full commodity price board — click a row to view its historical price chart"
      />

      <CommoditiesView indicators={allIndicators} />
    </div>
  );
}
