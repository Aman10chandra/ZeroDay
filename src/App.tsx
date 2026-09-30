import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { TopBar } from './components/shell/TopBar';
import { LeftRail } from './components/shell/LeftRail';
import { IncidentStrip } from './components/shell/IncidentStrip';
import { RightContextDrawer } from './components/shell/RightContextDrawer';
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

export default function App() {
  const { 
    activeScreen, 
    isOpsMode, 
    isAuthenticated,
    toasts,
    dismissToast,
    refreshStorageData,
    navigateScreen,
    setIsAuthenticated
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
    const screenParam = params.get('screen') as any;
    if (screenParam) {
      navigateScreen(screenParam);
    }
    const authParam = params.get('auth');
    if (authParam === 'false') {
      setIsAuthenticated(false);
    }
  }, [isOpsMode, refreshStorageData, navigateScreen, setIsAuthenticated]);

  // If not authenticated, render LoginScreen (Screen 0)
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

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
      case 'settings':
        return <AuditSettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-zd-base text-zd-text font-sans transition-colors duration-150">
      {/* 1. Global Shell: Top Bar with Telemetry Status, Clock, Search, Siren, Theme, User */}
      <TopBar />

      {/* 2. Persistent Incident Strip when any region is Critical (36px under top bar) */}
      <IncidentStrip />

      {/* 3. Main Workspace: Left Rail + Active Screen + Right Context Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftRail />
        <main className="flex-1 flex flex-col overflow-hidden bg-zd-base relative">
          {renderActiveScreen()}
        </main>
        <RightContextDrawer />
      </div>

      {/* 4. Global Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* 5. Global Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
