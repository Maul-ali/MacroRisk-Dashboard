'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { type RiskDiagramNodeData, getStatusBadgeClass } from '@/lib/data/riskProfileData';

// ─── Input Parameter Node (Tier 1) ───
export const ParamNode = memo(function ParamNode({
  data,
  selected,
}: NodeProps & { data: RiskDiagramNodeData }) {
  const isMarket = data.category === 'Market';
  const isFlagged = data.isFlagged;

  return (
    <div
      className={clsx(
        'relative px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[190px] max-w-[210px] select-none',
        'bg-bg-card/90 backdrop-blur-md shadow-md hover:shadow-lg',
        selected && 'ring-2 ring-chart-1 ring-offset-2 ring-offset-bg-primary',
        isFlagged
          ? 'border-2 border-risk-critical shadow-glow-red'
          : isMarket
            ? 'border border-emerald-500/70 hover:border-emerald-400'
            : 'border border-sky-400/70 hover:border-sky-300'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-text-muted !border-2 !border-bg-card"
      />

      <div className="flex items-start justify-between gap-1.5 mb-1">
        <span
          className={clsx(
            'text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded',
            isFlagged
              ? 'bg-risk-critical/15 text-risk-critical'
              : isMarket
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-sky-400/15 text-sky-400'
          )}
        >
          {data.category}
        </span>
        {data.status && (
          <span className={clsx('risk-badge text-[8px] !px-1.5 !py-0', getStatusBadgeClass(data.status))}>
            {data.status === '> Tolerance' ? '> Tol' : data.status === '> Trigger Level' ? '> Trig' : data.status}
          </span>
        )}
      </div>

      <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2">
        {data.label}
      </p>

      {data.sublabel && (
        <p className="text-[11px] font-mono font-medium text-text-secondary mt-1">
          {data.sublabel}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-chart-1 !border-2 !border-bg-card"
      />
    </div>
  );
});

// ─── Mid-Tier / Derived Factors Node (Tier 2) ───
export const MidTierNode = memo(function MidTierNode({
  data,
  selected,
}: NodeProps & { data: RiskDiagramNodeData }) {
  return (
    <div
      className={clsx(
        'relative px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[200px] max-w-[220px] select-none',
        'bg-bg-card/90 backdrop-blur-md shadow-md hover:shadow-lg',
        'border border-indigo-400/60 hover:border-indigo-300',
        selected && 'ring-2 ring-chart-1 ring-offset-2 ring-offset-bg-primary'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-text-muted !border-2 !border-bg-card"
      />

      <div className="flex items-center gap-1 mb-1">
        <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
          Derived Factor
        </span>
      </div>

      <p className="text-xs font-semibold text-text-primary leading-snug">
        {data.label}
      </p>

      {data.formula && (
        <p className="text-[10px] text-text-muted mt-1 truncate" title={data.formula}>
          {data.formula}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-indigo-400 !border-2 !border-bg-card"
      />
    </div>
  );
});

// ─── Outcome Node (Tier 3) ───
export const OutcomeNode = memo(function OutcomeNode({
  data,
  selected,
}: NodeProps & { data: RiskDiagramNodeData }) {
  return (
    <div
      className={clsx(
        'relative px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[190px] max-w-[210px] select-none',
        'bg-bg-card shadow-xl hover:shadow-2xl border-2 border-sky-400/50 hover:border-sky-400',
        selected && 'ring-2 ring-sky-400 ring-offset-2 ring-offset-bg-primary'
      )}
      style={{
        backgroundImage: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-sky-400 !border-2 !border-bg-card"
      />

      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="text-[9px] font-bold tracking-widest uppercase text-sky-500">
          Outcome Utama
        </span>
      </div>

      <h4 className="text-sm font-extrabold text-text-primary tracking-wide">
        {data.label}
      </h4>

      {data.description && (
        <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
          {data.description}
        </p>
      )}
    </div>
  );
});
