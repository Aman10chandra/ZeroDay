import React from 'react';
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
  PinOff,
  LifeBuoy,
  UserCog
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import { useStore, ScreenId } from '../../store/useStore';
import { LogoMark } from '../ui/LogoMark';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
}

export const LeftRail: React.FC = () => {
  const { 
    activeScreen, 
    navigateScreen, 
    isRailPinned,
    toggleRailPinned,
    wards,
    alerts,
    reports,
    rescueRequests,
    currentUser 
  } = useStore();

  const isCriticalIncident = wards.some(w => w.riskLevel === 'critical');
  const pendingRescueCount = rescueRequests.filter(r => r.status === 'pending').length;

  const monitorItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'region_detail', label: 'Regions', icon: MapPin },
    { id: 'sensors_mpu', label: 'Sensors', icon: Activity },
    { id: 'risk_engine', label: 'Risk engine', icon: Cpu },
    { id: 'gateway_mesh', label: 'Gateway', icon: Radio },
    { id: 'evacuation', label: 'Evacuation', icon: Navigation },
  ];

  const operationsItems: NavItem[] = [
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: alerts.filter(a => a.status === 'active').length },
    { id: 'rescue_requests', label: 'Rescue requests', icon: LifeBuoy, badge: pendingRescueCount },
    { id: 'reports', label: 'Reports', icon: MessageSquare, badge: reports.filter(r => r.status === 'pending').length },
    { id: 'super_admin', label: 'Super admin', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeScreen === item.id;
    const isOverview = item.id === 'overview';

    const buttonContent = (
      <button
        key={item.id}
        onClick={() => navigateScreen(item.id)}
        className={clsx(
          "h-9 rounded-control relative transition-colors duration-150 flex items-center group w-full text-left",
          isRailPinned ? "px-3 gap-3" : "justify-center px-0",
          isActive 
            ? "bg-zd-raised text-zd-text" 
            : "text-zd-muted hover:text-zd-text hover:bg-zd-hover"
        )}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Active border bar */}
        {isActive && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-zd-accent rounded-r" />
        )}

        <div className="relative flex items-center justify-center shrink-0">
          <Icon
            className={clsx(
              "w-4 h-4 transition-colors",
              isActive ? "text-zd-accent" : "text-zd-muted group-hover:text-zd-text"
            )}
            strokeWidth={1.5}
          />

          {/* 6px Red Dot Incident Indicator at top-right of Overview icon */}
          {isOverview && isCriticalIncident && (
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-sev-critical ring-2 ring-zd-surface animate-soft-pulse" />
          )}

          {/* Icon-only badge indicator when rail is collapsed */}
          {!isRailPinned && item.badge !== undefined && item.badge > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full font-mono text-[9px] font-semibold bg-sev-critical text-white leading-none">
              {item.badge}
            </span>
          )}
        </div>

        {/* Label when pinned */}
        {isRailPinned && (
          <span className={clsx(
            "font-sans text-[13px] truncate flex-1 leading-none",
            isActive ? "font-medium text-zd-text" : "font-normal text-zd-muted group-hover:text-zd-text"
          )}>
            {item.label}
          </span>
        )}

        {/* Numeric Badge when pinned */}
        {isRailPinned && item.badge !== undefined && item.badge > 0 && (
          <span className={clsx(
            "font-mono text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full font-semibold shrink-0 leading-none",
            item.id === 'alerts' || item.id === 'rescue_requests' ? 'bg-sev-critical text-white' : 'bg-zd-base text-zd-muted border border-zd-border'
          )}>
            {item.badge}
          </span>
        )}
      </button>
    );

    // If rail is NOT pinned, wrap in Radix Tooltip
    if (!isRailPinned) {
      return (
        <Tooltip.Root key={item.id} delayDuration={150}>
          <Tooltip.Trigger asChild>
            {buttonContent}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={8}
              className="z-50 px-2.5 py-1 text-xs font-sans bg-zd-raised text-zd-text rounded-control border border-zd-border shadow-popover select-none animate-in fade-in-0 zoom-in-95"
            >
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-1.5 font-mono text-[10px] text-sev-critical">
                  ({item.badge})
                </span>
              )}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      );
    }

    return buttonContent;
  };

  return (
    <Tooltip.Provider delayDuration={150}>
      <aside 
        id="left-rail"
        style={{ gridArea: 'rail' }}
        className={clsx(
          "h-full bg-zd-surface border-r border-zd-border flex flex-col justify-between py-3 select-none z-20 shrink-0 transition-all duration-200",
          isRailPinned ? "w-[232px]" : "w-[72px]"
        )}
      >
        {/* Top: Logo & Pin Action */}
        <div className={clsx(
          "flex items-center pb-3 border-b border-zd-border",
          isRailPinned ? "px-4 justify-between" : "justify-center"
        )}>
          <button 
            onClick={() => navigateScreen('overview')}
            className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
            title="ZeroDay Console"
          >
            <LogoMark size={24} />
            {isRailPinned && (
              <span className="font-sans font-bold text-sm text-zd-text tracking-tight">
                ZeroDay
              </span>
            )}
          </button>

          {isRailPinned && (
            <button
              onClick={toggleRailPinned}
              className="w-7 h-7 rounded-control flex items-center justify-center text-zd-dim hover:text-zd-text hover:bg-zd-hover transition-colors"
              title="Unpin sidebar"
              aria-label="Unpin sidebar"
            >
              <PinOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2.5 py-3 overflow-y-auto custom-scrollbar">
          {/* MONITOR Category */}
          {isRailPinned && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-zd-dim select-none">
              Monitor
            </div>
          )}
          {monitorItems.map(renderNavButton)}

          {/* Divider & OPERATIONS Category */}
          <div className="my-2 border-t border-zd-border/60" />
          {isRailPinned && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-zd-dim select-none">
              Operations
            </div>
          )}
          {operationsItems.map(renderNavButton)}
        </nav>

        {/* Footer: User profile & Pin toggle button if collapsed */}
        <div className="pt-3 border-t border-zd-border px-2 flex flex-col gap-2">
          {!isRailPinned && (
            <Tooltip.Root delayDuration={150}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={toggleRailPinned}
                  className="w-full h-8 rounded-control flex items-center justify-center text-zd-dim hover:text-zd-text hover:bg-zd-hover transition-colors"
                  aria-label="Pin sidebar"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="z-50 px-2.5 py-1 text-xs font-sans bg-zd-raised text-zd-text rounded-control border border-zd-border shadow-popover select-none"
                >
                  Pin sidebar
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}

          {/* User Button */}
          <button
            onClick={() => navigateScreen('settings')}
            className={clsx(
              "w-full rounded-control hover:bg-zd-hover flex items-center transition-colors text-left",
              isRailPinned ? "px-2 py-2 gap-2.5" : "py-1.5 justify-center"
            )}
            title={`${currentUser.name} (${currentUser.role})`}
            aria-label="User settings"
          >
            <div className="w-8 h-8 rounded-full bg-zd-accent/15 border border-zd-accent/30 flex items-center justify-center text-zd-accent font-sans text-xs font-bold shrink-0">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            {isRailPinned && (
              <div className="flex flex-col truncate min-w-0">
                <span className="text-[13px] font-sans font-medium text-zd-text truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[11px] font-sans text-zd-dim capitalize leading-tight">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </Tooltip.Provider>
  );
};
