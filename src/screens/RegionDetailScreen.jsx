import React, { useState } from 'react';
import { 
  ArrowLeft, Download, BellRing, Video, ChevronRight, Sliders, MapPin, Plus
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function RegionDetailScreen({ 
  onBack, 
  onOpenSluiceOverride, 
  onIssueSiren,
  onOpenAddShelter,
  onOpenEvacuationMap,
  onShowToast,
  onOpenMPU6050,
  onOpenAIRiskEngine,
  userRole = 'admin'
}) {
  const [telemetrySpan, setTelemetrySpan] = useState('7D');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Precipitation Chart Data
  const chartData = {
    '7D': {
      labels: ['10 May', '11 May', '12 May', '13 May', '14 May', '15 May', 'Today'],
      values: [12, 28, 33, 44, 56, 64, 68],
      peak: '68 mm/h',
    },
    '30D': {
      labels: ['16 Apr', '23 Apr', '30 Apr', '07 May', '14 May', 'Today'],
      values: [8, 14, 22, 38, 59, 68],
      peak: '68 mm/h',
    },
    '90D': {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Today'],
      values: [5, 12, 25, 48, 68],
      peak: '68 mm/h',
    }
  }[telemetrySpan];

  const svgWidth = 320;
  const svgHeight = 110;
  const maxY = 75;

  const points = chartData.values.map((val, idx) => {
    const x = (idx / (chartData.values.length - 1)) * (svgWidth - 36) + 24;
    const y = svgHeight - (val / maxY) * (svgHeight - 20) - 10;
    return { x, y, val, label: chartData.labels[idx] };
  });

  const dangerY = svgHeight - (50 / maxY) * (svgHeight - 20) - 10;

  // Path generator (1.5px clean line, no area fill)
  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-24 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Rampur Ward" userRole={userRole} />

      {/* Subheader */}
      <div className="w-full bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-1 -ml-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
              title="Return to territories overview"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight leading-tight">
                Rampur Ward
              </h1>
              <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
                Sector 4B Basin · South Sub-catchment
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-[#C1271D] dark:text-[#D9382E] px-1.5 py-0.5 border border-[#C1271D]/40 dark:border-[#D9382E]/40 rounded-[4px]">
            Critical
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {/* Single Boxed Hero Element: Emergency Directive (3px top border + tinted bg) */}
        <section 
          role="alert"
          className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] overflow-hidden bg-[#FAF9F6] dark:bg-[#171B19]"
        >
          <div className="h-[3px] bg-[#C1271D] dark:bg-[#D9382E]" />
          <div className="p-3.5 bg-[#C1271D]/[0.08] dark:bg-[#D9382E]/[0.12] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C1271D] dark:bg-[#D9382E] animate-slow-pulse flex-shrink-0" />
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] font-semibold text-[#C1271D] dark:text-[#D9382E]">
                  Evacuation Directive Active
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#C1271D] dark:text-[#D9382E] font-semibold">
                Datum +1.6 m
              </span>
            </div>

            <p className="text-xs text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed">
              River datum exceeded by 1.6 m. Embankment backflow threatens 1,240 households in Sector 4B low quadrants.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenEvacuationMap}
                className="h-9 px-3 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#0F1211] text-xs font-semibold rounded-[8px] flex-1 flex items-center justify-center gap-1.5 transition-calm"
              >
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Open evacuation corridor</span>
              </button>

              <button
                onClick={onOpenAddShelter}
                className="h-9 px-3 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] text-[#1A1D1B] dark:text-[#ECEAE4] text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1 transition-calm"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Add refuge</span>
              </button>
            </div>
          </div>
        </section>

        {/* Telemetry as Data Rows (label left, mono value right, small status dot) */}
        <section aria-label="Sector telemetry data rows">
          <div className="py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Live readings
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            {/* Reading 1: Rainfall */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C1271D] dark:bg-[#D9382E] flex-shrink-0" />
                <span className="text-[#5C635E] dark:text-[#8A928D]">Precipitation rate</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-base font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">62</span>
                <span className="text-xs text-[#5C635E] dark:text-[#8A928D]">mm/h</span>
                <span className="text-[11px] text-[#C1271D] dark:text-[#D9382E] ml-1.5">+14% 1h</span>
              </div>
            </div>

            {/* Reading 2: Soil Moisture */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D2620A] dark:bg-[#E87214] flex-shrink-0" />
                <span className="text-[#5C635E] dark:text-[#8A928D]">Capacitive soil saturation</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-base font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">91</span>
                <span className="text-xs text-[#5C635E] dark:text-[#8A928D]">%</span>
                <span className="text-[11px] text-[#D2620A] dark:text-[#E87214] ml-1.5">Saturated</span>
              </div>
            </div>

            {/* Reading 3: River Level */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C1271D] dark:bg-[#D9382E] flex-shrink-0" />
                <span className="text-[#5C635E] dark:text-[#8A928D]">River water depth</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-base font-semibold text-[#C1271D] dark:text-[#D9382E]">4.8</span>
                <span className="text-xs text-[#5C635E] dark:text-[#8A928D]">m</span>
                <span className="text-[11px] text-[#5C635E] dark:text-[#8A928D] ml-1.5">(Danger 4.2m)</span>
              </div>
            </div>

            {/* Reading 4: Sensor Node */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] dark:bg-[#389E65] flex-shrink-0" />
                <span className="text-[#5C635E] dark:text-[#8A928D]">Base station telemetry</span>
              </div>
              <div className="flex items-baseline gap-1.5 font-mono text-xs">
                <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">SN-014 Online</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">99.4% uptime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Precipitation Telemetry Chart (Chart rules: no fills, 1.5px line, dashed threshold) */}
        <section aria-label="Precipitation trend chart">
          <div className="flex items-center justify-between py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Intensity profile (mm/h)
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {['7D', '30D', '90D'].map((span) => (
                <button
                  key={span}
                  onClick={() => setTelemetrySpan(span)}
                  className={`px-1.5 py-0.5 rounded transition-calm ${
                    telemetrySpan === span 
                      ? 'bg-[#1A1D1B] text-[#FAF9F6] dark:bg-[#ECEAE4] dark:text-[#0F1211] font-semibold' 
                      : 'text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B]'
                  }`}
                >
                  {span}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 bg-[#FAF9F6] dark:bg-[#171B19]">
            <div className="flex justify-between items-baseline mb-2 text-xs font-mono">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Precipitation history</span>
              <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">Peak: {chartData.peak}</span>
            </div>

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-28 overflow-visible select-none">
              {/* Horizontal Grid lines */}
              {[75, 50, 25, 0].map((val) => {
                const yPos = svgHeight - (val / maxY) * (svgHeight - 20) - 10;
                return (
                  <g key={val}>
                    <text x="0" y={yPos + 3} fill="#8A928D" fontSize="8" fontFamily="'IBM Plex Mono', monospace">
                      {val}
                    </text>
                    <line x1="20" y1={yPos} x2={svgWidth} y2={yPos} stroke="currentColor" className="text-[#D8D4CA]/50 dark:text-[#2A302D]" strokeWidth="1" />
                  </g>
                );
              })}

              {/* Danger threshold line (dashed 1.5px in severity-critical) */}
              <line
                x1="20"
                y1={dangerY}
                x2={svgWidth}
                y2={dangerY}
                stroke="#C1271D"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text 
                x={svgWidth} 
                y={dangerY - 3} 
                fill="#C1271D" 
                fontSize="8" 
                fontFamily="'IBM Plex Mono', monospace"
                textAnchor="end"
              >
                Danger threshold 50 mm/h
              </text>

              {/* Chart Line: 1.5px clean line, NO gradient or fill under line */}
              <path
                d={linePath}
                fill="none"
                stroke="#1A1D1B"
                className="dark:stroke-[#ECEAE4]"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    className="fill-[#FAF9F6] dark:fill-[#171B19] stroke-[#1A1D1B] dark:stroke-[#ECEAE4]"
                    strokeWidth="1.5"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {hoveredIndex === i && (
                    <g>
                      <rect x={pt.x - 18} y={pt.y - 18} width="36" height="14" rx="2" className="fill-[#1A1D1B] dark:fill-[#ECEAE4]" />
                      <text x={pt.x} y={pt.y - 8} fill="#FAF9F6" className="dark:fill-[#0F1211]" fontSize="8" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">
                        {pt.val}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>

            {/* X-axis labels in mono */}
            <div className="flex justify-between items-center px-4 mt-2 text-[10px] font-mono text-[#5C635E] dark:text-[#8A928D]">
              {chartData.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Basin Sluice CCTV Feed */}
        <section aria-label="Hydraulic sluice camera feed">
          <div className="flex items-center justify-between py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Hydraulic barrier CCTV
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#C1271D] dark:text-[#D9382E]">
              <Video className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Live feed</span>
            </div>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] overflow-hidden bg-[#1A1D1B]">
            <div className="relative h-36 w-full">
              <img 
                src="/sluice_gate.jpg" 
                alt="Weir barrier live video" 
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1574974671999-24b7df56753f?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute top-2 left-2 bg-[#0F1211]/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#ECEAE4]">
                CAM-02 · WEIR GATE 03
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F6] dark:bg-[#171B19] border-t border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] block">
                  Rampur Weir 03 Barrier
                </span>
                <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                  Discharge: 1,240 m³/s · Aperture: 40%
                </span>
              </div>
              <button
                onClick={onOpenSluiceOverride}
                className="h-8 px-3 bg-[#C1271D] hover:bg-[#A81E15] text-white text-xs font-semibold rounded-[8px] transition-calm"
              >
                Override
              </button>
            </div>
          </div>
        </section>

        {/* Compact Sensors Table */}
        <section aria-label="Field sensor station inventory">
          <div className="flex items-center justify-between py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Field sensor inventory (5)
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            {/* SN-014 */}
            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">SN-014</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">Rain gauge (piezo array)</span>
              </div>
              <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4]">62 mm/h</span>
            </div>

            {/* SN-015 */}
            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#C1271D] dark:text-[#D9382E] font-semibold">SN-015</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">River ultrasonic gauge</span>
              </div>
              <span className="font-mono text-[#C1271D] dark:text-[#D9382E]">4.8 m (Critical)</span>
            </div>

            {/* SN-018 */}
            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">SN-018</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">Soil moisture 40cm</span>
              </div>
              <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4]">91%</span>
            </div>

            {/* SN-022 MPU-6050 (Clickable to open 3D) */}
            <div 
              onClick={onOpenMPU6050}
              className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#ECE9E2]/60 dark:hover:bg-[#2A302D]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">SN-022</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">MPU-6050 6-axis tiltmeter</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#1A1D1B] dark:text-[#ECEAE4]">
                <span>50Hz live</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
              </div>
            </div>

            {/* SN-029 */}
            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">SN-029</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">Sluice actuator 03</span>
              </div>
              <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4]">Open 40%</span>
            </div>
          </div>
        </section>

        {/* Analytical Risk Model Shortcut */}
        {onOpenAIRiskEngine && (
          <button
            onClick={onOpenAIRiskEngine}
            className="w-full h-11 px-3 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] text-xs font-semibold flex items-center justify-between hover:bg-[#ECE9E2]/50 dark:hover:bg-[#2A302D]/50 transition-colors"
          >
            <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">
              View risk model assessment (CatBoost + LSTM)
            </span>
            <ChevronRight className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Sticky Bottom Thumb Zone Actions */}
      <aside 
        aria-label="Critical emergency actions"
        className="fixed bottom-0 left-0 right-0 w-full bg-[#FAF9F6] dark:bg-[#171B19] border-t border-[#D8D4CA] dark:border-[#2A302D] z-20 transition-colors"
      >
        <div className="max-w-5xl mx-auto p-3 flex items-center gap-2">
          <button
            onClick={() => onShowToast ? onShowToast("Telemetry exported: CSV dataset 4,820 records", "success") : null}
            className="flex-1 h-11 px-3 border border-[#D8D4CA] dark:border-[#2A302D] text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 text-[#1A1D1B] dark:text-[#ECEAE4] hover:bg-[#ECE9E2] dark:hover:bg-[#2A302D] transition-calm"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onIssueSiren}
            className="flex-1 h-11 px-3 bg-[#C1271D] hover:bg-[#A81E15] text-white text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm"
          >
            <BellRing className="w-4 h-4" strokeWidth={1.5} />
            <span>Trigger siren</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
