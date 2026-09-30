import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Send, Plus, MapPin, ZoomIn, ZoomOut, PhoneCall, Check, X
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function EvacuationRouteScreen({ 
  onBack, 
  userRole = 'admin',
  onToggleRole,
  isAddingShelterInitially = false,
  onOpenDispatchModal,
  dispatchedRouteData
}) {
  const [selectedShelterId, setSelectedShelterId] = useState('govt_school');
  const [activeLayer, setActiveLayer] = useState('dem'); // 'base' | 'dem' | 'ndwi'
  
  // Interactive Pinning States
  const [isZoomedToShelters, setIsZoomedToShelters] = useState(isAddingShelterInitially);
  const [isAddingMode, setIsAddingMode] = useState(isAddingShelterInitially);
  const [pinDropSuccessMessage, setPinDropSuccessMessage] = useState('');

  // Initial and dynamic shelter points
  const [shelterPoints, setShelterPoints] = useState([
    {
      id: 'govt_school',
      name: 'Govt. School, Rampur',
      dist: '1.8 km',
      routeDesc: 'Upper ridge road · Stable bedrock foundation',
      capacity: '200',
      elevation: '+14m MSL',
      x: 280,
      y: 75,
      isPrimary: true,
    },
    {
      id: 'community_hall',
      name: 'Community Hall, Bhelupur',
      dist: '3.2 km',
      routeDesc: 'Sector 4 ring bypass · Nominal runoff',
      capacity: '150',
      elevation: '+19m MSL',
      x: 310,
      y: 110,
      isPrimary: false,
    },
    {
      id: 'panchayat_bhawan',
      name: 'Panchayat Bhawan, Kotdwar',
      dist: '4.5 km',
      routeDesc: 'Hill crest track · Elevated plateau',
      capacity: '280',
      elevation: '+26m MSL',
      x: 230,
      y: 45,
      isPrimary: false,
    },
  ]);

  useEffect(() => {
    if (isAddingShelterInitially) {
      setIsZoomedToShelters(true);
      setIsAddingMode(true);
    }
  }, [isAddingShelterInitially]);

  const selectedShelter = shelterPoints.find(s => s.id === selectedShelterId) || shelterPoints[0];

  const handleMapClick = (e) => {
    if (!isAddingMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const svgX = Math.round((clickX / rect.width) * 350);
    const svgY = Math.round((clickY / rect.height) * 270);

    const newShelter = {
      id: `custom_${Date.now()}`,
      name: `Refuge Camp ${shelterPoints.length + 1}`,
      dist: '2.4 km',
      routeDesc: 'Designated elevated haven site',
      capacity: '120',
      elevation: '+18m MSL',
      x: svgX,
      y: svgY,
      isPrimary: false,
    };

    setShelterPoints(prev => [...prev, newShelter]);
    setSelectedShelterId(newShelter.id);
    setIsAddingMode(false);
    setPinDropSuccessMessage(`Added "${newShelter.name}".`);
    setTimeout(() => setPinDropSuccessMessage(''), 3000);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-6 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Evacuation Map" userRole={userRole} />

      {/* Subheader with Back Navigation */}
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
                Evacuation corridor
              </h1>
              <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
                Sector 4B · Avoid bridge & 36° escarpment
              </p>
            </div>
          </div>

          {/* Layer Segmented Control */}
          <div className="flex bg-[#ECE9E2] dark:bg-[#121514] p-0.5 rounded-[6px] border border-[#D8D4CA] dark:border-[#2A302D] text-[11px] font-mono">
            {[
              { id: 'base', label: 'Base' },
              { id: 'dem', label: 'DEM 30m' },
              { id: 'ndwi', label: 'NDWI' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`px-2 py-0.5 rounded-[4px] transition-calm ${
                  activeLayer === l.id 
                    ? 'bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold' 
                    : 'text-[#5C635E] dark:text-[#8A928D]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pin Drop Notice */}
      {pinDropSuccessMessage && (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-3">
          <div className="px-3 py-1.5 border border-[#2E7D4F]/40 bg-[#2E7D4F]/10 text-[#2E7D4F] dark:text-[#389E65] text-xs font-mono rounded-[6px] flex items-center justify-between">
            <span>{pinDropSuccessMessage}</span>
            <button onClick={() => setPinDropSuccessMessage('')}>
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Map Container */}
      <div className="w-full bg-[#ECE9E2] dark:bg-[#121514] border-b border-[#D8D4CA] dark:border-[#2A302D]">
        <div 
          onClick={handleMapClick}
          className={`relative max-w-5xl mx-auto w-full h-[320px] sm:h-[400px] overflow-hidden select-none ${
            isAddingMode ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
        <svg 
          className="w-full h-full" 
          viewBox={isZoomedToShelters ? "110 10 240 190" : "0 0 350 270"} 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="surveyGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" className="text-[#D8D4CA]/70 dark:text-[#2A302D]" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Survey Grid Base */}
          <rect width="100%" height="100%" fill="url(#surveyGrid)" />

          {/* River Geometry */}
          <path
            d="M -20 200 C 60 210, 130 180, 220 120 C 260 90, 300 80, 380 70"
            fill="none"
            stroke="currentColor"
            className="text-[#5C635E]/30 dark:text-[#8A928D]/25"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M -20 200 C 60 210, 130 180, 220 120 C 260 90, 300 80, 380 70"
            fill="none"
            stroke="currentColor"
            className="text-[#5C635E]/60 dark:text-[#8A928D]/50"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Layer: NDWI Water Saturation Pools */}
          {activeLayer === 'ndwi' && (
            <g opacity="0.6">
              <ellipse cx="210" cy="180" rx="35" ry="16" className="fill-[#5C635E]/30 dark:fill-[#8A928D]/30" />
              <text x="210" y="183" fontSize="6.5" fill="currentColor" className="text-[#1A1D1B] dark:text-[#ECEAE4]" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">
                NDWI +0.42
              </text>
            </g>
          )}

          {/* Layer: DEM 30m Topography & Landslide Hazard Hatch */}
          {(activeLayer === 'dem' || activeLayer === 'base') && (
            <g>
              {/* Elevation Contours */}
              <path d="M 0 60 Q 120 40 220 30 T 350 20" fill="none" stroke="currentColor" className="text-[#5C635E]/40" strokeWidth="1" strokeDasharray="3 3" />
              <text x="12" y="56" fontSize="6" fill="currentColor" className="text-[#5C635E]" fontFamily="'IBM Plex Mono', monospace">920m</text>
              
              <path d="M 0 100 Q 140 85 240 65 T 350 55" fill="none" stroke="currentColor" className="text-[#5C635E]/40" strokeWidth="1" strokeDasharray="3 3" />
              <text x="12" y="96" fontSize="6" fill="currentColor" className="text-[#5C635E]" fontFamily="'IBM Plex Mono', monospace">860m</text>

              {/* Landslide Hazard Hatch: severity-critical at low opacity */}
              <polygon 
                points="230,130 280,105 295,145 245,160" 
                fill="#C1271D"
                fillOpacity="0.10"
                stroke="#C1271D" 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              <text x="262" y="132" fontSize="6" fill="#C1271D" fontFamily="'IBM Plex Mono', monospace" fontWeight="600" textAnchor="middle">
                SLOPE 36°
              </text>
              <text x="262" y="140" fontSize="5.5" fill="#C1271D" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">
                Landslide zone
              </text>
            </g>
          )}

          {/* Submerged Bridge Hazard Node */}
          <circle cx="160" cy="145" r="10" fill="#C1271D" fillOpacity="0.15" />
          <circle cx="160" cy="145" r="4" fill="#C1271D" />
          <text x="160" y="132" fontSize="6" fill="#C1271D" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fontWeight="600">
            Bridge closed
          </text>

          {/* Safe Active Corridor (Black dashed stroke leading to selected haven) */}
          <path
            d={`M 65 205 Q 120 170 145 130 T 215 95 T ${selectedShelter.x} ${selectedShelter.y}`}
            fill="none"
            stroke="currentColor"
            className="text-[#1A1D1B] dark:text-[#ECEAE4]"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Origin: Civil Lines Station */}
          <circle cx="65" cy="205" r="5" className="fill-[#1A1D1B] dark:fill-[#ECEAE4]" />
          <text x="65" y="217" fontSize="6.5" fill="currentColor" className="text-[#1A1D1B] dark:text-[#ECEAE4]" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">
            Origin
          </text>

          {/* Shelter Pins */}
          {shelterPoints.map((s) => {
            const isSelected = s.id === selectedShelterId;
            return (
              <g 
                key={s.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShelterId(s.id);
                }}
              >
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isSelected ? 6 : 4}
                  fill="#2E7D4F"
                  stroke="currentColor"
                  className="text-[#FAF9F6] dark:text-[#171B19]"
                  strokeWidth="1.5"
                />
                <text
                  x={s.x}
                  y={s.y - 8}
                  fontSize="6.5"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight={isSelected ? '600' : '400'}
                  fill="currentColor"
                  className="text-[#1A1D1B] dark:text-[#ECEAE4]"
                  textAnchor="middle"
                >
                  {s.name.split(',')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map View Zoom Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={() => setIsZoomedToShelters(!isZoomedToShelters)}
            className="p-1.5 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[4px] text-xs font-mono text-[#1A1D1B] dark:text-[#ECEAE4] shadow-subtle"
            title="Toggle zoom level"
          >
            {isZoomedToShelters ? <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} /> : <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
        </div>

        {isAddingMode && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-[#1A1D1B] text-[#FAF9F6] text-[10.5px] font-mono rounded-[4px]">
            Click map to place refuge
          </div>
        )}
        </div>
      </div>

      {/* Bottom Sheet Controls & Selected Shelter Specs */}
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {/* Selected Haven Card (Structured Data Rows) */}
        <section aria-label="Designated haven specifications">
          <div className="py-1 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Selected haven specifications
            </span>
            <span className="text-[11px] font-mono text-[#2E7D4F] dark:text-[#389E65] font-semibold">
              Verified safe
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            <div className="p-3 flex justify-between items-baseline">
              <span className="font-semibold text-sm text-[#1A1D1B] dark:text-[#ECEAE4]">
                {selectedShelter.name}
              </span>
              <span className="font-mono text-[#5C635E] dark:text-[#8A928D]">
                {selectedShelter.dist} · 24 min
              </span>
            </div>

            <div className="p-2.5 flex justify-between font-mono text-[11px]">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Elevation gain</span>
              <span className="text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">{selectedShelter.elevation}</span>
            </div>

            <div className="p-2.5 flex justify-between font-mono text-[11px]">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Haven capacity</span>
              <span className="text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">{selectedShelter.capacity} persons</span>
            </div>

            <div className="p-2.5 flex justify-between font-mono text-[11px]">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Topographic clearance</span>
              <span className="text-[#2E7D4F] dark:text-[#389E65]">Stable bedrock ridge</span>
            </div>
          </div>
        </section>

        {/* Actions for Admin vs Resident */}
        <section aria-label="Route actions">
          {userRole === 'admin' ? (
            <div className="space-y-2">
              <button
                onClick={() => onOpenDispatchModal && onOpenDispatchModal(selectedShelter, shelterPoints.length)}
                className="w-full h-11 px-4 bg-[#C1271D] hover:bg-[#A81E15] text-white text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm"
              >
                <Send className="w-4 h-4" strokeWidth={1.5} />
                <span>Dispatch route to nodes</span>
              </button>

              <button
                onClick={() => setIsAddingMode(!isAddingMode)}
                className={`w-full h-11 px-4 border text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm ${
                  isAddingMode
                    ? 'bg-[#1A1D1B] text-[#FAF9F6] border-[#1A1D1B] dark:bg-[#ECEAE4] dark:text-[#0F1211]'
                    : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#1A1D1B] dark:text-[#ECEAE4] hover:bg-[#ECE9E2] dark:hover:bg-[#2A302D]'
                }`}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>{isAddingMode ? 'Cancel pin placement' : 'Add shelter point'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <a
                href="tel:1077"
                className="w-full h-11 px-4 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#0F1211] text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm hover:opacity-90"
              >
                <PhoneCall className="w-4 h-4" strokeWidth={1.5} />
                <span>Call SDRF control (1077)</span>
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
