import React, { useState } from 'react';
import { WardRegion, SensorNode, ShelterPoint } from '../../types';
import { Layers, ZoomIn, ZoomOut, Compass, Eye, EyeOff } from 'lucide-react';

interface OverviewMapProps {
  wards: WardRegion[];
  sensors: SensorNode[];
  shelters: ShelterPoint[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  hoveredWardId: string | null;
  onHoverWard: (wardId: string | null) => void;
  layers: {
    wards: boolean;
    sensors: boolean;
    shelters: boolean;
    rainfall: boolean;
    rivers: boolean;
    susceptibility: boolean;
  };
}

export const OverviewMap: React.FC<OverviewMapProps> = ({
  wards,
  sensors,
  shelters,
  selectedWardId,
  onSelectWard,
  hoveredWardId,
  onHoverWard,
  layers,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Convert lat/lng to canvas coordinates
  const minLat = 29.68, maxLat = 29.84;
  const minLng = 78.46, maxLng = 78.64;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = 700 - ((lat - minLat) / (maxLat - minLat)) * 700;
    return { x, y };
  };

  const hoveredWard = hoveredWardId ? wards.find(w => w.id === hoveredWardId) : null;

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none bg-zd-base"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Background Hillshade Relief Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-luminosity overflow-hidden">
        <img
          src="/assets/terrain-dark.webp"
          alt="Topographic Hillshade"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zd-base via-transparent to-zd-base/60" />
      </div>

      {/* SVG Vector Map Layer */}
      <svg
        className="w-full h-full relative z-10 cursor-crosshair"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="surveyGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="0.8" fill="rgba(255, 255, 255, 0.1)" />
          </pattern>

          {/* Rainfall Radar Pulse */}
          <radialGradient id="radarGlow" cx="48%" cy="38%" r="45%">
            <stop offset="0%" stopColor="#5CC8BE" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#5CC8BE" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#5CC8BE" stopOpacity="0" />
          </radialGradient>

          {/* Hazard diagonal hatch for slope risk */}
          <pattern id="slopeHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#E5484D" strokeWidth="1" strokeOpacity="0.35" />
          </pattern>
        </defs>

        {/* Survey Coordinates Grid */}
        <rect width="100%" height="100%" fill="url(#surveyGrid)" />

        {/* Elevation Contours */}
        <g className="text-white/10" stroke="currentColor" fill="none" strokeWidth="0.75">
          <path d="M 60 220 Q 280 150 500 200 T 940 180" strokeDasharray="3 3" />
          <path d="M 100 320 Q 350 250 600 300 T 980 280" />
          <path d="M 50 420 Q 300 350 550 400 T 950 380" strokeDasharray="3 3" />
          <path d="M 120 520 Q 380 450 630 500 T 990 480" />
        </g>

        {/* Rivers Layer */}
        {layers.rivers && (
          <g>
            {/* Khoh River Main Channel */}
            <path
              d="M 60 600 C 220 550, 360 490, 520 350 C 640 250, 780 200, 980 150"
              fill="none"
              stroke="#214050"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* River water flow shimmer */}
            <path
              d="M 60 600 C 220 550, 360 490, 520 350 C 640 250, 780 200, 980 150"
              fill="none"
              stroke="#5CC8BE"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              className="animate-pulse"
              opacity="0.75"
            />
            {/* Khoh Tributary */}
            <path
              d="M 520 350 Q 600 420 700 610"
              fill="none"
              stroke="#2C4B5E"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
        )}

        {/* Rainfall Radar Pulse */}
        {layers.rainfall && (
          <ellipse cx="530" cy="340" rx="240" ry="170" fill="url(#radarGlow)" />
        )}

