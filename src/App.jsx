import React, { useState, useRef } from 'react';
import PhoneMockup from './components/PhoneMockup';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import RegionDetailScreen from './screens/RegionDetailScreen';
import AlertControlScreen from './screens/AlertControlScreen';
import EvacuationRouteScreen from './screens/EvacuationRouteScreen';
import CommunityReportsScreen from './screens/CommunityReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ManualAlertModal from './components/ManualAlertModal';
import AddReportModal from './components/AddReportModal';
import SluiceOverrideModal from './components/SluiceOverrideModal';
import DispatchRouteModal from './components/DispatchRouteModal';
import ResidentAlertBanner from './components/ResidentAlertBanner';

export default function App() {
  // Screen routing
  const [currentScreen, setCurrentScreen] = useState('home');
  const [bottomNavTab, setBottomNavTab] = useState('home');

  // Role: 'admin' | 'resident'
  const [userRole, setUserRole] = useState('admin');

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

  // Siren Audio & Visual alert state
  const [isSirenActive, setIsSirenActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  // Sync bottom nav tab with current screen
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
    else if (tabId === 'sensors') {
      setCurrentScreen('detail');
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
      setBottomNavTab('sensors');
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
    alert(`🚨 EMERGENCY BROADCAST DISPATCHED!\nSeverity: ${data.severity.toUpperCase()}\nMessage: ${data.customMessage}`);
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
    // Play a brief high-alert notification beep
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Resident taps "View Escape Route" on the banner
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
        else if (screenId === 'detail') setBottomNavTab('sensors');
        else if (screenId === 'alerts') setBottomNavTab('alerts');
        else if (screenId === 'map') setBottomNavTab('map');
        else if (screenId === 'reports') setBottomNavTab('');
        else if (screenId === 'settings') setBottomNavTab('settings');
      }}
      isSirenActive={isSirenActive}
      onToggleSiren={toggleSiren}
      userRole={userRole}
      onToggleRole={() => setUserRole(prev => prev === 'admin' ? 'resident' : 'admin')}
      onTriggerDisaster={() => {
        setCurrentScreen('detail');
        setBottomNavTab('sensors');
      }}
    >
      {/* Resident Alert Notification Banner */}
      <ResidentAlertBanner 
        alertData={residentAlert}
        onViewRoute={handleViewResidentRoute}
        onDismiss={() => setResidentAlert(null)}
      />

      {/* Active Screen View */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen 
            onSelectRegionDetail={handleSelectRegion} 
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
          />
        )}

        {currentScreen === 'alerts' && (
          <AlertControlScreen 
            onBack={() => {
              setCurrentScreen('home');
              setBottomNavTab('home');
            }}
            onOpenManualAlert={() => setManualAlertOpen(true)}
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
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen />
        )}
      </div>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav 
        activeTab={bottomNavTab} 
        onTabChange={handleTabChange} 
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
          alert(`Report posted: "${report.body}"`);
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
