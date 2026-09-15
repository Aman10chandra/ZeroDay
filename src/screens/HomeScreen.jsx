import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function HomeScreen({ onSelectRegionDetail }) {
  const [sortOrder, setSortOrder] = useState('critical');

  const regionsData = [
    {
      id: 'rampur',
      name: 'Rampur Ward',
      rainfall: '62 mm/hr',
      status: 'River level critical',
      dotColor: '#dc2626', // Red
      isActiveCard: true, // Soft blue-tinted card as in screenshot
      severity: 1,
    },
    {
      id: 'kosi',
      name: 'Kosi Nagar',
      rainfall: '48 mm/hr',
      status: 'Inundation warning',
      dotColor: '#dc2626', // Red
      isActiveCard: false,
      severity: 2,
    },
    {
      id: 'barauni',
      name: 'Barauni East',
      rainfall: '31 mm/hr',
      status: 'Gauge rising steadily',
      dotColor: '#b45309', // Amber / Brown
      isActiveCard: false,
      severity: 3,
    },
    {
      id: 'darbhanga',
      name: 'Darbhanga Block',
      rainfall: '24 mm/hr',
      status: 'Drainage watch active',
      dotColor: '#b45309', // Amber / Brown
      isActiveCard: false,
      severity: 4,
    },
    {
      id: 'samastipur',
      name: 'Samastipur Central',
      rainfall: '11 mm/hr',
      status: 'Normal flow',
      dotColor: '#94a3b8', // Muted slate / light blue
      isActiveCard: false,
      severity: 5,
    },
    {
      id: 'patna',
      name: 'Patna Canal Sector 3',
      rainfall: '4 mm/hr',
      status: 'Within safe threshold',
      dotColor: '#94a3b8', // Muted slate / light blue
      isActiveCard: false,
      severity: 6,
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-6">
      {/* Top Header */}
      <TopHeader currentRegion="All Regions" />

      {/* Main Content */}
      <div className="px-4 pt-4 pb-2">
        {/* User Greeting */}
        <h2 className="text-[17px] font-medium text-slate-800 tracking-tight mb-4">
          Good evening, Rajesh
        </h2>

        {/* 2 Top Metric Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Regions Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-slate-500">
              Regions
            </span>
            <div className="my-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                14
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse" />
              <span className="text-[12px] font-semibold text-[#a83210]">
                5 alerts active
              </span>
            </div>
          </div>

          {/* Sensors Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-slate-500">
              Sensors
            </span>
            <div className="my-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                42 online
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] font-bold text-[#b91c1c]">
                3 offline
              </span>
            </div>
          </div>
        </div>

        {/* Regions Header & Sort Dropdown */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">
            Regions
          </h3>
          <button 
            onClick={() => setSortOrder(sortOrder === 'critical' ? 'alpha' : 'critical')}
            className="flex items-center gap-1 text-[13px] font-bold text-[#a83210] hover:opacity-80 transition-opacity"
          >
            <span>Sort</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#a83210]" strokeWidth={2.8} />
          </button>
        </div>

        {/* Region Cards List */}
        <div className="flex flex-col gap-2.5">
          {regionsData.map((region) => {
            const isHighlighted = region.isActiveCard;
            return (
              <div
                key={region.id}
                onClick={() => onSelectRegionDetail && onSelectRegionDetail(region.id)}
                className={`w-full rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] ${
                  isHighlighted 
                    ? 'bg-[#e8f0fe] border border-blue-100/80 shadow-[0_2px_6px_rgba(59,130,246,0.06)]' 
                    : 'bg-white border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Colored Status Dot */}
                  <span 
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: region.dotColor }} 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[15.5px] font-bold text-slate-900 tracking-tight">
                        {region.name}
                      </h4>
                      {region.id === 'rampur' && (
                        <span className="bg-[#fee2e2] text-[#991b1b] border border-red-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                          Disaster Active
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-slate-500 font-normal mt-0.5 leading-snug">
                      {region.rainfall} rainfall · {region.status}
                    </p>
                  </div>
                </div>

                {/* Chevron Right Arrow */}
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" strokeWidth={2.4} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