        {/* Ward Polygons */}
        {layers.wards && wards.map((ward) => {
          const isSelected = selectedWardId === ward.id;
          const isHovered = hoveredWardId === ward.id;

          const points = ward.polygon.map(coord => {
            const pt = project(coord[0], coord[1]);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          const center = project(ward.lat, ward.lng);

          // 25% fill in severity color with thin outlines
          const severityStyles: Record<string, { fill: string; stroke: string }> = {
            safe: { fill: 'rgba(76, 183, 130, 0.14)', stroke: '#4CB782' },
            advisory: { fill: 'rgba(217, 180, 74, 0.18)', stroke: '#D9B44A' },
            warning: { fill: 'rgba(232, 132, 58, 0.22)', stroke: '#E8843A' },
            critical: { fill: 'rgba(229, 72, 77, 0.25)', stroke: '#E5484D' },
          };

          const style = severityStyles[ward.riskLevel] || severityStyles.safe;

          return (
            <g 
              key={ward.id}
              onClick={() => onSelectWard(ward.id)}
              onMouseEnter={() => onHoverWard(ward.id)}
              onMouseLeave={() => onHoverWard(null)}
              className="cursor-pointer transition-all duration-200"
            >
              <polygon
                points={points}
                fill={style.fill}
                stroke={isHovered || isSelected ? '#5CC8BE' : style.stroke}
                strokeWidth={isHovered || isSelected ? '2' : '1'}
                strokeDasharray={ward.riskLevel === 'critical' ? '4 3' : 'none'}
                className="transition-colors duration-200"
              />

              {/* Susceptibility diagonal hatch */}
              {layers.susceptibility && (ward.riskLevel === 'critical' || ward.riskLevel === 'warning') && (
                <polygon
                  points={points}
                  fill="url(#slopeHatch)"
                  opacity="0.5"
                />
              )}

              {/* Center point marker */}
              <circle
                cx={center.x}
                cy={center.y}
                r={isHovered || isSelected ? 4 : 2.5}
                fill={style.stroke}
                className="transition-all"
              />
              <text
                x={center.x}
                y={center.y - 8}
                textAnchor="middle"
                fill="#EAF0F3"
                fontSize="11"
                fontFamily="inherit"
                fontWeight={isHovered || isSelected ? '600' : '400'}
                className="pointer-events-none drop-shadow"
              >
                {ward.name}
              </text>
            </g>
          );
        })}

        {/* Shelters */}
        {layers.shelters && shelters.map(s => {
          const pt = project(s.lat, s.lng);
          return (
            <g key={s.id} className="cursor-pointer">
              <polygon
                points={`${pt.x},${pt.y - 7} ${pt.x + 6},${pt.y} ${pt.x + 4},${pt.y + 6} ${pt.x - 4},${pt.y + 6} ${pt.x - 6},${pt.y}`}
                fill="#4CB782"
                stroke="#0A0F13"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Sensors */}
        {layers.sensors && sensors.map(s => {
          const pt = project(s.lat, s.lng);
          return (
            <g key={s.id} className="cursor-pointer">
              <rect
                x={pt.x - 3}
                y={pt.y - 3}
                width="6"
                height="6"
                fill={s.status === 'online' ? '#5CC8BE' : s.status === 'degraded' ? '#E8843A' : '#5E6C77'}
                stroke="#0A0F13"
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredWard && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none p-2.5 bg-zd-surface/95 backdrop-blur-sm border border-zd-border rounded-panel shadow-popover text-xs font-sans"
          style={{
            left: `${Math.min(tooltipPos.x + 12, window.innerWidth - 220)}px`,
            top: `${Math.max(tooltipPos.y - 50, 10)}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredWard.riskLevel === 'critical'
                  ? 'bg-sev-critical'
                  : hoveredWard.riskLevel === 'warning'
                  ? 'bg-sev-warning'
                  : hoveredWard.riskLevel === 'advisory'
                  ? 'bg-sev-advisory'
                  : 'bg-sev-normal'
              }`}
            />
            <span className="font-semibold text-zd-text">{hoveredWard.name}</span>
            <span className="text-[10px] font-mono text-zd-dim capitalize">({hoveredWard.riskLevel})</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-zd-muted">
            <span>Rain: {hoveredWard.rainfall1h} mm/h</span>
            <span>River: {hoveredWard.riverLevelM} m</span>
          </div>
        </div>
      )}

      {/* Map Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
          className="w-8 h-8 rounded-[6px] bg-zd-surface/90 hover:bg-zd-raised border border-zd-border flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.25))}
          className="w-8 h-8 rounded-[6px] bg-zd-surface/90 hover:bg-zd-raised border border-zd-border flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="w-8 h-8 rounded-[6px] bg-zd-surface/90 hover:bg-zd-raised border border-zd-border flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors"
          title="Reset view"
        >
          <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Scale & Coordinate Metadata */}
      <div className="absolute bottom-3 left-16 z-20 flex items-center gap-2 font-mono text-[10px] text-zd-dim bg-zd-surface/80 px-2 py-0.5 rounded-[4px] border border-zd-border">
        <span>Kotdwar Catchment · EPSG:4326</span>
        <span className="opacity-40">|</span>
        <span>DEM 30m Hillshade</span>
      </div>
    </div>
  );
};
