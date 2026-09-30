import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { TypedConfirmModal } from '../../components/ui/TypedConfirmModal';
import { sirenService } from '../../services/audio';
import { 
  Layers, 
  MapPin, 
  Send, 
  Plus, 
  PhoneCall, 
  Eye, 
  EyeOff, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  X,
  Compass,
  ShieldCheck,
  Camera,
  Footprints,
  Mountain,
  Radio,
  Info,
  ChevronRight,
  Maximize2,
  Users,
  Navigation
} from 'lucide-react';
import { ShelterPoint } from '../../types';

export const EvacuationPlannerScreen: React.FC = () => {
  const { 
    shelters, 
    wards, 
    addShelter, 
    createAlert, 
    addAuditLog, 
    showToast 
  } = useStore();

  const [selectedShelterId, setSelectedShelterId] = useState<string>(shelters[0]?.id || 'sh-rampur-school');
  const [layersOpen, setLayersOpen] = useState(false);
  const [shelterDrawerOpen, setShelterDrawerOpen] = useState(false);
  const [isDropMode, setIsDropMode] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [typedConfirmOpen, setTypedConfirmOpen] = useState(false);
  const [bridgeModalOpen, setBridgeModalOpen] = useState(false);
  const [routeStepsModalOpen, setRouteStepsModalOpen] = useState(false);

  // GIS Overlay Layers
  const [layers, setLayers] = useState({
    slope: true,
    contours: true,
    waterIndex: true,
    satellite: true,
    meshNodes: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedShelter = shelters.find(s => s.id === selectedShelterId) || shelters[0] || {
    id: 'sh-rampur-school',
    name: 'Govt. Primary School, Rampur',
    wardId: 'ward-rampur-4b',
    wardName: 'Rampur Basin 4B',
    lat: 29.753,
    lng: 78.534,
    capacity: 350,
    currentOccupancy: 120,
    elevationM: 890,
    bedrockStability: 'Stable bedrock' as const,
    contactPhone: '+91-1382-224101',
    contactOfficer: 'Pradeep Rawat (Headmaster)',
    status: 'open' as const,
    routeNotes: 'Approach via Ridge Road West. Avoid low river culvert #4.',
    suppliesDays: 5,
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDropMode) return;
    setIsDropMode(false);
    const newId = `sh-${Date.now()}`;
    addShelter({
      name: `Sanctuary Site ${shelters.length + 1}`,
      wardId: 'ward-rampur-4b',
      wardName: 'Rampur Basin 4B',
      lat: 29.754,
      lng: 78.539,
      capacity: 300,
      currentOccupancy: 0,
      elevationM: 910,
      bedrockStability: 'Stable bedrock',
      contactPhone: '+91-1382-220011',
      contactOfficer: 'DEOC Field Coordinator',
      status: 'open',
      routeNotes: 'Designated high ground ridge sanctuary',
      suppliesDays: 5,
    });
    showToast({
      type: 'success',
      title: 'Shelter Designated',
      message: 'New high-ground sanctuary added to corridor roster',
    });
    addAuditLog('ADD_SHELTER', newId, 'Designated new emergency shelter haven');
  };

  const handleConfirmDispatch = () => {
    setDispatchModalOpen(false);
    setTypedConfirmOpen(true);
  };

  const finalizeDispatch = () => {
    setTypedConfirmOpen(false);
    sirenService.playChime();
    createAlert({
      title: `EVACUATION CORRIDOR DISPATCH: ${selectedShelter.name}`,
      titleHi: `निकासी मार्ग निर्देश: ${selectedShelter.name}`,
      body: `Immediate evacuation advised along North Ridge corridor to ${selectedShelter.name} (1.8 km, ~24 min walk, +230m climb). Submerged Rampur Bridge & 36° slide slope are bypassed.`,
      bodyHi: `तुरंत निर्धारित उत्तर रिज सुरक्षित मार्ग से ${selectedShelter.name} की ओर बढ़ें। जलमग्न रामपुर पुल से बचें।`,
      severity: 'critical',
      regionId: 'ward-rampur-4b',
      channels: ['push', 'sms', 'ble_mesh'],
      directiveType: 'EVACUATION',
    });
    showToast({
      type: 'critical',
      title: 'Evacuation Corridor Dispatched',
      message: 'Route transmitted to 1,240 devices via Push, SMS, and BLE Mesh',
      onUndo: () => {
        showToast({ type: 'info', title: 'Broadcast Recalled', message: 'Evacuation route alert recalled' });
      },
      undoLabel: 'Recall (10s)'
    });
    addAuditLog('DISPATCH_CORRIDOR', selectedShelter.name, 'Dispatched evacuation corridor to 1,240 field units');
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden select-none bg-zd-base ${isDropMode ? 'cursor-crosshair' : ''}`}
      onClick={handleCanvasClick}
    >
      <style>{`
        @keyframes corridorMarch {
          from {
            stroke-dashoffset: 48;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-corridor-march {
          animation: corridorMarch 1.4s linear infinite;
        }
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .hazard-ping {
          animation: pulseRing 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
      `}</style>

      {/* 1. REALISTIC MOUNTAIN TERRAIN BACKGROUND */}
      {layers.satellite && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="/assets/terrain-dark.webp"
            alt="Himalayan Mountain Shaded Relief Terrain"
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.25] saturate-[0.85] opacity-90 transition-opacity duration-300"
          />
          {/* Subtle Topographic Scrim & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-zd-base/90 via-zd-base/40 to-zd-base/70 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,15,19,0.85)_100%)] pointer-events-none" />
        </div>
      )}

      {/* 2. VECTOR GIS / RADAR OVERLAY LAYER */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 850"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Fine coordinate grid */}
            <pattern id="evacFineGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
              <circle cx="80" cy="80" r="1" fill="rgba(92, 200, 190, 0.2)" />
            </pattern>

            {/* Landslide Rupture Zone 36° Red Diagonal Hatch */}
            <pattern id="dangerHatch36" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#E5484D" strokeWidth="1.8" strokeOpacity="0.55" />
            </pattern>

            {/* Water Inundation Diagonal Shimmer */}
            <pattern id="waterHatch" width="16" height="16" patternTransform="rotate(-30 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="16" y2="0" stroke="rgba(92, 200, 190, 0.18)" strokeWidth="1" strokeDasharray="3 4" />
            </pattern>

            {/* Corridor Gradient: Cyan Glacier -> Emerald Haven */}
            <linearGradient id="corridorGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5CC8BE" />
              <stop offset="60%" stopColor="#4CB782" />
              <stop offset="100%" stopColor="#3CD69E" />
            </linearGradient>

            {/* Path Glow Filter */}
            <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid overlay */}
          <rect width="100%" height="100%" fill="url(#evacFineGrid)" />

          {/* Topographic Contours (25m interval lines) */}
          {layers.contours && (
            <g stroke="rgba(255, 255, 255, 0.11)" fill="none" strokeWidth="1">
              <path d="M 0 340 C 240 280, 520 310, 780 240 C 1040 170, 1260 210, 1440 180" />
              <path d="M 0 440 C 260 380, 540 410, 800 340 C 1060 270, 1280 310, 1440 280" strokeDasharray="4 4" strokeWidth="0.75" />
              <path d="M 0 540 C 280 480, 560 510, 820 440 C 1080 370, 1300 410, 1440 380" />
              <path d="M 0 640 C 300 580, 580 610, 840 540 C 1100 470, 1320 510, 1440 480" strokeDasharray="4 4" strokeWidth="0.75" />
              <path d="M 0 740 C 320 680, 600 710, 860 640 C 1120 570, 1340 610, 1440 580" />
            </g>
          )}

          {/* Inundated River Basin (Lowland Flood Surge Zone) */}
          {layers.waterIndex && (
            <g>
              <path
                d="M 0 720 C 180 700, 360 680, 520 660 C 680 640, 840 670, 1020 690 C 1180 710, 1320 740, 1440 760 L 1440 850 L 0 850 Z"
                fill="rgba(28, 88, 124, 0.38)"
                stroke="rgba(92, 200, 190, 0.4)"
                strokeWidth="1.2"
              />
              <path
                d="M 0 720 C 180 700, 360 680, 520 660 C 680 640, 840 670, 1020 690 C 1180 710, 1320 740, 1440 760 L 1440 850 L 0 850 Z"
                fill="url(#waterHatch)"
              />
              <text
                x="620"
                y="745"
                fill="rgba(92, 200, 190, 0.75)"
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="500"
                letterSpacing="0.08em"
              >
                RAMPUR GORGE INUNDATION PLUME (+2.4m SURGE)
              </text>
            </g>
          )}

          {/* Landslide Hazard Polygon (36° Steep Scarp) */}
          {layers.slope && (
            <g>
              <polygon
                points="480,480 720,380 840,490 620,590"
                fill="url(#dangerHatch36)"
                stroke="#E5484D"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              {/* Hazard boundary glow */}
              <polygon
                points="480,480 720,380 840,490 620,590"
                fill="none"
                stroke="#E5484D"
                strokeWidth="6"
                strokeOpacity="0.15"
              />
              <rect
                x="565"
                y="470"
                width="190"
                height="24"
                rx="4"
                fill="rgba(229, 72, 77, 0.9)"
                stroke="#E5484D"
                strokeWidth="1"
              />
              <text
                x="660"
                y="486"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="600"
                letterSpacing="0.04em"
              >
                ⚠️ 36° SCARP RUPTURE HAZARD
              </text>
            </g>
          )}

          {/* Secondary / Impassable Low River Road (Flooded out) */}
          <path
            d="M 280 660 C 380 655, 480 660, 580 665 C 680 670, 780 675, 880 680"
            fill="none"
            stroke="#E5484D"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* MAIN ESCAPE CORRIDOR: High Ridge Mountain Path */}
          {/* Underglow halo */}
          <path
            d="M 280 640 C 360 520, 500 460, 680 390 C 820 330, 960 290, 1140 220"
            fill="none"
            stroke="#5CC8BE"
            strokeWidth="10"
            strokeOpacity="0.22"
            strokeLinecap="round"
          />
          {/* Primary Solid Background Track */}
          <path
            d="M 280 640 C 360 520, 500 460, 680 390 C 820 330, 960 290, 1140 220"
            fill="none"
            stroke="rgba(10, 15, 19, 0.85)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Animated Marching Dash Vector */}
          <path
            d="M 280 640 C 360 520, 500 460, 680 390 C 820 330, 960 290, 1140 220"
            fill="none"
            stroke="url(#corridorGradient)"
            strokeWidth="4"
            strokeDasharray="14 10"
            strokeLinecap="round"
            className="animate-corridor-march"
            filter="url(#corridorGlow)"
          />

          {/* Directional Flow Chevrons along Ridge Corridor */}
          <g fill="#4CB782" opacity="0.9">
            {/* Arrow 1 */}
            <polygon points="410,545 422,538 410,531 414,538" transform="rotate(-36 414 538)" />
            {/* Arrow 2 */}
            <polygon points="620,415 632,408 620,401 624,408" transform="rotate(-26 624 408)" />
            {/* Arrow 3 */}
            <polygon points="860,325 872,318 860,311 864,318" transform="rotate(-18 864 318)" />
            {/* Arrow 4 */}
            <polygon points="1040,262 1052,255 1040,248 1044,255" transform="rotate(-22 1044 255)" />
          </g>

          {/* Mesh Nodes on Path */}
          {layers.meshNodes && (
            <g>
              {/* Relay 1 */}
              <circle cx="510" cy="460" r="4" fill="#5CC8BE" />
              <circle cx="510" cy="460" r="10" fill="none" stroke="#5CC8BE" strokeWidth="1" opacity="0.4" />
              {/* Relay 2 */}
              <circle cx="780" cy="350" r="4" fill="#5CC8BE" />
              <circle cx="780" cy="350" r="10" fill="none" stroke="#5CC8BE" strokeWidth="1" opacity="0.4" />
              {/* Relay 3 */}
              <circle cx="990" cy="275" r="4" fill="#5CC8BE" />
              <circle cx="990" cy="275" r="10" fill="none" stroke="#5CC8BE" strokeWidth="1" opacity="0.4" />
            </g>
          )}
        </svg>
      </div>

      {/* 3. INTERACTIVE HTML WAYPOINT OVERLAYS (SHARP & NON-CLIPPING) */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        
        {/* WAYPOINT A: ORIGIN (Rampur Ward 4B Settlement) */}
        <div 
          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full"
          style={{ left: '19.5%', top: '75%' }}
        >
          <div className="group relative flex flex-col items-center">
            {/* Card Pill */}
            <div className="bg-zd-surface/95 backdrop-blur-md border border-zd-border px-3 py-1.5 rounded-panel shadow-modal flex items-center gap-2.5 transition-all group-hover:scale-105 group-hover:border-zd-accent">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zd-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zd-accent"></span>
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-xs text-zd-text">Rampur Ward 4B</span>
                  <span className="font-mono text-[9px] text-zd-accent bg-zd-accent-dim px-1 rounded">START</span>
                </div>
                <div className="font-mono text-[10px] text-zd-muted flex items-center gap-1.5">
                  <span>1,240 residents</span>
                  <span>·</span>
                  <span>Elev. 660m</span>
                </div>
              </div>
            </div>
            {/* Pointer Stem */}
            <div className="w-0.5 h-3 bg-zd-accent/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-zd-accent border-2 border-zd-base shadow-md" />
          </div>
        </div>

        {/* HAZARD NODE: Submerged Rampur Bridge (CLOSED) */}
        <div 
          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full"
          style={{ left: '42%', top: '71%' }}
        >
          <div className="group relative flex flex-col items-center">
            <button
              onClick={() => setBridgeModalOpen(true)}
              className="group flex items-center gap-2 bg-zd-surface/95 hover:bg-zd-raised backdrop-blur-md border border-sev-critical/60 hover:border-sev-critical px-2.5 py-1.5 rounded-control shadow-modal text-left transition-all hover:scale-105"
              title="Click to view bridge telemetry & CCTV snapshot"
            >
              {/* Pulsing Danger Icon */}
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="hazard-ping absolute inline-flex h-full w-full rounded-full bg-sev-critical"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sev-critical"></span>
              </span>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-[11px] text-sev-critical">Rampur Bridge</span>
                  <span className="font-mono text-[9px] px-1 bg-sev-critical/20 text-sev-critical rounded font-bold">CLOSED</span>
                </div>
                <div className="font-mono text-[10px] text-zd-muted flex items-center gap-1">
                  <span>Water +1.8m</span>
                  <span>·</span>
                  <span className="underline decoration-dotted text-zd-text flex items-center gap-0.5">
                    <Camera className="w-2.5 h-2.5" /> CCTV Feed
                  </span>
                </div>
              </div>
            </button>
            <div className="w-0.5 h-2.5 bg-sev-critical/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-sev-critical border-2 border-zd-base shadow-md" />
          </div>
        </div>

        {/* WAYPOINT B: Bhelupur Saddle Checkpoint */}
        <div 
          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full"
          style={{ left: '54%', top: '45%' }}
        >
          <div className="group relative flex flex-col items-center">
            <div className="bg-zd-surface/90 backdrop-blur-md border border-zd-border px-2.5 py-1 rounded-panel shadow-modal flex items-center gap-2 transition-transform group-hover:scale-105">
              <Footprints className="w-3 h-3 text-zd-accent" />
              <div>
                <div className="font-sans font-medium text-[11px] text-zd-text">North Ridge Saddle</div>
                <div className="font-mono text-[9px] text-zd-dim">Elev. 790m · Clear ridge track</div>
              </div>
            </div>
            <div className="w-0.5 h-2 bg-zd-border" />
            <div className="w-2 h-2 rounded-full bg-zd-surface border border-zd-accent" />
          </div>
        </div>

        {/* WAYPOINT C: High-Ground Sanctuary Destination */}
        <div 
          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: '79.5%', top: '26%' }}
        >
          <div 
            onClick={() => {
              setSelectedShelterId('sh-rampur-school');
              setShelterDrawerOpen(true);
            }}
            className="group relative flex items-center gap-3 cursor-pointer"
            title="Click to view sanctuary shelter details"
          >
            {/* Glowing target beacon exactly on corridor termination */}
            <div className="relative flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-sev-normal opacity-40" />
              <div className="w-4 h-4 rounded-full bg-sev-normal border-2 border-zd-base shadow-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Sanctuary Card Pill */}
            <div className="bg-zd-surface/95 backdrop-blur-md border-2 border-sev-normal hover:border-sev-normal/80 px-3.5 py-2 rounded-panel shadow-modal flex items-center gap-3 transition-all group-hover:scale-105">
              <div className="w-7 h-7 rounded-control bg-sev-normal-dim border border-sev-normal flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-sev-normal" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-xs text-zd-text">{selectedShelter.name}</span>
                  <span className="font-mono text-[9px] text-sev-normal bg-sev-normal-dim px-1.5 py-0.2 rounded font-semibold">SAFE HAVEN</span>
                </div>
                <div className="font-mono text-[10px] text-zd-muted flex items-center gap-2 mt-0.5">
                  <span className="text-sev-normal font-semibold">Elev. {selectedShelter.elevationM}m ASL</span>
                  <span>·</span>
                  <span>Cap: {selectedShelter.currentOccupancy}/{selectedShelter.capacity}</span>
                </div>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-zd-dim group-hover:text-zd-text transition-colors" />
            </div>
          </div>
        </div>

      </div>

      {/* 4. TOP HUD BAR: SECTOR INFO & CONTROLS */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex items-center justify-between gap-4">
        
        {/* Left: Sector & Active Route Status */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div className="bg-zd-surface/90 backdrop-blur-md border border-zd-border rounded-panel px-3.5 py-2 shadow-modal flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-sev-normal animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-micro uppercase font-mono tracking-wider text-zd-dim">EVACUATION CORRIDOR</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sev-normal-dim text-sev-normal rounded font-medium">DISPATCH READY</span>
                <span className="hidden md:inline font-mono text-[10px] text-zd-dim">· 29°45'11" N · 78°32'04" E</span>
              </div>
              <h1 className="font-sans font-bold text-sm text-zd-text">Sector 4-B: North Ridge Bypass Corridor</h1>
            </div>
          </div>

          {/* Quick Route Telemetry Tag */}
          <div className="hidden xl:flex items-center gap-3 bg-zd-surface/80 backdrop-blur-md border border-zd-border rounded-panel px-3 py-2 text-xs font-mono text-zd-muted shadow-modal">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-zd-accent" />
              <span>1.8 km ridge track</span>
            </div>
            <span className="text-zd-dim">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zd-accent" />
              <span>~24 min walking ETA</span>
            </div>
            <span className="text-zd-dim">·</span>
            <div className="flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-zd-accent" />
              <span>+230m climb to safe ground</span>
            </div>
          </div>
        </div>

        {/* Right: GIS Layers & Havens Drawer Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          {/* GIS Layer Menu */}
          <div className="relative">
            <button
              onClick={() => setLayersOpen(!layersOpen)}
              className={`h-9 px-3 rounded-control border flex items-center gap-2 font-sans text-xs transition-colors shadow-modal ${
                layersOpen 
                  ? 'bg-zd-accent text-zd-base border-zd-accent font-semibold' 
                  : 'bg-zd-surface/90 hover:bg-zd-raised text-zd-muted hover:text-zd-text border-zd-border'
              }`}
              title="Toggle Terrain & Hazard Layers"
            >
              <Layers className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">GIS Layers</span>
            </button>

            {layersOpen && (
              <div className="absolute top-11 right-0 w-60 p-2 bg-zd-surface/95 backdrop-blur-md border border-zd-border rounded-panel shadow-popover text-xs font-sans z-50">
                <span className="text-micro font-mono uppercase tracking-wider text-zd-dim px-2 py-1 block border-b border-zd-border mb-1">
                  Terrain & Hazard GIS Overlays
                </span>
                <div className="space-y-0.5">
                  {[
                    { key: 'satellite' as const, label: 'Shaded Relief Satellite Base' },
                    { key: 'slope' as const, label: '36° Rupture Slope Hazard' },
                    { key: 'waterIndex' as const, label: 'NDWI Gorge Inundation Zone' },
                    { key: 'contours' as const, label: 'Topographic Contours (25m)' },
                    { key: 'meshNodes' as const, label: 'Offline BLE Mesh Relay Nodes' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => toggleLayer(item.key)}
                      className="w-full h-8 px-2 rounded-[4px] flex items-center justify-between hover:bg-zd-hover text-zd-text text-left transition-colors"
                    >
                      <span className="text-xs">{item.label}</span>
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

          {/* Turn-by-Turn Steps Modal Trigger */}
          <button
            onClick={() => setRouteStepsModalOpen(true)}
            className="h-9 px-3 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-text flex items-center gap-1.5 font-sans text-xs shadow-modal transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-zd-accent" />
            <span className="hidden sm:inline">Route Steps</span>
          </button>

          {/* Havens Drawer Trigger */}
          <button
            onClick={() => setShelterDrawerOpen(true)}
            className="h-9 px-3.5 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-text flex items-center gap-2 font-sans text-xs shadow-modal transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
            <span className="font-medium">Designated Havens ({shelters.length})</span>
          </button>
        </div>

      </div>

      {/* 5. FLOATING BOTTOM COMMAND DOCK (CLEAN, UNCLUTTERED, NO TRUNCATION) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto w-full max-w-4xl px-3 sm:px-4">
        <div className="bg-zd-surface/95 backdrop-blur-xl border border-zd-border/90 rounded-panel px-4 py-2.5 sm:px-6 sm:py-3.5 shadow-modal flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Destination & Route Specs */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-control bg-sev-normal-dim border border-sev-normal/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sev-normal" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-xs sm:text-sm text-zd-text truncate">{selectedShelter.name}</span>
                <span className="font-mono text-[9px] sm:text-[10px] text-sev-normal bg-sev-normal-dim px-1.5 py-0.5 rounded font-semibold shrink-0">
                  HAVEN {selectedShelter.elevationM}m
                </span>
              </div>
              <p className="font-mono text-[11px] sm:text-xs text-zd-muted flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <span>1.8 km</span>
                <span className="text-zd-dim">·</span>
                <span>24 min walk</span>
                <span className="text-zd-dim">·</span>
                <span className="text-sev-normal font-sans font-medium truncate">Bypasses bridge & 36° slide</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end shrink-0">
            <Button
              variant="outline"
              onClick={() => setRouteStepsModalOpen(true)}
              className="h-8 sm:h-9 px-2.5 sm:px-3 font-sans text-xs"
            >
              Route details
            </Button>

            <Button
              variant="primary"
              onClick={() => setDispatchModalOpen(true)}
              className="h-8 sm:h-9 px-3 sm:px-4 font-sans text-xs font-semibold gap-1.5 sm:gap-2 shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Transmit Route Instructions</span>
              <span className="sm:hidden">Transmit Route</span>
              <span className="font-mono text-[10px] bg-black/20 px-1 py-0.5 rounded text-white/90">1,240</span>
            </Button>
          </div>

        </div>
      </div>

      {/* 7. SHELTERS REGISTER DRAWER */}
      <Drawer
        isOpen={shelterDrawerOpen}
        onClose={() => setShelterDrawerOpen(false)}
        title="High-Ground Sanctuaries"
        subtitle="Capacity, elevation, and terrain stability register"
        width="w-[420px]"
      >
        <div className="space-y-4 font-sans text-xs flex flex-col h-full justify-between pb-4">
          <div className="space-y-4">
            
            {/* Featured Shelter Photo Card */}
            <div className="relative rounded-panel overflow-hidden border border-zd-border bg-zd-base group">
              <img
                src="/assets/shelter-school.webp"
                alt="Govt. Primary School Rampur Sanctuary Ground"
                className="w-full h-36 object-cover object-center filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zd-base via-zd-base/30 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono text-sev-normal font-semibold uppercase tracking-wider block">
                    Designated Primary Haven
                  </span>
                  <span className="font-bold text-sm text-zd-text block">Govt. Primary School, Rampur</span>
                  <span className="text-xs font-mono text-zd-muted">Elev. 890m · Granite Bedrock</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sev-normal text-zd-base font-bold text-[10px] font-mono">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Click-to-Drop Toggle */}
            <button
              onClick={() => {
                setIsDropMode(true);
                setShelterDrawerOpen(false);
                showToast({
                  type: 'info',
                  title: 'Pin Drop Mode Active',
                  message: 'Click anywhere on the map terrain to designate a new sanctuary',
                });
              }}
              className="w-full h-9 px-3 rounded-control border border-dashed border-zd-accent/50 hover:border-zd-accent text-zd-accent flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Designate sanctuary (Click-to-drop on terrain)</span>
            </button>

            {/* List of Shelters */}
            <div className="space-y-2">
              <span className="text-micro font-mono uppercase tracking-wider text-zd-dim block">
                All Available District Havens
              </span>

              <div className="divide-y divide-zd-border border border-zd-border rounded-panel bg-zd-base/60 overflow-hidden">
                {shelters.map(shelter => {
                  const isSelected = selectedShelterId === shelter.id;
                  const occPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);

                  return (
                    <div
                      key={shelter.id}
                      onClick={() => setSelectedShelterId(shelter.id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-zd-raised border-l-2 border-zd-accent' : 'hover:bg-zd-hover'
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-zd-text">{shelter.name}</span>
                        <span className="font-mono text-[11px] text-sev-normal font-medium">{shelter.elevationM}m elev</span>
                      </div>

                      <div className="flex justify-between font-mono text-[11px] text-zd-muted mb-2">
                        <span>Capacity: {shelter.currentOccupancy}/{shelter.capacity} persons</span>
                        <span>{occPct}% occupied</span>
                      </div>

                      {/* Capacity Bar */}
                      <div className="h-1.5 w-full bg-zd-surface rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occPct > 85 ? 'bg-sev-critical' : occPct > 60 ? 'bg-sev-warning' : 'bg-sev-normal'
                          }`}
                          style={{ width: `${Math.max(6, occPct)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zd-dim font-mono">
                        <span>Reserves: {shelter.suppliesDays} days</span>
                        <span>{shelter.bedrockStability}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Drawer Footer: SDRF Hotline */}
          <div className="pt-3 border-t border-zd-border text-center space-y-2">
            <a
              href="tel:1077"
              className="inline-flex items-center gap-2 text-xs font-mono text-zd-muted hover:text-zd-accent transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sev-critical" />
              <span>SDRF Emergency Command: Call Toll-Free 1077</span>
            </a>
          </div>
        </div>
      </Drawer>

      {/* 8. SUBMERGED BRIDGE CAMERA & TELEMETRY MODAL */}
      <Modal
        isOpen={bridgeModalOpen}
        onClose={() => setBridgeModalOpen(false)}
        title="Hazard Telemetry: Rampur Bridge Culvert"
        subtitle="Culvert #4 flood breach & impassable status verification"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 font-sans text-xs">
          {/* Real Flooded Road Photo */}
          <div className="relative rounded-panel overflow-hidden border border-zd-border bg-zd-base">
            <img
              src="/assets/flooded-road.webp"
              alt="Submerged Rampur Bridge River Surge"
              className="w-full h-48 object-cover object-center"
            />
            <div className="absolute top-2.5 left-2.5 bg-sev-critical text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
              CLOSED · 1.8M WATER OVER DECK
            </div>
            <div className="absolute bottom-2.5 right-2.5 bg-zd-base/90 backdrop-blur-md text-zd-muted font-mono text-[10px] px-2 py-0.5 rounded border border-zd-border">
              CAM-04 · 14:03 IST
            </div>
          </div>

          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zd-muted">River Surge Stage:</span>
              <span className="text-sev-critical font-bold">4.8 m (+1.3m Above Danger)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted">Flow Velocity:</span>
              <span className="text-zd-text">280 m³/s (Flash discharge)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted">Structural Status:</span>
              <span className="text-sev-critical">Impassable for civilian vehicles & foot traffic</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted">Corridor Action:</span>
              <span className="text-sev-normal font-bold">Diverted via North Ridge Saddle</span>
            </div>
          </div>

          <p className="text-[11px] text-zd-muted leading-relaxed">
            The bridge is currently under active flash surge. Any attempt to cross risks sweep-off. The North Ridge evacuation corridor successfully bypasses this crossing with +130m clearance.
          </p>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setBridgeModalOpen(false)}>
              Acknowledge & Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* 9. TURN-BY-TURN ROUTE STEPS MODAL */}
      <Modal
        isOpen={routeStepsModalOpen}
        onClose={() => setRouteStepsModalOpen(false)}
        title="North Ridge Escape Corridor: Turn-by-Turn Guide"
        subtitle="1.8 km high-ground pedestrian route to safe haven"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-2">
            {[
              {
                step: '1',
                title: 'Depart Ward 4B Settlement',
                desc: 'Move immediately west towards the North Ridge trail head. Do NOT take the lower valley road leading to Rampur bridge.',
                meta: 'Elev. 660m · Distance 0m'
              },
              {
                step: '2',
                title: 'Ascend to Bhelupur Saddle Checkpoint',
                desc: 'Follow marked flags ascending along the granite spur. BLE Mesh Relay #2 is operational here for distress pings.',
                meta: 'Elev. 790m (+130m) · Distance 650m'
              },
              {
                step: '3',
                title: 'Traverse High Contour Ridge',
                desc: 'Maintain pace along the ridge crest. The route remains 300m west of the active 36° landslide scarp rupture hazard.',
                meta: 'Elev. 840m · Distance 1.2 km'
              },
              {
                step: '4',
                title: 'Arrive at Govt. Primary School Haven',
                desc: 'Enter through the western gates. Register at the SDRF intake desk for shelter, dry rations, and medical inspection.',
                meta: 'Elev. 890m ASL · Distance 1.8 km'
              }
            ].map(item => (
              <div key={item.step} className="p-3 bg-zd-base border border-zd-border rounded-panel flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-zd-accent-dim text-zd-accent border border-zd-accent/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {item.step}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-zd-text">{item.title}</span>
                    <span className="font-mono text-[10px] text-zd-dim shrink-0">{item.meta}</span>
                  </div>
                  <p className="text-[11px] text-zd-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setRouteStepsModalOpen(false)}>
              Close Guide
            </Button>
          </div>
        </div>
      </Modal>

      {/* 10. DISPATCH REVIEW MODAL */}
      <Modal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title="Review Corridor Dispatch Broadcast"
        subtitle="Confirm emergency pathway dissemination to civilian recipients"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-sans text-xs">
          {/* Mini Route Map Preview Card */}
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-zd-muted font-sans">Destination Sanctuary:</span>
              <span className="text-zd-text font-bold">{selectedShelter.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zd-muted font-sans">Corridor Distance:</span>
              <span className="text-zd-text">1.8 km (Ridge path)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zd-muted font-sans">Estimated Walk ETA:</span>
              <span className="text-zd-text">24 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zd-muted font-sans">Hazard Clearance:</span>
              <span className="text-sev-normal font-semibold">Avoids Submerged Bridge & 36° Slide</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zd-muted font-sans">Civilian Target Reach:</span>
              <span className="text-zd-accent font-bold">1,240 mobile devices</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zd-muted font-sans">Broadcast Channels:</span>
              <span className="text-zd-text">Push, SMS & Offline BLE Mesh</span>
            </div>
          </div>

          <p className="text-[11px] text-zd-muted leading-relaxed">
            Corridor instructions will be broadcast with high-priority audio tones via push notification, emergency SMS, and offline BLE mesh relays in mobile dead zones.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDispatch}>
              Proceed to confirmation
            </Button>
          </div>
        </div>
      </Modal>

      {/* 11. TYPED CONFIRMATION MODAL */}
      <TypedConfirmModal
        isOpen={typedConfirmOpen}
        onClose={() => setTypedConfirmOpen(false)}
        onConfirm={finalizeDispatch}
        title="Authorize Evacuation Corridor Broadcast"
        prompt="Type EVACUATE to transmit corridor instructions"
        confirmWord="EVACUATE"
        actionLabel="Transmit Emergency Directive"
        description="This action will trigger audible mobile alerts and turn-by-turn SMS route maps to 1,240 registered residents in Rampur Basin."
      />
    </div>
  );
};
