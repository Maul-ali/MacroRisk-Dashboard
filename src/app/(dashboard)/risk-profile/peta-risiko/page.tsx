'use client';

import { Info } from 'lucide-react';
import RiskMapCanvas from '@/components/risk-map/RiskMapCanvas';
import { DIAGRAM_NODES, DIAGRAM_EDGES } from '@/lib/data/riskProfileData';

export default function PetaRisikoPage() {
  const totalNodes = DIAGRAM_NODES.length;
  const totalEdges = DIAGRAM_EDGES.length;

  return (
    <div className="space-y-4">
      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1">
              Enterprise Risk Management · Peta Hubungan Kausal
            </p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Peta Risiko
            </h1>
            <p className="mt-0.5 text-xs text-text-secondary max-w-3xl">
              Diagram alur interaktif hubungan kausal parameter risiko (Market &amp; Operational)
              ke 5 dimensi outcome bisnis (Produksi, Revenue, Biaya Produksi, Margin, Arus Kas Operasi).
            </p>
          </div>
        </div>
      </div>

      {/* ── Disclaimer & Summary Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-tertiary/30 text-xs text-text-muted animate-fade-in">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span>
            Hubungan kausal ini adalah asumsi berdasarkan business logic untuk validasi desain, bukan hasil model statistik.
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
          <span>
            <strong className="text-text-primary">{totalNodes}</strong> parameter/faktor
          </span>
          <span>·</span>
          <span>
            <strong className="text-text-primary">{totalEdges}</strong> relasi kausal
          </span>
          <span>·</span>
          <span>
            <strong className="text-text-primary">5</strong> dimensi bisnis
          </span>
        </div>
      </div>

      {/* ── Interactive Node-Link Canvas ── */}
      <RiskMapCanvas />
    </div>
  );
}
