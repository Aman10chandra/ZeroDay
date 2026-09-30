import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useStore } from '../../store/useStore';
import { OverviewMap } from './OverviewMap';
import { SeverityDot } from '../../components/ui/SeverityDot';
import { Button } from '../../components/ui/Button';
import { 
  Layers, 
  ChevronRight, 
  ArrowLeft,
  X,
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Waves,
  Activity,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { WardRegion } from '../../types';

export const OverviewScreen: React.FC = () => {
  const { 
    wards, 
    sensors, 
    shelters, 
    selectedWardId, 
    selectWard, 
    navigateScreen 
  } = useStore();

  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);

  // Layer switches
  const [layers, setLayers] = useState({
    wards: true,
    sensors: true,
    shelters: true,
    rainfall: true,
    rivers: true,
    susceptibility: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Severity counts computed directly from store
  const criticalCount = wards.filter(w => w.riskLevel === 'critical').length;
  const warningCount = wards.filter(w => w.riskLevel === 'warning').length;
  const advisoryCount = wards.filter(w => w.riskLevel === 'advisory').length;
  const attentionCount = criticalCount + warningCount + advisoryCount;

  // Priority list: sorted by riskScore descending, max 5 rows
  const priorityWards = [...wards]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const selectedWard = wards.find(w => w.id === selectedWardId);

  return (
    <div className="w-full h-full flex overflow-hidden select-none bg-zd-base">
      
      {/* 1. LEFT/CENTER: MAP CANVAS & OVERLAY CONTROLS */}
      <div className="flex-1 relative h-full overflow-hidden min-w-0">
        
        {/* Full-Bleed Map Canvas */}
        <OverviewMap
          wards={wards}
          sensors={sensors}
          shelters={shelters}
          selectedWardId={selectedWardId}
          onSelectWard={(id) => selectWard(id)}
          hoveredWardId={hoveredWardId}
          onHoverWard={setHoveredWardId}
          layers={layers}
        />

        {/* 2. Top-Left Headline Stat */}
        <div className="absolute top-5 left-5 z-20 pointer-events-none">
          <div className="p-3 bg-zd-surface/90 border border-zd-border shadow-sm backdrop-blur-md rounded-panel max-w-sm">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-hero font-light text-zd-text tracking-tight leading-none">
                {attentionCount}
              </span>
              <span className="font-sans text-sm text-zd-muted font-normal leading-tight">
                wards need attention
              </span>
            </div>
            <p className="font-sans text-xs text-zd-dim mt-2 leading-relaxed">
              {criticalCount} critical, {warningCount} warning, {advisoryCount} advisory
            </p>
          </div>
        </div>

        {/* 3. Bottom-Left Minimal Layer Switcher (36px Icon Button opening Radix Popover) */}
        <div className="absolute bottom-5 left-5 z-20">
          <Popover.Root open={layersOpen} onOpenChange={setLayersOpen}>
            <Popover.Trigger asChild>
              <button
                className={`w-9 h-9 rounded-control border flex items-center justify-center transition-colors shadow-sm focus:outline-none ${
                  layersOpen 
                    ? 'bg-zd-raised text-zd-accent border-zd-accent' 
                    : 'bg-zd-surface/90 hover:bg-zd-raised text-zd-muted hover:text-zd-text border-zd-border'
                }`}
                title="Map layers"
                aria-label="Map layers"
              >
                <Layers className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="start"
                sideOffset={8}
                className="z-50 w-56 p-2 bg-zd-surface border border-zd-border rounded-panel shadow-popover text-xs font-sans animate-in fade-in-0 zoom-in-95"
              >
                <span className="text-[11px] font-sans text-zd-dim px-2 py-1 block border-b border-zd-border mb-1">
                  Map layers
                </span>
                <div className="space-y-0.5">
                  {[
                    { key: 'wards' as const, label: 'Wards & Catchments' },
                    { key: 'sensors' as const, label: 'Sensor Nodes' },
                    { key: 'shelters' as const, label: 'Shelters & Havens' },
                    { key: 'rainfall' as const, label: 'Rainfall Doppler' },
                    { key: 'rivers' as const, label: 'River Channels' },
                    { key: 'susceptibility' as const, label: 'Slope Susceptibility' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => toggleLayer(item.key)}
                      className="w-full h-8 px-2 rounded-control flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors focus:outline-none"
                    >
                      <span>{item.label}</span>
                      {layers[item.key] ? (
                        <Eye className="w-3.5 h-3.5 text-zd-accent" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zd-dim" />
                      )}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

      </div>

      {/* 2. RIGHT IN-FLOW 360PX COLUMN: PRIORITY QUEUE OR WARD DETAIL */}
      <aside 
        id="overview-right-column"
        className="w-[360px] h-full bg-zd-surface border-l border-zd-border flex flex-col shrink-0 z-20 overflow-hidden"
      >
        {selectedWard ? (
          /* WARD DETAIL VIEW (Replaces Queue in same column with back arrow) */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header: Back arrow, Ward Name (20px), Severity dot + word, Close button */}
            <div className="p-4 border-b border-zd-border flex items-center justify-between shrink-0 bg-zd-surface">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  id="btn-back-to-queue"
                  onClick={() => selectWard('')}
                  className="w-7 h-7 rounded-control flex items-center justify-center text-zd-muted hover:text-zd-text hover:bg-zd-hover transition-colors shrink-0"
                  title="Back to Priority Queue"
                  aria-label="Back to Priority Queue"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h2 className="font-sans font-semibold text-lg text-zd-text truncate leading-tight">
                    {selectedWard.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <SeverityDot level={selectedWard.riskLevel} />
                    <span className="font-sans text-xs text-zd-muted capitalize">
                      {selectedWard.riskLevel} severity
                    </span>
                    <span className="text-zd-dim">·</span>
                    <span className="font-mono text-xs text-zd-dim">{selectedWard.code}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => selectWard('')}
                className="w-7 h-7 rounded-control flex items-center justify-center text-zd-dim hover:text-zd-text hover:bg-zd-hover transition-colors shrink-0"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs font-sans">
              
              {/* 1. Hero Metric: River level with animated gauge */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-zd-muted">
                  <span>River level</span>
                  <span className="font-mono text-[11px] text-zd-dim">Danger: {selectedWard.riverDangerMarkM} m</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-light text-zd-text tracking-tight">
                    {selectedWard.riverLevelM}
                  </span>
                  <span className="text-zd-dim font-mono text-sm">m</span>
                  {selectedWard.datumBreachM > 0 && (
                    <span className="font-mono text-xs text-sev-critical font-medium ml-auto">
                      +{selectedWard.datumBreachM} m above danger
                    </span>
                  )}
                </div>
                {/* Visual gauge bar */}
                <div className="w-full h-1.5 bg-zd-raised rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      selectedWard.riskLevel === 'critical' ? 'bg-sev-critical' : selectedWard.riskLevel === 'warning' ? 'bg-sev-warning' : 'bg-zd-accent'
                    }`}
                    style={{ width: `${Math.min(100, (selectedWard.riverLevelM / (selectedWard.riverDangerMarkM * 1.5)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="h-px bg-zd-border" />

              {/* 2. 3-Item Quiet Metric Row (No boxes, pure whitespace + alignment) */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-zd-dim block mb-1">Precipitation</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-lg font-normal text-zd-text">{selectedWard.rainfall1h}</span>
                    <span className="text-[10px] text-zd-dim font-mono">mm/h</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-zd-dim block mb-1">Soil sat.</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-lg font-normal text-zd-text">{selectedWard.soilSaturationPct}</span>
                    <span className="text-[10px] text-zd-dim font-mono">%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-zd-dim block mb-1">Risk score</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-mono text-lg font-normal ${
                      selectedWard.riskLevel === 'critical' ? 'text-sev-critical font-medium' : 'text-zd-text'
                    }`}>
                      {selectedWard.riskScore}
                    </span>
                    <span className="text-[10px] text-zd-dim font-mono">/100</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-zd-border" />

              {/* 3. 6h Trend Sparkline */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-zd-muted">
                  <span>Precipitation history (6h)</span>
                  <span className="font-mono text-[10px] text-zd-dim">50 mm/h threshold</span>
                </div>
                <div className="h-16 flex items-end gap-2 pt-2">
                  {[18, 26, 34, 46, 58, 62].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-t-sm transition-all ${
                          val >= 50 ? 'bg-sev-critical' : val >= 30 ? 'bg-sev-warning' : 'bg-zd-accent'
                        }`}
                        style={{ height: `${(val / 70) * 100}%` }}
                      />
                      <span className="font-mono text-[10px] text-zd-dim">{idx * 2 + 1}h</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-zd-border" />

              {/* 4. Assessment Sentence */}
              <div className="space-y-1">
                <span className="text-[11px] text-zd-dim block">Catchment assessment</span>
                <p className="text-xs text-zd-muted leading-relaxed">
                  {selectedWard.statusSummary}
                </p>
              </div>

              <div className="h-px bg-zd-border" />

              {/* 5. Households at Risk */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-zd-muted">Households at risk</span>
                <span className="font-mono text-sm font-medium text-zd-text">
                  {selectedWard.householdsAtRisk.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pinned Bottom CTA Button: Open Region */}
            <div className="p-4 border-t border-zd-border bg-zd-surface shrink-0">
              <Button
                variant="primary"
                onClick={() => {
                  navigateScreen('region_detail');
                }}
                className="w-full h-9 font-sans text-xs font-semibold gap-2"
              >
                <span>Open region detail</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* PRIORITY QUEUE VIEW (Standard right column when no ward is selected) */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zd-border flex items-center justify-between shrink-0 bg-zd-surface">
              <div className="flex items-center gap-2">
                <h2 className="font-sans font-semibold text-sm text-zd-text">
                  Priority queue
                </h2>
                <span className="font-mono text-[10px] text-zd-dim bg-zd-base px-1.5 py-0.5 rounded border border-zd-border">
                  {priorityWards.length} wards
                </span>
              </div>
              <span className="font-sans text-[11px] text-zd-dim">Sorted by risk</span>
            </div>

            {/* Ward List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zd-border font-sans custom-scrollbar">
              {priorityWards.map(ward => {
                const isSelected = selectedWardId === ward.id;
                const isCritical = ward.riskLevel === 'critical';
                const isWarning = ward.riskLevel === 'warning';

                return (
                  <div
                    key={ward.id}
                    data-ward-id={ward.id}
                    onClick={() => selectWard(ward.id)}
                    onMouseEnter={() => setHoveredWardId(ward.id)}
                    onMouseLeave={() => setHoveredWardId(null)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-zd-raised' : 'hover:bg-zd-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                      <SeverityDot level={ward.riskLevel} />
                      <div className="truncate">
                        <span className="font-sans text-xs font-medium text-zd-text block truncate">
                          {ward.name}
                        </span>
                        <span className="font-mono text-[10px] text-zd-dim">
                          Score {ward.riskScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-zd-muted shrink-0">
                      <span>{ward.rainfall1h} mm/h</span>
                      {isCritical || isWarning ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-sev-critical" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-zd-dim" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Priority Queue Footer */}
            <div className="p-3 border-t border-zd-border text-center text-[11px] text-zd-dim font-sans bg-zd-surface shrink-0">
              Select a ward to view catchment telemetry
            </div>
          </div>
        )}
      </aside>

    </div>
  );
};
