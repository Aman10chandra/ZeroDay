import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { 
  MapPin, 
  Activity, 
  ShieldAlert, 
  Home, 
  Volume2, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  FileDown, 
  UserCheck,
  Radio,
  FileText
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const CommandPalette: React.FC = () => {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    wards, 
    sensors, 
    shelters, 
    selectWard, 
    selectSensor, 
    navigateScreen, 
    toggleSiren, 
    toggleOpsMode, 
    isOpsMode, 
    setRole 
  } = useStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-zd-surface border border-zd-border rounded-panel shadow-2xl overflow-hidden text-zd-text">
        <Command label="Global Command Palette" className="w-full">
          <div className="flex items-center px-4 border-b border-zd-border bg-zd-surface">
            <span className="text-[10px] font-mono text-zd-dim uppercase mr-2.5">⌘K</span>
            <Command.Input
              autoFocus
              placeholder="Search regions, sensors, shelters, or commands..."
              className="w-full h-11 bg-transparent text-xs font-sans text-zd-text placeholder:text-zd-muted focus:outline-none"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 custom-scrollbar text-xs">
            <Command.Empty className="py-6 text-center text-xs font-mono text-zd-muted">
              No matching records or commands.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="QUICK OPERATIONAL ACTIONS" className="text-[11px] font-mono text-zd-muted uppercase tracking-[0.06em] px-2.5 py-1.5 font-medium">
              <Command.Item
                onSelect={() => {
                  navigateScreen('alerts');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-sev-critical" />
                <span>Broadcast Emergency Alert (Multi-channel)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  toggleSiren();
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-sev-warning" />
                <span>Toggle SDRF Emergency Siren Test</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  navigateScreen('gateway_mesh');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-zd-accent" />
                <span>Test Offline BLE Mesh Packet Broadcast</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  toggleOpsMode();
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
              >
                {isOpsMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>Toggle Console Theme ({isOpsMode ? 'Switch to Light' : 'Switch to Dark Ops'})</span>
              </Command.Item>
            </Command.Group>

            {/* Regions / Wards */}
            <Command.Group heading="REGIONS & BASINS" className="text-[11px] font-mono text-zd-muted uppercase tracking-[0.06em] px-2.5 py-1.5 font-medium mt-2">
              {wards.map((ward) => (
                <Command.Item
                  key={ward.id}
                  onSelect={() => {
                    selectWard(ward.id);
                    navigateScreen('region_detail');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zd-muted" />
                    <span>{ward.name}</span>
                    <span className="font-mono text-[11px] text-zd-muted">({ward.code})</span>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-zd-muted">
                    {ward.riskLevel} · {ward.riskScore}%
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Sensor Nodes */}
            <Command.Group heading="FIELD SENSORS (MPU6050 / WEIR)" className="text-[11px] font-mono text-zd-muted uppercase tracking-[0.06em] px-2.5 py-1.5 font-medium mt-2">
              {sensors.map((sensor) => (
                <Command.Item
                  key={sensor.id}
                  onSelect={() => {
                    selectSensor(sensor.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-zd-accent" />
                    <span className="font-mono">{sensor.code}</span>
                    <span className="text-zd-muted truncate max-w-xs">{sensor.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-zd-muted">{sensor.status}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Shelters */}
            <Command.Group heading="SHELTERS & HAVENS" className="text-[11px] font-mono text-zd-muted uppercase tracking-[0.06em] px-2.5 py-1.5 font-medium mt-2">
              {shelters.map((shelter) => (
                <Command.Item
                  key={shelter.id}
                  onSelect={() => {
                    navigateScreen('evacuation');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between px-2.5 py-2 rounded-control text-xs text-zd-text hover:bg-zd-hover cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-sev-normal" />
                    <span>{shelter.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-zd-muted">
                    Cap: {shelter.capacity} · +{shelter.elevationM}m MSL
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Switch Role */}
            <Command.Group heading="ROLE AUTHORIZATION" className="text-[11px] font-mono text-zd-muted uppercase tracking-[0.06em] px-2.5 py-1.5 font-medium mt-2">
              <Command.Item
                onSelect={() => {
                  setRole('super_admin');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs hover:bg-zd-hover cursor-pointer font-mono"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Super Admin (Full override & broadcast clearance)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setRole('district_officer');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs hover:bg-zd-hover cursor-pointer font-mono"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>District Disaster Officer</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setRole('viewer');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs hover:bg-zd-hover cursor-pointer font-mono"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Read-only Control Room Viewer</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2.5 border-t border-zd-border bg-zd-surface flex items-center justify-between text-[11px] font-mono text-zd-muted">
            <div className="flex items-center gap-2">
              <span>Use <kbd className="px-1 py-0.5 bg-zd-base border border-zd-border rounded text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-zd-base border border-zd-border rounded text-[10px]">↓</kbd> to navigate</span>
              <span><kbd className="px-1 py-0.5 bg-zd-base border border-zd-border rounded text-[10px]">↵</kbd> to select</span>
            </div>
            <span><kbd className="px-1 py-0.5 bg-zd-base border border-zd-border rounded text-[10px]">ESC</kbd> to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
