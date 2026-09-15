import React, { useState } from 'react';
import { 
  ArrowLeft, Droplets, Waves, Radio, TrendingUp, AlertTriangle, 
  Download, BellRing, Video, ChevronRight, BarChart2
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function RegionDetailScreen({ 
  onBack, 
  onOpenSluiceOverride, 
  onIssueSiren 
}) {
  const [activeTab, setActiveTab] = useState('rain');
  const [telemetrySpan, setTelemetrySpan] = useState('7D');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Data for chart based on span
  const chartDataMap = {
    '7D': {
      labels: ['May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'Today'],
      values: [12, 28, 33, 44, 56, 64, 68],
      peak: '68 mm/hr',
    },
    '30D': {
      labels: ['Apr 16', 'Apr 23', 'Apr 30', 'May 07', 'May 14', 'Today'],
      values: [8, 14, 22, 38, 59, 68],
      peak: '68 mm/hr',
    },
    '90D': {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Today'],
      values: [5, 12, 25, 48, 68],
      peak: '68 mm/hr',
    }
  };

  const currentChart = chartDataMap[telemetrySpan];

  // SVG Chart Dimensions
  const svgWidth = 330;
  const svgHeight = 120;
  const maxY = 75;

  // Convert values to SVG coordinate string
  const points = currentChart.values.map((val, idx) => {
    const x = (idx / (currentChart.values.length - 1)) * (svgWidth - 40) + 25;
    const y = svgHeight - (val / maxY) * (svgHeight - 20) - 10;
    return { x, y, val, label: currentChart.labels[idx] };
  });

  // Danger threshold line Y
  const dangerY = svgHeight - (50 / maxY) * (svgHeight - 20) - 10;

  // Generate smooth SVG path
  const generateCurvedPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[0];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = generateCurvedPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Header */}
      <TopHeader currentRegion="All Regions" />

      {/* Sub-header with Back Arrow, Title, and RED ALERT Pill */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" strokeWidth={2.4} />
          </button>
          <div>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
              Rampur Ward
            </h1>
            <p className="text-[11.5px] text-slate-500 font-medium leading-none mt-0.5">
              Basin Sector 4B · Zone South
            </p>
          </div>
        </div>

        {/* RED ALERT Badge */}
        <div className="flex items-center gap-1.5 bg-[#fee2e2] px-2.5 py-1 rounded-full border border-red-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-ping" />
          <span className="text-[10.5px] font-extrabold text-[#991b1b] tracking-wider uppercase">
            RED ALERT
          </span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-4">
        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Rainfall */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative">
            <div className="flex items-center justify-between text-slate-500 text-[12px] font-medium">
              <span>Rainfall</span>
              <Droplets className="w-4 h-4 text-[#a83210]" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              62 <span className="text-xs font-normal text-slate-500">mm/hr</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#dc2626] mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14% vs 1h ago</span>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative">
            <div className="flex items-center justify-between text-slate-500 text-[12px] font-medium">
              <span>Soil moisture</span>
              <Droplets className="w-4 h-4 text-[#a83210]" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              91%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#b45309] mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Near saturation</span>
            </div>
          </div>

          {/* River Level */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative">
            <div className="flex items-center justify-between text-slate-500 text-[12px] font-medium">
              <span>River level</span>
              <Waves className="w-4 h-4 text-[#dc2626]" />
            </div>
            <div className="text-xl font-black text-[#dc2626] mt-1.5">
              Critical
            </div>
            <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1">
              <span>⤓ 4.8m (Danger: 4.2m)</span>
            </div>
          </div>

          {/* Sensor N-014 */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative">
            <div className="flex items-center justify-between text-slate-500 text-[12px] font-medium">
              <span>Sensor N-014</span>
              <Radio className="w-4 h-4 text-[#a83210]" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              <span className="text-lg font-black text-slate-900">Online</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
              <span>📶 Telemetry 99.4%</span>
            </div>
          </div>
        </div>

        {/* Tab Selector: Rain History, Sensor History, Alert History */}
        <div className="flex items-center border-b border-slate-200">
          <button
            onClick={() => setActiveTab('rain')}
            className={`pb-2 px-3 text-[13px] font-bold transition-all relative ${
              activeTab === 'rain' ? 'text-[#a83210]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Rain History
            {activeTab === 'rain' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#a83210] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sensor')}
            className={`pb-2 px-3 text-[13px] font-medium transition-all relative ${
              activeTab === 'sensor' ? 'text-[#a83210] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sensor History
            {activeTab === 'sensor' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#a83210] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('alert')}
            className={`pb-2 px-3 text-[13px] font-medium transition-all relative ${
              activeTab === 'alert' ? 'text-[#a83210] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Alert History
            {activeTab === 'alert' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#a83210] rounded-full" />
            )}
          </button>
        </div>

        {/* Precipitation Telemetry Chart Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Intensity Profile (mm/hr)
              </span>
              <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                Precipitation Telemetry
              </h3>
            </div>
            <span className="bg-[#ffedd5] text-[#9a3412] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#fed7aa]">
              Peak: {currentChart.peak}
            </span>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative w-full pt-1 pb-2">
            {/* SVG Chart */}
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-32 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                  <stop offset="90%" stopColor="#ea580c" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid lines */}
              {[75, 50, 25, 0].map((val) => {
                const yPos = svgHeight - (val / maxY) * (svgHeight - 20) - 10;
                return (
                  <g key={val}>
                    <text x="5" y={yPos + 3} fill="#94a3b8" fontSize="8.5" fontFamily="sans-serif">
                      {val}
                    </text>
                    <line 
                      x1="22" 
                      y1={yPos} 
                      x2={svgWidth} 
                      y2={yPos} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                    />
                  </g>
                );
              })}

              {/* Danger Threshold Line (at 50 mm) */}
              <line
                x1="22"
                y1={dangerY}
                x2={svgWidth}
                y2={dangerY}
                stroke="#dc2626"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <text 
                x={svgWidth - 5} 
                y={dangerY - 4} 
                fill="#dc2626" 
                fontSize="8.5" 
                textAnchor="end" 
                fontWeight="bold"
              >
                Danger Threshold (50 mm)
              </text>

              {/* Area Under Curve */}
              <path d={areaPath} fill="url(#rainGradient)" />

              {/* Red Line */}
              <path 
                d={linePath} 
                fill="none" 
                stroke="#9a3412" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />

              {/* Dots on points */}
              {points.map((pt, i) => (
                <g key={i} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#9a3412"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Tooltip on hover */}
                  {hoveredPoint && hoveredPoint.label === pt.label && (
                    <g>
                      <rect 
                        x={pt.x - 22} 
                        y={pt.y - 24} 
                        width="44" 
                        height="18" 
                        rx="4" 
                        fill="#1e293b" 
                      />
                      <text 
                        x={pt.x} 
                        y={pt.y - 12} 
                        fill="#ffffff" 
                        fontSize="9" 
                        textAnchor="middle" 
                        fontWeight="bold"
                      >
                        {pt.val} mm/h
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>

            {/* X-axis date labels */}
            <div className="flex justify-between items-center px-4 mt-1 text-[10.5px] text-slate-400">
              {currentChart.labels.map((lbl, idx) => (
                <span 
                  key={idx} 
                  className={idx === currentChart.labels.length - 1 ? "font-bold text-[#a83210]" : ""}
                >
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* Telemetry Span Toggle */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Telemetry Span</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              {['7D', '30D', '90D'].map((span) => (
                <button
                  key={span}
                  onClick={() => setTelemetrySpan(span)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    telemetrySpan === span 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {span}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Basin Sluice Overview Live Feed Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="p-3.5 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Basin Sluice Overview
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#dc2626]">
              <Video className="w-3.5 h-3.5" />
              <span>Live Feed</span>
            </div>
          </div>

          {/* Sluice Gate Real Photo / Banner */}
          <div className="relative h-44 w-full bg-slate-900">
            <img 
              src="/sluice_gate.jpg" 
              alt="Rampur Weir #3 Barrier" 
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                // Fallback image if needed
                e.target.src = "https://images.unsplash.com/photo-1574974671999-24b7df56753f?auto=format&fit=crop&w=800&q=80";
              }}
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Live blinking tag */}
            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              CAM-02 WEIR GATE
            </div>

            {/* Bottom info banner with Override button */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-bold text-white tracking-tight leading-tight drop-shadow-sm">
                  Rampur Weir #3 Barrier
                </h4>
                <p className="text-[11px] text-slate-200 font-medium drop-shadow-sm mt-0.5">
                  Discharge: 1,240 m³/sec · Active
                </p>
              </div>
              <button 
                onClick={onOpenSluiceOverride}
                className="bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95"
              >
                Override
              </button>
            </div>
          </div>
        </div>

        {/* Sensors List Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16.5px] font-bold text-slate-900 tracking-tight">
              Sensors
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              5 active monitoring nodes
            </span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {/* SN-014 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ea580c] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-900">
                    SN-014 · Rain Gauge
                  </h4>
                  <p className="text-[11.5px] text-slate-500">
                    Acoustic piezo array
                  </p>
                </div>
              </div>
              <span className="text-[13.5px] font-extrabold text-slate-900">
                62 mm/hr
              </span>
            </div>

            {/* SN-015 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#dc2626] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-900">
                    SN-015 · River Level Gauge
                  </h4>
                  <p className="text-[11.5px] text-[#dc2626] font-medium">
                    Exceeded major danger level
                  </p>
                </div>
              </div>
              <span className="text-[13px] font-extrabold text-[#dc2626]">
                4.8m <span className="font-normal text-[11px] text-red-500/80">(Warn: 4.2m)</span>
              </span>
            </div>

            {/* SN-018 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ea580c] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-900">
                    SN-018 · Soil Moisture Sensor
                  </h4>
                  <p className="text-[11.5px] text-slate-500">
                    Root depth 40cm probe
                  </p>
                </div>
              </div>
              <span className="text-[13.5px] font-extrabold text-slate-900">
                91% Saturation
              </span>
            </div>

            {/* SN-022 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-900">
                    SN-022 · Embankment Monitor
                  </h4>
                  <p className="text-[11.5px] text-slate-500">
                    Structural tiltmeter gauge
                  </p>
                </div>
              </div>
              <span className="text-[12.5px] font-semibold text-slate-400">
                Offline - 2hr ago
              </span>
            </div>

            {/* SN-029 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ea580c] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-900">
                    SN-029 · Sluice Gate Telem...
                  </h4>
                  <p className="text-[11.5px] text-slate-500">
                    Actuator load nominal
                  </p>
                </div>
              </div>
              <span className="text-[13px] font-extrabold text-slate-900">
                Online · Open 40%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[16.5px] font-bold text-slate-900 tracking-tight">
              Recent Alerts
            </h3>
            <button className="text-xs font-bold text-[#a83210] hover:underline">
              View Log
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {/* Alert 1 */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#dc2626] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900">
                    River level critical near Rampur bridge
                  </h4>
                  <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                    Automated evacuation dispatch dispatched to Unit 4
                  </p>
                </div>
              </div>
              <span className="text-[11.5px] text-slate-500 font-medium whitespace-nowrap">
                4:12 PM
              </span>
            </div>

            {/* Alert 2 */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#b45309] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900">
                    Sluice gate 3 opened to relieve pressure
                  </h4>
                  <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                    Hydraulic command executed remotely by District Eng.
                  </p>
                </div>
              </div>
              <span className="text-[11.5px] text-slate-500 font-medium whitespace-nowrap">
                2:45 PM
              </span>
            </div>

            {/* Alert 3 */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#b45309] mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900">
                    Rainfall exceeded 50 mm/hr threshold
                  </h4>
                  <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                    Continuous telemetry trigger from station SN-014
                  </p>
                </div>
              </div>
              <span className="text-[11.5px] text-slate-500 font-medium whitespace-nowrap">
                11:30 AM
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Export Telemetry & Issue Siren */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button 
            onClick={() => alert("Downloading telemetry sensor dataset (CSV/JSON)...")}
            className="flex items-center justify-center gap-2 bg-[#e8f0fe] hover:bg-[#dbeafe] text-[#1e40af] font-bold text-xs py-3 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Telemetry</span>
          </button>

          <button 
            onClick={onIssueSiren}
            className="flex items-center justify-center gap-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-95 animate-pulse"
          >
            <BellRing className="w-4 h-4" />
            <span>Issue Siren</span>
          </button>
        </div>
      </div>
    </div>
  );
}
