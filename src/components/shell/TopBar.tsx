import React from 'react';
import * as Popover from '@radix-ui/react-popover';
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
  UserCheck,
  ShieldAlert,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useOverlay } from '../../store/useOverlay';
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
    navigateScreen,
    selectWard,
    setIsAuthenticated
  } = useStore();

  const { active, openOverlay, closeOverlay } = useOverlay();

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalWards = wards.filter(w => w.riskLevel === 'critical');
  const warningWards = wards.filter(w => w.riskLevel === 'warning');
  const onlineSensors = sensors.filter(s => s.status === 'online').length;

  // Real derived system-health status
  const systemHealth = (() => {
    if (criticalWards.length > 0) {
      return {
        label: `${criticalWards.length} critical incident${criticalWards.length > 1 ? 's' : ''}`,
        dotColor: 'bg-sev-critical',
        isCritical: true,
      };
    }
    if (warningWards.length > 0) {
      return {
        label: `${warningWards.length} warning${warningWards.length > 1 ? 's' : ''}`,
        dotColor: 'bg-sev-warning',
        isCritical: false,
      };
    }
    return {
      label: 'All systems normal',
      dotColor: 'bg-sev-normal',
      isCritical: false,
    };
  })();

  const screenTitles: Record<string, { title: string; subtitle?: string }> = {
    overview: { title: 'Overview', subtitle: 'Catchment monitoring & priority queue' },
    region_detail: { title: 'Region Detail', subtitle: 'Hydrological & telemetry analysis' },
    sensors_mpu: { title: 'Sensor Telemetry', subtitle: 'Tri-axial IMU & geotechnical nodes' },
    risk_engine: { title: 'AI Risk Engine', subtitle: 'Multi-hazard predictive inference pipeline' },
    gateway_mesh: { title: 'Gateway & Mesh', subtitle: 'LoRa base station & BLE packet mesh' },
    evacuation: { title: 'Evacuation Planner', subtitle: 'Topographic ridge escape corridors' },
    alerts: { title: 'Alert Control', subtitle: 'Civilian warning broadcast dissemination' },
    rescue_requests: { title: 'Rescue Requests', subtitle: 'Live citizen distress beacons & SAR deployment' },
    reports: { title: 'Community Reports', subtitle: 'Crowdsourced field observations' },
    super_admin: { title: 'State Area Command', subtitle: 'Sector oversight & officer commissioning' },
    settings: { title: 'Settings & Audit', subtitle: 'DEOC access control & dispatch logs' },
  };

  const currentMeta = screenTitles[activeScreen] || { title: 'Overview' };

  return (
    <header 
      style={{ gridArea: 'top' }}
      className="h-14 w-full bg-zd-surface border-b border-zd-border flex items-center justify-between px-5 text-xs select-none z-30 transition-colors shrink-0"
    >
      {/* Left: Page Title only (with secondary subtitle under if present) */}
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="font-sans font-semibold text-zd-text text-base leading-tight truncate">
          {currentMeta.title}
        </h1>
        {currentMeta.subtitle && (
          <span className="font-sans text-[11px] text-zd-muted leading-tight truncate hidden sm:block">
            {currentMeta.subtitle}
          </span>
        )}
      </div>

      {/* Center: Search Pill (Button, not real input, opens Command Palette) */}
      <div className="flex items-center justify-center flex-1 max-w-sm mx-4">
        <button
          onClick={() => openOverlay('command')}
          className="w-full max-w-[320px] h-9 px-3 rounded-control bg-zd-base border border-zd-border hover:border-zd-border-focus text-zd-muted hover:text-zd-text flex items-center justify-between font-sans text-xs transition-colors group"
          aria-label="Search or jump to (Cmd+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-zd-dim group-hover:text-zd-muted transition-colors" strokeWidth={1.5} />
            <span className="truncate">Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-zd-surface border border-zd-border font-mono text-[10px] text-zd-dim group-hover:text-zd-muted shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Derived Health, Alert Bell, Theme, User Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* 1. Derived System Health Popover */}
        <Popover.Root 
          open={active === 'health'} 
          onOpenChange={(open) => open ? openOverlay('health') : closeOverlay()}
        >
          <Popover.Trigger asChild>
            <button
              className="h-9 px-3 rounded-control hover:bg-zd-hover flex items-center gap-2 font-sans text-xs text-zd-text transition-colors focus:outline-none"
              aria-label="System status"
            >
              <span className={`w-2 h-2 rounded-full ${systemHealth.dotColor} ${systemHealth.isCritical ? 'animate-soft-pulse' : ''}`} />
              <span className="font-medium hidden md:inline">
                {activeScreen === 'overview' && systemHealth.isCritical ? 'System status' : systemHealth.label}
              </span>
              <ChevronDown className="w-3 h-3 text-zd-dim" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="end"
              sideOffset={8}
              className="z-50 w-72 p-3 bg-zd-surface border border-zd-border rounded-panel shadow-popover text-xs font-sans animate-in fade-in-0 zoom-in-95"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zd-border">
                <span className="font-sans font-medium text-zd-text">System infrastructure</span>
                <span className="font-mono text-[10px] text-zd-dim">Telemetry nominal</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-zd-border">
                  <span className="text-zd-muted flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
                    LoRa gateway 868 MHz
                  </span>
                  <span className="font-mono text-sev-normal font-medium">99.4%</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zd-border">
                  <span className="text-zd-muted flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-zd-accent" strokeWidth={1.5} />
                    BLE mesh nodes
                  </span>
                  <span className="font-mono text-zd-text font-medium">12/14 online</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zd-border">
                  <span className="text-zd-muted flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
                    Field sensors
                  </span>
                  <span className="font-mono text-zd-text font-medium">{onlineSensors}/{sensors.length} active</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-zd-muted flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-sev-normal" strokeWidth={1.5} />
                    CatBoost inference
                  </span>
                  <span className="font-mono text-sev-normal font-medium">42 ms</span>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 2. Notifications Popover */}
        <Popover.Root 
          open={active === 'notifications'} 
          onOpenChange={(open) => open ? openOverlay('notifications') : closeOverlay()}
        >
          <Popover.Trigger asChild>
            <button
              className="w-9 h-9 rounded-control hover:bg-zd-hover flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors relative focus:outline-none"
              title="Alert Notifications"
              aria-label="Alert notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {activeAlerts.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sev-critical animate-soft-pulse" />
              )}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="end"
              sideOffset={8}
              className="z-50 w-80 p-3 bg-zd-surface border border-zd-border rounded-panel shadow-popover text-xs font-sans animate-in fade-in-0 zoom-in-95"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zd-border">
                <span className="font-medium text-zd-text">Active broadcasts</span>
                <span className="font-mono text-[10px] text-sev-critical font-medium">
                  {activeAlerts.length} active
                </span>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                {activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      closeOverlay();
                      navigateScreen('alerts');
                    }}
                    className="p-2 rounded-control bg-zd-base hover:bg-zd-hover cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zd-text truncate">{alert.title}</span>
                      <span className="font-mono text-[10px] text-zd-dim shrink-0">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-zd-muted line-clamp-2 leading-relaxed">
                      {alert.body}
                    </p>
                  </div>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 3. Theme Toggle Ghost Button */}
        <button
          onClick={toggleOpsMode}
          className="w-9 h-9 rounded-control hover:bg-zd-hover flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors focus:outline-none"
          title={isOpsMode ? 'Switch to Light Theme' : 'Switch to Ops Dark Mode'}
          aria-label="Toggle theme"
        >
          {isOpsMode ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
        </button>

        {/* 4. User Profile Menu Popover */}
        <Popover.Root 
          open={active === 'user'} 
          onOpenChange={(open) => open ? openOverlay('user') : closeOverlay()}
        >
          <Popover.Trigger asChild>
            <button
              className="h-9 pl-1.5 pr-2.5 rounded-control hover:bg-zd-hover flex items-center gap-2 transition-colors focus:outline-none group"
              aria-label="User account menu"
            >
              <div className="w-7 h-7 rounded-full bg-zd-accent/20 border border-zd-accent/40 flex items-center justify-center text-zd-accent font-sans text-xs font-semibold shrink-0">
                MJ
              </div>
              <span className="font-sans font-medium text-xs text-zd-text hidden lg:inline">
                M. Joshi
              </span>
              <ChevronDown className="w-3 h-3 text-zd-dim group-hover:text-zd-muted transition-colors" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="end"
              sideOffset={8}
              className="z-50 w-64 p-3 bg-zd-surface border border-zd-border rounded-panel shadow-popover text-xs font-sans animate-in fade-in-0 zoom-in-95"
            >
              <div className="pb-2.5 mb-2 border-b border-zd-border">
                <span className="font-semibold text-zd-text block text-sm">{currentUser.name}</span>
                <span className="text-zd-muted text-[11px] block">{currentUser.email}</span>
                <span className="font-mono text-[10px] text-zd-dim block mt-0.5">{currentUser.station}</span>
              </div>

              <div className="space-y-1 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zd-dim block px-2 py-0.5">
                  Role clearance
                </span>
                {[
                  { role: 'district_officer' as UserRole, label: 'District Disaster Officer' },
                  { role: 'sdrf_operator' as UserRole, label: 'SDRF Control Room Operator' },
                  { role: 'super_admin' as UserRole, label: 'Super Admin (Command)' },
                ].map(item => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setRole(item.role);
                      closeOverlay();
                    }}
                    className={`w-full px-2 py-1.5 rounded-control flex items-center justify-between text-left transition-colors ${
                      currentUser.role === item.role ? 'bg-zd-raised text-zd-accent font-medium' : 'hover:bg-zd-hover text-zd-muted'
                    }`}
                  >
                    <span>{item.label}</span>
                    {currentUser.role === item.role && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zd-border">
                <button
                  onClick={() => {
                    closeOverlay();
                    setIsAuthenticated(false);
                  }}
                  className="w-full px-2 py-1.5 rounded-control hover:bg-sev-critical-dim text-sev-critical flex items-center gap-2 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

      </div>
    </header>
  );
};
