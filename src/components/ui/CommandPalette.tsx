import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  Search, 
  MapPin, 
  Activity, 
  Radio, 
  Navigation, 
  ShieldAlert, 
  MessageSquare, 
  Settings, 
  Cpu, 
  Send, 
  Sun, 
  Moon, 
  Sparkles,
  Home,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useStore, ScreenId } from '../../store/useStore';
import { useOverlay } from '../../store/useOverlay';

export const CommandPalette: React.FC = () => {
  const { 
    wards, 
    sensors, 
    shelters, 
    navigateScreen, 
    selectWard, 
    selectSensor,
    toggleOpsMode,
    isOpsMode,
    showToast
  } = useStore();

  const { active, openOverlay, closeOverlay } = useOverlay();
  const [search, setSearch] = useState('');

  // Global keydown listeners: Cmd+K and "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (active === 'command') {
          closeOverlay();
        } else {
          openOverlay('command');
        }
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        openOverlay('command');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, openOverlay, closeOverlay]);

  const handleSelectPage = (screenId: ScreenId) => {
    navigateScreen(screenId);
    closeOverlay();
  };

  const handleSelectWard = (wardId: string) => {
    selectWard(wardId);
    navigateScreen('region_detail');
    closeOverlay();
  };

  const handleSelectSensor = (sensorId: string) => {
    selectSensor(sensorId);
    closeOverlay();
  };

  const handleSelectShelter = () => {
    navigateScreen('evacuation');
    closeOverlay();
  };

  const isOpen = active === 'command';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content 
          aria-describedby={undefined}
          className="fixed top-[18vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] bg-zd-surface border border-zd-border rounded-panel shadow-modal overflow-hidden p-0 animate-in fade-in-0 zoom-in-95"
        >
          <Dialog.Title className="sr-only">Command Menu</Dialog.Title>
          <Command 
            className="w-full font-sans text-zd-text" 
            loop 
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }}
          >
            {/* Search Input bar */}
            <div className="flex items-center px-4 border-b border-zd-border">
              <Search className="w-4 h-4 text-zd-dim mr-3 shrink-0" strokeWidth={1.5} />
              <Command.Input 
                value={search}
                onValueChange={setSearch}
                placeholder="Search or jump to..." 
                className="w-full h-12 bg-transparent text-sm text-zd-text placeholder:text-zd-dim focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-zd-base border border-zd-border font-mono text-[10px] text-zd-dim">
                Esc
              </kbd>
            </div>

            {/* List */}
            <Command.List className="max-h-[380px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar text-xs">
              <Command.Empty className="py-8 text-center text-xs text-zd-muted font-sans">
                No results found for "{search}". Try searching for "Rampur" or "Alerts".
              </Command.Empty>

              {/* Suggested Actions (shown when search is empty or matches) */}
              <Command.Group heading="Suggested actions" className="text-zd-muted font-sans text-[12px] px-2 py-1 font-medium">
                <Command.Item
                  value="Compose emergency alert"
                  onSelect={() => handleSelectPage('alerts')}
                  className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-zd-accent" strokeWidth={1.5} />
                    <span className="text-[14px]">Compose emergency alert</span>
                  </div>
                  <span className="font-mono text-[11px] text-zd-dim">Alerts</span>
                </Command.Item>

                <Command.Item
                  value="Run AI risk assessment"
                  onSelect={() => handleSelectPage('risk_engine')}
                  className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-zd-accent" strokeWidth={1.5} />
                    <span className="text-[14px]">Run AI risk assessment</span>
                  </div>
                  <span className="font-mono text-[11px] text-zd-dim">CatBoost</span>
                </Command.Item>

                <Command.Item
                  value="Test mesh broadcast"
                  onSelect={() => handleSelectPage('gateway_mesh')}
                  className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-zd-accent" strokeWidth={1.5} />
                    <span className="text-[14px]">Test mesh broadcast</span>
                  </div>
                  <span className="font-mono text-[11px] text-zd-dim">Gateway</span>
                </Command.Item>

                <Command.Item
                  value="Toggle theme dark light"
                  onSelect={() => {
                    toggleOpsMode();
                    closeOverlay();
                  }}
                  className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isOpsMode ? <Sun className="w-4 h-4 text-zd-accent" /> : <Moon className="w-4 h-4 text-zd-accent" />}
                    <span className="text-[14px]">Toggle theme</span>
                  </div>
                  <span className="font-mono text-[11px] text-zd-dim">{isOpsMode ? 'Dark' : 'Light'}</span>
                </Command.Item>
              </Command.Group>

              {/* Regions / Wards */}
              <Command.Group heading="Regions & catchments" className="text-zd-muted font-sans text-[12px] px-2 py-1 font-medium">
                {wards.map(ward => {
                  const isCritical = ward.riskLevel === 'critical';
                  const isWarning = ward.riskLevel === 'warning';
                  const dotColor = isCritical ? 'bg-sev-critical' : isWarning ? 'bg-sev-warning' : 'bg-sev-normal';

                  return (
                    <Command.Item
                      key={ward.id}
                      value={`${ward.name} ${ward.code} ${ward.basin}`}
                      onSelect={() => handleSelectWard(ward.id)}
                      className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MapPin className="w-4 h-4 text-zd-dim shrink-0" strokeWidth={1.5} />
                        <span className="text-[14px] truncate">{ward.name}</span>
                        <span className="font-mono text-[11px] text-zd-dim">{ward.code}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="text-[12px] text-zd-muted capitalize">{ward.riskLevel}</span>
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>

              {/* Sensors */}
              <Command.Group heading="Sensor nodes" className="text-zd-muted font-sans text-[12px] px-2 py-1 font-medium">
                {sensors.map(sensor => (
                  <Command.Item
                    key={sensor.id}
                    value={`${sensor.code} ${sensor.locationName || sensor.name} ${sensor.type}`}
                    onSelect={() => handleSelectSensor(sensor.id)}
                    className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Activity className="w-4 h-4 text-zd-dim shrink-0" strokeWidth={1.5} />
                      <span className="font-mono text-[14px]">{sensor.code}</span>
                      <span className="text-[12px] text-zd-muted truncate">({sensor.locationName || sensor.name})</span>
                    </div>
                    <span className="font-mono text-[11px] text-zd-muted font-medium">{sensor.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Shelters */}
              <Command.Group heading="Sanctuary havens" className="text-zd-muted font-sans text-[12px] px-2 py-1 font-medium">
                {shelters.map(shelter => (
                  <Command.Item
                    key={shelter.id}
                    value={`${shelter.name} ${shelter.code} ${shelter.wardName}`}
                    onSelect={handleSelectShelter}
                    className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Home className="w-4 h-4 text-sev-normal shrink-0" strokeWidth={1.5} />
                      <span className="text-[14px] truncate">{shelter.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-zd-dim">{shelter.elevationM}m ASL</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Pages */}
              <Command.Group heading="Navigation pages" className="text-zd-muted font-sans text-[12px] px-2 py-1 font-medium">
                {[
                  { id: 'overview' as ScreenId, label: 'Overview' },
                  { id: 'rescue_requests' as ScreenId, label: 'Rescue Map & Citizen Distress' },
                  { id: 'super_admin' as ScreenId, label: 'Super Admin: State Area Command' },
                  { id: 'region_detail' as ScreenId, label: 'Region Detail' },
                  { id: 'sensors_mpu' as ScreenId, label: 'Sensor Telemetry' },
                  { id: 'risk_engine' as ScreenId, label: 'AI Risk Engine' },
                  { id: 'gateway_mesh' as ScreenId, label: 'Gateway & Mesh' },
                  { id: 'evacuation' as ScreenId, label: 'Evacuation Planner' },
                  { id: 'alerts' as ScreenId, label: 'Alert Control' },
                  { id: 'reports' as ScreenId, label: 'Community Reports' },
                  { id: 'settings' as ScreenId, label: 'Settings & Audit' },
                ].map(page => (
                  <Command.Item
                    key={page.id}
                    value={page.label}
                    onSelect={() => handleSelectPage(page.id)}
                    className="h-10 px-3 rounded-control flex items-center justify-between text-zd-text hover:bg-zd-raised cursor-pointer transition-colors"
                  >
                    <span className="text-[14px]">{page.label}</span>
                    <span className="text-[11px] font-mono text-zd-dim">Jump</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>

            {/* Single clean 12px hint line */}
            <div className="px-4 py-2.5 border-t border-zd-border flex items-center justify-between text-[12px] text-zd-dim font-sans bg-zd-surface">
              <span>Use arrow keys to navigate, Esc to close</span>
              <span>Press Enter to select</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
