import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldCheck, Check, Navigation, PhoneCall, 
  Compass, AlertOctagon, Building2, User, Users, Info, MapPin, 
  Plus, ZoomIn, ZoomOut, Send, CheckCircle2, Eye, ShieldAlert,
  Layers, ChevronRight, X
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function EvacuationRouteScreen({ 
  onBack, 
  userRole = 'admin', // 'admin' | 'resident'
  onToggleRole,
  isAddingShelterInitially = false,
  onOpenDispatchModal,
  dispatchedRouteData
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedShelterId, setSelectedShelterId] = useState('govt_school');
  const [navigationStarted, setNavigationStarted] = useState(false);
  
  // Interactive Map Zoom & Pinning States
  const [isZoomedToShelters, setIsZoomedToShelters] = useState(isAddingShelterInitially);
  const [isAddingMode, setIsAddingMode] = useState(isAddingShelterInitially);
  const [pinDropSuccessMessage, setPinDropSuccessMessage] = useState('');

  // Initial and dynamic shelter points
  const [shelterPoints, setShelterPoints] = useState([
    {
      id: 'govt_school',
      name: 'Govt. School, Rampur',
      dist: '1.8 km',
      routeDesc: 'Primary highland refuge · Potable water ready',
      capacity: '200',
      elevation: '+14m',
      x: 280,
      y: 75,
      isPrimary: true,
      status: 'Ready',
    },
    {
      id: 'community_hall',
      name: 'Community Hall, Bhelupur',
      dist: '3.2 km',
      routeDesc: 'Sector 4 Ring Road · Nominal waterflow',
      capacity: '150',
      elevation: '+19m',
      x: 310,
      y: 110,
      isPrimary: false,
      status: 'Ready',
    },
    {
      id: 'panchayat_bhawan',
      name: 'Panchayat Bhawan, Kotdwar',
      dist: '4.5 km',
      routeDesc: 'Upper Ridge Hill Track · Elevated plateau',
      capacity: '280',
      elevation: '+26m',
      x: 230,
      y: 45,
      isPrimary: false,
      status: 'Ready',
    },
  ]);

  // If opened via "Add shelter points" button from ward detail, zoom immediately
  useEffect(() => {
    if (isAddingShelterInitially) {
      setIsZoomedToShelters(true);
      setIsAddingMode(true);
    }
  }, [isAddingShelterInitially]);

  const selectedShelter = shelterPoints.find(s => s.id === selectedShelterId) || shelterPoints[0];

  // Handler to drop custom shelter pin on map click
  const handleMapClick = (e) => {
    if (!isAddingMode) return;
    
    // Calculate SVG coordinate ratio from container click
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const svgX = Math.round((clickX / rect.width) * 350);
    const svgY = Math.round((clickY / rect.height) * 270);

    const newShelter = {
      id: `custom_${Date.now()}`,
      name: `Emergency Camp ${shelterPoints.length + 1}`,
      dist: '2.4 km',
      routeDesc: 'Newly designated elevated relief site',
      capacity: '120',
      elevation: '+18m',
      x: svgX,
      y: svgY,
      isPrimary: false,
      status: 'Newly Pinned',
    };

    setShelterPoints(prev => [...prev, newShelter]);
    setSelectedShelterId(newShelter.id);
    setIsZoomedToShelters(true);
    setPinDropSuccessMessage(`Added "${newShelter.name}" to Rampur Ward map!`);
    setTimeout(() => setPinDropSuccessMessage(''), 3500);
  };

  // Quick preset add
  const handleAddPresetShelter = (name, dist, elevation, capacity, x, y) => {
    const newShelter = {
      id: `preset_${Date.now()}`,
      name,
      dist,
      routeDesc: 'Elevated safe zone verified by SDRF',
      capacity,
      elevation,
      x,
      y,
      status: 'Newly Pinned',
    };
    setShelterPoints(prev => [...prev, newShelter]);
    setSelectedShelterId(newShelter.id);
    setIsZoomedToShelters(true);
    setPinDropSuccessMessage(`Pinned "${name}"!`);
    setTimeout(() => setPinDropSuccessMessage(''), 3500);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Header */}
      <TopHeader currentRegion="Rampur Ward" />

      {/* Role Indicator / Mode Banner */}
      <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${userRole === 'admin' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="font-bold tracking-tight">
            {userRole === 'admin' ? 'ADMIN DISASTER CONTROL' : 'RESIDENT ESCAPE VIEW'}
          </span>
        </div>

        {onToggleRole && (
          <button
            onClick={onToggleRole}
            className="text-[11px] font-bold text-orange-300 hover:text-white underline"
          >
            Switch to {userRole === 'admin' ? 'Resident' : 'Admin'}
          </button>
        )}
      </div>

      {/* Subheader */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" strokeWidth={2.4} />
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight leading-tight">
              Evacuation Route & Shelters
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Rampur Ward · Disaster Zone 04
            </p>
          </div>
        </div>

        {/* GPS Live Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-800 tracking-wider">
            GPS Live
          </span>
        </div>
      </div>

      {/* Success Notification Banner when pin added */}
      {pinDropSuccessMessage && (
        <div className="mx-4 mt-2 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>{pinDropSuccessMessage}</span>
          </div>
          <button onClick={() => setPinDropSuccessMessage('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Action Control Ribbon */}
      {userRole === 'admin' && (
        <div className="px-4 py-2 bg-[#fff7ed] border-b border-[#fed7aa] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setIsAddingMode(!isAddingMode);
              if (!isAddingMode) setIsZoomedToShelters(true);
            }}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              isAddingMode 
                ? 'bg-[#9a3412] text-white border-[#9a3412] shadow-sm' 
                : 'bg-white text-[#9a3412] border-[#fed7aa] hover:bg-orange-100/50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            <span>{isAddingMode ? 'Click Map to Drop Pin' : 'Add Shelter Points'}</span>
          </button>

          <button
            onClick={() => onOpenDispatchModal && onOpenDispatchModal(selectedShelter, shelterPoints.length)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-sm active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Route to Users</span>
          </button>
        </div>
      )}

      {/* Filter & Zoom Bar */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Shelters', 'Hazards'].map((filter) => {
            const isSelected = activeFilter === filter.toLowerCase();
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(isSelected ? 'all' : filter.toLowerCase())}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Zoom Toggle Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsZoomedToShelters(!isZoomedToShelters)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              isZoomedToShelters 
                ? 'bg-orange-100 border-[#fed7aa] text-[#9a3412]' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Zoom to Shelter Points"
          >
            {isZoomedToShelters ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span className="text-[10.5px]">{isZoomedToShelters ? 'Reset View' : 'Zoom to Shelters'}</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3.5">
        {/* Interactive Map Visual Container */}
        <div 
          onClick={handleMapClick}
          className={`relative w-full h-[280px] bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] select-none transition-all ${
            isAddingMode ? 'cursor-crosshair ring-2 ring-orange-500' : 'cursor-default'
          }`}
        >
          {/* SVG Map with Dynamic ViewBox / Zoom to Shelter Points */}
          <svg 
            className="w-full h-full transition-all duration-500 ease-out" 
            viewBox={isZoomedToShelters ? "110 10 240 190" : "0 0 350 270"} 
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#mapGrid)" />

            {/* River Stream */}
            <path
              d="M -20 220 C 80 215, 140 240, 240 225 C 290 220, 330 230, 380 220 L 380 270 L -20 270 Z"
              fill="#e0f2fe"
              opacity="0.85"
            />
            <path
              d="M -20 200 C 60 210, 130 180, 220 120 C 260 90, 300 80, 380 70"
              fill="none"
              stroke="#dbeafe"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M -20 200 C 60 210, 130 180, 220 120 C 260 90, 300 80, 380 70"
              fill="none"
              stroke="#bfdbfe"
              strokeWidth="4"
              strokeDasharray="4 6"
              opacity="0.6"
            />

            {/* Inundated Danger Zone / Flood polygon */}
            <path
              d="M 110 195 Q 155 170 180 145 T 225 155 T 195 205 Z"
              fill="#fee2e2"
              opacity="0.5"
            />

            {/* Normal / Submerged Roads */}
            <path
              d="M 50 250 L 160 180 L 175 140 L 200 135"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Active Evacuation Escape Route (Leading to selected shelter) */}
            <path
              d={`M 65 205 Q 120 170 145 130 T 215 95 T ${selectedShelter.x} ${selectedShelter.y}`}
              fill="none"
              stroke="#c2410c"
              strokeWidth="4.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />

            {/* Hazard Node: Submerged Bridge */}
            <circle cx="160" cy="145" r="15" fill="#fee2e2" opacity="0.7" />
            <circle cx="160" cy="145" r="6" fill="#ef4444" />

            {/* Origin Point: Resident (Civil Lines) */}
            <circle cx="65" cy="205" r="8" fill="#c2410c" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="65" cy="205" r="14" fill="#ea580c" opacity="0.3" className="animate-ping" />

            {/* Dynamic Shelter Pins */}
            {shelterPoints.map((shelter) => {
              const isSelected = shelter.id === selectedShelterId;
              return (
                <g 
                  key={shelter.id} 
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShelterId(shelter.id);
                  }}
                >
                  {/* Outer pulse */}
                  <circle
                    cx={shelter.x}
                    cy={shelter.y}
                    r={isSelected ? 16 : 10}
                    fill={isSelected ? '#16a34a' : '#059669'}
                    opacity={isSelected ? 0.35 : 0.2}
                    className="animate-pulse"
                  />

                  {/* Inner Pin Body */}
                  <circle
                    cx={shelter.x}
                    cy={shelter.y}
                    r={isSelected ? 8 : 6}
                    fill="#16a34a"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* Pin Flag / Label in SVG */}
                  <rect
                    x={shelter.x - 30}
                    y={shelter.y - 20}
                    width="60"
                    height="12"
                    rx="6"
                    fill={isSelected ? '#166534' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#cbd5e1'}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x={shelter.x}
                    y={shelter.y - 11}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill={isSelected ? '#ffffff' : '#1e293b'}
                  >
                    {shelter.name.split(',')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Top Overlays */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span className="text-[11px] font-bold text-slate-800">
              {shelterPoints.length} Shelter Points Active
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-lg px-2 py-0.5 text-[11px] font-extrabold text-slate-700 shadow-sm flex items-center gap-0.5">
            <span>N</span>
            <span className="text-slate-500">↑</span>
          </div>

          {/* Bridge Submerged Hazard Warning Tag */}
          <div className="absolute top-[175px] left-3 bg-[#fee2e2] border border-red-200 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-sm">
            <AlertOctagon className="w-3 h-3 text-[#b91c1c]" />
            <span className="text-[10.5px] font-bold text-[#b91c1c]">
              Bypass Active: Rampur Bridge Inundated
            </span>
          </div>

          {/* Mode Prompt Helper */}
          {isAddingMode && (
            <div className="absolute bottom-2.5 left-2.5 bg-orange-600 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-md animate-bounce">
              Tap map to drop shelter pin
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
            Elevation: <span className="font-bold">{selectedShelter.elevation}</span>
          </div>
        </div>

        {/* Quick Add Presets (For Admin) */}
        {userRole === 'admin' && isAddingMode && (
          <div className="bg-white rounded-2xl p-3 border border-orange-200 shadow-sm flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#9a3412] uppercase tracking-wide">
              Pre-surveyed Relief Staging Grounds:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddPresetShelter("St. Mary Ridge", "2.1 km", "+22m MSL", "180", 250, 60)}
                className="text-left p-2 rounded-xl bg-orange-50/60 border border-orange-200/70 hover:bg-orange-100/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">+ St. Mary Ridge</div>
                <div className="text-[10px] text-slate-500">Elev: +22m MSL · Cap: 180</div>
              </button>

              <button
                onClick={() => handleAddPresetShelter("Relief Ground West", "3.0 km", "+17m MSL", "250", 180, 50)}
                className="text-left p-2 rounded-xl bg-orange-50/60 border border-orange-200/70 hover:bg-orange-100/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">+ Relief Ground West</div>
                <div className="text-[10px] text-slate-500">Elev: +17m MSL · Cap: 250</div>
              </button>
            </div>
          </div>
        )}

        {/* Primary Selected Destination Card */}
        <div className="bg-[#fff9f6] rounded-2xl p-4 border border-[#fed7aa]/80 shadow-[0_2px_8px_rgba(194,65,12,0.06)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#c2410c] flex-shrink-0" />
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
                  {selectedShelter.name}
                </h3>
                <span className="text-[11px] text-[#16a34a] font-semibold">
                  {selectedShelter.status} · Safe Elevation {selectedShelter.elevation}
                </span>
              </div>
            </div>
            <span className="text-[14px] font-extrabold text-[#9a3412]">
              {selectedShelter.dist}
            </span>
          </div>

          <div className="mt-2.5 text-[12px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>Capacity: {selectedShelter.capacity} evacuees</span>
              <span className="text-slate-300">·</span>
              <span>Bypasses landslide hazard zone</span>
            </div>
            <div className="flex items-center gap-1 text-[#16a34a] font-semibold text-[11.5px]">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              <span>Medical triage, emergency rations & clean water ready</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-1 border-t border-orange-100">
            {userRole === 'admin' ? (
              <button
                onClick={() => onOpenDispatchModal && onOpenDispatchModal(selectedShelter, shelterPoints.length)}
                className="w-full bg-[#9a3412] hover:bg-[#7c2d12] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Directive to Affected Citizens</span>
              </button>
            ) : (
              <button
                onClick={() => setNavigationStarted(!navigationStarted)}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Navigation className="w-3.5 h-3.5 fill-white rotate-45" />
                <span>{navigationStarted ? "GPS Turn-by-Turn Active..." : "Start Turn-by-Turn GPS Navigation"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Alternate Pinned Shelters List */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">
              STAGED RELIEF HAVENS ({shelterPoints.length})
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Select to route
            </span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {shelterPoints.map((shelter) => {
              const isSelected = shelter.id === selectedShelterId;
              return (
                <div 
                  key={shelter.id} 
                  onClick={() => {
                    setSelectedShelterId(shelter.id);
                    setIsZoomedToShelters(true);
                  }}
                  className={`py-2.5 flex items-center justify-between cursor-pointer -mx-1 px-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-orange-50/70 font-semibold' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#16a34a]' : 'bg-slate-300'}`} />
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900">
                        {shelter.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {shelter.routeDesc} · Elev: {shelter.elevation}
                      </p>
                    </div>
                  </div>

                  <span className="text-[12.5px] font-extrabold text-slate-800 ml-2 whitespace-nowrap">
                    {shelter.dist}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Assistance Hotline */}
        <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm">
          <PhoneCall className="w-4 h-4 text-[#1e40af] flex-shrink-0" />
          <p className="text-[12px] text-slate-700 font-medium">
            Emergency Hotline: If stranded on route,{' '}
            <a 
              href="tel:1077" 
              className="text-[#1e40af] font-bold underline hover:text-[#1e3a8a]"
            >
              call NDRF / District Control 1077
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
