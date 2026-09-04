// ─── Database Schema & Types for Neon Postgres ───

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

export const RISK_STATUSES: RiskStatus[] = [
  'Within Limit',
  'Within Appetite',
  'Within Tolerance',
  '> Tolerance',
  '> Trigger Level',
];

export const RISK_TAXONOMIES: RiskTaxonomy[] = [
  'Strategic Risk',
  'Market and Macroeconomic Risk',
  'Financial Risk',
  'Credit/Counterparty Risk',
  'Operational Risk',
  'Investment/Project Risk',
  'Reputational Risk',
  'Regulatory, Legal & Compliance Risk',
];

export interface RiskParameterRow {
  id: string;
  name: string;
  taxonomy: RiskTaxonomy;
  status: RiskStatus;
  currentValue: string;
  period: string;
  appetiteThreshold?: string | null;
  toleranceThreshold?: string | null;
  limitThreshold?: string | null;
  triggerThreshold?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type NewRiskParameter = Omit<RiskParameterRow, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
