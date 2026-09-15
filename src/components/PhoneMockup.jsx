import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2, Volume2, AlertOctagon } from 'lucide-react';

export default function PhoneMockup({ 
  children, 
  activeScreen, 
  onNavigateScreen, 
  isSirenActive,
  onToggleSiren 
}) {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [forcePureMobile, setForcePureMobile] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      // Format 12-hour or standard
      setCurrentTime(`${hours % 12 || 12}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const screenNames = [
    { id: 'home', label: '1. Home' },
    { id: 'detail', label: '2. Rampur Detail' },
    { id: 'alerts', label: '3. Alerts' },
    { id: 'map', label: '4. Evacuation' },
    { id: 'reports', label: '5. Reports' },
    { id: 'settings', label: '6. Settings' },
  ];

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      forcePureMobile ? 'bg-[#f8fafc] p-0' : 'bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#0f172a] sm:py-8 sm:px-4 flex flex-col items-center justify-center'
    }`}>
      {/* Desktop Presentation Bar (Hidden on mobile or when toggled to pure view) */}
      {!forcePureMobile && (
        <div className="hidden sm:flex flex-wrap items-center justify-between w-full max-w-4xl mb-6 px-4 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-bold text-white tracking-tight text-sm">
              ZeroDay Telemetry App
            </span>
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-[10px] uppercase font-mono">
              SIH Edition
            </span>
          </div>

          {/* Quick jump to the 5 screenshots */}
          <div className="flex items-center gap-1.5 my-1">
            {screenNames.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigateScreen(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeScreen === s.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Controls: Siren & Frame Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSiren}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSirenActive
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-slate-800 hover:bg-red-950 text-red-400 border border-red-900/50'
              }`}
              title="Test Emergency Siren Audio/Visual"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSirenActive ? 'Siren ON' : 'Test Siren'}</span>
            </button>

            <button
              onClick={() => setForcePureMobile(!forcePureMobile)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Toggle Fullscreen Clean Mobile View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Center Phone Frame Wrapper */}
      <div className="relative flex items-center justify-center w-full">
        {/* Outer Phone Mockup Frame (Active on desktop when not in pure mode) */}
        <div 
          className={`relative transition-all duration-300 ${
            forcePureMobile 
              ? 'w-full min-h-screen rounded-none shadow-none p-0 bg-[#f8fafc]' 
              : 'w-full sm:w-[412px] sm:h-[864px] sm:p-3 sm:rounded-[52px] sm:bg-gradient-to-b sm:from-slate-700 sm:via-slate-800 sm:to-slate-900 sm:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.5)] sm:ring-1 sm:ring-white/15'
          }`}
        >
          {/* Hardware buttons on phone edges (Only on desktop frame) */}
          {!forcePureMobile && (
            <>
              {/* Volume Up */}
              <div className="hidden sm:block absolute -left-[2px] top-28 w-[3px] h-10 bg-slate-600 rounded-l-sm" />
              {/* Volume Down */}
              <div className="hidden sm:block absolute -left-[2px] top-42 w-[3px] h-10 bg-slate-600 rounded-l-sm" />
              {/* Power button */}
              <div className="hidden sm:block absolute -right-[2px] top-32 w-[3px] h-14 bg-slate-600 rounded-r-sm" />
            </>
          )}

          {/* Phone Screen Glass */}
          <div 
            className={`w-full h-full bg-[#f8fafc] overflow-hidden flex flex-col relative transition-all ${
              forcePureMobile 
                ? 'min-h-screen rounded-none' 
                : 'sm:rounded-[42px] sm:border sm:border-slate-800 sm:h-[840px]'
            }`}
          >
            {/* Siren Strobe Overlay if active */}
            {isSirenActive && (
              <div className="absolute inset-0 bg-red-600/20 z-50 pointer-events-none animate-pulse border-4 border-red-600" />
            )}

            {/* Mobile Top Status Bar */}
            <div className="flex-shrink-0 bg-white px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 select-none z-30">
              {/* Left: Time */}
              <span className="text-[14px] font-semibold tracking-tight pl-1">
                {currentTime}
              </span>

              {/* Center: Dynamic Island Capsule (Desktop frame view) */}
              {!forcePureMobile && (
                <div className="hidden sm:flex items-center justify-center w-24 h-5 bg-black rounded-full shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-neutral-800 ml-auto mr-2" />
                </div>
              )}

              {/* Right: Signal, Wifi, Battery */}
              <div className="flex items-center gap-1.5 pr-1">
                <Signal className="w-3.5 h-3.5 fill-slate-800 stroke-none" />
                <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
                <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
                  <div className="w-full h-full bg-slate-800 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
              {children}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="bg-white flex-shrink-0 py-1.5 flex justify-center z-30 select-none">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
