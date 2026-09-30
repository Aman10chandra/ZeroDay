import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Activity, 
  Cpu, 
  Radio, 
  Navigation, 
  ShieldAlert, 
  MessageSquare, 
  Settings, 
  Pin,
  PinOff
} from 'lucide-react';
import clsx from 'clsx';
import { useStore, ScreenId } from '../../store/useStore';
import { LogoMark } from '../ui/LogoMark';

export const LeftRail: React.FC = () => {
  const { 
    activeScreen, 
    navigateScreen, 
    wards,
    alerts,
    reports,
    currentUser 
  } = useStore();

  const [isPinned, setIsPinned] = useState(false);
  const isCriticalIncident = wards.some(w => w.riskLevel === 'critical');

  const navItems = [
    { id: 'overview' as ScreenId, label: 'Overview', icon: LayoutDashboard },
    { id: 'region_detail' as ScreenId, label: 'Regions', icon: MapPin },
    { id: 'sensors_mpu' as ScreenId, label: 'Sensors 3D', icon: Activity },
    { id: 'risk_engine' as ScreenId, label: 'Risk engine', icon: Cpu },
    { id: 'gateway_mesh' as ScreenId, label: 'Gateway', icon: Radio },
    { id: 'evacuation' as ScreenId, label: 'Evacuation', icon: Navigation },
    { id: 'alerts' as ScreenId, label: 'Alerts', icon: ShieldAlert, badge: alerts.filter(a => a.status === 'active').length },
    { id: 'reports' as ScreenId, label: 'Reports', icon: MessageSquare, badge: reports.filter(r => r.status === 'pending').length },
    { id: 'settings' as ScreenId, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        "h-full bg-zd-surface border-r border-zd-border flex flex-col justify-between py-3 transition-all duration-200 select-none z-20 shrink-0",
        isPinned ? "w-48 px-2" : "w-16 items-center"
      )}
    >
      {/* Top: Logo Mark + Pin Toggle */}
      <div className={clsx("flex items-center gap-2 px-2 pb-3 mb-2 border-b border-zd-border w-full", isPinned ? "justify-between" : "justify-center")}>
        <div 
          onClick={() => navigateScreen('overview')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <LogoMark size={24} />
          {isPinned && (
            <span className="font-sans font-bold text-sm text-zd-text tracking-tight">
              ZeroDay
            </span>
          )}
        </div>
        
        {isPinned && (
          <button
            onClick={() => setIsPinned(false)}
            className="text-zd-dim hover:text-zd-muted p-1 rounded"
            title="Collapse rail"
          >
            <PinOff className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav Icons */}
      <nav className="flex-1 flex flex-col gap-1 w-full">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          const isOverview = item.id === 'overview';

          return (
            <button
              key={item.id}
              onClick={() => navigateScreen(item.id)}
              className={clsx(
                "h-10 flex items-center rounded-control relative transition-colors duration-150 group",
                isPinned ? "px-3 gap-3 justify-start" : "justify-center px-0 w-full",
                isActive 
                  ? "text-zd-text bg-zd-raised" 
                  : "text-zd-muted hover:text-zd-text hover:bg-zd-hover"
              )}
              title={!isPinned ? item.label : undefined}
            >
              {/* Active 2px Teal Indicator Bar on Left */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-zd-accent rounded-r" />
              )}

              {/* Icon Container */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={clsx(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-zd-accent" : "text-zd-muted group-hover:text-zd-text"
                  )}
                  strokeWidth={1.5}
                />

                {/* Red dot on Overview when Critical Incident active */}
                {isOverview && isCriticalIncident && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sev-critical ring-2 ring-zd-surface animate-soft-pulse" />
                )}
              </div>

              {/* Pinned Label */}
              {isPinned && (
                <span className="font-sans text-xs font-medium truncate flex-1 text-left">
                  {item.label}
                </span>
              )}

              {/* Counter Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={clsx(
                  "font-mono text-[10px] px-1.5 py-0.2 rounded-full font-semibold",
                  item.id === 'alerts' ? 'bg-sev-critical text-white' : 'bg-zd-base text-zd-muted border border-zd-border',
                  !isPinned && "absolute top-1.5 right-1.5 text-[9px] px-1"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Pin / Avatar */}
      <div className={clsx("flex flex-col gap-2 pt-2 border-t border-zd-border w-full", isPinned ? "px-2" : "items-center")}>
        {!isPinned && (
          <button
            onClick={() => setIsPinned(true)}
            className="text-zd-dim hover:text-zd-muted p-1.5 rounded transition-colors"
            title="Pin navigation rail open"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateScreen('settings')}>
          <div className="w-8 h-8 rounded-full bg-zd-raised border border-zd-border flex items-center justify-center text-zd-text font-mono text-xs font-bold shrink-0">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          {isPinned && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-zd-text truncate">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-zd-dim capitalize">{currentUser.role.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
