import React, { useState } from 'react';
import { 
  ArrowLeft, ShieldCheck, Check, Navigation, PhoneCall, 
  Compass, AlertOctagon, Building2, User, Info, MapPin
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function EvacuationRouteScreen({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedShelter, setSelectedShelter] = useState('govt_school');
  const [navigationStarted, setNavigationStarted] = useState(false);

  const alternateShelters = [
    {
      id: 'community_hall',
      name: 'Community Hall, Bhelupur',
      dist: '3.2 km',
      routeDesc: 'Sector 4 Ring Road · Nominal waterflow',
      capacity: '150',
    },
    {
      id: 'panchayat_bhawan',
      name: 'Panchayat Bhawan, Kotdwar',
      dist: '4.5 km',
      routeDesc: 'Upper Ridge Hill Track · Elevated plateau',
      capacity: '280',
    },
    {
      id: 'phc_station',
      name: 'Primary Health Centre',
      dist: '5.1 km',
      routeDesc: 'NH-58 Bypass · Medical station ready',
      capacity: '90',
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Header */}
      <TopHeader currentRegion="All Regions" />

      {/* Subheader */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" strokeWidth={2.4} />
          </button>
          <h1 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
            Evacuation route
          </h1>
        </div>

        {/* GPS Live Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-800 tracking-wider">
            GPS Live
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 select-none overflow-x-auto no-scrollbar">
        {['Sensors', 'Shelters', 'Hazards'].map((filter) => {
          const isSelected = activeFilter === filter.toLowerCase();
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(isSelected ? 'all' : filter.toLowerCase())}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
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

      <div className="px-4 py-3 flex flex-col gap-3.5">
        {/* Interactive Map Visual Container */}
        <div className="relative w-full h-[270px] bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] select-none">
          <svg className="w-full h-full" viewBox="0 0 350 270" preserveAspectRatio="none">
            <defs>
              <pattern id="mapGrid" width="35" height="35" patternUnits="userSpaceOnUse">
                <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
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

            {/* Roads */}
            <path
              d="M 50 250 L 160 180 L 175 140 L 200 135"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Route */}
            <path
              d="M 65 205 Q 120 170 145 130 T 215 95 T 280 75"
              fill="none"
              stroke="#c2410c"
              strokeWidth="4.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />

            {/* Hazard Node */}
            <circle cx="160" cy="145" r="14" fill="#fee2e2" opacity="0.6" />
            <circle cx="160" cy="145" r="6" fill="#ef4444" />
          </svg>

          {/* Map Badges */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span className="text-[11px] font-bold text-slate-800">
              Safe Route Active
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-lg px-2 py-0.5 text-[11px] font-extrabold text-slate-700 shadow-sm flex items-center gap-0.5">
            <span>N</span>
            <span className="text-slate-500">↑</span>
          </div>

          <div className="absolute top-[180px] left-3 bg-[#fee2e2] border border-red-200 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-[11px] font-bold text-[#b91c1c]">
              ⊘ Bypass: Bridge Submerged
            </span>
          </div>

          {/* Origin */}
          <div className="absolute top-[148px] left-2">
            <div className="relative flex items-center">
              <div className="absolute -left-1 -top-1 w-6 h-6 rounded-full bg-[#ea580c]/30 animate-ping" />
              <div className="w-4 h-4 rounded-full bg-[#c2410c] border-2 border-white flex items-center justify-center shadow-md z-10" />
              <div className="ml-1.5 bg-white/95 backdrop-blur-sm border border-slate-200 px-2 py-0.5 rounded-full shadow-sm">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                  You (Civil Lines)
                </span>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="absolute top-[60px] right-6">
            <div className="relative flex items-center flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-[#16a34a]/20 border-2 border-[#16a34a] flex items-center justify-center shadow-md">
                <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
              </div>
              <div className="mr-1.5 bg-white/95 backdrop-blur-sm border border-slate-200 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#16a34a]" />
                <span className="text-[11px] font-bold text-slate-800">
                  Shelter
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
            Elevation: <span className="font-bold">+14m</span>
          </div>
        </div>

        {/* Primary Selected Destination Card */}
        <div className="bg-[#fff9f6] rounded-2xl p-4 border border-[#fed7aa]/80 shadow-[0_2px_8px_rgba(194,65,12,0.06)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#c2410c] flex-shrink-0" />
              <h3 className="text-[16.5px] font-bold text-slate-900 tracking-tight">
                Govt. School, Rampur
              </h3>
            </div>
            <span className="text-[14px] font-extrabold text-[#9a3412]">
              1.8 km <span className="text-slate-400 font-normal">·</span> 22 min
            </span>
          </div>

          <div className="mt-2 text-[12px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <span>👥 Capacity 200</span>
              <span className="text-slate-300">·</span>
              <span>Route avoids landslide zone</span>
            </div>
            <div className="flex items-center gap-1 text-[#16a34a] font-semibold text-[11.5px]">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              <span>Relief kit & potable water ready</span>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setNavigationStarted(!navigationStarted)}
              className="bg-[#9a3412] hover:bg-[#7c2d12] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span>{navigationStarted ? "Navigating..." : "Start"}</span>
              <Navigation className="w-3.5 h-3.5 fill-white rotate-45" />
            </button>
          </div>
        </div>

        {/* Alternate Options */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11.5px] font-extrabold text-slate-500 tracking-wider uppercase">
              ALTERNATE OPTIONS
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              3 Available
            </span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {alternateShelters.map((shelter) => (
              <div 
                key={shelter.id} 
                onClick={() => setSelectedShelter(shelter.id)}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 -mx-1 px-1 rounded-lg transition-colors"
              >
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-900">
                    {shelter.name}
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    {shelter.routeDesc}
                  </p>
                </div>
                <span className="text-[13px] font-extrabold text-slate-800 ml-2 whitespace-nowrap">
                  {shelter.dist}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assistance Hotline */}
        <div className="bg-[#eef4ff] border border-blue-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm">
          <span className="text-base">🚨</span>
          <p className="text-[12px] text-slate-700 font-medium">
            Need assistance on route?{' '}
            <a 
              href="tel:1077" 
              className="text-[#1e40af] font-bold underline hover:text-[#1e3a8a]"
            >
              Call Control Room 1077
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
