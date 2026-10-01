import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { RescueRequest, WardRegion } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  AlertOctagon, 
  LifeBuoy, 
  CheckCircle2, 
  Clock, 
  Users, 
  Battery, 
  Phone, 
  Shield, 
  Radio, 
  ExternalLink 
} from 'lucide-react';
import clsx from 'clsx';

interface RescueMapProps {
  rescueRequests: RescueRequest[];
  wards: WardRegion[];
  selectedRescueId: string | null;
  onSelectRescue: (id: string) => void;
  onDispatchOfficer: (request: RescueRequest) => void;
  onMarkRescued: (request: RescueRequest) => void;
}

export const RescueMap: React.FC<RescueMapProps> = ({
  rescueRequests,
  wards,
  selectedRescueId,
  onSelectRescue,
  onDispatchOfficer,
  onMarkRescued,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredRequestId, setHoveredRequestId] = useState<string | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [showRescuedPins, setShowRescuedPins] = useState(true);
  const [showWards, setShowWards] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [satelliteBg, setSatelliteBg] = useState(true);

  // Geographic bounds for Kotdwar & Khoh river catchment
  const minLat = 29.72, maxLat = 29.78;
  const minLng = 78.50, maxLng = 78.56;

  const project = (lat: number, lng: number) => {
    // Keep clamp within bounds
    const clampedLat = Math.min(Math.max(lat, minLat), maxLat);
    const clampedLng = Math.min(Math.max(lng, minLng), maxLng);
    const x = ((clampedLng - minLng) / (maxLng - minLng)) * 1000;
    const y = 700 - ((clampedLat - minLat) / (maxLat - minLat)) * 700;
    return { x, y };
  };

  const displayedRequests = rescueRequests.filter(req => {
    if (!showRescuedPins && req.status === 'rescued') return false;
    return true;
  });

  const hoveredRequest = rescueRequests.find(r => r.id === hoveredRequestId);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-zd-base border border-zd-border rounded-panel shadow-sm">
      {/* 1. Tactical Satellite Hillshade Relief Background */}
      {satelliteBg && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src="/assets/rescue-terrain.jpg"
            alt="Himalayan Rescue Topographic Hillshade"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.25] saturate-[0.8] transition-opacity duration-300"
          />
          {/* Tactical Scrim Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-zd-base/90 via-zd-base/40 to-zd-base/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,15,19,0.85)_100%)]" />
        </div>
      )}

      {/* 2. Vector GIS / Topographic Grid / Rivers / Markers */}
      <svg
        className="w-full h-full relative z-10"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <defs>
          {/* Tactical Coordinates Grid */}
          <pattern id="rescueGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
            <circle cx="60" cy="60" r="0.8" fill="rgba(92, 200, 190, 0.2)" />
          </pattern>

          {/* High Danger Area Diagonal Hatch */}
          <pattern id="dangerHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#E5484D" strokeWidth="1.2" strokeOpacity="0.3" />
          </pattern>

          {/* Pulsing Beacon Glow Filter */}
          <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* River Water Gradient */}
          <linearGradient id="khohTorrentGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1B3848" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#255768" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#5CC8BE" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Survey Coordinates Grid */}
        <rect width="100%" height="100%" fill="url(#rescueGrid)" />

        {/* Topographic Contours */}
        <g stroke="rgba(255, 255, 255, 0.05)" fill="none" strokeWidth="0.8">
          <path d="M 0 160 Q 280 110 520 150 T 1000 130" strokeDasharray="3 3" />
          <path d="M 0 270 Q 320 200 580 250 T 1000 220" />
          <path d="M 0 390 Q 290 320 540 370 T 1000 340" strokeDasharray="3 3" />
          <path d="M 0 510 Q 360 440 620 490 T 1000 460" />
          <path d="M 0 630 Q 340 560 600 610 T 1000 580" strokeDasharray="3 3" />
        </g>

        {/* River Torrent Layer */}
        {showRivers && (
          <g>
            {/* Khoh River Bed */}
            <path
              d="M 80 680 C 240 620, 390 540, 510 410 C 600 310, 710 240, 960 170"
              fill="none"
              stroke="#132B3A"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Active Surge Streamline */}
            <path
              d="M 80 680 C 240 620, 390 540, 510 410 C 600 310, 710 240, 960 170"
              fill="none"
              stroke="url(#khohTorrentGradient)"
              strokeWidth="4"
              strokeDasharray="10 6"
              className="animate-pulse"
            />
            {/* Tributary */}
            <path
              d="M 510 410 Q 640 490 760 670"
              fill="none"
              stroke="#1B3848"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M 510 410 Q 640 490 760 670"
              fill="none"
              stroke="#5CC8BE"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.75"
            />
            {/* River Label */}
            <text
              x="320"
              y="590"
              fill="rgba(92, 200, 190, 0.7)"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="600"
              letterSpacing="0.1em"
              transform="rotate(-28 320 590)"
            >
              KHOH RIVERBED (SURGE VELOCITY 4.8 m/s)
            </text>
          </g>
        )}

        {/* Ward Polygons */}
        {showWards && wards.map((ward) => {
          const isCritical = ward.riskLevel === 'critical';
          const points = ward.polygon.map(coord => {
            const pt = project(coord[0], coord[1]);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          const center = project(ward.lat, ward.lng);

          const severityColors: Record<string, { fill: string; stroke: string }> = {
            normal: { fill: 'rgba(76, 183, 130, 0.08)', stroke: 'rgba(76, 183, 130, 0.35)' },
            advisory: { fill: 'rgba(217, 180, 74, 0.10)', stroke: 'rgba(217, 180, 74, 0.45)' },
            warning: { fill: 'rgba(232, 132, 58, 0.12)', stroke: 'rgba(232, 132, 58, 0.55)' },
            critical: { fill: 'rgba(229, 72, 77, 0.16)', stroke: 'rgba(229, 72, 77, 0.75)' },
          };

          const color = severityColors[ward.riskLevel] || severityColors.normal;

          return (
            <g key={ward.id} className="pointer-events-none">
              <polygon
                points={points}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={1.5}
                strokeDasharray={isCritical ? 'none' : '4 3'}
                strokeLinejoin="round"
              />
              {isCritical && (
                <polygon
                  points={points}
                  fill="url(#dangerHatch)"
                />
              )}
              {/* Ward Label with Collision Avoidance */}
              <text
                x={ward.id === 'ward-bhelupur' ? center.x - 24 : center.x}
                y={ward.id === 'ward-bhelupur' ? center.y - 34 : center.y - 18}
                textAnchor="middle"
                fill="#C5D3DD"
                fontSize="11"
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
                style={{
                  paintOrder: 'stroke fill',
                  stroke: '#0A0F13',
                  strokeWidth: '3px',
                }}
              >
                {ward.name.replace(' Lowlands', '').replace(' Gully', '').replace(' Roadway', '')}
              </text>
            </g>
          );
        })}

        {/* Citizen Rescue Request Pins */}
        {displayedRequests.map((req) => {
          const pt = project(req.lat, req.lng);
          const isSelected = selectedRescueId === req.id;
          const isHovered = hoveredRequestId === req.id;
          const isCritical = req.urgency === 'critical';
          const isRescued = req.status === 'rescued';
          const isDispatched = req.status === 'dispatched' || req.status === 'in_progress';

          // Marker color palette
          let pinColor = '#E5484D'; // Red
          let pulseColor = 'rgba(229, 72, 77, 0.4)';
          if (isRescued) {
            pinColor = '#4CB782'; // Green
            pulseColor = 'rgba(76, 183, 130, 0.3)';
          } else if (isDispatched) {
            pinColor = '#5CC8BE'; // Teal
            pulseColor = 'rgba(92, 200, 190, 0.4)';
          } else if (req.urgency === 'urgent') {
            pinColor = '#E8843A'; // Orange
            pulseColor = 'rgba(232, 132, 58, 0.4)';
          } else if (req.urgency === 'moderate') {
            pinColor = '#D9B44A'; // Amber
            pulseColor = 'rgba(217, 180, 74, 0.3)';
          }

          return (
            <g
              key={req.id}
              onClick={() => onSelectRescue(req.id)}
              onMouseEnter={() => setHoveredRequestId(req.id)}
              onMouseLeave={() => setHoveredRequestId(null)}
              className="cursor-pointer transition-transform duration-150"
              style={{
                transformOrigin: `${pt.x}px ${pt.y}px`,
                transform: isHovered || isSelected ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              {/* Outer Pulsing Beacon for Pending Critical Requests */}
              {isCritical && req.status === 'pending' && (
                <>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="24"
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    className="animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="16"
                    fill={pulseColor}
                    className="animate-pulse"
                  />
                </>
              )}

              {/* In-progress radar ring */}
              {isDispatched && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="18"
                  fill="none"
                  stroke={pinColor}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.8"
                />
              )}

              {/* Pin Halo */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 16 : isHovered ? 14 : 11}
                fill="#0A0F13"
                stroke={isSelected ? '#5CC8BE' : pinColor}
                strokeWidth={isSelected ? 2.5 : 2}
                filter={isCritical ? 'url(#beaconGlow)' : undefined}
                className="transition-all"
              />

              {/* Inner Circle Fill */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 10 : 8}
                fill={pinColor}
              />

              {/* Person Icon / Count Text inside pin */}
              <text
                x={pt.x}
                y={pt.y + 3.5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {isRescued ? '✓' : req.peopleCount}
              </text>

              {/* SOS Tag Badge Above Pin */}
              <g transform={`translate(${pt.x}, ${pt.y - 18})`}>
                <rect
                  x="-28"
                  y="-12"
                  width="56"
                  height="14"
                  rx="3"
                  fill="#0A0F13"
                  stroke={pinColor}
                  strokeWidth="1"
                  strokeOpacity="0.85"
                />
                <text
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  fill="#EAF0F3"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {req.code}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Card */}
      {hoveredRequest && (
        <div 
          className="absolute z-30 bottom-16 left-5 max-w-sm bg-zd-surface/95 backdrop-blur-md border border-zd-border rounded-panel p-3.5 shadow-popover text-zd-text animate-in fade-in-0 slide-in-from-bottom-2 duration-150 pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zd-border pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={clsx(
                "w-2 h-2 rounded-full",
                hoveredRequest.urgency === 'critical' ? 'bg-sev-critical animate-ping' :
                hoveredRequest.status === 'rescued' ? 'bg-sev-safe' : 'bg-sev-warning'
              )} />
              <span className="font-mono text-xs font-bold text-zd-text">{hoveredRequest.code}</span>
              <span className="font-sans text-xs text-zd-muted">• {hoveredRequest.wardName}</span>
            </div>
            <span className={clsx(
              "px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase",
              hoveredRequest.status === 'rescued' ? 'bg-sev-safe/20 text-sev-safe border border-sev-safe/30' :
              hoveredRequest.status === 'dispatched' ? 'bg-zd-accent/20 text-zd-accent border border-zd-accent/30' :
              hoveredRequest.status === 'in_progress' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
              'bg-sev-critical/20 text-sev-critical border border-sev-critical/30'
            )}>
              {hoveredRequest.status.replace('_', ' ')}
            </span>
          </div>

          <div className="text-xs space-y-1.5 font-sans">
            <div className="font-semibold text-zd-text flex items-center justify-between">
              <span>{hoveredRequest.citizenName}</span>
              <span className="text-[11px] font-normal text-zd-muted flex items-center gap-1">
                <Users className="w-3 h-3 text-zd-accent" /> {hoveredRequest.peopleCount} trapped
              </span>
            </div>
            <p className="text-zd-muted line-clamp-2 leading-relaxed">
              {hoveredRequest.situation}
            </p>
            {hoveredRequest.vulnerableDetails && (
              <p className="text-[11px] text-sev-warning font-medium">
                ⚠️ {hoveredRequest.vulnerableDetails}
              </p>
            )}
            <div className="text-[11px] text-zd-dim flex items-center justify-between pt-1">
              <span>📱 {hoveredRequest.phone}</span>
              <span>🕒 {hoveredRequest.timestamp}</span>
            </div>
          </div>

          {/* Quick Action in hover card */}
          <div className="mt-3 pt-2 border-t border-zd-border flex items-center gap-2">
            <button
              onClick={() => onSelectRescue(hoveredRequest.id)}
              className="flex-1 px-2.5 py-1 text-xs bg-zd-raised hover:bg-zd-hover text-zd-text rounded-control border border-zd-border transition-colors font-sans flex items-center justify-center gap-1.5"
            >
              <span>View Full Dossier</span>
            </button>
            {hoveredRequest.status === 'pending' && (
              <button
                onClick={() => onDispatchOfficer(hoveredRequest)}
                className="flex-1 px-2.5 py-1 text-xs bg-zd-accent hover:bg-zd-accent-hover text-zd-base font-semibold rounded-control transition-colors flex items-center justify-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Dispatch Team</span>
              </button>
            )}
            {hoveredRequest.status !== 'rescued' && (
              <button
                onClick={() => onMarkRescued(hoveredRequest)}
                className="px-2.5 py-1 text-xs bg-sev-safe/20 hover:bg-sev-safe/30 text-sev-safe font-medium rounded-control border border-sev-safe/40 transition-colors flex items-center gap-1"
                title="Mark Rescued"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Safe</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Control Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-zd-surface/90 backdrop-blur border border-zd-border px-3 py-1.5 rounded-control shadow-sm text-xs font-sans">
        <span className="flex items-center gap-1.5 font-medium text-zd-text">
          <span className="w-2 h-2 rounded-full bg-sev-critical animate-ping" />
          <span>Live Citizen Distress Network</span>
        </span>
        <span className="text-zd-border">|</span>
        <span className="text-zd-muted font-mono text-[11px]">
          {displayedRequests.filter(r => r.status === 'pending').length} Unassigned SOS
        </span>
      </div>

      {/* Collapsible Layer & Legend Popover + Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <Popover.Root open={controlsOpen} onOpenChange={setControlsOpen}>
          <Popover.Trigger asChild>
            <button
              className={clsx(
                "h-8 px-2.5 rounded-control border flex items-center gap-1.5 font-sans text-xs transition-colors shadow-sm focus:outline-none",
                controlsOpen 
                  ? "bg-zd-raised text-zd-accent border-zd-accent" 
                  : "bg-zd-surface/90 hover:bg-zd-raised text-zd-muted hover:text-zd-text border-zd-border"
              )}
              title="Map layers and urgency legend"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers & Legend</span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="end"
              sideOffset={8}
              className="z-50 w-60 p-3 bg-zd-surface border border-zd-border rounded-panel shadow-popover text-xs font-sans space-y-3 animate-in fade-in-0 zoom-in-95"
            >
              {/* 1. Layers Toggle */}
              <div>
                <span className="text-[11px] font-sans text-zd-dim block mb-1.5 font-semibold">
                  Map layers
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSatelliteBg(!satelliteBg)}
                    className="w-full h-7 px-2 rounded-control flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors"
                  >
                    <span>Hillshade topography</span>
                    <span className={clsx("text-[10px] font-mono", satelliteBg ? "text-zd-accent" : "text-zd-dim")}>
                      {satelliteBg ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowWards(!showWards)}
                    className="w-full h-7 px-2 rounded-control flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors"
                  >
                    <span>Ward boundaries</span>
                    <span className={clsx("text-[10px] font-mono", showWards ? "text-zd-accent" : "text-zd-dim")}>
                      {showWards ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowRivers(!showRivers)}
                    className="w-full h-7 px-2 rounded-control flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors"
                  >
                    <span>River torrent channels</span>
                    <span className={clsx("text-[10px] font-mono", showRivers ? "text-zd-accent" : "text-zd-dim")}>
                      {showRivers ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowRescuedPins(!showRescuedPins)}
                    className="w-full h-7 px-2 rounded-control flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors"
                  >
                    <span>Rescued citizens</span>
                    <span className={clsx("text-[10px] font-mono", showRescuedPins ? "text-zd-accent" : "text-zd-dim")}>
                      {showRescuedPins ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Beacon Urgency Legend */}
              <div className="pt-2 border-t border-zd-border/60">
                <span className="text-[11px] font-sans text-zd-dim block mb-1.5 font-semibold">
                  Beacon urgency legend
                </span>
                <div className="space-y-1.5 text-xs text-zd-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sev-critical shadow-[0_0_6px_#E5484D] shrink-0" />
                    <span>Critical / Trapped</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sev-warning shrink-0" />
                    <span>Urgent Advisory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zd-accent shrink-0" />
                    <span>Team Dispatched</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sev-safe shrink-0 shadow-[0_0_6px_#4CB782]" />
                    <span>Rescued / Safe</span>
                  </div>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Zoom In / Out Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(z => Math.min(z + 0.25, 2.5))}
            className="w-8 h-8 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-muted hover:text-zd-text flex items-center justify-center transition-colors shadow-sm"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(z - 0.25, 0.75))}
            className="w-8 h-8 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-muted hover:text-zd-text flex items-center justify-center transition-colors shadow-sm"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
