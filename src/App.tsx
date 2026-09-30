import React, { useEffect } from 'react';
import { useStore, ScreenId } from './store/useStore';
import { useOverlay } from './store/useOverlay';
import { TopBar } from './components/shell/TopBar';
import { LeftRail } from './components/shell/LeftRail';
import { IncidentStrip } from './components/shell/IncidentStrip';
import { CommandPalette } from './components/ui/CommandPalette';
import { ToastContainer } from './components/ui/Toast';

// Screens
import { LoginScreen } from './features/auth/LoginScreen';
import { OverviewScreen } from './features/overview/OverviewScreen';
import { RegionDetailScreen } from './features/region/RegionDetailScreen';
import { MPU6050TelemetryScreen } from './features/sensors/MPU6050TelemetryScreen';
import { AIRiskEngineScreen } from './features/risk-engine/AIRiskEngineScreen';
import { GatewayMeshScreen } from './features/gateway/GatewayMeshScreen';
import { EvacuationPlannerScreen } from './features/evacuation/EvacuationPlannerScreen';
import { AlertControlScreen } from './features/alerts/AlertControlScreen';
import { CommunityReportsScreen } from './features/reports/CommunityReportsScreen';
import { AuditSettingsScreen } from './features/settings/AuditSettingsScreen';
import { RescueRequestsScreen } from './features/rescue/RescueRequestsScreen';
import { SuperAdminScreen } from './features/admin/SuperAdminScreen';

export default function App() {
  const { 
    activeScreen, 
    isOpsMode, 
    isAuthenticated,
    toasts,
    dismissToast,
    refreshStorageData,
    navigateScreen,
    setIsAuthenticated,
    isRailPinned,
    wards
  } = useStore();

  // Initialize IndexedDB storage, sync dark mode class, and read URL query parameters
  useEffect(() => {
    refreshStorageData();
    if (isOpsMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') as ScreenId | null;
    if (screenParam) {
      navigateScreen(screenParam);
    }
    const authParam = params.get('auth');
    if (authParam === 'false') {
      setIsAuthenticated(false);
    }
  }, [isOpsMode, refreshStorageData, navigateScreen, setIsAuthenticated]);

  // If not authenticated, render LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const isCriticalIncident = wards.some(w => w.riskLevel === 'critical');
  const railWidth = isRailPinned ? '232px' : '72px';
  const stripRowHeight = isCriticalIncident ? '36px' : '0px';

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'overview':
        return <OverviewScreen />;
      case 'region_detail':
        return <RegionDetailScreen />;
      case 'sensors_mpu':
        return <MPU6050TelemetryScreen />;
      case 'risk_engine':
        return <AIRiskEngineScreen />;
      case 'gateway_mesh':
        return <GatewayMeshScreen />;
      case 'evacuation':
        return <EvacuationPlannerScreen />;
      case 'alerts':
        return <AlertControlScreen />;
      case 'reports':
        return <CommunityReportsScreen />;
      case 'rescue_requests':
        return <RescueRequestsScreen />;
      case 'super_admin':
        return <SuperAdminScreen />;
      case 'settings':
        return <AuditSettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  const isMapScreen = ['overview', 'evacuation', 'rescue_requests'].includes(activeScreen);

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: `${railWidth} 1fr`,
        gridTemplateRows: `56px ${stripRowHeight} 1fr`,
        gridTemplateAreas: `
          "rail top"
          "rail strip"
          "rail main"
        `,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
      className="bg-zd-base text-zd-text font-sans transition-colors duration-150"
    >
      {/* 1. Left Rail (Grid Area: rail, Full Viewport Height) */}
      <LeftRail />

      {/* 2. Top Bar (Grid Area: top, 56px Height Right of Rail) */}
      <TopBar />

      {/* 3. In-flow Incident Strip (Grid Area: strip, 36px or 0px, Never an Overlay) */}
      <IncidentStrip />

      {/* 4. Main Workspace (Grid Area: main, In-flow, No Fixed Children) */}
      <main 
        style={{ gridArea: 'main' }}
        className={`min-h-0 w-full h-full bg-zd-base relative ${
          isMapScreen ? 'overflow-hidden' : 'overflow-auto custom-scrollbar'
        }`}
      >
        {renderActiveScreen()}
      </main>

      {/* 5. Global Command Palette (Modal Dialog) */}
      <CommandPalette />

      {/* 6. Global Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
