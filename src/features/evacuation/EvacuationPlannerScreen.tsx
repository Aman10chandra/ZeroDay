import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { TypedConfirmModal } from '../../components/ui/TypedConfirmModal';
import { sirenService } from '../../services/audio';
import { 
  Navigation, 
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
  X
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

  const [selectedShelterId, setSelectedShelterId] = useState<string>(shelters[0]?.id || 'sh-01');
  const [layersOpen, setLayersOpen] = useState(false);
  const [shelterDrawerOpen, setShelterDrawerOpen] = useState(false);
  const [isDropMode, setIsDropMode] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [typedConfirmOpen, setTypedConfirmOpen] = useState(false);

  // Layers
  const [layers, setLayers] = useState({
    slope: true,
    contours: true,
    waterIndex: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedShelter = shelters.find(s => s.id === selectedShelterId) || shelters[0];

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDropMode) return;
    setIsDropMode(false);
    const newId = `sh-${Date.now()}`;
    addShelter({
      name: `Sanctuary Site ${shelters.length + 1}`,
      wardId: 'ward-rampur-4b',
      wardName: 'Rampur Basin 4B',
      lat: 29.742,
      lng: 78.538,
      capacity: 350,
      currentOccupancy: 0,
      elevationM: 920,
      bedrockStability: 'Stable Bedrock Ridge',
      contactPhone: '+91-1382-220011',
      contactOfficer: 'DEOC Field Coordinator',
      status: 'open',
      routeNotes: 'Designated high ground haven',
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
      title: `EVACUATION ROUTE DISPATCH: ${selectedShelter.name}`,
      titleHi: `निकासी मार्ग निर्देश: ${selectedShelter.name}`,
      body: `Immediate evacuation advised along designated ridge corridor to ${selectedShelter.name} (1.8 km, ~24 min walk). Avoid submerged Rampur bridge.`,
      bodyHi: `तुरंत निर्धारित सुरक्षित मार्ग से ${selectedShelter.name} की ओर बढ़ें।`,
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
    <div className="relative w-full h-full overflow-hidden select-none bg-zd-base">
      {/* 1. Full-Bleed Map Canvas with Marching Dash Corridor */}
      <div className={`absolute inset-0 z-0 ${isDropMode ? 'cursor-crosshair' : ''}`}>
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          onClick={handleCanvasClick}
        >
          <defs>
            {/* Topographic Background Grid */}
            <pattern id="evacGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
            </pattern>

            {/* Landslide Danger Zone: Subtle Red Diagonal Hatch labeled "Steep slope 36°" */}
            <pattern id="dangerHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#E5484D" strokeWidth="1.2" strokeOpacity="0.45" />
            </pattern>

            {/* Linear Gradient for Escape Corridor */}
            <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5CC8BE" />
              <stop offset="100%" stopColor="#E8843A" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#evacGrid)" />

          {/* Contours */}
          {layers.contours && (
            <g stroke="rgba(255, 255, 255, 0.08)" fill="none" strokeWidth="1">
              <path d="M 50 180 Q 300 120 550 160 T 950 140" strokeDasharray="3 3" />
              <path d="M 80 280 Q 320 220 580 260 T 980 240" />
              <path d="M 40 380 Q 280 320 520 360 T 960 340" strokeDasharray="3 3" />
              <path d="M 90 480 Q 340 420 600 460 T 990 440" />
            </g>
          )}

          {/* Flooded Lowlands in Soft Translucent Blue */}
          {layers.waterIndex && (
            <path
              d="M 120 620 C 260 580, 420 540, 520 440 C 620 340, 740 310, 920 280 L 1000 700 L 0 700 Z"
              fill="rgba(56, 130, 168, 0.22)"
              stroke="rgba(92, 200, 190, 0.3)"
              strokeWidth="1"
            />
          )}

          {/* Landslide Danger Zone (Subtle red diagonal hatch labeled "Steep slope 36°") */}
          {layers.slope && (
            <g>
              <polygon
                points="280,240 460,180 540,290 380,360"
                fill="url(#dangerHatch)"
                stroke="#E5484D"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x="380"
                y="265"
                textAnchor="middle"
                fill="#E5484D"
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="600"
                className="select-none pointer-events-none drop-shadow"
              >
                Steep slope 36° (Rupture Hazard)
              </text>
            </g>
          )}

          {/* Submerged Rampur Bridge (Small red marker) */}
          <g transform="translate(360, 470)">
            <circle r="7" fill="#E5484D" />
            <circle r="12" fill="none" stroke="#E5484D" strokeWidth="1" className="animate-ping" opacity="0.6" />
            <text x="14" y="4" fill="#E5484D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              Submerged Rampur Bridge (CLOSED)
            </text>
          </g>

          {/* Escape Corridor: Bold teal-to-orange dashed line with animated marching dashes */}
          <path
            d="M 220 540 C 260 410, 360 380, 480 320 C 580 270, 680 240, 780 180"
            fill="none"
            stroke="url(#corridorGrad)"
            strokeWidth="4"
            strokeDasharray="10 6"
            className="animate-pulse"
          />

          {/* Origin: Rampur Basin 4B Settlement */}
          <g transform="translate(220, 540)">
            <circle r="6" fill="#5CC8BE" />
            <text x="-12" y="-12" textAnchor="end" fill="#EAF0F3" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
              Rampur Settlement (1,240 homes)
            </text>
          </g>

          {/* Destination: Govt. School Rampur Shelter */}
          <g transform="translate(780, 180)" className="cursor-pointer" onClick={() => setSelectedShelterId('sh-01')}>
            <polygon
              points="0,-12 12,0 8,12 -8,12 -12,0"
              fill="#4CB782"
              stroke="#0A0F13"
              strokeWidth="2"
            />
            <text x="18" y="4" fill="#4CB782" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
              Govt. School Rampur (High Ground Haven)
            </text>
          </g>
        </svg>
      </div>

      {/* 2. Top-Left Minimal Layer Switcher (Icon button that opens popover) */}
      <div className="absolute top-5 left-5 z-10 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className={`w-9 h-9 rounded-control border flex items-center justify-center transition-colors shadow-modal ${
              layersOpen 
                ? 'bg-zd-accent text-zd-base border-zd-accent' 
                : 'bg-zd-surface/90 hover:bg-zd-raised text-zd-muted hover:text-zd-text border-zd-border'
            }`}
            title="Terrain GIS layers"
          >
            <Layers className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {layersOpen && (
            <div className="absolute top-11 left-0 w-52 p-2 bg-zd-surface/95 backdrop-blur-md border border-zd-border rounded-panel shadow-popover text-xs font-sans">
              <span className="text-micro text-zd-dim px-2 py-1 block border-b border-zd-border mb-1">
                Hazard Layers
              </span>
              <div className="space-y-0.5">
                {[
                  { key: 'slope' as const, label: 'DEM Slope (36° Hazard)' },
                  { key: 'contours' as const, label: 'Topographic Contours' },
                  { key: 'waterIndex' as const, label: 'NDWI Inundation Lowlands' },
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

      {/* Top-Right "Havens & Shelters" Trigger Button */}
      <div className="absolute top-5 right-5 z-10 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setShelterDrawerOpen(true)}
          className="h-9 px-3.5 rounded-[6px] bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-text flex items-center gap-2 font-sans text-xs shadow-modal transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-zd-accent" strokeWidth={1.5} />
          <span>Designated Havens ({shelters.length})</span>
        </button>
      </div>

      {/* 3. Floating Bottom Panel (Single Line at Rest) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto w-full max-w-xl px-4">
        <div className="bg-zd-surface/95 backdrop-blur-md border border-zd-border rounded-panel px-5 py-3 shadow-modal flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-sans text-xs truncate">
            <span className="w-2 h-2 rounded-full bg-sev-normal shrink-0" />
            <span className="font-semibold text-zd-text truncate">{selectedShelter.name}</span>
            <span className="text-zd-dim">·</span>
            <span className="font-mono text-zd-muted">1.8 km</span>
            <span className="text-zd-dim">·</span>
            <span className="font-mono text-zd-muted">24 min walk</span>
          </div>

          <Button
            variant="primary"
            onClick={() => setDispatchModalOpen(true)}
            className="h-8 px-4 font-sans text-xs font-semibold shrink-0 gap-1.5"
          >
            <span>Send route to residents</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Shelters Right Drawer */}
      <Drawer
        isOpen={shelterDrawerOpen}
        onClose={() => setShelterDrawerOpen(false)}
        title="High-Ground Sanctuaries"
        subtitle="Capacity, elevation, and terrain stability register"
        width="w-96"
      >
        <div className="space-y-4 font-sans text-xs flex flex-col h-full justify-between">
          <div className="space-y-3">
            {/* Add Shelter Click-to-Drop Toggle */}
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
              className="w-full h-8 px-3 rounded-[6px] border border-dashed border-zd-accent/50 hover:border-zd-accent text-zd-accent flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Designate sanctuary (Click-to-drop)</span>
            </button>

            {/* List of Shelters */}
            <div className="divide-y divide-zd-border border border-zd-border rounded-panel bg-zd-base">
              {shelters.map(shelter => {
                const isSelected = selectedShelterId === shelter.id;
                const occPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);

                return (
                  <div
                    key={shelter.id}
                    onClick={() => setSelectedShelterId(shelter.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-zd-raised' : 'hover:bg-zd-hover'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-zd-text">{shelter.name}</span>
                      <span className="font-mono text-[11px] text-zd-dim">{shelter.elevationM}m elev</span>
                    </div>

                    <div className="flex justify-between font-mono text-[11px] text-zd-muted mb-2">
                      <span>Capacity: {shelter.capacity} persons</span>
                      <span>Occupied: {occPct}%</span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="h-1.5 w-full bg-zd-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sev-normal rounded-full"
                        style={{ width: `${Math.max(5, occPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer: Quiet SDRF 1077 Hotline Link */}
          <div className="pt-4 border-t border-zd-border text-center">
            <a
              href="tel:1077"
              className="inline-flex items-center gap-2 text-xs font-mono text-zd-dim hover:text-zd-accent transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sev-critical" />
              <span>Emergency Control: Call SDRF 1077</span>
            </a>
          </div>
        </div>
      </Drawer>

      {/* Dispatch Review Modal */}
      <Modal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title="Review Corridor Dispatch"
        subtitle="Confirm emergency pathway dissemination to civilian recipients"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-sans text-xs">
          {/* Mini Route Map Preview Card */}
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Destination:</span>
              <span className="text-zd-text font-bold">{selectedShelter.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Corridor Distance:</span>
              <span className="text-zd-text">1.8 km (Ridge path)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Estimated Walk ETA:</span>
              <span className="text-zd-text">24 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Hazard Clearance:</span>
              <span className="text-sev-normal">Avoids Submerged Bridge</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Civilian Target Reach:</span>
              <span className="text-zd-accent font-bold">1,240 devices</span>
            </div>
          </div>

          <p className="text-[11px] text-zd-muted leading-relaxed">
            Corridor instructions will be broadcast via push notification, emergency SMS, and offline BLE mesh relays in dead zones.
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

      {/* Typed Confirmation Modal */}
      <TypedConfirmModal
        isOpen={typedConfirmOpen}
        onClose={() => setTypedConfirmOpen(false)}
        onConfirm={finalizeDispatch}
        title="Authorize Evacuation Corridor Broadcast"
        prompt="Type EVACUATE to transmit corridor instructions"
        confirmWord="EVACUATE"
        actionLabel="Transmit Emergency Directive"
        description="This action will trigger audible mobile phone alerts and SMS route maps to 1,240 registered residents in Rampur Basin."
      />
    </div>
  );
};
