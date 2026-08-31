// ─── Corporate Risk Profile — Static Dummy Data ───
// Matches reference: "Data dummy tahap pertama · Periode Juni 2026"
// 43 parameters, composite score 1.588 PPR-2, status "Within Appetite"

// ─── Types ───

export type RiskStatus =
  | 'Within Limit'
  | 'Within Appetite'
  | 'Within Tolerance'
  | '> Tolerance'
  | '> Trigger Level';

export type RiskTaxonomy =
  | 'Strategic Risk'
  | 'Market and Macroeconomic Risk'
  | 'Financial Risk'
  | 'Credit/Counterparty Risk'
  | 'Operational Risk'
  | 'Investment/Project Risk'
  | 'Reputational Risk'
  | 'Regulatory, Legal & Compliance Risk';

export interface RiskParameter {
  id: string;
  name: string;
  taxonomy: RiskTaxonomy;
  status: RiskStatus;
  currentValue: string;
  period: string;
  appetiteThreshold?: string;
  toleranceThreshold?: string;
  limitThreshold?: string;
  triggerThreshold?: string;
}

export interface TaxonomyStatusRow {
  taxonomy: RiskTaxonomy;
  limit: number;
  appetite: number;
  tolerance: number;
  overTolerance: number;
  overTrigger: number;
  total: number;
}

export interface CorporateRiskProfile {
  score: number;
  scoreUnit: string;
  status: RiskStatus;
  period: string;
  totalParameters: number;
  statusCounts: {
    withinLimit: number;
    withinAppetite: number;
    withinTolerance: number;
    overTolerance: number;
    overTrigger: number;
  };
  taxonomyBreakdown: TaxonomyStatusRow[];
  parameters: RiskParameter[];
}

// ─── Status → Color / CSS helpers ───

export function getStatusColor(status: RiskStatus): string {
  switch (status) {
    case 'Within Limit':
      return 'var(--risk-low)';
    case 'Within Appetite':
      return 'var(--chart-4)';
    case 'Within Tolerance':
      return 'var(--risk-elevated)';
    case '> Tolerance':
      return 'var(--risk-high)';
    case '> Trigger Level':
      return 'var(--risk-critical)';
  }
}

export function getStatusBadgeClass(status: RiskStatus): string {
  switch (status) {
    case 'Within Limit':
      return 'risk-badge--limit';
    case 'Within Appetite':
      return 'risk-badge--appetite';
    case 'Within Tolerance':
      return 'risk-badge--tolerance';
    case '> Tolerance':
      return 'risk-badge--over-tolerance';
    case '> Trigger Level':
      return 'risk-badge--over-trigger';
  }
}

export function getStatusBgTint(status: RiskStatus): string {
  switch (status) {
    case 'Within Limit':
      return 'rgba(34, 197, 94, 0.06)';
    case 'Within Appetite':
      return 'rgba(20, 184, 166, 0.06)';
    case 'Within Tolerance':
      return 'rgba(245, 158, 11, 0.06)';
    case '> Tolerance':
      return 'rgba(249, 115, 22, 0.08)';
    case '> Trigger Level':
      return 'rgba(239, 68, 68, 0.08)';
  }
}

// ─── 43 Dummy Risk Parameters ───

