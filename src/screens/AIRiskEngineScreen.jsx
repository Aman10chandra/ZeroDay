import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, SlidersHorizontal, Activity } from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function AIRiskEngineScreen({ 
  onBack, 
  onShowToast, 
  onNavigateEvacuation,
  userRole = 'admin'
}) {
  const [selectedVillage, setSelectedVillage] = useState('rampur');
  const [soilSaturation, setSoilSaturation] = useState(88); // %
  const [rollingRain7D, setRollingRain7D] = useState(285); // mm
  const [vibrationIntensity, setVibrationIntensity] = useState(1.8); // mm/s

  const villageData = {
    rampur: {
      name: 'Rampur Ward (Sector 4B)',
      demSlope: '34.2°',
      demAspect: 'North-East 68°',
      elevationRange: '840m – 1,420m',
      baseCatBoostScore: 78,
    },
    bhelupur: {
      name: 'Bhelupur Upper Ridge',
      demSlope: '41.5°',
      demAspect: 'South-West 210°',
      elevationRange: '1,120m – 1,860m',
      baseCatBoostScore: 86,
    },
    kotdwar: {
      name: 'Kotdwar Valley Base',
      demSlope: '18.4°',
      demAspect: 'East 90°',
      elevationRange: '620m – 890m',
      baseCatBoostScore: 54,
    }
  };

  const currentVillage = villageData[selectedVillage];

  // Dynamic CatBoost Score (Seasonal Susceptibility)
  const dynamicCatBoost = Math.min(
    98, 
    Math.round(currentVillage.baseCatBoostScore * 0.7 + (rollingRain7D / 350) * 30)
  );

  // Dynamic Multi-Sensor LSTM Trigger (Live time-series)
  const isSoilCritical = soilSaturation >= 80;
  const lstmConfidence = Math.min(
    99,
    Math.round((soilSaturation * 0.55) + (vibrationIntensity * 22))
  );
  const isLiveTriggerFired = isSoilCritical && (vibrationIntensity > 1.2 || soilSaturation > 85);

  // Blended Decision Output (CatBoost 40% + LSTM 60%)
  let decisionStatus = 'Normal advisory level';
  let decisionSeverity = 'advisory';
  let decisionTitle = 'Advisory: Baseline Monitoring';

  if (dynamicCatBoost > 70 && isLiveTriggerFired) {
    decisionStatus = 'Evacuation directive: Slope breach and flash flood imminent in Sector 4B.';
    decisionSeverity = 'critical';
    decisionTitle = 'Critical Directive: Evacuation Required';
  } else if (dynamicCatBoost > 60 || isLiveTriggerFired) {
    decisionStatus = 'Warning: Elevated soil saturation and slope instability detected.';
    decisionSeverity = 'warning';
    decisionTitle = 'Warning: Prepare Evacuation Havens';
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-12 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Risk Engine" userRole={userRole} />

      {/* Subheader */}
      <div className="w-full bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-1 -ml-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
              title="Return"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight leading-tight">
                Risk model pipeline
              </h1>
              <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
                CatBoost susceptibility + LSTM live trigger
              </p>
            </div>
          </div>

          {/* Territory Selector */}
          <select 
            value={selectedVillage} 
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] text-xs font-mono px-2 py-1 rounded-[4px] border border-[#D8D4CA] dark:border-[#2A302D] outline-none"
          >
            <option value="rampur">Rampur Ward</option>
            <option value="bhelupur">Bhelupur Ridge</option>
            <option value="kotdwar">Kotdwar Valley</option>
          </select>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {/* The Combined Decision as the Single Boxed Hero Block */}
        <section 
          role="region"
          aria-label="Combined risk decision"
          className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] overflow-hidden bg-[#FAF9F6] dark:bg-[#171B19]"
        >
          <div className={`h-[3px] ${
            decisionSeverity === 'critical' ? 'bg-[#C1271D] dark:bg-[#D9382E]' :
            decisionSeverity === 'warning' ? 'bg-[#D2620A] dark:bg-[#E87214]' : 'bg-[#A87A00] dark:bg-[#C79200]'
          }`} />

          <div className={`p-3.5 space-y-2.5 ${
            decisionSeverity === 'critical' ? 'bg-[#C1271D]/[0.08] dark:bg-[#D9382E]/[0.12]' :
            decisionSeverity === 'warning' ? 'bg-[#D2620A]/[0.08] dark:bg-[#E87214]/[0.12]' : 'bg-[#A87A00]/[0.08] dark:bg-[#C79200]/[0.12]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  decisionSeverity === 'critical' ? 'bg-[#C1271D] dark:bg-[#D9382E] animate-slow-pulse' :
                  decisionSeverity === 'warning' ? 'bg-[#D2620A] dark:bg-[#E87214]' : 'bg-[#A87A00] dark:bg-[#C79200]'
                }`} />
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                  {decisionTitle}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                Blended 40/60
              </span>
            </div>

            <p className="text-xs text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed">
              {decisionStatus}
            </p>

            {decisionSeverity === 'critical' && onNavigateEvacuation && (
              <button
                onClick={onNavigateEvacuation}
                className="w-full h-9 px-3 bg-[#C1271D] hover:bg-[#A81E15] text-white text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm"
              >
                <span>Dispatch safe highland route</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </section>

        {/* The Two Models as Two Labelled Rows with Weight and Score */}
        <section aria-label="Component predictive models">
          <div className="py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Component models
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            {/* Model 1: CatBoost Seasonal Susceptibility */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] block">
                    CatBoost seasonal susceptibility
                  </span>
                  <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    Weight: 40% · Topography + historical labels
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-base font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                    {dynamicCatBoost}%
                  </span>
                  <span className="text-[10px] text-[#5C635E] dark:text-[#8A928D] block">
                    {dynamicCatBoost > 70 ? 'High' : 'Moderate'}
                  </span>
                </div>
              </div>

              {/* Topography sub-row */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-[#ECE9E2]/40 dark:bg-[#121514]/40 rounded-[4px] text-[11px] font-mono">
                <div>
                  <span className="text-[#5C635E] dark:text-[#8A928D] block text-[10px]">Slope</span>
                  <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">{currentVillage.demSlope}</span>
                </div>
                <div>
                  <span className="text-[#5C635E] dark:text-[#8A928D] block text-[10px]">Aspect</span>
                  <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">{currentVillage.demAspect}</span>
                </div>
                <div>
                  <span className="text-[#5C635E] dark:text-[#8A928D] block text-[10px]">Elevation</span>
                  <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">{currentVillage.elevationRange}</span>
                </div>
              </div>
            </div>

            {/* Model 2: Multi-Sensor LSTM Live Trigger */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] block">
                    Multi-sensor LSTM live trigger
                  </span>
                  <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    Weight: 60% · Field sensor time-series
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-base font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                    {lstmConfidence}%
                  </span>
                  <span className={`text-[10px] block ${isLiveTriggerFired ? 'text-[#C1271D] dark:text-[#D9382E] font-semibold' : 'text-[#2E7D4F] dark:text-[#389E65]'}`}>
                    {isLiveTriggerFired ? 'Trigger fired' : 'Nominal trace'}
                  </span>
                </div>
              </div>

              {/* Live inputs sub-row */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-[#ECE9E2]/40 dark:bg-[#121514]/40 rounded-[4px] text-[11px] font-mono">
                <div>
                  <span className="text-[#5C635E] dark:text-[#8A928D] block text-[10px]">Soil saturation</span>
                  <span className={soilSaturation >= 80 ? 'text-[#C1271D] dark:text-[#D9382E] font-semibold' : 'text-[#1A1D1B] dark:text-[#ECEAE4]'}>
                    {soilSaturation}% {soilSaturation >= 80 ? '(Critical)' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[#5C635E] dark:text-[#8A928D] block text-[10px]">Slope vibration</span>
                  <span className={vibrationIntensity >= 2.0 ? 'text-[#C1271D] dark:text-[#D9382E] font-semibold' : 'text-[#1A1D1B] dark:text-[#ECEAE4]'}>
                    {vibrationIntensity} mm/s {vibrationIntensity >= 2.0 ? '(Pulse)' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Model Stress-Testing Sliders (Sliders get mono value readouts at right end) */}
        <section aria-label="Model parameter simulation">
          <div className="py-1 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Model parameter controls
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3.5 bg-[#FAF9F6] dark:bg-[#171B19] space-y-3.5">
            {/* Slider 1: 7-Day Rainfall */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-[#5C635E] dark:text-[#8A928D]">7-day accumulation</span>
                <span className="font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                  {rollingRain7D} mm
                </span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="450" 
                value={rollingRain7D}
                onChange={(e) => setRollingRain7D(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-full appearance-none cursor-pointer accent-[#1A1D1B] dark:accent-[#ECEAE4]"
              />
            </div>

            {/* Slider 2: Soil Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-[#5C635E] dark:text-[#8A928D]">Soil saturation probe</span>
                <span className="font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                  {soilSaturation}%
                </span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="98" 
                value={soilSaturation}
                onChange={(e) => setSoilSaturation(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-full appearance-none cursor-pointer accent-[#1A1D1B] dark:accent-[#ECEAE4]"
              />
            </div>

            {/* Slider 3: Vibration */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-[#5C635E] dark:text-[#8A928D]">Slope vibration</span>
                <span className="font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                  {vibrationIntensity} mm/s
                </span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="4.5" 
                step="0.1"
                value={vibrationIntensity}
                onChange={(e) => setVibrationIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-full appearance-none cursor-pointer accent-[#1A1D1B] dark:accent-[#ECEAE4]"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
