import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Shield, User, AlertTriangle } from 'lucide-react';

export default function PhoneMockup({ 
  children, 
  activeScreen, 
  onNavigateScreen, 
  isSirenActive,
  onToggleSiren,
  userRole = 'admin',
  onToggleRole,
  onTriggerDisaster,
  isOpsMode = false,
  onToggleOpsMode
}) {
  const screens = [
    { id: 'home', label: 'Overview' },
    { id: 'detail', label: 'Rampur' },
    { id: 'mpu6050', label: 'MPU6050' },
    { id: 'ai-engine', label: 'Risk Model' },
    { id: 'gateway', label: 'Gateway' },
    { id: 'map', label: 'Map' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-150 ${
      isOpsMode ? 'bg-[#0F1211] text-[#ECEAE4]' : 'bg-[#F3F1EC] text-[#1A1D1B]'
    }`}>
      {/* Presenter Toolbar — Sits OUTSIDE the app viewport, muted monospace */}
      <aside 
        aria-label="Presenter controls"
        className={`w-full border-b px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono transition-colors duration-150 ${
          isOpsMode 
            ? 'bg-[#171B19] border-[#2A302D] text-[#8A928D]' 
            : 'bg-[#FAF9F6] border-[#D8D4CA] text-[#5C635E]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#1A1D1B] dark:text-[#ECEAE4]">
            PRESENTER
          </span>
          <span className="text-[11px] opacity-60">|</span>
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {screens.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigateScreen(s.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-calm border ${
                  activeScreen === s.id
                    ? isOpsMode 
                      ? 'bg-[#2A302D] text-[#ECEAE4] border-[#8A928D]' 
                      : 'bg-[#1A1D1B] text-[#FAF9F6] border-[#1A1D1B]'
                    : isOpsMode
                      ? 'bg-transparent text-[#8A928D] border-transparent hover:border-[#2A302D]'
                      : 'bg-transparent text-[#5C635E] border-transparent hover:border-[#D8D4CA]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-calm flex items-center gap-1.5 ${
              isOpsMode 
                ? 'border-[#2A302D] text-[#ECEAE4] hover:bg-[#2A302D]' 
                : 'border-[#D8D4CA] text-[#1A1D1B] hover:bg-[#ECE9E2]'
            }`}
            title="Toggle Admin vs Resident perspective"
          >
            {userRole === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
            <span>Role: {userRole === 'admin' ? 'Admin' : 'Resident'}</span>
          </button>

          {/* Trigger Incident Directive */}
          <button
            onClick={onTriggerDisaster}
            className="px-2 py-0.5 rounded text-[11px] font-mono text-[#C1271D] dark:text-[#D9382E] border border-[#C1271D]/40 dark:border-[#D9382E]/40 hover:bg-[#C1271D]/10 transition-calm flex items-center gap-1"
            title="Jump to Rampur Basin 4B directive"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Directive 4B</span>
          </button>

          {/* Audio Siren Toggle */}
          <button
            onClick={onToggleSiren}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-calm flex items-center gap-1 border ${
              isSirenActive
                ? 'bg-[#C1271D] text-white border-[#C1271D]'
                : isOpsMode
                  ? 'border-[#2A302D] text-[#ECEAE4] hover:bg-[#2A302D]'
                  : 'border-[#D8D4CA] text-[#1A1D1B] hover:bg-[#ECE9E2]'
            }`}
            title="Toggle Web Audio emergency siren"
          >
            {isSirenActive ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{isSirenActive ? 'Siren On' : 'Siren'}</span>
          </button>

          {/* Ops Mode / Dark Theme Toggle */}
          {onToggleOpsMode && (
            <button
              onClick={onToggleOpsMode}
              className={`p-1 rounded border transition-calm ${
                isOpsMode 
                  ? 'border-[#2A302D] text-[#ECEAE4] hover:bg-[#2A302D]' 
                  : 'border-[#D8D4CA] text-[#1A1D1B] hover:bg-[#ECE9E2]'
              }`}
              title={isOpsMode ? 'Switch to Light Theme' : 'Switch to Dark Ops Mode'}
            >
              {isOpsMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area: Centered 400px column on desktop, edge-to-edge on mobile */}
      <main className="flex-1 flex justify-center items-start sm:py-6 sm:px-4">
        <div 
          className={`w-full min-h-[calc(100vh-45px)] sm:min-h-0 sm:h-[844px] sm:max-w-[400px] flex flex-col relative transition-colors duration-150 sm:border rounded sm:rounded-[8px] overflow-hidden ${
            isOpsMode 
              ? 'bg-[#171B19] border-[#2A302D] text-[#ECEAE4]' 
              : 'bg-[#FAF9F6] border-[#D8D4CA] text-[#1A1D1B]'
          }`}
        >
          {/* Calm siren indicator: a 2px top border stripe when siren active, no screen flash */}
          {isSirenActive && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#C1271D] z-50 animate-slow-pulse" />
          )}

          {/* Scrollable application container */}
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