const PARAMETERS: RiskParameter[] = [
  // ── Strategic Risk (1): 1 Within Limit ──
  {
    id: 'strat-01',
    name: 'Pencapaian Target Strategis Perusahaan',
    taxonomy: 'Strategic Risk',
    status: 'Within Limit',
    currentValue: '92.3%',
    period: 'Juni',
    appetiteThreshold: '≥ 85%',
    toleranceThreshold: '≥ 80%',
    limitThreshold: '≥ 90%',
    triggerThreshold: '< 75%',
  },

  // ── Market and Macroeconomic Risk (8): 5 Limit, 2 Appetite, 1 >Tolerance ──
  {
    id: 'mkt-01',
    name: 'Harga Bahan Baku Non-Gas: DAP',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Appetite',
    currentValue: '792 USD/ton',
    period: 'Juni',
    appetiteThreshold: '≤ 800 USD/ton',
    toleranceThreshold: '≤ 850 USD/ton',
    limitThreshold: '≤ 750 USD/ton',
    triggerThreshold: '> 900 USD/ton',
  },
  {
    id: 'mkt-02',
    name: 'Harga Bahan Baku Non-Gas: KCL',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Appetite',
    currentValue: '385 USD/ton',
    period: 'Juni',
    appetiteThreshold: '≤ 400 USD/ton',
    toleranceThreshold: '≤ 430 USD/ton',
    limitThreshold: '≤ 370 USD/ton',
    triggerThreshold: '> 460 USD/ton',
  },
  {
    id: 'mkt-03',
    name: 'Harga Bahan Baku Gas',
    taxonomy: 'Market and Macroeconomic Risk',
    status: '> Tolerance',
    currentValue: '8.57 USD/MMBTU',
    period: 'Juni',
    appetiteThreshold: '≤ 7.00 USD/MMBTU',
    toleranceThreshold: '≤ 7.80 USD/MMBTU',
    limitThreshold: '≤ 6.50 USD/MMBTU',
    triggerThreshold: '> 9.00 USD/MMBTU',
  },
  {
    id: 'mkt-04',
    name: 'Nilai Tukar USD/IDR',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Limit',
    currentValue: '15,250 IDR/USD',
    period: 'Juni',
    appetiteThreshold: '≤ 15,800',
    toleranceThreshold: '≤ 16,200',
    limitThreshold: '≤ 15,500',
    triggerThreshold: '> 16,500',
  },
  {
    id: 'mkt-05',
    name: 'Harga Jual Urea Internasional',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Limit',
    currentValue: '310 USD/ton',
    period: 'Juni',
    appetiteThreshold: '≥ 280 USD/ton',
    toleranceThreshold: '≥ 260 USD/ton',
    limitThreshold: '≥ 300 USD/ton',
    triggerThreshold: '< 240 USD/ton',
  },
  {
    id: 'mkt-06',
    name: 'Tingkat Inflasi Domestik',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Limit',
    currentValue: '3.2%',
    period: 'Juni',
    appetiteThreshold: '≤ 4.0%',
    toleranceThreshold: '≤ 5.0%',
    limitThreshold: '≤ 3.5%',
    triggerThreshold: '> 6.0%',
  },
  {
    id: 'mkt-07',
    name: 'Harga Bahan Baku Non-Gas: Asam Sulfat',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Limit',
    currentValue: '85 USD/ton',
    period: 'Juni',
    appetiteThreshold: '≤ 95 USD/ton',
    toleranceThreshold: '≤ 105 USD/ton',
    limitThreshold: '≤ 90 USD/ton',
    triggerThreshold: '> 115 USD/ton',
  },
  {
    id: 'mkt-08',
    name: 'Harga Bahan Baku Non-Gas: Ammonia Import',
    taxonomy: 'Market and Macroeconomic Risk',
    status: 'Within Limit',
    currentValue: '420 USD/ton',
    period: 'Juni',
    appetiteThreshold: '≤ 450 USD/ton',
    toleranceThreshold: '≤ 480 USD/ton',
    limitThreshold: '≤ 430 USD/ton',
    triggerThreshold: '> 510 USD/ton',
  },

  // ── Financial Risk (9): 6 Limit, 2 Tolerance, 1 >Trigger ──
  {
    id: 'fin-01',
    name: 'Indikator Kinerja Anak Perusahaan Non-Pupuk: PIN',
    taxonomy: 'Financial Risk',
    status: 'Within Tolerance',
    currentValue: '87.4%',
    period: 'Juni',
    appetiteThreshold: '≥ 95%',
    toleranceThreshold: '≥ 85%',
    limitThreshold: '≥ 97%',
    triggerThreshold: '< 80%',
  },
  {
    id: 'fin-02',
    name: 'Indikator Kinerja Anak Perusahaan Non-Pupuk: PIP',
    taxonomy: 'Financial Risk',
    status: '> Trigger Level',
    currentValue: '72.1%',
    period: 'Juni',
    appetiteThreshold: '≥ 95%',
    toleranceThreshold: '≥ 85%',
    limitThreshold: '≥ 97%',
    triggerThreshold: '< 80%',
  },
  {
    id: 'fin-03',
    name: 'Current Ratio',
    taxonomy: 'Financial Risk',
    status: 'Within Tolerance',
    currentValue: '1.79x',
    period: 'Juni',
    appetiteThreshold: '≥ 2.0x',
    toleranceThreshold: '≥ 1.7x',
    limitThreshold: '≥ 2.2x',
    triggerThreshold: '< 1.5x',
  },
  {
    id: 'fin-04',
    name: 'Debt to Equity Ratio',
    taxonomy: 'Financial Risk',
    status: 'Within Limit',
    currentValue: '0.65x',
    period: 'Juni',
    appetiteThreshold: '≤ 0.80x',
    toleranceThreshold: '≤ 0.90x',
    limitThreshold: '≤ 0.70x',
    triggerThreshold: '> 1.00x',
  },
  {
    id: 'fin-05',
    name: 'EBITDA Margin',
    taxonomy: 'Financial Risk',
    status: 'Within Limit',
    currentValue: '22.5%',
    period: 'Juni',
    appetiteThreshold: '≥ 18%',
    toleranceThreshold: '≥ 15%',
    limitThreshold: '≥ 20%',
    triggerThreshold: '< 12%',
  },
  {
    id: 'fin-06',
    name: 'Net Profit Margin',
    taxonomy: 'Financial Risk',
    status: 'Within Limit',
    currentValue: '11.8%',
    period: 'Juni',
    appetiteThreshold: '≥ 8%',
    toleranceThreshold: '≥ 6%',
    limitThreshold: '≥ 10%',
    triggerThreshold: '< 4%',
  },
  {
    id: 'fin-07',
    name: 'Return on Equity (ROE)',
    taxonomy: 'Financial Risk',
    status: 'Within Limit',
    currentValue: '14.2%',
    period: 'Juni',
    appetiteThreshold: '≥ 12%',
    toleranceThreshold: '≥ 10%',
    limitThreshold: '≥ 13%',
    triggerThreshold: '< 8%',
  },
  {
    id: 'fin-08',
    name: 'Interest Coverage Ratio',
    taxonomy: 'Financial Risk',
    status: 'Within Limit',
    currentValue: '5.4x',
    period: 'Juni',
    appetiteThreshold: '≥ 4.0x',
    toleranceThreshold: '≥ 3.0x',
    limitThreshold: '≥ 4.5x',
    triggerThreshold: '< 2.5x',
  },
  {
    id: 'fin-09',
    name: 'Cash Conversion Cycle',
    taxonomy: 'Financial Risk',
    status: 'Within Limit',
    currentValue: '45 Hari',
    period: 'Juni',
    appetiteThreshold: '≤ 55 Hari',
    toleranceThreshold: '≤ 65 Hari',
    limitThreshold: '≤ 50 Hari',
    triggerThreshold: '> 75 Hari',
  },

  // ── Credit/Counterparty Risk (3): 2 Limit, 1 >Tolerance ──
  {
    id: 'crd-01',
    name: 'Persentase Piutang Jatuh Tempo > 12 Bulan',
    taxonomy: 'Credit/Counterparty Risk',
    status: '> Tolerance',
    currentValue: '28.50%',
    period: 'Juni',
    appetiteThreshold: '≤ 15%',
    toleranceThreshold: '≤ 20%',
    limitThreshold: '≤ 10%',
    triggerThreshold: '> 30%',
  },
  {
    id: 'crd-02',
    name: 'Kolektibilitas Piutang Distributor',
    taxonomy: 'Credit/Counterparty Risk',
    status: 'Within Limit',
    currentValue: '95.2%',
    period: 'Juni',
    appetiteThreshold: '≥ 92%',
    toleranceThreshold: '≥ 88%',
    limitThreshold: '≥ 94%',
    triggerThreshold: '< 85%',
  },
  {
    id: 'crd-03',
    name: 'Counterparty Default Rate',
    taxonomy: 'Credit/Counterparty Risk',
    status: 'Within Limit',
    currentValue: '0.8%',
    period: 'Juni',
    appetiteThreshold: '≤ 2.0%',
    toleranceThreshold: '≤ 3.0%',
    limitThreshold: '≤ 1.5%',
    triggerThreshold: '> 4.0%',
  },

  // ── Operational Risk (16): 12 Limit, 1 Appetite, 3 >Tolerance ──
  {
    id: 'ops-01',
    name: 'Rata-Rata Downtime: Amonia',
    taxonomy: 'Operational Risk',
    status: 'Within Appetite',
    currentValue: '34.87 Days',
    period: 'Juni',
    appetiteThreshold: '≤ 36 Days',
    toleranceThreshold: '≤ 42 Days',
    limitThreshold: '≤ 30 Days',
    triggerThreshold: '> 48 Days',
  },
  {
    id: 'ops-02',
    name: 'Penjualan Produk Non-Subsidi: Urea',
    taxonomy: 'Operational Risk',
    status: '> Tolerance',
    currentValue: '78.6%',
    period: 'Juni',
    appetiteThreshold: '≥ 90%',
    toleranceThreshold: '≥ 85%',
    limitThreshold: '≥ 92%',
    triggerThreshold: '< 75%',
  },
  {
    id: 'ops-03',
    name: 'Penjualan Produk Non-Subsidi: Amonia',
    taxonomy: 'Operational Risk',
    status: '> Tolerance',
    currentValue: '89.9%',
    period: 'Juni',
    appetiteThreshold: '≥ 95%',
    toleranceThreshold: '≥ 92%',
    limitThreshold: '≥ 97%',
    triggerThreshold: '< 88%',
  },
  {
    id: 'ops-04',
    name: 'Penjualan Produk Non-Subsidi: NPK',
    taxonomy: 'Operational Risk',
    status: '> Tolerance',
    currentValue: '68.6%',
    period: 'Juni',
    appetiteThreshold: '≥ 85%',
    toleranceThreshold: '≥ 80%',
    limitThreshold: '≥ 88%',
    triggerThreshold: '< 70%',
  },
  {
    id: 'ops-05',
    name: 'Tingkat Kecelakaan Kerja (TRIR)',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '0.42',
    period: 'Juni',
    appetiteThreshold: '≤ 0.80',
    toleranceThreshold: '≤ 1.00',
    limitThreshold: '≤ 0.50',
    triggerThreshold: '> 1.20',
  },
  {
    id: 'ops-06',
    name: 'Utilisasi Kapasitas Pabrik: Urea',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '94.5%',
    period: 'Juni',
    appetiteThreshold: '≥ 88%',
    toleranceThreshold: '≥ 82%',
    limitThreshold: '≥ 92%',
    triggerThreshold: '< 75%',
  },
  {
    id: 'ops-07',
    name: 'Utilisasi Kapasitas Pabrik: NPK',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '91.2%',
    period: 'Juni',
    appetiteThreshold: '≥ 85%',
    toleranceThreshold: '≥ 80%',
    limitThreshold: '≥ 88%',
    triggerThreshold: '< 72%',
  },
  {
    id: 'ops-08',
    name: 'Kualitas Produk: Urea (Spesifikasi)',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '99.7%',
    period: 'Juni',
    appetiteThreshold: '≥ 99.0%',
    toleranceThreshold: '≥ 98.5%',
    limitThreshold: '≥ 99.5%',
    triggerThreshold: '< 98.0%',
  },
  {
    id: 'ops-09',
    name: 'Ketepatan Waktu Pengiriman',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '96.3%',
    period: 'Juni',
    appetiteThreshold: '≥ 93%',
    toleranceThreshold: '≥ 90%',
    limitThreshold: '≥ 95%',
    triggerThreshold: '< 85%',
  },
  {
    id: 'ops-10',
    name: 'Ketersediaan Stok Bahan Baku Kritis',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '45 Hari',
    period: 'Juni',
    appetiteThreshold: '≥ 30 Hari',
    toleranceThreshold: '≥ 21 Hari',
    limitThreshold: '≥ 35 Hari',
    triggerThreshold: '< 14 Hari',
  },
  {
    id: 'ops-11',
    name: 'Indeks Kepuasan Pelanggan',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '4.2 / 5.0',
    period: 'Juni',
    appetiteThreshold: '≥ 3.8',
    toleranceThreshold: '≥ 3.5',
    limitThreshold: '≥ 4.0',
    triggerThreshold: '< 3.0',
  },
  {
    id: 'ops-12',
    name: 'Downtime Sistem IT Kritikal',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '0.3%',
    period: 'Juni',
    appetiteThreshold: '≤ 1.0%',
    toleranceThreshold: '≤ 2.0%',
    limitThreshold: '≤ 0.5%',
    triggerThreshold: '> 3.0%',
  },
  {
    id: 'ops-13',
    name: 'Tingkat Turnover Karyawan',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '4.8%',
    period: 'Juni',
    appetiteThreshold: '≤ 7.0%',
    toleranceThreshold: '≤ 9.0%',
    limitThreshold: '≤ 5.5%',
    triggerThreshold: '> 12.0%',
  },
  {
    id: 'ops-14',
    name: 'Insiden Lingkungan (Environmental Incident)',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '0',
    period: 'Juni',
    appetiteThreshold: '≤ 1',
    toleranceThreshold: '≤ 2',
    limitThreshold: '0',
    triggerThreshold: '> 3',
  },
  {
    id: 'ops-15',
    name: 'Rata-Rata Downtime: NPK',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '18.2 Days',
    period: 'Juni',
    appetiteThreshold: '≤ 25 Days',
    toleranceThreshold: '≤ 30 Days',
    limitThreshold: '≤ 20 Days',
    triggerThreshold: '> 35 Days',
  },
  {
    id: 'ops-16',
    name: 'Efisiensi Energi (GJ/ton produk)',
    taxonomy: 'Operational Risk',
    status: 'Within Limit',
    currentValue: '28.5 GJ/ton',
    period: 'Juni',
    appetiteThreshold: '≤ 31 GJ/ton',
    toleranceThreshold: '≤ 33 GJ/ton',
    limitThreshold: '≤ 29.5 GJ/ton',
    triggerThreshold: '> 35 GJ/ton',
  },

  // ── Investment/Project Risk (1): 1 Limit ──
  {
    id: 'inv-01',
    name: 'Realisasi CAPEX vs Budget',
    taxonomy: 'Investment/Project Risk',
    status: 'Within Limit',
    currentValue: '97.2%',
    period: 'Juni',
    appetiteThreshold: '≥ 90%',
    toleranceThreshold: '≥ 85%',
    limitThreshold: '≥ 95%',
    triggerThreshold: '< 80%',
  },

  // ── Reputational Risk (1): 1 Limit ──
  {
    id: 'rep-01',
    name: 'Media Sentiment Index',
    taxonomy: 'Reputational Risk',
    status: 'Within Limit',
    currentValue: '72.5',
    period: 'Juni',
    appetiteThreshold: '≥ 60',
    toleranceThreshold: '≥ 50',
    limitThreshold: '≥ 65',
    triggerThreshold: '< 40',
  },

  // ── Regulatory, Legal & Compliance Risk (4): 3 Limit, 1 >Tolerance ──
  {
    id: 'reg-01',
    name: 'Penyaluran Pupuk Subsidi: Organik',
    taxonomy: 'Regulatory, Legal & Compliance Risk',
    status: '> Tolerance',
    currentValue: '47.4%',
    period: 'Juni',
    appetiteThreshold: '≥ 85%',
    toleranceThreshold: '≥ 75%',
    limitThreshold: '≥ 90%',
    triggerThreshold: '< 60%',
  },
  {
    id: 'reg-02',
    name: 'Tingkat Kepatuhan Regulasi K3',
    taxonomy: 'Regulatory, Legal & Compliance Risk',
    status: 'Within Limit',
    currentValue: '98.5%',
    period: 'Juni',
    appetiteThreshold: '≥ 95%',
    toleranceThreshold: '≥ 92%',
    limitThreshold: '≥ 97%',
    triggerThreshold: '< 90%',
  },
  {
    id: 'reg-03',
    name: 'Penyelesaian Temuan Audit',
    taxonomy: 'Regulatory, Legal & Compliance Risk',
    status: 'Within Limit',
    currentValue: '96.0%',
    period: 'Juni',
    appetiteThreshold: '≥ 90%',
    toleranceThreshold: '≥ 85%',
    limitThreshold: '≥ 93%',
    triggerThreshold: '< 80%',
  },
  {
    id: 'reg-04',
    name: 'Penyaluran Pupuk Subsidi: Non-Organik',
    taxonomy: 'Regulatory, Legal & Compliance Risk',
    status: 'Within Limit',
    currentValue: '94.7%',
    period: 'Juni',
    appetiteThreshold: '≥ 88%',
    toleranceThreshold: '≥ 82%',
    limitThreshold: '≥ 92%',
    triggerThreshold: '< 75%',
  },
];

