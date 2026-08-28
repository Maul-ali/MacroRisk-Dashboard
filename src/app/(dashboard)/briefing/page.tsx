import PageHeader from '@/components/shared/PageHeader';
import { getCompositeRiskScore } from '@/lib/data/indicators';
import { FileText, AlertTriangle, TrendingUp, Shield, DollarSign, Globe } from 'lucide-react';

export default function BriefingPage() {
  const risk = getCompositeRiskScore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Brief"
        subtitle="AI-generated risk intelligence synthesis — management-facing narrative"
        badge={{ label: risk.label, variant: risk.label as 'Elevated' }}
      />

      {/* Brief Card */}
      <div className="glass-card p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-risk-elevated/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-risk-elevated" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Mac
            </h2>
            <p className="text-xs text-text-muted">
              Generated Aug 24, 2026, 10:34 WIB · Formula v1.3
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-risk-elevated/5 border border-risk-elevated/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-risk-elevated" />
              <span className="font-semibold text-risk-elevated text-xs uppercase tracking-wider">
                Summary Assessment
              </span>
            </div>
            <p>
              The FI Macro Risk Score stands at <strong className="text-text-primary">67/100 (Elevated)</strong>,
              up 4 points from the previous period. Energy and fertilizer markets are the main
              pressure points. Domestic conditions remain relatively stable, partially offsetting
              external headwinds.
            </p>
          </div>

          {/* Energy Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-risk-high" />
              <h3 className="font-semibold text-text-primary">
                Energy & Feedstock (Score: 78)
              </h3>
            </div>
            <p>
              Brent crude surged <strong className="text-risk-critical">+37.6%</strong> over the past month to $95.29/bbl,
              the single largest contributor to the composite score (+2.4 pts). WTI followed at +22.6%.
              Henry Hub natural gas declined -15.6%, providing mild relief on gas-based production costs.
              Middle East tensions (Yemen, Houthi Red Sea disruptions, Iran-US Strait of Hormuz concerns)
              continue to drive shipping risk premiums higher.
            </p>
          </div>

          {/* Fertilizer Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-chart-2" />
              <h3 className="font-semibold text-text-primary">
                Fertilizer Market (Score: 72)
              </h3>
            </div>
            <p>
              Urea dropped <strong className="text-risk-low">-31.6%</strong> to $389.88/st, a notable correction.
              Despite this, the category remains at High score due to elevated DAP ($783.75/st) and
              Ammonia ($775/mt) pricing. Phosphate rock is the only Critical-band item at $170/mt (+8.5%).
              All fertilizer price data is sourced from USDA AMS/Green Markets and currently marked Stale
              — manual verification is recommended.
            </p>
          </div>

          {/* FX Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-chart-1" />
              <h3 className="font-semibold text-text-primary">
                FX & Financial (Score: 63)
              </h3>
            </div>
            <p>
              USD/IDR at 17,705 (-0.4%), within the Guarded band. The combination of rising energy
              costs and a weakening rupiah creates an input-cost inflation risk that has been flagged
              for internal validation. VIX at 15.13 (-2.8%) and USD Broad Index at 118.9 (-1.7%)
              suggest reduced global volatility, partially offsetting FX concerns.
            </p>
          </div>

          {/* Geopolitics */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-chart-4" />
              <h3 className="font-semibold text-text-primary">
                Global Macro & Geopolitics (Score: 61)
              </h3>
            </div>
            <p>
              Key geopolitical risks: Red Sea shipping disruptions (Houthi-related), Iran-US tensions
              affecting Strait of Hormuz passage, and ongoing Russia-Ukraine conflict maintaining
              uncertainty in Black Sea grain/fertilizer corridors. China crude imports down in Q2 2026
              may ease global oil competition but signals broader demand softening. US record LNG exports
              are reshaping global energy trade flows.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-border-primary text-xs text-text-muted">
            <p>
              ⚠️ This brief synthesizes Energy/Feedstock, Fertilizer Market, FX, Domestic Macro,
              and material news signals. Rising energy costs + weakening rupiah = input-cost inflation
              risk has been flagged for internal validation. Data freshness: 71% live (4 Fresh, 0 Partial,
              12 Stale). Formula v1.3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
