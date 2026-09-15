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

export default function App() {
  // Screen routing
  const [currentScreen, setCurrentScreen] = useState('home');
  const [bottomNavTab, setBottomNavTab] = useState('home');

  // Modals state
  const [manualAlertOpen, setManualAlertOpen] = useState(false);
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [sluiceOverrideOpen, setSluiceOverrideOpen] = useState(false);

  // Siren Audio & Visual alert state
  const [isSirenActive, setIsSirenActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  // Sync bottom nav tab with current screen
  const handleTabChange = (tabId) => {
    setBottomNavTab(tabId);
    if (tabId === 'home') setCurrentScreen('home');
    else if (tabId === 'map') setCurrentScreen('map');
    else if (tabId === 'alerts') setCurrentScreen('alerts');
    else if (tabId === 'sensors') setCurrentScreen('detail');
    else if (tabId === 'settings') setCurrentScreen('settings');
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
    >
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
            }}
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
    </PhoneMockup>
  );
}