// ─── Taxonomy Breakdown ───

const TAXONOMY_BREAKDOWN: TaxonomyStatusRow[] = [
  { taxonomy: 'Strategic Risk', limit: 1, appetite: 0, tolerance: 0, overTolerance: 0, overTrigger: 0, total: 1 },
  { taxonomy: 'Market and Macroeconomic Risk', limit: 5, appetite: 2, tolerance: 0, overTolerance: 1, overTrigger: 0, total: 8 },
  { taxonomy: 'Financial Risk', limit: 6, appetite: 0, tolerance: 2, overTolerance: 0, overTrigger: 1, total: 9 },
  { taxonomy: 'Credit/Counterparty Risk', limit: 2, appetite: 0, tolerance: 0, overTolerance: 1, overTrigger: 0, total: 3 },
  { taxonomy: 'Operational Risk', limit: 12, appetite: 1, tolerance: 0, overTolerance: 3, overTrigger: 0, total: 16 },
  { taxonomy: 'Investment/Project Risk', limit: 1, appetite: 0, tolerance: 0, overTolerance: 0, overTrigger: 0, total: 1 },
  { taxonomy: 'Reputational Risk', limit: 1, appetite: 0, tolerance: 0, overTolerance: 0, overTrigger: 0, total: 1 },
  { taxonomy: 'Regulatory, Legal & Compliance Risk', limit: 3, appetite: 0, tolerance: 0, overTolerance: 1, overTrigger: 0, total: 4 },
];

