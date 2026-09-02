'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Search,
  RotateCcw,
  Target,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Sparkles,
  MousePointerClick,
  Filter,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ParamNode, MidTierNode, OutcomeNode } from './CustomNodes';
import {
  DIAGRAM_NODES,
  DIAGRAM_EDGES,
  RISK_PROFILE,
  getStatusBadgeClass,
  getStatusColor,
  type RiskDiagramNodeData,
  type RiskDiagramEdge,
  type RiskParameter,
  type RiskStatus,
} from '@/lib/data/riskProfileData';

const nodeTypes = {
  paramNode: ParamNode,
  midTierNode: MidTierNode,
  outcomeNode: OutcomeNode,
};

const OUTCOME_OPTIONS = [
  { id: 'all', label: 'Seluruh outcome', nodeId: null },
  { id: 'prod', label: 'Produksi', nodeId: 'node-out-prod' },
  { id: 'cost', label: 'Biaya Produksi', nodeId: 'node-out-cost' },
  { id: 'rev', label: 'Revenue', nodeId: 'node-out-rev' },
  { id: 'margin', label: 'Margin', nodeId: 'node-out-margin' },
  { id: 'cash', label: 'Arus Kas Operasi', nodeId: 'node-out-cash' },
];

export default function RiskMapCanvas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Market' | 'Operational'>('Semua');
  const [selectedOutcome, setSelectedOutcome] = useState('all');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-mkt-03');
  const [modalParameter, setModalParameter] = useState<RiskParameter | null>(null);

  // ─── Downstream & Upstream Graph Traversal Helper ───
  const getUpstreamNodeIds = useCallback((targetNodeId: string): Set<string> => {
    const upstream = new Set<string>([targetNodeId]);
    const queue = [targetNodeId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const edge of DIAGRAM_EDGES) {
        if (edge.target === curr && !upstream.has(edge.source)) {
          upstream.add(edge.source);
          queue.push(edge.source);
        }
      }
    }
    return upstream;
  }, []);

  const getDirectNeighborNodeIds = useCallback((nodeId: string): Set<string> => {
    const neighbors = new Set<string>([nodeId]);
    for (const edge of DIAGRAM_EDGES) {
      if (edge.source === nodeId) neighbors.add(edge.target);
      if (edge.target === nodeId) neighbors.add(edge.source);
    }
    return neighbors;
  }, []);

  // ─── Filtered Nodes ───
  const filteredNodes = useMemo(() => {
    const selectedOutcomeOption = OUTCOME_OPTIONS.find((o) => o.id === selectedOutcome);
    const targetOutcomeId = selectedOutcomeOption?.nodeId;
    const allowedByOutcome = targetOutcomeId ? getUpstreamNodeIds(targetOutcomeId) : null;
    const allowedByFocus = isFocusMode && selectedNodeId ? getDirectNeighborNodeIds(selectedNodeId) : null;

    return DIAGRAM_NODES.map((node) => {
      let isVisible = true;
      let isDimmed = false;

      // Category filter for input params
      if (node.data.tier === 1 && categoryFilter !== 'Semua') {
        if (node.data.category !== categoryFilter) {
          isVisible = false;
        }
      }

      // Outcome filter
      if (allowedByOutcome && !allowedByOutcome.has(node.id)) {
        isDimmed = true;
      }

      // Focus mode filter
      if (allowedByFocus && !allowedByFocus.has(node.id)) {
        isDimmed = true;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          node.data.label.toLowerCase().includes(q) ||
          (node.data.sublabel && node.data.sublabel.toLowerCase().includes(q)) ||
          (node.data.description && node.data.description.toLowerCase().includes(q));
        if (!matches) {
          isDimmed = true;
        }
      }

      return {
        ...node,
        hidden: !isVisible,
        style: {
          opacity: isDimmed ? 0.25 : 1,
          transition: 'opacity 0.2s ease',
        },
        selected: node.id === selectedNodeId,
      } as Node<RiskDiagramNodeData>;
    });
  }, [categoryFilter, selectedOutcome, isFocusMode, selectedNodeId, searchQuery, getUpstreamNodeIds, getDirectNeighborNodeIds]);

  // ─── Filtered Edges ───
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.filter((n) => !n.hidden).map((n) => n.id));
    const selectedOutcomeOption = OUTCOME_OPTIONS.find((o) => o.id === selectedOutcome);
    const targetOutcomeId = selectedOutcomeOption?.nodeId;
    const allowedByOutcome = targetOutcomeId ? getUpstreamNodeIds(targetOutcomeId) : null;
    const allowedByFocus = isFocusMode && selectedNodeId ? getDirectNeighborNodeIds(selectedNodeId) : null;

    return DIAGRAM_EDGES.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)).map((edge) => {
      const isRelatedToSelected = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
      let isDimmed = false;

      if (allowedByOutcome && (!allowedByOutcome.has(edge.source) || !allowedByOutcome.has(edge.target))) {
        isDimmed = true;
      }
      if (allowedByFocus && (!allowedByFocus.has(edge.source) || !allowedByFocus.has(edge.target))) {
        isDimmed = true;
      }

      let strokeColor = '#38bdf8'; // Searah
      let strokeDash = undefined;
      let markerColor = '#38bdf8';

      if (edge.type === 'Berlawanan') {
        strokeColor = '#ef4444';
        markerColor = '#ef4444';
      } else if (edge.type === 'Dampak tertunda') {
        strokeColor = '#94a3b8';
        strokeDash = '6 4';
        markerColor = '#94a3b8';
      }

      if (isRelatedToSelected) {
        strokeColor = edge.type === 'Berlawanan' ? '#f87171' : '#38bdf8';
      }

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: edge.type === 'Searah' && isRelatedToSelected,
        label: edge.label,
        labelStyle: {
          fill: strokeColor,
          fontWeight: 700,
          fontSize: 11,
        },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: '#0f172a',
          fillOpacity: 0.85,
          stroke: strokeColor,
          strokeWidth: 1,
        },
        style: {
          stroke: strokeColor,
          strokeWidth: isRelatedToSelected ? 2.5 : 1.5,
          strokeDasharray: strokeDash,
          opacity: isDimmed ? 0.15 : 1,
          transition: 'all 0.2s ease',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: markerColor,
        },
      } as Edge;
    });
  }, [filteredNodes, selectedNodeId, selectedOutcome, isFocusMode, getUpstreamNodeIds, getDirectNeighborNodeIds]);

  const [nodes, , onNodesChange] = useNodesState(filteredNodes);
  const [edges, , onEdgesChange] = useEdgesState(filteredEdges);

  // Sync state when filtered changes
  const displayNodes = filteredNodes;
  const displayEdges = filteredEdges;

  // ─── Selected Node Data & Connections ───
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return DIAGRAM_NODES.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId]);

  const linkedRiskParameter = useMemo(() => {
    if (!selectedNode?.data.parameterId) return null;
    return RISK_PROFILE.parameters.find((p) => p.id === selectedNode.data.parameterId) || null;
  }, [selectedNode]);

  const directConnections = useMemo(() => {
    if (!selectedNodeId) return [];
    const outgoing = DIAGRAM_EDGES.filter((e) => e.source === selectedNodeId).map((e) => {
      const targetNode = DIAGRAM_NODES.find((n) => n.id === e.target);
      return {
        direction: 'outgoing' as const,
        edge: e,
        node: targetNode,
      };
    });
    const incoming = DIAGRAM_EDGES.filter((e) => e.target === selectedNodeId).map((e) => {
      const sourceNode = DIAGRAM_NODES.find((n) => n.id === e.source);
      return {
        direction: 'incoming' as const,
        edge: e,
        node: sourceNode,
      };
    });
    return [...outgoing, ...incoming];
  }, [selectedNodeId]);

  // ─── Reset Handler ───
  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('Semua');
    setSelectedOutcome('all');
    setIsFocusMode(false);
    setSelectedNodeId('node-mkt-03');
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="space-y-4">
      {/* ── Top Control Bar ── */}
      <div className="glass-card p-4 space-y-3 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Search + Category Toggle */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari parameter..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-bg-tertiary/70 border border-border-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:border-chart-1 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Segmented Category Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-bg-tertiary/60 border border-border-subtle">
              {(['Semua', 'Market', 'Operational'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={clsx(
                    'px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
                    categoryFilter === cat
                      ? 'bg-bg-card text-text-primary shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Path to Outcome Dropdown + Focus Mode + Reset */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Outcome Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Jalur menuju:</span>
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary/80 border border-border-primary text-text-primary focus:outline-none focus:border-chart-1 cursor-pointer"
              >
                {OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Focus Mode Button */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                isFocusMode
                  ? 'bg-chart-1/20 border-chart-1 text-chart-1 font-semibold'
                  : 'bg-bg-tertiary/60 border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
              )}
              title="Fokus hanya pada koneksi langsung dari node yang dipilih"
            >
              <Target className="w-3.5 h-3.5" />
              Fokus hubungan
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary/40 border border-border-primary text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors cursor-pointer"
              title="Reset seluruh filter dan posisi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* ── Legend Row ── */}
        <div className="pt-2 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-y-2 text-[11px] text-text-muted">
          {/* Swatches */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-text-secondary">Node:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-emerald-500 bg-emerald-500/20" />
              <span>Market</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-sky-400 bg-sky-400/20" />
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-indigo-400 bg-indigo-400/20" />
              <span>Derived Factor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-bg-card border-2 border-sky-400/60" />
              <span className="font-medium text-text-secondary">Outcome</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-risk-critical bg-risk-critical/20" />
              <span className="text-risk-critical font-medium">Diluar Threshold</span>
            </div>
          </div>

          {/* Line styles */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-text-secondary">Relasi:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-sky-400" />
              <span>Searah (+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-red-500" />
              <span>Berlawanan (-)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-slate-400" />
              <span>Dampak tertunda</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Canvas + Right Detail Panel Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* React Flow Canvas (Left ~8-9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 h-[680px] glass-card relative overflow-hidden border border-border-primary">
          <ReactFlowProvider>
            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.3}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
              attributionPosition="bottom-left"
              className="bg-bg-primary/50"
            >
              <Background color="rgba(148, 163, 184, 0.12)" gap={20} size={1} />
              <Controls
                position="bottom-left"
                className="!bg-bg-card !border-border-primary !text-text-primary !shadow-lg [&>button]:!bg-bg-card [&>button]:!border-border-subtle [&>button]:!text-text-secondary hover:[&>button]:!text-text-primary"
              />
              <MiniMap
                position="top-right"
                zoomable
                pannable
                nodeColor={(node) => {
                  if (node.type === 'outcomeNode') return '#38bdf8';
                  if (node.data?.isFlagged) return '#ef4444';
                  if (node.data?.category === 'Market') return '#10b981';
                  if (node.data?.category === 'Operational') return '#38bdf8';
                  return '#818cf8';
                }}
                className="!bg-bg-card/90 !border !border-border-primary !rounded-xl !shadow-md !w-32 !h-24 hidden md:block"
                maskColor="rgba(15, 23, 42, 0.6)"
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Right-Side Detail Panel (Right ~3-4 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 glass-card p-5 flex flex-col h-[680px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4 animate-fade-in">
              {/* Eyebrow & Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">
                  {selectedNode.data.category === 'Outcome'
                    ? 'BUSINESS OUTCOME'
                    : selectedNode.data.category === 'Mid-tier'
                    ? 'DERIVED FACTOR'
                    : linkedRiskParameter?.taxonomy?.toUpperCase() || `${selectedNode.data.category.toUpperCase()} RISK`}
                </span>
                {selectedNode.data.status && (
                  <span className={clsx('risk-badge text-[10px]', getStatusBadgeClass(selectedNode.data.status))}>
                    {selectedNode.data.status}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-text-primary leading-tight">
                  {selectedNode.data.label}
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  {selectedNode.data.description || 'Parameter risiko yang mempengaruhi target dan kinerja operasional.'}
                </p>
              </div>

              {/* Stats Section (Realisasi, Formula, Thresholds) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-bg-tertiary/50 border border-border-subtle">
                {selectedNode.data.currentValue && (
                  <div className="flex items-center justify-between text-xs py-1 border-b border-border-subtle/50">
                    <span className="text-text-muted">Realisasi Juni</span>
                    <span className="font-bold text-text-primary font-mono">
                      {selectedNode.data.currentValue}
                    </span>
                  </div>
                )}
                {selectedNode.data.formula && (
                  <div className="text-xs py-1 border-b border-border-subtle/50">
                    <span className="text-text-muted block mb-0.5">Formula</span>
                    <span className="font-medium text-text-secondary font-mono text-[11px] block leading-tight">
                      {selectedNode.data.formula}
                    </span>
                  </div>
                )}
                {linkedRiskParameter?.limitThreshold && (
                  <div className="flex items-center justify-between text-xs py-1 border-b border-border-subtle/50">
                    <span className="text-text-muted">Within Limit</span>
                    <span className="font-semibold text-risk-low font-mono">
                      {linkedRiskParameter.limitThreshold}
                    </span>
                  </div>
                )}
                {linkedRiskParameter?.appetiteThreshold && (
                  <div className="flex items-center justify-between text-xs py-1 border-b border-border-subtle/50">
                    <span className="text-text-muted">Risk Appetite</span>
                    <span className="font-semibold text-chart-4 font-mono">
                      {linkedRiskParameter.appetiteThreshold}
                    </span>
                  </div>
                )}
                {linkedRiskParameter?.toleranceThreshold && (
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-text-muted">Risk Tolerance</span>
                    <span className="font-semibold text-risk-elevated font-mono">
                      {linkedRiskParameter.toleranceThreshold}
                    </span>
                  </div>
                )}
              </div>

              {/* Buka Rincian Parameter Button */}
              {linkedRiskParameter && (
                <button
                  onClick={() => setModalParameter(linkedRiskParameter)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-bg-tertiary/80 hover:bg-bg-card-hover border border-border-primary text-text-primary transition-colors cursor-pointer"
                >
                  Buka rincian parameter
                  <ArrowRight className="w-3.5 h-3.5 text-chart-1" />
                </button>
              )}

              {/* Direct Connections List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                    Hubungan Langsung ({directConnections.length})
                  </p>
                </div>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {directConnections.length > 0 ? (
                    directConnections.map(({ direction, edge, node }) => {
                      if (!node) return null;
                      const isOutgoing = direction === 'outgoing';
                      const isInverse = edge.type === 'Berlawanan';
                      const isDelayed = edge.type === 'Dampak tertunda';

                      return (
                        <button
                          key={edge.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className="w-full flex items-start gap-2 p-2.5 rounded-lg bg-bg-tertiary/40 hover:bg-bg-card-hover border border-border-subtle transition-colors text-left cursor-pointer group"
                        >
                          <div className="mt-0.5 shrink-0">
                            {isOutgoing ? (
                              <ArrowUpRight className="w-3.5 h-3.5 text-chart-1 group-hover:translate-x-0.5 transition-transform" />
                            ) : (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-text-primary truncate">
                                {node.data.label}
                              </p>
                              <span
                                className={clsx(
                                  'text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0',
                                  isInverse
                                    ? 'bg-red-500/15 text-red-400'
                                    : isDelayed
                                    ? 'bg-slate-500/15 text-slate-400'
                                    : 'bg-sky-500/15 text-sky-400'
                                )}
                              >
                                {edge.type}
                              </span>
                            </div>
                            {edge.description && (
                              <p className="text-[10px] text-text-muted line-clamp-2 mt-0.5">
                                {edge.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-text-muted italic text-center py-3">
                      Tidak ada hubungan langsung
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-text-muted">
              <div className="w-12 h-12 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-3">
                <MousePointerClick className="w-6 h-6 text-text-muted animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Pilih Parameter
              </h4>
              <p className="text-xs text-text-secondary max-w-[220px] leading-relaxed">
                Klik sebuah parameter pada diagram untuk melihat detail realisasi, formula, dan jalur hubungan kausal.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Threshold Detail Modal (Reused) ── */}
      {modalParameter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalParameter(null)}
          />
          <div className="glass-card relative z-10 w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-semibold text-text-muted tracking-widest uppercase mb-1">
                  Detail Parameter &amp; Threshold
                </p>
                <h3 className="text-lg font-bold text-text-primary">
                  {modalParameter.name}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {modalParameter.taxonomy} · {modalParameter.period} 2026
                </p>
              </div>
              <button
                onClick={() => setModalParameter(null)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Value */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-tertiary/60 mb-4">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: getStatusColor(modalParameter.status) }}
              />
              <div className="flex-1">
                <p className="text-xs text-text-muted">Nilai Saat Ini</p>
                <p className="text-xl font-bold text-text-primary font-mono">
                  {modalParameter.currentValue}
                </p>
              </div>
              <span className={clsx('risk-badge', getStatusBadgeClass(modalParameter.status))}>
                {modalParameter.status}
              </span>
            </div>

            {/* Thresholds */}
            <div className="space-y-2">
              {[
                { label: 'Limit', value: modalParameter.limitThreshold, color: 'var(--risk-low)' },
                { label: 'Appetite', value: modalParameter.appetiteThreshold, color: 'var(--chart-4)' },
                { label: 'Tolerance', value: modalParameter.toleranceThreshold, color: 'var(--risk-elevated)' },
                { label: 'Trigger', value: modalParameter.triggerThreshold, color: 'var(--risk-critical)' },
              ].map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/40 hover:bg-bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="text-sm text-text-secondary font-medium">
                      {t.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary font-mono tabular-nums">
                    {t.value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
