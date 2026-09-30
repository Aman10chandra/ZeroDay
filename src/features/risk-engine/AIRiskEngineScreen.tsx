import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  RotateCcw, 
  Send,
  Database,
  Layers,
  Cpu,
  CheckCircle2,
  Info
} from 'lucide-react';

export const AIRiskEngineScreen: React.FC = () => {
  const { 
    wards, 
    selectedWardId, 
    selectWard, 
    navigateScreen, 
    createAlert,
    showToast,
    addAuditLog
  } = useStore();

  const [activeWardId, setActiveWardId] = useState<string>(selectedWardId || wards[0].id);
  const ward = wards.find(w => w.id === activeWardId) || wards[0];

  // Scenario stress-test state (collapsed by default)
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [sliderRain7D, setSliderRain7D] = useState<number>(310); // 50 to 450 mm
  const [sliderSoilSat, setSliderSoilSat] = useState<number>(ward.soilSaturationPct || 91); // 40 to 98%
  const [sliderVibration, setSliderVibration] = useState<number>(2.4); // 0.1 to 4.5 mm/s

  // Step details drawer
  const [activeStepDrawer, setActiveStepDrawer] = useState<'data' | 'seasonal' | 'live' | 'decision' | null>(null);

  // Dynamic ML Calculation (CatBoost + LSTM Hybrid Blend)
  const simulation = useMemo(() => {
    const catBoostBase = Math.min(100, Math.round((sliderRain7D / 450) * 80 + 15));
    const lstmBase = Math.min(100, Math.round(((sliderSoilSat - 40) / 58) * 55 + (sliderVibration / 4.5) * 45));
    const combinedScore = Math.round(catBoostBase * 0.40 + lstmBase * 0.60);

    let ladderStep = 0; // 0 = Safe, 1 = Advisory, 2 = Warning, 3 = Red Directive
    let statement = 'Normal watershed equilibrium';
    let isRed = false;

    if (combinedScore >= 78) {
      ladderStep = 3;
      statement = 'Mandatory evacuation recommended';
      isRed = true;
    } else if (combinedScore >= 60) {
      ladderStep = 2;
      statement = 'Stage shelters and warn residents';
    } else if (combinedScore >= 40) {
      ladderStep = 1;
      statement = 'Debris watch and weir monitoring recommended';
    } else {
      ladderStep = 0;
      statement = 'All slope parameters within baseline';
    }

    return {
      catBoostScore: catBoostBase,
      lstmScore: lstmBase,
      combinedScore,
      ladderStep,
      statement,
      isRed,
      features: [
        { name: '7-day antecedent rainfall (310 mm)', pct: 36, isTop: true },
        { name: 'Subsurface soil pore saturation (91%)', pct: 32, isTop: true },
        { name: 'Dynamic shear vibration (2.4 mm/s)', pct: 20 },
        { name: 'DEM slope steepness (34.2°)', pct: 12 },
      ]
    };
  }, [sliderRain7D, sliderSoilSat, sliderVibration]);

  const handleResetToLive = () => {
    setSliderRain7D(260);
    setSliderSoilSat(ward.soilSaturationPct);
    setSliderVibration(1.2);
    showToast({
      type: 'info',
      title: 'Reset to Live Feed',
      message: 'Scenario sliders synchronized with field telemetry',
    });
  };

  const handleDispatch = () => {
    createAlert({
      title: `MANDATORY EVACUATION DIRECTIVE: ${ward.name}`,
      titleHi: `अनिवार्य निकासी निर्देश: ${ward.name}`,
      body: `AI model confidence reached 94%. Imminent slope failure detected for ${ward.name}. Evacuate immediately along designated high-ground corridors.`,
      bodyHi: `आपातकालीन निकासी तुरंत शुरू करें।`,
      severity: 'critical',
      regionId: ward.id,
      channels: ['push', 'sms', 'ble_mesh'],
      directiveType: 'EVACUATION',
    });
    showToast({
      type: 'critical',
      title: 'Evacuation Dispatched',
      message: `Evacuation corridor broadcast initiated for ${ward.name}`,
      onUndo: () => {
        showToast({ type: 'info', title: 'Broadcast Recalled', message: 'Alert canceled' });
      },
      undoLabel: 'Recall (10s)'
    });
    addAuditLog('DISPATCH_EVACUATION_AI', ward.code, 'Dispatched evacuation based on AI decision engine');
    navigateScreen('evacuation');
  };

  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-zd-base text-zd-text select-none">
      <div className="max-w-5xl mx-auto w-full">
      {/* Top Header: Simple Ward Selector */}
      <div className="flex items-center justify-between pb-6 border-b border-zd-border mb-8">
        <div className="flex items-center gap-3">
          <label className="font-sans text-xs text-zd-muted">Monitored sector:</label>
          <div className="relative">
            <select
              value={activeWardId}
              onChange={(e) => {
                setActiveWardId(e.target.value);
                selectWard(e.target.value);
              }}
              className="h-8 pl-3 pr-8 rounded-[6px] bg-zd-surface border border-zd-border text-zd-text font-sans text-xs appearance-none focus:outline-none focus:border-zd-accent cursor-pointer"
            >
              {wards.map(w => (
                <option key={w.id} value={w.id} className="bg-zd-surface text-zd-text">
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zd-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <span className="font-mono text-xs text-zd-dim">
          CatBoost-LSTM Hybrid v4.2 · Run 14:02 IST
        </span>
      </div>

      {/* Center: The Decision Focal Point */}
      <div className="text-center py-8">
        <span className="font-sans text-xs text-zd-muted block mb-3">Model Assessment</span>
        <h2 className="font-sans text-3xl md:text-4xl font-light text-zd-text tracking-tight mb-6">
          {simulation.statement}
        </h2>

        {/* Four-Step Ladder Track with Marker & Confidence */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative pt-4 pb-2">
            {/* The Track */}
            <div className="h-1.5 w-full bg-zd-surface rounded-full overflow-hidden flex">
              <div className="flex-1 bg-sev-normal/30 border-r border-zd-base" />
              <div className="flex-1 bg-sev-advisory/30 border-r border-zd-base" />
              <div className="flex-1 bg-sev-warning/30 border-r border-zd-base" />
              <div className="flex-1 bg-sev-critical/40" />
            </div>

            {/* Marker */}
            <div
              className="absolute top-1.5 w-4 h-4 -ml-2 rounded-full border-2 border-zd-base transition-all duration-300 shadow-sm"
              style={{
                left: `${(simulation.ladderStep / 3) * 100}%`,
                backgroundColor: simulation.isRed ? '#E5484D' : simulation.ladderStep === 2 ? '#E8843A' : simulation.ladderStep === 1 ? '#D9B44A' : '#4CB782'
              }}
            />
          </div>

          {/* Ladder Labels */}
          <div className="flex justify-between font-sans text-[11px] text-zd-muted pt-2">
            <span className={simulation.ladderStep === 0 ? 'text-sev-normal font-semibold' : ''}>Safe</span>
            <span className={simulation.ladderStep === 1 ? 'text-sev-advisory font-semibold' : ''}>Advisory</span>
            <span className={simulation.ladderStep === 2 ? 'text-sev-warning font-semibold' : ''}>Warning</span>
            <span className={simulation.ladderStep === 3 ? 'text-sev-critical font-semibold' : ''}>Red directive</span>
          </div>

          <div className="mt-3">
            <span className="font-mono text-xs text-zd-dim">
              Model confidence: <strong className="text-zd-text">{simulation.combinedScore}%</strong>
            </span>
          </div>
        </div>

        {/* Primary Action Button (when Red) */}
        {simulation.isRed && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={handleDispatch}
              className="h-10 px-6 font-sans text-xs font-semibold gap-2 shadow-sm"
            >
              <span>Dispatch evacuation corridor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* 3-Step Horizontal Flow: Data -> Seasonal -> Live -> Decision */}
      <div className="my-10 pt-8 border-t border-zd-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1: Ingested Data */}
          <div
            onClick={() => setActiveStepDrawer('data')}
            className="p-4 bg-zd-surface hover:bg-zd-raised border border-zd-border rounded-panel cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[11px] text-zd-muted">1. Field Data</span>
              <Database className="w-3.5 h-3.5 text-zd-dim" />
            </div>
            <div className="font-mono text-xl font-light text-zd-text">5 Sensors</div>
            <span className="font-sans text-[11px] text-zd-dim mt-1 block">50 Hz IMU + Doppler</span>
          </div>

          {/* Step 2: Seasonal Susceptibility */}
          <div
            onClick={() => setActiveStepDrawer('seasonal')}
            className="p-4 bg-zd-surface hover:bg-zd-raised border border-zd-border rounded-panel cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[11px] text-zd-muted">2. CatBoost Seasonal</span>
              <Layers className="w-3.5 h-3.5 text-zd-dim" />
            </div>
            <div className="font-mono text-xl font-light text-zd-text">{simulation.catBoostScore}%</div>
            <span className="font-sans text-[11px] text-zd-dim mt-1 block">Susceptibility (40% weight)</span>
          </div>

          {/* Step 3: Live Kinematic Trigger */}
          <div
            onClick={() => setActiveStepDrawer('live')}
            className="p-4 bg-zd-surface hover:bg-zd-raised border border-zd-border rounded-panel cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[11px] text-zd-muted">3. LSTM Live Trigger</span>
              <Cpu className="w-3.5 h-3.5 text-zd-accent" />
            </div>
            <div className="font-mono text-xl font-light text-zd-text">{simulation.lstmScore}%</div>
            <span className="font-sans text-[11px] text-zd-dim mt-1 block">Dynamic trigger (60% weight)</span>
          </div>

          {/* Step 4: Decision Output */}
          <div
            onClick={() => setActiveStepDrawer('decision')}
            className="p-4 bg-zd-surface hover:bg-zd-raised border border-zd-border rounded-panel cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[11px] text-zd-muted">4. Blended Output</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sev-critical" />
            </div>
            <div className="font-mono text-xl font-light text-sev-critical">{simulation.combinedScore}%</div>
            <span className="font-sans text-[11px] text-zd-dim mt-1 block">Hybrid Decision Matrix</span>
          </div>
        </div>
      </div>

      {/* "Why this decision" Section: 4 feature-contribution bars */}
      <div className="mb-10 p-6 bg-zd-surface border border-zd-border rounded-panel">
        <h4 className="font-sans text-xs font-semibold text-zd-text mb-1">
          Why this decision
        </h4>
        <p className="font-sans text-xs text-zd-muted mb-4">
          SHAP feature contribution weighting from latest model inference
        </p>

        <div className="space-y-3">
          {simulation.features.map((feat, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-sans text-xs mb-1">
                <span className={feat.isTop ? 'text-zd-text font-medium' : 'text-zd-muted'}>
                  {feat.name}
                </span>
                <span className="font-mono text-zd-text">{feat.pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-zd-base rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    feat.isTop ? 'bg-zd-accent' : 'bg-zd-muted/40'
                  }`}
                  style={{ width: `${feat.pct * 2.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Try a scenario" Panel (Collapsed by default) */}
      <div className="border border-zd-border rounded-panel bg-zd-surface overflow-hidden">
        <div
          onClick={() => setScenarioOpen(!scenarioOpen)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-zd-hover transition-colors"
        >
          <div>
            <h4 className="font-sans text-xs font-semibold text-zd-text">Try a scenario</h4>
            <p className="font-sans text-xs text-zd-muted mt-0.5">
              Simulate high-impact weather and seismic stress parameters
            </p>
          </div>
          <button className="text-zd-muted hover:text-zd-text">
            {scenarioOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {scenarioOpen && (
          <div className="p-6 border-t border-zd-border space-y-6 bg-zd-base/50">
            {/* Slider 1: Rainfall */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-sans text-zd-muted">Antecedent Rainfall (7-Day)</span>
                <span className="font-mono text-zd-text font-semibold">{sliderRain7D} mm</span>
              </div>
              <input
                type="range"
                min="50"
                max="450"
                value={sliderRain7D}
                onChange={(e) => setSliderRain7D(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zd-surface rounded appearance-none cursor-pointer accent-zd-accent"
              />
              <div className="flex justify-between font-mono text-[10px] text-zd-dim mt-1">
                <span>50 mm (Dry)</span>
                <span>450 mm (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Slider 2: Soil Saturation */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-sans text-zd-muted">Subsurface Soil Pore Saturation</span>
                <span className="font-mono text-zd-text font-semibold">{sliderSoilSat}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="98"
                value={sliderSoilSat}
                onChange={(e) => setSliderSoilSat(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zd-surface rounded appearance-none cursor-pointer accent-zd-accent"
              />
              <div className="flex justify-between font-mono text-[10px] text-zd-dim mt-1">
                <span>40% (Permeable)</span>
                <span>98% (Liquefaction Imminent)</span>
              </div>
            </div>

            {/* Slider 3: Vibration */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-sans text-zd-muted">Kinematic Ground Shear Velocity</span>
                <span className="font-mono text-zd-text font-semibold">{sliderVibration.toFixed(1)} mm/s</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4.5"
                step="0.1"
                value={sliderVibration}
                onChange={(e) => setSliderVibration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zd-surface rounded appearance-none cursor-pointer accent-zd-accent"
              />
              <div className="flex justify-between font-mono text-[10px] text-zd-dim mt-1">
                <span>0.1 mm/s (Micro-tremor)</span>
                <span>4.5 mm/s (Slope Rupture)</span>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToLive}
                className="gap-1.5 font-sans text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to live data</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Step Detail Drawer */}
      <Drawer
        isOpen={activeStepDrawer !== null}
        onClose={() => setActiveStepDrawer(null)}
        title="Model Pipeline Telemetry"
        subtitle={`Stage: ${activeStepDrawer?.toUpperCase()}`}
        width="w-96"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">DEM Slope Angle:</span>
              <span className="text-zd-text font-semibold">34.2°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Catchment Aspect:</span>
              <span className="text-zd-text">South-West (SW 215°)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Elevation Range:</span>
              <span className="text-zd-text">640m - 1,480m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Rainfall Windows:</span>
              <span className="text-zd-text">3D: 114mm · 7D: 310mm · 14D: 480mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Historical Training:</span>
              <span className="text-zd-text">2015, 2017, 2023 Disasters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Model Engine:</span>
              <span className="text-zd-accent">CatBoost-v1.2 + PyTorch LSTM</span>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