// ─── Composite Profile ───

export const RISK_PROFILE: CorporateRiskProfile = {
  score: 1.588,
  scoreUnit: 'PPR-2',
  status: 'Within Appetite',
  period: 'Juni 2026',
  totalParameters: 43,
  statusCounts: {
    withinLimit: 31,
    withinAppetite: 3,
    withinTolerance: 2,
    overTolerance: 6,
    overTrigger: 1,
  },
  taxonomyBreakdown: TAXONOMY_BREAKDOWN,
  parameters: PARAMETERS,
};

// ─── Helpers ───

/** All parameters that are NOT "Within Limit" — requiring management attention */
export function getAttentionParameters(): RiskParameter[] {
  return PARAMETERS.filter((p) => p.status !== 'Within Limit');
}

/** Filter attention parameters by status */
export function getAttentionByStatus(status: RiskStatus): RiskParameter[] {
  return PARAMETERS.filter((p) => p.status === status);
}

/** Get parameters for a given taxonomy */
export function getParametersByTaxonomy(taxonomy: RiskTaxonomy): RiskParameter[] {
  return PARAMETERS.filter((p) => p.taxonomy === taxonomy);
}

/** All status levels in display order */
export const STATUS_ORDER: RiskStatus[] = [
  'Within Limit',
  'Within Appetite',
  'Within Tolerance',
  '> Tolerance',
  '> Trigger Level',
];

