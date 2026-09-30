import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Radio, 
  Wifi, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../../types';

export const TopBar: React.FC = () => {
  const { 
    activeScreen, 
    wards, 
    sensors, 
    alerts, 
    isOpsMode, 
    toggleOpsMode, 
    currentUser, 
    setRole, 
    setCommandPaletteOpen,
    navigateScreen,
    selectWard
  } = useStore();

  const [healthPopoverOpen, setHealthPopoverOpen] = useState(false);
  const [alertPopoverOpen, setAlertPopoverOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const onlineSensors = sensors.filter(s => s.status === 'online').length;

  const screenTitles: Record<string, { title: string; parent?: string }> = {
    overview: { title: 'Overview' },
    region_detail: { title: 'Region Detail', parent: 'Regions' },
    sensors_mpu: { title: 'Sensor Telemetry', parent: 'Sensors' },
    risk_engine: { title: 'AI Risk Engine' },
    gateway_mesh: { title: 'Gateway & Mesh' },
    evacuation: { title: 'Evacuation Planner' },
    alerts: { title: 'Alert Control' },
    reports: { title: 'Community Reports' },
    settings: { title: 'Settings & Audit' },
  };

  const currentMeta = screenTitles[activeScreen] || { title: 'Overview' };

  return (
    <header className="h-[52px] w-full bg-zd-surface border-b border-zd-border flex items-center justify-between px-4 text-xs shrink-0 select-none z-30 transition-colors">
      {/* Left: Breadcrumb / Page Title */}
      <div className="flex items-center gap-2">
        {currentMeta.parent ? (
          <>
            <span className="text-zd-muted font-sans text-xs">{currentMeta.parent}</span>
            <span className="text-zd-dim text-[11px]">/</span>
            <span className="font-sans font-semibold text-zd-text text-sm">{currentMeta.title}</span>
          </>
        ) : (
          <span className="font-sans font-semibold text-zd-text text-sm">{currentMeta.title}</span>
        )}
      </div>

      {/* Center: Command Search Pill */}
      <div className="flex items-center justify-center flex-1 max-w-md mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full max-w-xs h-8 px-3 rounded-[6px] bg-zd-base border border-zd-border hover:border-zd-border-focus text-zd-muted hover:text-zd-text flex items-center justify-between font-sans text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zd-dim" strokeWidth={1.5} />
            <span>Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.2 rounded bg-zd-surface border border-zd-border font-mono text-[10px] text-zd-dim">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Consolidated System Health, Alert Bell, Theme, Avatar */}
      <div className="flex items-center gap-3">
        {/* Single Grouped System Health Control */}
        <div className="relative">
          <button
            onClick={() => setHealthPopoverOpen(!healthPopoverOpen)}
            className="h-8 px-2.5 rounded-[6px] border border-zd-border bg-zd-base hover:bg-zd-hover flex items-center gap-2 font-sans text-xs text-zd-text transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-sev-normal" />
            <span>All systems normal</span>
            <ChevronDown className="w-3 h-3 text-zd-muted" />
          </button>

          {healthPopoverOpen && (
            <div className="absolute right-0 mt-1 w-64 p-3 bg-zd-surface border border-zd-border rounded-panel shadow-popover z-50 text-xs font-sans">
              <span className="text-micro text-zd-muted font-semibold block mb-2">
                System Infrastructure Status
              </span>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between py-1 border-b border-zd-border">
                  <span className="text-zd-muted flex items-center gap-1.5 font-sans">
                    <Radio className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
                    LoRA Gateway
                  </span>
                  <span className="text-sev-normal font-semibold">868 MHz (99.4%)</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zd-border">
                  <span className="text-zd-muted flex items-center gap-1.5 font-sans">
                    <Wifi className="w-3.5 h-3.5 text-zd-accent" strokeWidth={1.5} />
                    BLE Mesh Nodes
                  </span>
                  <span className="text-zd-text font-semibold">9/12 Online</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zd-border">
                  <span className="text-zd-muted flex items-center gap-1.5 font-sans">
                    <Activity className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
                    Field Sensors
                  </span>
                  <span className="text-zd-text font-semibold">{onlineSensors}/{sensors.length} Active</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-zd-muted flex items-center gap-1.5 font-sans">
                    <Cpu className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
                    CatBoost + LSTM
                  </span>
                  <span className="text-sev-normal font-semibold">Nominal (42ms)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alert Bell with Count */}
        <div className="relative">
          <button
            onClick={() => setAlertPopoverOpen(!alertPopoverOpen)}
            className={`h-8 px-2.5 rounded-[6px] border flex items-center gap-1.5 text-xs font-mono transition-colors ${
              criticalCount > 0 
                ? 'bg-sev-critical-dim border-sev-critical/50 text-sev-critical'
                : 'bg-zd-base border-zd-border text-zd-muted hover:text-zd-text'
            }`}
          >
            <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="font-semibold">{activeAlerts.length}</span>
          </button>

          {alertPopoverOpen && (
            <div className="absolute right-0 mt-1 w-72 p-2 bg-zd-surface border border-zd-border rounded-panel shadow-popover z-50 text-xs">
              <div className="px-2 py-1 border-b border-zd-border flex items-center justify-between font-sans">
                <span className="font-semibold text-zd-text">Active Alerts ({activeAlerts.length})</span>
                <button
                  onClick={() => {
                    navigateScreen('alerts');
                    setAlertPopoverOpen(false);
                  }}
                  className="text-zd-accent hover:underline text-[11px]"
                >
                  Manage
                </button>
              </div>
              <div className="divide-y divide-zd-border max-h-56 overflow-y-auto custom-scrollbar mt-1">
                {activeAlerts.map(alt => (
                  <div
                    key={alt.id}
                    onClick={() => {
                      selectWard(alt.regionId);
                      navigateScreen('region_detail');
                      setAlertPopoverOpen(false);
                    }}
                    className="p-2 hover:bg-zd-hover cursor-pointer rounded transition-colors"
                  >
                    <p className="font-sans font-semibold text-zd-text truncate">{alt.title}</p>
                    <p className="font-mono text-[10px] text-zd-muted mt-0.5">{alt.regionName} · {alt.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleOpsMode}
          className="h-8 w-8 rounded-[6px] border border-zd-border bg-zd-base hover:bg-zd-hover text-zd-muted hover:text-zd-text flex items-center justify-center transition-colors"
          title={isOpsMode ? "Switch to warm light theme" : "Switch to dark theme"}
        >
          {isOpsMode ? <Sun className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />}
        </button>

        {/* Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-8 px-2 rounded-[6px] border border-zd-border bg-zd-base hover:bg-zd-hover flex items-center gap-2 text-xs font-sans text-zd-text transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-zd-accent/20 text-zd-accent font-mono text-[10px] font-bold flex items-center justify-center">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-medium hidden md:inline">{currentUser.name}</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 p-2 bg-zd-surface border border-zd-border rounded-panel shadow-popover z-50 text-xs">
              <div className="p-2 border-b border-zd-border mb-1">
                <p className="font-semibold text-zd-text">{currentUser.name}</p>
                <p className="text-[11px] text-zd-muted font-mono">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <div className="space-y-0.5">
                {(['super_admin', 'district_officer', 'ward_rep', 'viewer'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setRole(role);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-xs capitalize ${
                      currentUser.role === role ? 'bg-zd-accent-dim text-zd-accent font-semibold' : 'text-zd-muted hover:text-zd-text hover:bg-zd-hover'
                    }`}
                  >
                    <span>{role.replace('_', ' ')}</span>
                    {currentUser.role === role && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
