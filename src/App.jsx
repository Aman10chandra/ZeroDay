import React, { useState, useRef } from 'react';
import PhoneMockup from './components/PhoneMockup';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import RegionDetailScreen from './screens/RegionDetailScreen';
import AlertControlScreen from './screens/AlertControlScreen';
import EvacuationRouteScreen from './screens/EvacuationRouteScreen';
import CommunityReportsScreen from './screens/CommunityReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MPU6050TelemetryScreen from './screens/MPU6050TelemetryScreen';
import AIRiskEngineScreen from './screens/AIRiskEngineScreen';
import HardwareGatewayScreen from './screens/HardwareGatewayScreen';
import ToolsScreen from './screens/ToolsScreen';
import ManualAlertModal from './components/ManualAlertModal';
import AddReportModal from './components/AddReportModal';
import SluiceOverrideModal from './components/SluiceOverrideModal';
import DispatchRouteModal from './components/DispatchRouteModal';
import ResidentAlertBanner from './components/ResidentAlertBanner';
import Toast from './components/Toast';

export default function App() {
  // Screen routing
  const [currentScreen, setCurrentScreen] = useState('home');
  const [bottomNavTab, setBottomNavTab] = useState('home');

  // Origin tracker for engineering sub-screens (returns to Tools when opened from Tools)
  const [engineeringOrigin, setEngineeringOrigin] = useState('home');

  // Role: 'admin' | 'resident'
  const [userRole, setUserRole] = useState('admin');

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals state
  const [manualAlertOpen, setManualAlertOpen] = useState(false);
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [sluiceOverrideOpen, setSluiceOverrideOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Disaster & Shelter state
  const [isAddingShelterMode, setIsAddingShelterMode] = useState(false);
  const [selectedShelterForDispatch, setSelectedShelterForDispatch] = useState(null);
  const [totalSheltersForDispatch, setTotalSheltersForDispatch] = useState(3);
  const [dispatchedRouteData, setDispatchedRouteData] = useState(null);
  const [residentAlert, setResidentAlert] = useState(null);

  // Ops Mode theme (auto by prefers-color-scheme, plus manual toggle)
  const [isOpsMode, setIsOpsMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync dark class on document element
  React.useEffect(() => {
    if (isOpsMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isOpsMode]);

  const toggleOpsMode = () => setIsOpsMode(prev => !prev);

  // Siren Audio & Visual alert state
  const [isSirenActive, setIsSirenActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  // Sync bottom nav tab with current screen (Overview, Map, Alerts, Reports)
  const handleTabChange = (tabId) => {
    setBottomNavTab(tabId);
    if (tabId === 'home') {
      setCurrentScreen('home');
      setIsAddingShelterMode(false);
    }
    else if (tabId === 'map') {
      setCurrentScreen('map');
    }
    else if (tabId === 'alerts') {
      setCurrentScreen('alerts');
      setIsAddingShelterMode(false);
    }
    else if (tabId === 'reports') {
      setCurrentScreen('reports');
      setIsAddingShelterMode(false);
    }
    else if (tabId === 'tools') {
      setCurrentScreen('tools');
      setIsAddingShelterMode(false);
    }
    else if (tabId === 'settings') {
      setCurrentScreen('settings');
      setIsAddingShelterMode(false);
    }
  };

  // Direct screen selection (e.g. tapping Rampur Ward from Home)
  const handleSelectRegion = (regionId) => {
    if (regionId === 'rampur' || regionId === 'Rampur Ward') {
      setCurrentScreen('detail');
      setBottomNavTab('');
    } else {
      setCurrentScreen('detail');
    }
  };

  // Sound generator for emergency siren using Web Audio API
  const toggleSiren = () => {
    if (isSirenActive) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

      const now = ctx.currentTime;
      for (let i = 0; i < 20; i++) {
        osc.frequency.setValueAtTime(650, now + i * 0.5);
        osc.frequency.setValueAtTime(950, now + i * 0.5 + 0.25);
      }

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;

      setIsSirenActive(true);
      setTimeout(() => {
        stopSiren();
      }, 6000);
    } catch (e) {
      console.warn("Audio Context error:", e);
      setIsSirenActive(true);
      setTimeout(() => setIsSirenActive(false), 4000);
    }
  };

  const stopSiren = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {}
    setIsSirenActive(false);
  };

  const handleConfirmManualAlert = (data) => {
    startSiren();
    showToast(`Disaster broadcast transmitted via SMS, Push & BLE Mesh (${data.severity.toUpperCase()})`, 'warning');
  };

  // Open "Add Shelter Points" directly from Rampur Ward card
  const handleOpenAddShelter = () => {
    setIsAddingShelterMode(true);
    setCurrentScreen('map');
    setBottomNavTab('map');
  };

  // Open Evacuation Map from Ward
  const handleOpenEvacuationMap = () => {
    setIsAddingShelterMode(false);
    setCurrentScreen('map');
    setBottomNavTab('map');
  };

  // Open Dispatch Modal from Map screen
  const handleOpenDispatchModal = (shelter, totalCount) => {
    setSelectedShelterForDispatch(shelter);
    setTotalSheltersForDispatch(totalCount);
    setDispatchModalOpen(true);
  };

  // Admin broadcasts escape route to residents
  const handleConfirmDispatch = (dispatchData) => {
    setDispatchedRouteData(dispatchData);
    setResidentAlert(dispatchData);
    showToast(`Evacuation corridor to ${dispatchData.shelter?.name || "Govt. School"} transmitted to 1,240 nodes`, 'success');
    
    // Play a crisp high-priority alert chime
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, ctx.currentTime);
      osc.frequency.setValueAtTime(1040, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Resident taps "Open Evacuation Path" on the banner
  const handleViewResidentRoute = () => {
    setCurrentScreen('map');
    setBottomNavTab('map');
    setUserRole('resident');
  };

  return (
    <PhoneMockup 
      activeScreen={currentScreen} 
      onNavigateScreen={(screenId) => {
        setCurrentScreen(screenId);
        if (screenId === 'home') setBottomNavTab('home');
        else if (screenId === 'detail') setBottomNavTab('');
        else if (screenId === 'alerts') setBottomNavTab('alerts');
        else if (screenId === 'map') setBottomNavTab('map');
        else if (screenId === 'reports') setBottomNavTab('reports');
        else if (screenId === 'tools') setBottomNavTab('tools');
        else if (screenId === 'settings') setBottomNavTab('');
        else if (screenId === 'mpu6050') setBottomNavTab('tools');
        else if (screenId === 'ai-engine') setBottomNavTab('tools');
        else if (screenId === 'gateway') setBottomNavTab('tools');
      }}
      isSirenActive={isSirenActive}
      onToggleSiren={toggleSiren}
      userRole={userRole}
      onToggleRole={() => setUserRole(prev => prev === 'admin' ? 'resident' : 'admin')}
      onTriggerDisaster={() => {
        setCurrentScreen('detail');
        setBottomNavTab('');
      }}
      isOpsMode={isOpsMode}
      onToggleOpsMode={toggleOpsMode}
    >
      {/* Resident Alert Notification Banner */}
      <ResidentAlertBanner 
        alertData={residentAlert}
        onViewRoute={handleViewResidentRoute}
        onDismiss={() => setResidentAlert(null)}
      />

      {/* Toast Notification */}
      <Toast 
        message={toast?.message} 
        type={toast?.type} 
        onDismiss={() => setToast(null)} 
      />

      {/* Active Screen View */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen 
            onSelectRegionDetail={handleSelectRegion}
            onNavigateMPU6050={() => {
              setEngineeringOrigin('home');
              setCurrentScreen('mpu6050');
            }}
            onNavigateAIRiskEngine={() => {
              setEngineeringOrigin('home');
              setCurrentScreen('ai-engine');
            }}
            onNavigateGateway={() => {
              setEngineeringOrigin('home');
              setCurrentScreen('gateway');
            }}
            onOpenSettings={() => setCurrentScreen('settings')}
            userRole={userRole}
          />
        )}

        {currentScreen === 'detail' && (
          <RegionDetailScreen 
            onBack={() => {
              setCurrentScreen('home');
              setBottomNavTab('home');
            }}
            onOpenSluiceOverride={() => setSluiceOverrideOpen(true)}
            onIssueSiren={toggleSiren}
            onOpenAddShelter={handleOpenAddShelter}
            onOpenEvacuationMap={handleOpenEvacuationMap}
            onShowToast={showToast}
            onOpenMPU6050={() => {
              setEngineeringOrigin('detail');
              setCurrentScreen('mpu6050');
            }}
            onOpenAIRiskEngine={() => {
              setEngineeringOrigin('detail');
              setCurrentScreen('ai-engine');
            }}
          />
        )}

        {currentScreen === 'alerts' && (
          <AlertControlScreen 
            onBack={() => {
              setCurrentScreen('home');
              setBottomNavTab('home');
            }}
            onOpenManualAlert={() => setManualAlertOpen(true)}
            onOpenGateway={() => {
              setEngineeringOrigin('alerts');
              setCurrentScreen('gateway');
            }}
          />
        )}

        {currentScreen === 'map' && (
          <EvacuationRouteScreen 
            onBack={() => {
              setCurrentScreen('home');
              setBottomNavTab('home');
              setIsAddingShelterMode(false);
            }}
            userRole={userRole}
            onToggleRole={() => setUserRole(prev => prev === 'admin' ? 'resident' : 'admin')}
            isAddingShelterInitially={isAddingShelterMode}
            onOpenDispatchModal={handleOpenDispatchModal}
            dispatchedRouteData={dispatchedRouteData}
          />
        )}

        {currentScreen === 'reports' && (
          <CommunityReportsScreen 
            onOpenAddReport={() => setAddReportOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'tools' && (
          <ToolsScreen 
            onNavigateMPU6050={() => {
              setEngineeringOrigin('tools');
              setCurrentScreen('mpu6050');
            }}
            onNavigateAIRiskEngine={() => {
              setEngineeringOrigin('tools');
              setCurrentScreen('ai-engine');
            }}
            onNavigateGateway={() => {
              setEngineeringOrigin('tools');
              setCurrentScreen('gateway');
            }}
            userRole={userRole}
          />
        )}

        {currentScreen === 'mpu6050' && (
          <MPU6050TelemetryScreen 
            onBack={() => {
              if (engineeringOrigin === 'tools') {
                setCurrentScreen('tools');
              } else {
                setCurrentScreen('detail');
                setBottomNavTab('');
              }
            }}
            onShowToast={showToast}
            onTriggerDisaster={() => {
              setCurrentScreen('detail');
              setBottomNavTab('');
            }}
          />
        )}

        {currentScreen === 'ai-engine' && (
          <AIRiskEngineScreen 
            onBack={() => {
              if (engineeringOrigin === 'tools') {
                setCurrentScreen('tools');
              } else if (engineeringOrigin === 'detail') {
                setCurrentScreen('detail');
                setBottomNavTab('');
              } else {
                setCurrentScreen('home');
                setBottomNavTab('home');
              }
            }}
            onShowToast={showToast}
            onNavigateEvacuation={() => {
              setCurrentScreen('map');
              setBottomNavTab('map');
            }}
          />
        )}

        {currentScreen === 'gateway' && (
          <HardwareGatewayScreen 
            onBack={() => {
              if (engineeringOrigin === 'tools') {
                setCurrentScreen('tools');
              } else if (engineeringOrigin === 'alerts') {
                setCurrentScreen('alerts');
                setBottomNavTab('alerts');
              } else {
                setCurrentScreen('home');
                setBottomNavTab('home');
              }
            }}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen 
            onShowToast={showToast}
            isOpsMode={isOpsMode}
            onToggleOpsMode={toggleOpsMode}
            userRole={userRole}
            onToggleRole={() => setUserRole(prev => prev === 'admin' ? 'resident' : 'admin')}
          />
        )}
      </div>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav 
        activeTab={['tools', 'mpu6050', 'ai-engine', 'gateway'].includes(currentScreen) ? 'tools' : bottomNavTab} 
        onTabChange={handleTabChange} 
        toolsSeverity="critical"
      />

      {/* Modals */}
      <ManualAlertModal 
        isOpen={manualAlertOpen}
        onClose={() => setManualAlertOpen(false)}
        onConfirm={handleConfirmManualAlert}
      />

      <AddReportModal 
        isOpen={addReportOpen}
        onClose={() => setAddReportOpen(false)}
        onAdd={(report) => {
          showToast(`Advisory posted for telemetry verification: "${report.body.slice(0, 45)}..."`, "success");
        }}
      />

      <SluiceOverrideModal 
        isOpen={sluiceOverrideOpen}
        onClose={() => setSluiceOverrideOpen(false)}
      />

      {/* Admin Dispatch Route Modal */}
      <DispatchRouteModal 
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onConfirmDispatch={handleConfirmDispatch}
        selectedShelter={selectedShelterForDispatch}
        totalShelters={totalSheltersForDispatch}
        wardName="Rampur Ward"
      />
    </PhoneMockup>
  );
}