/** All taxonomies in display order */
export const TAXONOMY_ORDER: RiskTaxonomy[] = [
  'Strategic Risk',
  'Market and Macroeconomic Risk',
  'Financial Risk',
  'Credit/Counterparty Risk',
  'Operational Risk',
  'Investment/Project Risk',
  'Reputational Risk',
  'Regulatory, Legal & Compliance Risk',
];

// ─── Peta Risiko (Risk Map) — Causal Relationship Matrix ───
// Maps 24 Market + Operational parameters to 5 business outcome dimensions

export interface RiskMapRelation {
  parameterId: string;
  parameterName: string;
  taxonomy: 'Market and Macroeconomic Risk' | 'Operational Risk';
  status: RiskStatus;
  production: boolean;
  revenue: boolean;
  cost: boolean;
  margin: boolean;
  cashFlow: boolean;
}

export const RISK_MAP_RELATIONS: RiskMapRelation[] = [
  // Market and Macroeconomic Risk (8 parameters)
  { parameterId: 'mkt-01', parameterName: 'Harga Bahan Baku Non-Gas: DAP', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Appetite', production: false, revenue: false, cost: true, margin: true, cashFlow: true },
  { parameterId: 'mkt-02', parameterName: 'Harga Bahan Baku Non-Gas: KCL', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Appetite', production: false, revenue: false, cost: true, margin: true, cashFlow: true },
  { parameterId: 'mkt-03', parameterName: 'Harga Bahan Baku Gas', taxonomy: 'Market and Macroeconomic Risk', status: '> Tolerance', production: true, revenue: false, cost: true, margin: true, cashFlow: false },
  { parameterId: 'mkt-04', parameterName: 'Nilai Tukar USD/IDR', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Limit', production: false, revenue: true, cost: true, margin: true, cashFlow: true },
  { parameterId: 'mkt-05', parameterName: 'Harga Jual Urea Internasional', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Limit', production: false, revenue: true, cost: false, margin: true, cashFlow: true },
  { parameterId: 'mkt-06', parameterName: 'Tingkat Inflasi Domestik', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Limit', production: false, revenue: false, cost: true, margin: true, cashFlow: false },
  { parameterId: 'mkt-07', parameterName: 'Harga Bahan Baku Non-Gas: Asam Sulfat', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Limit', production: false, revenue: false, cost: true, margin: true, cashFlow: false },
  { parameterId: 'mkt-08', parameterName: 'Harga Bahan Baku Non-Gas: Ammonia Import', taxonomy: 'Market and Macroeconomic Risk', status: 'Within Limit', production: false, revenue: false, cost: true, margin: true, cashFlow: false },
  // Operational Risk (16 parameters)
  { parameterId: 'ops-01', parameterName: 'Rata-Rata Downtime: Amonia', taxonomy: 'Operational Risk', status: 'Within Appetite', production: true, revenue: true, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-02', parameterName: 'Penjualan Produk Non-Subsidi: Urea', taxonomy: 'Operational Risk', status: '> Tolerance', production: false, revenue: true, cost: false, margin: true, cashFlow: true },
  { parameterId: 'ops-03', parameterName: 'Penjualan Produk Non-Subsidi: Amonia', taxonomy: 'Operational Risk', status: '> Tolerance', production: false, revenue: true, cost: false, margin: true, cashFlow: true },
  { parameterId: 'ops-04', parameterName: 'Penjualan Produk Non-Subsidi: NPK', taxonomy: 'Operational Risk', status: '> Tolerance', production: false, revenue: true, cost: false, margin: true, cashFlow: true },
  { parameterId: 'ops-05', parameterName: 'Tingkat Kecelakaan Kerja (TRIR)', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-06', parameterName: 'Utilisasi Kapasitas Pabrik: Urea', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: true, cost: false, margin: true, cashFlow: false },
  { parameterId: 'ops-07', parameterName: 'Utilisasi Kapasitas Pabrik: NPK', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: true, cost: false, margin: true, cashFlow: false },
  { parameterId: 'ops-08', parameterName: 'Kualitas Produk: Urea (Spesifikasi)', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: false, margin: false, cashFlow: false },
  { parameterId: 'ops-09', parameterName: 'Ketepatan Waktu Pengiriman', taxonomy: 'Operational Risk', status: 'Within Limit', production: false, revenue: true, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-10', parameterName: 'Ketersediaan Stok Bahan Baku Kritis', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-11', parameterName: 'Indeks Kepuasan Pelanggan', taxonomy: 'Operational Risk', status: 'Within Limit', production: false, revenue: true, cost: false, margin: false, cashFlow: false },
  { parameterId: 'ops-12', parameterName: 'Downtime Sistem IT Kritikal', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-13', parameterName: 'Tingkat Turnover Karyawan', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-14', parameterName: 'Insiden Lingkungan (Environmental Incident)', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-15', parameterName: 'Rata-Rata Downtime: NPK', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: true, cost: true, margin: false, cashFlow: false },
  { parameterId: 'ops-16', parameterName: 'Efisiensi Energi (GJ/ton produk)', taxonomy: 'Operational Risk', status: 'Within Limit', production: true, revenue: false, cost: true, margin: true, cashFlow: false },
];
