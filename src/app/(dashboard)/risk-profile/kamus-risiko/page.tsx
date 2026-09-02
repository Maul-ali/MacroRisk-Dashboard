'use client';

import { Info, BookOpen } from 'lucide-react';
import { TAXONOMY_ORDER, RISK_PROFILE } from '@/lib/data/riskProfileData';

// ─── Glossary Definitions ───

const DEFINITIONS = [
  {
    term: 'Risk Appetite',
    id: 'appetite',
    color: 'var(--chart-4)',
    definitionId: 'Tingkat dan jenis risiko yang bersedia diterima perusahaan untuk mencapai tujuan strategis.',
    definitionEn: 'The level and type of risk a company is willing to accept to achieve strategic goals.',
  },
  {
    term: 'Risk Tolerance',
    id: 'tolerance',
    color: 'var(--risk-elevated)',
    definitionId: 'Variasi yang dapat diterima dari risk appetite sebelum diperlukan respons atau eskalasi tambahan.',
    definitionEn: 'The acceptable variation from risk appetite before additional response or escalation is needed.',
  },
  {
    term: 'Risk Limit',
    id: 'limit',
    color: 'var(--risk-low)',
    definitionId: 'Batas operasional untuk menjaga eksposur risiko tetap dalam koridor yang disetujui.',
    definitionEn: 'Operational boundaries to keep risk exposure within the approved corridor.',
  },
  {
    term: 'Trigger Level',
    id: 'trigger',
    color: 'var(--risk-critical)',
    definitionId: 'Nilai yang memerlukan eskalasi atau tindakan korektif.',
    definitionEn: 'A value that requires escalation or corrective action.',
  },
  {
    term: 'Parameter Risiko',
    id: 'parameter',
    color: 'var(--chart-1)',
    definitionId: 'Ukuran spesifik yang dipantau untuk menilai perubahan eksposur risiko.',
    definitionEn: 'A specific measure monitored to assess changes in risk exposure.',
  },
  {
    term: 'Key Risk Indicator (KRI)',
    id: 'kri',
    color: 'var(--chart-2)',
    definitionId: 'Sinyal peringatan dini untuk perubahan risiko.',
    definitionEn: 'An early warning signal for risk changes.',
  },
];

// ─── Taxonomy Descriptions ───

const TAXONOMY_DESCRIPTIONS: Record<string, string> = {
  'Strategic Risk':
    'Kegagalan mencapai tujuan strategis akibat keputusan, perencanaan, eksekusi, atau perubahan lingkungan bisnis.',
  'Market and Macroeconomic Risk':
    'Risiko dari perubahan harga pasar, nilai tukar, inflasi, pertumbuhan ekonomi, kompetisi, dan kondisi perdagangan global.',
  'Financial Risk':
    'Risiko yang memengaruhi profitabilitas, arus kas, likuiditas, struktur pendanaan, dan kemampuan memenuhi kewajiban keuangan.',
  'Credit/Counterparty Risk':
    'Risiko kerugian ketika pelanggan, mitra, atau counterparty gagal memenuhi kewajiban mereka.',
  'Operational Risk':
    'Risiko dari kegagalan proses, orang, sistem, fasilitas, rantai pasok, keselamatan, atau kejadian eksternal yang mengganggu operasi.',
  'Investment/Project Risk':
    'Risiko investasi atau proyek tidak memenuhi target biaya, waktu, kualitas, manfaat, dan return yang disepakati.',
  'Reputational Risk':
    'Risiko menurunnya kepercayaan stakeholder akibat persepsi, berita, perilaku, atau kinerja perusahaan.',
  'Regulatory, Legal & Compliance Risk':
    'Risiko dari ketidakpatuhan terhadap regulasi, kontrak, standar, tata kelola, dan kewajiban hukum.',
};

export default function KamusRisikoPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1.5">
            Enterprise Risk Management · Referensi
          </p>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Kamus Risiko
          </h1>
          <p className="mt-1 text-sm text-text-secondary max-w-2xl">
            Glosarium ini menyelaraskan terminologi yang digunakan di seluruh
            tampilan ringkasan, threshold, dan parameter risiko.
          </p>
        </div>
      </div>

      {/* ── Definitions Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {DEFINITIONS.map((def) => (
          <div
            key={def.id}
            className="glass-card p-5 relative overflow-hidden group hover:shadow-lg transition-shadow"
          >
            {/* Left color accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ background: def.color }}
            />
            <div className="flex items-center gap-2 mb-3">
              <BookOpen
                className="w-4 h-4 shrink-0"
                style={{ color: def.color }}
              />
              <h3 className="text-sm font-bold text-text-primary">
                {def.term}
              </h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-2">
              {def.definitionId}
            </p>
            <p className="text-xs text-text-muted italic leading-relaxed">
              {def.definitionEn}
            </p>
          </div>
        ))}
      </div>

      {/* ── Risk Taxonomy Reference Table ── */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase mb-1">
            Referensi Taksonomi
          </p>
          <h3 className="text-base font-bold text-text-primary">
            8 Taksonomi Risiko
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th className="min-w-[200px]">Taksonomi</th>
                <th className="min-w-[320px]">Deskripsi</th>
                <th className="text-center w-24">Parameter</th>
              </tr>
            </thead>
            <tbody>
              {TAXONOMY_ORDER.map((taxonomy, idx) => {
                const row = RISK_PROFILE.taxonomyBreakdown.find(
                  (r) => r.taxonomy === taxonomy
                );
                const count = row?.total ?? 0;
                return (
                  <tr key={taxonomy}>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bg-tertiary text-xs font-bold text-text-muted">
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-text-primary">
                        {taxonomy}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-text-secondary leading-relaxed">
                        {TAXONOMY_DESCRIPTIONS[taxonomy]}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-md bg-bg-tertiary text-sm font-bold text-text-primary">
                        {count}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer Disclaimer ── */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-border-subtle bg-bg-tertiary/30 animate-fade-in">
        <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed italic">
          Definisi ini merupakan bagian dari prototype dan perlu diselaraskan dengan
          kebijakan manajemen risiko resmi Fertilizer Indo.
        </p>
      </div>
    </div>
  );
}
