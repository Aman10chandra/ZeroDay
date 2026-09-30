import React, { useState } from 'react';
import { 
  ShieldCheck, Languages, MessageSquare, Map, Volume2, 
  Moon, Sun, Radio, HardDrive, RefreshCw, LogOut, Check
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function SettingsScreen({ 
  onShowToast,
  isOpsMode = false,
  onToggleOpsMode,
  userRole = 'admin',
  onToggleRole
}) {
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [offlineMaps, setOfflineMaps] = useState(true);
  const [sirenOnEmergency, setSirenOnEmergency] = useState(true);
  const [language, setLanguage] = useState('English');
  const [cacheSize, setCacheSize] = useState('42.4 MB');
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleClearCache = () => {
    setCacheSize('0.0 MB');
    if (onShowToast) {
      onShowToast('Offline topographic cache cleared (42.4 MB freed)', 'info');
    }
  };

  const handleRecalibrateMesh = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      if (onShowToast) {
        onShowToast('LoRA beacon MS-8842 recalibrated at 868.10 MHz', 'safe');
      }
    }, 900);
  };

  return (
    <div className="flex flex-col min-h-full pb-20 select-none">
      {/* Header */}
      <TopHeader 
        currentRegion="Settings & Diagnostics" 
        userRole={userRole}
      />

      <div className="p-4 space-y-5">
        {/* Status Line: Mono telemetry info */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D] pb-1 border-b border-[#D8D4CA] dark:border-[#2A302D]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] dark:bg-[#3FA66A]" />
            <span>NODE MS-8842 SYNCED</span>
          </div>
          <span>TIER 1 DISASTER CLEARANCE</span>
        </div>

        {/* Hero: Operator Profile Block (Single hero element) */}
        <section className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#ECE9E2] dark:bg-[#2A302D] border border-[#D8D4CA] dark:border-[#3A423E] flex items-center justify-center font-mono font-semibold text-sm text-[#1A1D1B] dark:text-[#ECEAE4]">
                RS
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight text-[#1A1D1B] dark:text-[#ECEAE4]">
                  Ravi Singh
                </h1>
                <p className="text-xs text-[#5C635E] dark:text-[#8A928D] font-mono mt-0.5">
                  Rampur Ward · Operator ID: SDRF-7740
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[999px] text-[11px] font-mono font-medium tracking-wider uppercase border border-[#2E7D4F]/30 bg-[#2E7D4F]/10 text-[#2E7D4F] dark:text-[#3FA66A] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
              Verified
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between text-xs">
            <span className="text-[#5C635E] dark:text-[#8A928D]">Authority scope</span>
            <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4]">SDRF Incident Commander (Level 1)</span>
          </div>
        </section>

        {/* Section: Display & Theme */}
        <section className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
            Display & Ops Mode
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] divide-y divide-[#D8D4CA] dark:divide-[#2A302D]">
            {/* Ops Dark Mode Toggle */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isOpsMode ? (
                  <Moon className="w-4 h-4 text-[#8A928D]" strokeWidth={1.5} />
                ) : (
                  <Sun className="w-4 h-4 text-[#5C635E]" strokeWidth={1.5} />
                )}
                <div>
                  <div className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                    Dark Ops Mode
                  </div>
                  <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    High-contrast air-traffic console palette
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isOpsMode}
                onClick={onToggleOpsMode}
                className={`w-11 h-6 flex items-center rounded-[999px] p-0.5 transition-colors border ${
                  isOpsMode 
                    ? 'bg-[#1A1D1B] dark:bg-[#ECEAE4] border-[#1A1D1B] dark:border-[#ECEAE4]' 
                    : 'bg-[#ECE9E2] border-[#D8D4CA]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-150 ${
                    isOpsMode 
                      ? 'translate-x-5 bg-[#171B19]' 
                      : 'translate-x-0 bg-[#FAF9F6] border border-[#D8D4CA]'
                  }`}
                />
              </button>
            </div>

            {/* Role Perspective Toggle */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                  Active view mode
                </div>
                <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                  Switch between Admin console and Resident field guide
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleRole}
                className="px-2.5 py-1 text-xs font-mono border border-[#D8D4CA] dark:border-[#2A302D] rounded-[4px] bg-[#ECE9E2] dark:bg-[#2A302D] hover:bg-[#D8D4CA] dark:hover:bg-[#3A423E] text-[#1A1D1B] dark:text-[#ECEAE4] transition-colors"
              >
                {userRole === 'admin' ? 'Admin' : 'Resident'}
              </button>
            </div>
          </div>
        </section>

        {/* Section: Emergency Preferences */}
        <section className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
            Field Preferences
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] divide-y divide-[#D8D4CA] dark:divide-[#2A302D]">
            {/* Language */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Languages className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">Language</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs">
                {['Hindi', 'English'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      if (onShowToast) onShowToast(`Interface language set to ${lang}`, 'info');
                    }}
                    className={`px-2 py-0.5 rounded-[4px] border transition-colors ${
                      language === lang
                        ? 'bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#171B19] border-[#1A1D1B] dark:border-[#ECEAE4]'
                        : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#5C635E] dark:text-[#8A928D]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Siren on Emergency */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                    Siren on critical alert
                  </div>
                  <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    Web Audio dual-tone 650/950 Hz
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sirenOnEmergency}
                onClick={() => setSirenOnEmergency(!sirenOnEmergency)}
                className={`w-11 h-6 flex items-center rounded-[999px] p-0.5 transition-colors border ${
                  sirenOnEmergency 
                    ? 'bg-[#1A1D1B] dark:bg-[#ECEAE4] border-[#1A1D1B] dark:border-[#ECEAE4]' 
                    : 'bg-[#ECE9E2] border-[#D8D4CA]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-150 ${
                    sirenOnEmergency 
                      ? 'translate-x-5 bg-[#171B19]' 
                      : 'translate-x-0 bg-[#FAF9F6] border border-[#D8D4CA]'
                  }`}
                />
              </button>
            </div>

            {/* SMS Relay */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                    SMS emergency fallback
                  </div>
                  <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    Auto-forward via cellular tower
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={smsAlerts}
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-11 h-6 flex items-center rounded-[999px] p-0.5 transition-colors border ${
                  smsAlerts 
                    ? 'bg-[#1A1D1B] dark:bg-[#ECEAE4] border-[#1A1D1B] dark:border-[#ECEAE4]' 
                    : 'bg-[#ECE9E2] border-[#D8D4CA]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-150 ${
                    smsAlerts 
                      ? 'translate-x-5 bg-[#171B19]' 
                      : 'translate-x-0 bg-[#FAF9F6] border border-[#D8D4CA]'
                  }`}
                />
              </button>
            </div>

            {/* Offline Maps Cache */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                    Offline topographic pack
                  </div>
                  <div className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    Cached: <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">{cacheSize}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-2.5 py-1 text-xs font-mono border border-[#D8D4CA] dark:border-[#2A302D] rounded-[4px] bg-[#ECE9E2] dark:bg-[#2A302D] hover:bg-[#D8D4CA] dark:hover:bg-[#3A423E] text-[#1A1D1B] dark:text-[#ECEAE4] transition-colors"
              >
                Clear cache
              </button>
            </div>
          </div>
        </section>

        {/* Section: LoRA Mesh Diagnostics */}
        <section className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
            LoRA Mesh Diagnostics
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] divide-y divide-[#D8D4CA] dark:divide-[#2A302D]">
            <div className="p-3 flex items-center justify-between text-xs">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Network identifier</span>
              <span className="font-mono font-medium text-[#1A1D1B] dark:text-[#ECEAE4]">ZD-MESH-IN-912</span>
            </div>

            <div className="p-3 flex items-center justify-between text-xs">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Routing protocol</span>
              <span className="font-mono font-medium text-[#1A1D1B] dark:text-[#ECEAE4]">v2.4.1 Flood-R</span>
            </div>

            <div className="p-3 flex items-center justify-between text-xs">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Active peer nodes</span>
              <span className="font-mono font-medium text-[#1A1D1B] dark:text-[#ECEAE4]">9 nodes in range</span>
            </div>

            <div className="p-3 flex items-center justify-between text-xs">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Beacon status</span>
              <div className="flex items-center gap-1.5 font-mono text-[#2E7D4F] dark:text-[#3FA66A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] dark:bg-[#3FA66A]" />
                <span>Operational (868.10 MHz)</span>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-xs text-[#5C635E] dark:text-[#8A928D]">Beacon calibration</span>
              <button
                type="button"
                onClick={handleRecalibrateMesh}
                disabled={isCalibrating}
                className="px-3 py-1.5 text-xs font-mono border border-[#D8D4CA] dark:border-[#2A302D] rounded-[4px] bg-[#ECE9E2] dark:bg-[#2A302D] hover:bg-[#D8D4CA] dark:hover:bg-[#3A423E] text-[#1A1D1B] dark:text-[#ECEAE4] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isCalibrating ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                <span>{isCalibrating ? 'Calibrating...' : 'Recalibrate node'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section: Session Action */}
        <div className="pt-2 flex flex-col gap-2">
          <button 
            type="button"
            onClick={() => onShowToast ? onShowToast('Session ended. Node unmounted.', 'info') : null}
            className="w-full h-11 rounded-[8px] border border-[#C1271D]/40 text-[#C1271D] dark:text-[#D9382E] hover:bg-[#C1271D]/10 font-medium text-sm flex items-center justify-center gap-2 transition-colors active:opacity-75"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>End operator session</span>
          </button>
        </div>

        {/* Agency Footer */}
        <div className="pt-2 text-center text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] space-y-0.5">
          <p>ZeroDay Civic Engine · v3.4.1 (Build 409)</p>
          <p>Disaster Management Cell, District Administration</p>
        </div>
      </div>
    </div>
  );
}
