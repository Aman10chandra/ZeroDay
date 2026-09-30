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
  Settings
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

  const isCriticalIncident = wards.some(w => w.riskLevel === 'critical');

  const mainNav = [
    { id: 'overview' as ScreenId, label: 'Overview', icon: LayoutDashboard },
    { id: 'region_detail' as ScreenId, label: 'Regions', icon: MapPin },
    { id: 'sensors_mpu' as ScreenId, label: 'Sensors', icon: Activity },
    { id: 'risk_engine' as ScreenId, label: 'Risk engine', icon: Cpu },
    { id: 'gateway_mesh' as ScreenId, label: 'Gateway', icon: Radio },
    { id: 'evacuation' as ScreenId, label: 'Evacuation', icon: Navigation },
  ];

  const bottomNav = [
    { id: 'alerts' as ScreenId, label: 'Alerts', icon: ShieldAlert, badge: alerts.filter(a => a.status === 'active').length },
    { id: 'reports' as ScreenId, label: 'Reports', icon: MessageSquare, badge: reports.filter(r => r.status === 'pending').length },
    { id: 'settings' as ScreenId, label: 'Settings', icon: Settings },
  ];

  const renderItem = (item: typeof mainNav[0] & { badge?: number }) => {
    const Icon = item.icon;
    const isActive = activeScreen === item.id;
    const isOverview = item.id === 'overview';

    return (
      <button
        key={item.id}
        onClick={() => navigateScreen(item.id)}
        className={clsx(
          "h-9 flex items-center gap-2.5 px-3 rounded-control relative transition-all duration-150 group w-full text-left",
          isActive 
            ? "bg-zd-raised text-zd-text" 
            : "text-zd-muted hover:text-zd-text hover:bg-zd-hover"
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-zd-accent rounded-r" />
        )}

        <div className="relative flex items-center justify-center shrink-0">
          <Icon
            className={clsx(
              "w-[18px] h-[18px] transition-colors",
              isActive ? "text-zd-accent" : "text-zd-dim group-hover:text-zd-muted"
            )}
            strokeWidth={1.5}
          />

          {/* Critical dot on Overview */}
          {isOverview && isCriticalIncident && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sev-critical ring-2 ring-zd-surface animate-soft-pulse" />
          )}
        </div>

        <span className={clsx(
          "font-sans text-[13px] truncate flex-1",
          isActive ? "font-medium" : "font-normal"
        )}>
          {item.label}
        </span>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <span className={clsx(
            "font-mono text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold shrink-0",
            item.id === 'alerts' ? 'bg-sev-critical text-white' : 'bg-zd-base text-zd-muted border border-zd-border'
          )}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="h-full w-[200px] bg-zd-surface border-r border-zd-border flex flex-col py-3 select-none z-20 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pb-4 mb-1 border-b border-zd-border">
        <div 
          onClick={() => navigateScreen('overview')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <LogoMark size={22} />
          <span className="font-sans font-bold text-sm text-zd-text tracking-tight">
            ZeroDay
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-2">
        <span className="px-3 mb-1.5 text-[10px] font-sans font-medium uppercase tracking-widest text-zd-dim">
          Monitor
        </span>
        {mainNav.map(renderItem)}

        <span className="px-3 mt-4 mb-1.5 text-[10px] font-sans font-medium uppercase tracking-widest text-zd-dim">
          Operations
        </span>
        {bottomNav.map(renderItem)}
      </nav>

      {/* User */}
      <div className="px-3 pt-3 border-t border-zd-border">
        <div 
          className="flex items-center gap-2.5 px-2 py-2 rounded-control hover:bg-zd-hover cursor-pointer transition-colors" 
          onClick={() => navigateScreen('settings')}
        >
          <div className="w-8 h-8 rounded-full bg-zd-accent/15 border border-zd-accent/30 flex items-center justify-center text-zd-accent font-mono text-xs font-bold shrink-0">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex flex-col truncate min-w-0">
            <span className="text-[13px] font-sans font-medium text-zd-text truncate">{currentUser.name}</span>
            <span className="text-[10px] font-sans text-zd-dim capitalize">{currentUser.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
