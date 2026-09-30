import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { OverviewMap } from './OverviewMap';
import { SeverityDot } from '../../components/ui/SeverityDot';
import { Modal } from '../../components/ui/Modal';
import { 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Table, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye, 
  EyeOff,
  Search
} from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const { 
    wards, 
    sensors, 
    shelters,
    selectedWardId, 
    selectWard, 
    openRightDrawer 
  } = useStore();

  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);
  const [priorityCollapsed, setPriorityCollapsed] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [tableViewOpen, setTableViewOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

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

  // Severity counts
  const criticalCount = wards.filter(w => w.riskLevel === 'critical').length;
  const warningCount = wards.filter(w => w.riskLevel === 'warning').length;
  const advisoryCount = wards.filter(w => w.riskLevel === 'advisory').length;
  const attentionCount = criticalCount + warningCount + advisoryCount;

  // Priority list: sorted by riskScore descending, max 5 rows
  const priorityWards = [...wards]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const filteredWardsForTable = wards.filter(w => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q) || w.district.toLowerCase().includes(q);
  });

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-zd-base">
      {/* 1. Full-Bleed Map Canvas */}
      <div className="absolute inset-0 z-0">
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
      </div>

      {/* 2. Top-Left Floating Headline Stat Block */}
      <div className="absolute top-5 left-5 z-10 pointer-events-auto">
        <div className="bg-zd-surface/90 backdrop-blur-md border border-zd-border rounded-panel p-5 shadow-modal max-w-xs transition-colors">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[44px] font-light text-zd-text tracking-tight leading-none">
              {attentionCount}
            </span>
            <span className="font-sans text-sm text-zd-muted font-medium">
              wards need attention
            </span>
          </div>
          <p className="font-sans text-xs text-zd-dim mt-2 leading-relaxed">
            {criticalCount} critical, {warningCount} warning, {advisoryCount} advisory
          </p>
        </div>
      </div>

      {/* 3. Right Floating Priority List (Collapsible, Max 5 Rows) */}
      <div className="absolute top-5 right-5 z-10 pointer-events-auto w-72">
        <div className="bg-zd-surface/90 backdrop-blur-md border border-zd-border rounded-panel overflow-hidden shadow-modal transition-all">
          {/* Header */}
          <div 
            onClick={() => setPriorityCollapsed(!priorityCollapsed)}
            className="px-4 py-3 border-b border-zd-border flex items-center justify-between cursor-pointer hover:bg-zd-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-semibold text-zd-text">Priority queue</span>
              <span className="font-mono text-[10px] text-zd-dim bg-zd-base px-1.5 py-0.2 rounded border border-zd-border">
                {priorityWards.length}
              </span>
            </div>
            <button className="text-zd-muted hover:text-zd-text">
              {priorityCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* List Content */}
          {!priorityCollapsed && (
            <div className="divide-y divide-zd-border font-sans">
              {priorityWards.map((ward) => {
                const isSelected = selectedWardId === ward.id;
                const isCritical = ward.riskLevel === 'critical';
                const isWarning = ward.riskLevel === 'warning';

                return (
                  <div
                    key={ward.id}
                    onClick={() => selectWard(ward.id)}
                    onMouseEnter={() => setHoveredWardId(ward.id)}
                    onMouseLeave={() => setHoveredWardId(null)}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-zd-raised' : 'hover:bg-zd-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <SeverityDot level={ward.riskLevel} />
                      <span className="font-sans text-xs font-medium text-zd-text truncate">
                        {ward.name}
                      </span>
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
          )}
        </div>
      </div>

      {/* 4. Bottom-Left Minimal Layer Switcher (Icon button that opens popover) */}
      <div className="absolute bottom-5 left-5 z-10 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className={`w-9 h-9 rounded-control border flex items-center justify-center transition-colors shadow-modal ${
              layersOpen 
                ? 'bg-zd-accent text-zd-base border-zd-accent' 
                : 'bg-zd-surface/90 hover:bg-zd-raised text-zd-muted hover:text-zd-text border-zd-border'
            }`}
            title="Layer switcher"
          >
            <Layers className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {layersOpen && (
            <div className="absolute bottom-11 left-0 w-56 p-2 bg-zd-surface/95 backdrop-blur-md border border-zd-border rounded-panel shadow-popover text-xs font-sans">
              <span className="text-micro text-zd-dim px-2 py-1 block border-b border-zd-border mb-1">
                Map Layers
              </span>
              <div className="space-y-0.5">
                {[
                  { key: 'wards' as const, label: 'Wards' },
                  { key: 'sensors' as const, label: 'Sensors' },
                  { key: 'shelters' as const, label: 'Shelters' },
                  { key: 'rainfall' as const, label: 'Rainfall Doppler' },
                  { key: 'rivers' as const, label: 'Rivers' },
                  { key: 'susceptibility' as const, label: 'Susceptibility' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key)}
                    className="w-full h-7 px-2 rounded-[4px] flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors"
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
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom-Right "View as table" Toggle */}
      <div className="absolute bottom-5 right-5 z-10 pointer-events-auto">
        <button
          onClick={() => setTableViewOpen(true)}
          className="h-9 px-3.5 rounded-[6px] bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-muted hover:text-zd-text flex items-center gap-2 font-sans text-xs shadow-modal transition-colors"
        >
          <Table className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>View as table</span>
        </button>
      </div>

      {/* Full Ward Table Modal */}
      <Modal
        isOpen={tableViewOpen}
        onClose={() => setTableViewOpen(false)}
        title="District Wards & Basins"
        subtitle="Complete telemetry registry across monitored sectors"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zd-dim" />
              <input
                type="text"
                placeholder="Search by ward name or code..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-zd-base border border-zd-border rounded-[6px] text-xs font-mono text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
              />
            </div>
            <span className="font-mono text-xs text-zd-muted">
              {filteredWardsForTable.length} sectors listed
            </span>
          </div>

          <div className="border border-zd-border rounded-panel overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-zd-base border-b border-zd-border font-mono text-micro text-zd-muted">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Ward</th>
                  <th className="py-2.5 px-3 font-normal">Severity</th>
                  <th className="py-2.5 px-3 font-normal">Rainfall</th>
                  <th className="py-2.5 px-3 font-normal">River Level</th>
                  <th className="py-2.5 px-3 font-normal">Saturation</th>
                  <th className="py-2.5 px-3 font-normal">Homes</th>
                  <th className="py-2.5 px-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zd-border font-mono text-xs">
                {filteredWardsForTable.map(ward => (
                  <tr key={ward.id} className="hover:bg-zd-hover transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-zd-text">
                      <div>{ward.name}</div>
                      <div className="text-[11px] font-mono text-zd-dim">{ward.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 capitalize font-sans">
                        <SeverityDot level={ward.riskLevel} />
                        <span className="text-zd-text text-[11px]">{ward.riskLevel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zd-text">{ward.rainfall1h} mm/h</td>
                    <td className="py-3 px-3 text-zd-text">{ward.riverLevelM} m</td>
                    <td className="py-3 px-3 text-zd-text">{ward.soilSaturationPct}%</td>
                    <td className="py-3 px-3 text-zd-text">{ward.householdsAtRisk.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => {
                          selectWard(ward.id);
                          setTableViewOpen(false);
                        }}
                        className="text-zd-accent hover:underline text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
