import React, { useState } from 'react';
import { ArrowLeft, Megaphone, ChevronRight, Network } from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function AlertControlScreen({ 
  onBack, 
  onOpenManualAlert, 
  onOpenGateway,
  userRole = 'admin'
}) {
  const [autoMode, setAutoMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [meshEnabled, setMeshEnabled] = useState(true);

  const activeCount = (pushEnabled ? 1 : 0) + (smsEnabled ? 1 : 0) + (meshEnabled ? 1 : 0);

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-12 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Alert Dispatch" userRole={userRole} />

      {/* Subheader */}
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
                Alert dispatch control
              </h1>
              <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
                Sector 4B · Multi-channel broadcast
              </p>
            </div>
          </div>

          {/* Auto mode toggle */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#5C635E] dark:text-[#8A928D] text-[11px]">Auto:</span>
            <button
              onClick={() => setAutoMode(!autoMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-calm ${
                autoMode ? 'bg-[#1A1D1B] dark:bg-[#ECEAE4]' : 'bg-[#D8D4CA] dark:bg-[#2A302D]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white dark:bg-[#0F1211] transition-transform ${
                autoMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {/* Single Boxed Hero Block: Dispatch Status */}
        <section 
          aria-label="Dispatch status"
          className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3.5 bg-[#FAF9F6] dark:bg-[#171B19] space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              System trigger mode
            </span>
            <span className="text-[11px] font-mono text-[#2E7D4F] dark:text-[#389E65] font-semibold">
              {activeCount} of 3 channels armed
            </span>
          </div>

          <p className="text-xs text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed">
            {autoMode 
              ? 'Autonomous dispatch active. Alerts trigger when sensor thresholds cross 50 mm/h rain or 80% saturation.'
              : 'Manual override active. Autonomous triggers paused. Supervisor confirmation required.'}
          </p>
        </section>

        {/* Primary Action Button */}
        <section aria-label="Manual broadcast trigger">
          <button
            onClick={onOpenManualAlert}
            className="w-full h-11 px-4 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#0F1211] text-xs font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-calm hover:opacity-90"
          >
            <Megaphone className="w-4 h-4" strokeWidth={1.5} />
            <span>Send manual alert</span>
          </button>
        </section>

        {/* Channel List as Rows with Status, Latency, and Reach in Mono */}
        <section aria-label="Broadcast delivery channels">
          <div className="py-1 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Transmission channels
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            {/* Channel 1: Mobile Push */}
            <div className="p-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${pushEnabled ? 'bg-[#2E7D4F] dark:bg-[#389E65]' : 'bg-[#D8D4CA]'}`} />
                  <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">Mobile application push</span>
                </div>
                <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] space-x-3">
                  <span>Reach: 1,240 nodes</span>
                  <span>Latency: 2s</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={() => setPushEnabled(!pushEnabled)}
                className="w-4 h-4 rounded text-[#1A1D1B] accent-[#1A1D1B] cursor-pointer"
              />
            </div>

            {/* Channel 2: SMS Broadcast */}
            <div className="p-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${smsEnabled ? 'bg-[#2E7D4F] dark:bg-[#389E65]' : 'bg-[#D8D4CA]'}`} />
                  <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">Cellular SMS broadcast</span>
                </div>
                <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] space-x-3">
                  <span>Reach: 8,450 numbers</span>
                  <span>Latency: 8s</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={() => setSmsEnabled(!smsEnabled)}
                className="w-4 h-4 rounded text-[#1A1D1B] accent-[#1A1D1B] cursor-pointer"
              />
            </div>

            {/* Channel 3: Offline BLE Mesh */}
            <div className="p-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${meshEnabled ? 'bg-[#2E7D4F] dark:bg-[#389E65]' : 'bg-[#D8D4CA]'}`} />
                  <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">Offline BLE mesh</span>
                </div>
                <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] space-x-3">
                  <span>Reach: 9 peer nodes</span>
                  <span>Latency: 180ms/hop</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={meshEnabled}
                onChange={() => setMeshEnabled(!meshEnabled)}
                className="w-4 h-4 rounded text-[#1A1D1B] accent-[#1A1D1B] cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Mesh & Gateway shortcut row */}
        {onOpenGateway && (
          <section aria-label="Mesh gateway link">
            <button
              onClick={onOpenGateway}
              className="w-full h-11 px-3 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] text-xs font-semibold flex items-center justify-between hover:bg-[#ECE9E2]/50 dark:hover:bg-[#2A302D]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">Inspect mesh and LoRA hardware gateway</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
            </button>
          </section>
        )}

        {/* Recent Transmission Audit Log */}
        <section aria-label="Recent broadcast audit log">
          <div className="py-1 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Transmission log
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            <div className="p-3 flex justify-between items-start">
              <div>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] block">
                  Evacuation directive: Sector 4B
                </span>
                <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                  Push + SMS + BLE · 1,240 deliveries confirmed
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">16:12</span>
            </div>

            <div className="p-3 flex justify-between items-start">
              <div>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] block">
                  Sluice gate 03 aperture 40%
                </span>
                <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                  Manual hydraulic override confirmed
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">14:45</span>
            </div>

            <div className="p-3 flex justify-between items-start">
              <div>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] block">
                  Rainfall threshold 50 mm/h exceeded
                </span>
                <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                  Autonomous sensor advisory triggered
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">11:30</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
