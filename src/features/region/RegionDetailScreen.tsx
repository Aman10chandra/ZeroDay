import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { SeverityDot } from '../../components/ui/SeverityDot';
import { Button } from '../../components/ui/Button';
import { Gauge } from '../../components/ui/Gauge';
import { Modal } from '../../components/ui/Modal';
import { TypedConfirmModal } from '../../components/ui/TypedConfirmModal';
import { 
  ArrowLeft, 
  MoreVertical, 
  Sliders, 
  Download, 
  BellRing, 
  Cpu, 
  Home, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export const RegionDetailScreen: React.FC = () => {
  const { 
    selectedWardId, 
    wards, 
    sensors, 
    selectSensor, 
    navigateScreen, 
    toggleSiren, 
    sirenActive, 
    updateSluiceAperture,
    openRightDrawer,
    currentUser,
    addAuditLog,
    showToast
  } = useStore();

  const ward = wards.find(w => w.id === selectedWardId) || wards[0];

  // 5 sensors for this basin
  const basinSensors = [
    { id: 'sn-022', code: 'SN-022', name: 'Khoh Inclinometer (MPU6050)', status: 'online', battery: 94, type: 'mpu' },
    { id: 'sn-014', code: 'SN-014', name: 'Rampur Pier Acoustic Radar', status: 'online', battery: 88, type: 'radar' },
    { id: 'sn-008', code: 'SN-008', name: 'Upper Valley Tipping Bucket', status: 'online', battery: 76, type: 'rain' },
    { id: 'sn-031', code: 'SN-031', name: 'Bridge Strain Optical Node', status: 'degraded', battery: 42, type: 'strain' },
    { id: 'sn-045', code: 'SN-045', name: 'North Gully Soil Moisture', status: 'online', battery: 91, type: 'soil' },
  ];

  // Secondary menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; value: number } | null>(null);
  const [activityExpanded, setActivityExpanded] = useState(false);

  // Sluice gate modal state
  const [sluiceModalOpen, setSluiceModalOpen] = useState(false);
  const [typedConfirmOpen, setTypedConfirmOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Mitigate upstream backwater surge');
  const [aperture, setAperture] = useState(ward.sluiceAperturePct || 40);

  // Calculated discharge and downstream level projection
  const dischargeRate = Math.round(aperture * 18.8);
  const downstreamLevel30m = (ward.riverLevelM - (aperture > 50 ? 0.35 : 0.1)).toFixed(2);

  // Precipitation series
  const seriesData = {
    '7D': [
      { label: 'Day -6', value: 14 },
      { label: 'Day -5', value: 22 },
      { label: 'Day -4', value: 31 },
      { label: 'Day -3', value: 45 },
      { label: 'Day -2', value: 54 },
      { label: 'Day -1', value: 58 },
      { label: 'Today', value: ward.rainfall1h },
    ],
    '30D': [
      { label: 'Week 1', value: 20 },
      { label: 'Week 2', value: 28 },
      { label: 'Week 3', value: 42 },
      { label: 'Week 4', value: 62 },
    ],
    '90D': [
      { label: 'Month 1', value: 25 },
      { label: 'Month 2', value: 38 },
      { label: 'Month 3', value: 59 },
    ],
  }[chartRange];

  const handleExportCSV = () => {
    const csv = `Timestamp,Ward,Rainfall_mm_h,Soil_Saturation_pct,River_Level_m\n${new Date().toISOString()},${ward.code},${ward.rainfall1h},${ward.soilSaturationPct},${ward.riverLevelM}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry_${ward.code}_${Date.now()}.csv`;
    a.click();
    showToast({
      type: 'success',
      title: 'Telemetry Exported',
      message: `Downloaded CSV records for ${ward.name}`,
    });
    addAuditLog('EXPORT_TELEMETRY', ward.code, 'Exported CSV dataset');
    setMenuOpen(false);
  };

  const handleApplyOverride = () => {
    if (Math.abs(aperture - ward.sluiceAperturePct) > 15) {
      setTypedConfirmOpen(true);
    } else {
      finalizeOverride();
    }
  };

  const finalizeOverride = () => {
    updateSluiceAperture(ward.id, aperture);
    setSluiceModalOpen(false);
    setTypedConfirmOpen(false);
    showToast({
      type: 'success',
      title: 'Sluice Aperture Updated',
      message: `Rampur Weir gate set to ${aperture}% (${dischargeRate} m³/s)`,
      onUndo: () => {
        updateSluiceAperture(ward.id, 40);
        showToast({ type: 'info', title: 'Action Recalled', message: 'Sluice restored to 40%' });
      },
      undoLabel: 'Recall (10s)',
    });
    addAuditLog('SLUICE_OVERRIDE', ward.code, `Gate aperture set to ${aperture}%. Reason: ${overrideReason}`);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar bg-zd-base text-zd-text select-none">
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b border-zd-border mb-6">
        <div>
          <button
            onClick={() => navigateScreen('overview')}
            className="flex items-center gap-1.5 text-xs text-zd-muted hover:text-zd-accent mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="font-sans font-semibold text-2xl text-zd-text tracking-tight">
              {ward.name}
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-sev-critical-dim border border-sev-critical/30 text-sev-critical">
              <SeverityDot level={ward.riskLevel} />
              <span className="font-sans text-xs font-semibold capitalize">{ward.riskLevel}</span>
            </div>
          </div>

          <p className="font-sans text-xs text-zd-muted mt-1.5">
            River {ward.datumBreachM > 0 ? `${ward.datumBreachM} m above danger level` : 'at baseline'} · {ward.householdsAtRisk.toLocaleString()} households at risk
          </p>
        </div>

        {/* Primary Action + Secondary Menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigateScreen('evacuation')}
            className="h-9 px-4 font-sans text-xs font-medium"
          >
            Open evacuation corridor
          </Button>

          {/* Three dots secondary menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-[6px] border border-zd-border bg-zd-surface hover:bg-zd-raised flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-52 p-1.5 bg-zd-surface border border-zd-border rounded-panel shadow-popover z-50 text-xs font-sans">
                <button
                  onClick={() => {
                    navigateScreen('evacuation');
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-zd-text text-left transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-zd-muted" />
                  <span>Stage shelters</span>
                </button>

                <button
                  onClick={() => {
                    navigateScreen('risk_engine');
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-zd-text text-left transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-zd-accent" />
                  <span>Run AI assessment</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full px-3 py-2 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-zd-text text-left transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-zd-muted" />
                  <span>Export telemetry</span>
                </button>

                <div className="my-1 border-t border-zd-border" />

                <button
                  onClick={() => {
                    toggleSiren();
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-[4px] hover:bg-sev-critical-dim flex items-center gap-2 text-sev-critical text-left transition-colors font-medium"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{sirenActive ? 'Stop Siren' : 'Issue Siren'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Wide, 8 cols): Precipitation Story & 3-item metrics */}
        <div className="lg:col-span-8 space-y-8">
          {/* Large Precipitation Chart */}
          <div className="bg-zd-surface border border-zd-border rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-sans text-sm font-semibold text-zd-text">
                  Precipitation & Inflow Trend
                </h3>
                <p className="font-sans text-xs text-zd-muted mt-0.5">
                  Peak hourly rainfall intensity against saturated mountain catchment
                </p>
              </div>

              {/* Segmented control 7D / 30D / 90D */}
              <div className="flex items-center p-0.5 rounded-[6px] bg-zd-base border border-zd-border font-mono text-xs">
                {(['7D', '30D', '90D'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setChartRange(tab)}
                    className={`px-3 py-1 rounded-[4px] transition-colors ${
                      chartRange === tab
                        ? 'bg-zd-surface text-zd-text font-semibold shadow-sm'
                        : 'text-zd-muted hover:text-zd-text'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart SVG with 50 mm/hr dashed threshold */}
            <div className="relative h-64 w-full">
              <svg className="w-full h-full overflow-visible">
                {/* 50 mm/hr Threshold line */}
                <line
                  x1="0"
                  y1="35%"
                  x2="100%"
                  y2="35%"
                  stroke="#E5484D"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x="8"
                  y="32%"
                  fill="#E5484D"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Danger Threshold: 50 mm/hr
                </text>

                {/* Horizontal gridlines */}
                {[0.2, 0.5, 0.75, 1.0].map((frac, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={`${frac * 85}%`}
                    x2="100%"
                    y2={`${frac * 85}%`}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                  />
                ))}

                {/* Bars & Polyline */}
                {seriesData.map((d, idx) => {
                  const x = (idx / (seriesData.length - 1 || 1)) * 90 + 5;
                  const heightPct = Math.min(85, (d.value / 75) * 85);
                  const y = 90 - heightPct;
                  const isCritical = d.value >= 50;

                  return (
                    <g
                      key={idx}
                      onMouseEnter={() => setHoveredDataPoint(d)}
                      onMouseLeave={() => setHoveredDataPoint(null)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r={hoveredDataPoint?.label === d.label ? 6 : 4}
                        fill={isCritical ? '#E5484D' : '#5CC8BE'}
                        stroke="#0A0F13"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      <text
                        x={`${x}%`}
                        y="98%"
                        textAnchor="middle"
                        fill="#5E6C77"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Crosshair hover tooltip */}
              {hoveredDataPoint && (
                <div className="absolute top-2 right-4 px-3 py-1.5 rounded-[4px] bg-zd-base border border-zd-border font-mono text-xs shadow-md">
                  <span className="text-zd-muted">{hoveredDataPoint.label}: </span>
                  <span className="text-zd-text font-bold">{hoveredDataPoint.value} mm/h</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiet 3-Item Metric Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Rainfall */}
            <div className="p-6 bg-zd-surface border border-zd-border rounded-panel">
              <span className="font-sans text-xs text-zd-muted block mb-2">Rainfall (Peak 1h)</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-light text-zd-text">{ward.rainfall1h}</span>
                <span className="font-sans text-xs text-zd-muted">mm/hr</span>
              </div>
              <p className="font-sans text-[11px] text-sev-critical mt-2 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-sev-critical" />
                <span>+12 mm/hr increase in last 60m</span>
              </p>
            </div>

            {/* Metric 2: Soil Saturation */}
            <div className="p-6 bg-zd-surface border border-zd-border rounded-panel">
              <span className="font-sans text-xs text-zd-muted block mb-2">Soil Saturation</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-light text-zd-text">{ward.soilSaturationPct}</span>
                <span className="font-sans text-xs text-zd-muted">%</span>
              </div>
              <p className="font-sans text-[11px] text-sev-warning mt-2 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-sev-warning" />
                <span>Liquefaction risk zone</span>
              </p>
            </div>

            {/* Metric 3: River Level with animated vertical gauge */}
            <div className="p-6 bg-zd-surface border border-zd-border rounded-panel flex items-center justify-between">
              <div>
                <span className="font-sans text-xs text-zd-muted block mb-2">River Level</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-light text-sev-critical">{ward.riverLevelM}</span>
                  <span className="font-sans text-xs text-zd-muted">m</span>
                </div>
                <p className="font-sans text-[11px] text-sev-critical mt-2">
                  1.6 m above 3.2 m danger line
                </p>
              </div>
              <Gauge currentLevelM={ward.riverLevelM} dangerMarkM={3.2} maxLevelM={6.0} />
            </div>
          </div>
        </div>

        {/* Right Column (Narrow, 4 cols): Weir Camera + Sensors List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weir Camera Panel */}
          <div className="bg-zd-surface border border-zd-border rounded-panel overflow-hidden shadow-sm">
            <div className="relative h-48 w-full bg-black">
              <img
                src="/assets/weir-cam.webp"
                alt="Rampur Weir CCTV"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-[4px] bg-black/75 border border-white/10 font-mono text-[11px] text-white">
                CAM-02 · Rampur Weir #3
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-black/75 border border-white/10 font-mono text-[10px] text-sev-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-sev-normal animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between border-t border-zd-border">
              <div>
                <span className="font-sans text-xs text-zd-muted block">Current Gate Aperture</span>
                <span className="font-mono text-sm font-semibold text-zd-text">{ward.sluiceAperturePct}% Open</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSluiceModalOpen(true)}
                className="gap-1.5 font-sans text-xs"
              >
                <Sliders className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Override gate</span>
              </Button>
            </div>
          </div>

          {/* Compact Sensors List (5 rows) */}
          <div className="bg-zd-surface border border-zd-border rounded-panel overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zd-border flex items-center justify-between">
              <h4 className="font-sans text-xs font-semibold text-zd-text">Sensors in Sector</h4>
              <span className="font-mono text-[11px] text-zd-dim">5 reporting</span>
            </div>

            <div className="divide-y divide-zd-border">
              {basinSensors.map(sensor => (
                <div
                  key={sensor.id}
                  className="p-3.5 flex items-center justify-between hover:bg-zd-hover transition-colors"
                >
                  <div 
                    onClick={() => openRightDrawer('sensor', sensor)}
                    className="flex items-center gap-2.5 cursor-pointer truncate"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        sensor.status === 'online' ? 'bg-sev-normal' : 'bg-sev-warning'
                      }`}
                    />
                    <div className="truncate">
                      <p className="font-sans text-xs font-medium text-zd-text truncate">{sensor.name}</p>
                      <p className="font-mono text-[10px] text-zd-dim">{sensor.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[11px] text-zd-muted">{sensor.battery}%</span>
                    {sensor.type === 'mpu' ? (
                      <button
                        onClick={() => {
                          selectSensor('sn-014');
                          navigateScreen('sensors_mpu');
                        }}
                        className="px-2 py-0.5 rounded-[4px] bg-zd-raised hover:bg-zd-accent hover:text-zd-base text-zd-accent border border-zd-border text-[11px] font-sans font-medium transition-colors"
                      >
                        Open 3D
                      </button>
                    ) : (
                      <button
                        onClick={() => openRightDrawer('sensor', sensor)}
                        className="text-zd-dim hover:text-zd-text text-xs"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Event Timeline ("Activity" section at bottom) */}
      <div className="mt-8 pt-4 border-t border-zd-border">
        <button
          onClick={() => setActivityExpanded(!activityExpanded)}
          className="flex items-center gap-2 font-sans text-xs font-semibold text-zd-muted hover:text-zd-text transition-colors"
        >
          <span>Activity & Audit Trail</span>
          {activityExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {activityExpanded && (
          <div className="mt-4 p-4 bg-zd-surface border border-zd-border rounded-panel space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zd-border text-zd-muted">
              <span>14:02:18 IST · Automated Model Run</span>
              <span className="text-sev-critical font-bold">Risk raised to Critical (94%)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zd-border text-zd-muted">
              <span>13:45:00 IST · Rampur Weir Gate</span>
              <span>Aperture adjusted to 40% by DEOC console</span>
            </div>
            <div className="flex items-center justify-between text-zd-muted">
              <span>12:30:12 IST · LoRA MS-8842</span>
              <span>Telemetry heartbeat synced across 5 nodes</span>
            </div>
          </div>
        )}
      </div>

      {/* Sluice Override Modal */}
      <Modal
        isOpen={sluiceModalOpen}
        onClose={() => setSluiceModalOpen(false)}
        title="Weir Sluice Gate Override"
        subtitle="CAM-02 Rampur Weir Spillway Hydraulic Control"
        maxWidth="max-w-lg"
      >
        <div className="space-y-6 font-sans">
          {/* Big Aperture Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-xs text-zd-muted">Target Gate Aperture</label>
              <span className="font-mono text-3xl font-light text-zd-text">{aperture}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={aperture}
              onChange={(e) => setAperture(parseInt(e.target.value))}
              className="w-full h-2 bg-zd-base rounded-lg appearance-none cursor-pointer accent-zd-accent"
            />
            <div className="flex justify-between text-[11px] font-mono text-zd-dim mt-1">
              <span>0% (Closed)</span>
              <span>40% (Current)</span>
              <span>100% (Full Flood Spill)</span>
            </div>
          </div>

          {/* Two Live Readouts: Discharge & Downstream Level at 30 min */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-zd-base border border-zd-border rounded-panel">
              <span className="text-[11px] text-zd-muted block mb-1">Discharge Rate</span>
              <span className="font-mono text-xl font-light text-zd-text">{dischargeRate} m³/s</span>
            </div>
            <div className="p-3.5 bg-zd-base border border-zd-border rounded-panel">
              <span className="text-[11px] text-zd-muted block mb-1">Downstream Stage (30 min)</span>
              <span className="font-mono text-xl font-light text-sev-warning">{downstreamLevel30m} m</span>
            </div>
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-[11px] text-zd-muted mb-1.5">
              Operational Reason (Logged to Audit Registry)
            </label>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full h-9 px-3 bg-zd-base border border-zd-border rounded-[6px] font-sans text-xs text-zd-text focus:outline-none focus:border-zd-accent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSluiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleApplyOverride}>
              Apply override
            </Button>
          </div>
        </div>
      </Modal>

      {/* Typed Confirmation Modal for high aperture modifications */}
      <TypedConfirmModal
        isOpen={typedConfirmOpen}
        onClose={() => setTypedConfirmOpen(false)}
        onConfirm={finalizeOverride}
        title="Confirm Sluice Gate Override"
        prompt="Type OVERRIDE to command hydraulic spillway actuators"
        confirmWord="OVERRIDE"
        actionLabel="Execute Gate Command"
        description={`This command will adjust Rampur Weir spillway from ${ward.sluiceAperturePct}% to ${aperture}%, changing river discharge to ${dischargeRate} m³/s.`}
      />
    </div>
  );
};
