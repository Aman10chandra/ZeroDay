import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Sensor3DCanvas, SensorCategory } from './Sensor3DCanvas';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { realtimeService } from '../../services/realtime';
import { MPU6050Kinematics } from '../../types';
import { 
  ArrowLeft, 
  RotateCcw, 
  Zap, 
  Info, 
  Activity, 
  Waves, 
  Droplets, 
  CloudRain, 
  Cpu, 
  Radio, 
  Wifi, 
  Battery, 
  Thermometer,
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

export const MPU6050TelemetryScreen: React.FC = () => {
  const { 
    selectedSensorId, 
    sensors, 
    wards, 
    navigateScreen, 
    createAlert,
    showToast,
    addAuditLog 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<SensorCategory>('mpu6050');
  const [deviceDetailsOpen, setDeviceDetailsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // MPU-6050 Kinematics State
  const [kinematics, setKinematics] = useState<MPU6050Kinematics>(realtimeService.getLatestKinematics());
  const [sparkHistory, setSparkHistory] = useState<{
    primary: number[];
    secondary: number[];
    tertiary: number[];
  }>({
    primary: [0.1, 0.12, 0.08, 0.15, 0.11, 0.09, 0.14, 0.1],
    secondary: [0.05, 0.04, 0.06, 0.08, 0.05, 0.07, 0.05, 0.06],
    tertiary: [0.02, 0.01, 0.03, 0.02, 0.04, 0.01, 0.02, 0.03],
  });

  // Environmental Dynamic Telemetry States
  const [ultrasonicLevel, setUltrasonicLevel] = useState<number>(3.2); // m
  const [soilSaturation, setSoilSaturation] = useState<number>(76); // %
  const [rainRate, setRainRate] = useState<number>(42.4); // mm/h
  const [decisionScore, setDecisionScore] = useState<number>(89); // 0-100

  const activeWard = wards[0] || {
    id: 'ward-rampur-4b',
    name: 'Rampur Basin 4B',
    code: 'WR-04B',
  };

  // Telemetry stream listener
  useEffect(() => {
    const unsub = realtimeService.on('mpu_telemetry', (data: MPU6050Kinematics) => {
      setKinematics(data);
      if (activeCategory === 'mpu6050') {
        setSparkHistory(prev => ({
          primary: [...prev.primary.slice(1), data.gyro.x],
          secondary: [...prev.secondary.slice(1), data.gyro.y],
          tertiary: [...prev.tertiary.slice(1), data.gyro.z],
        }));
      }
    });

    const unsubTick = realtimeService.on('env_telemetry_tick', () => {
      if (!isSimulating) {
        setUltrasonicLevel(prev => parseFloat((prev + (Math.random() - 0.49) * 0.04).toFixed(2)));
        setSoilSaturation(prev => Math.min(99, Math.max(50, Math.round(prev + (Math.random() - 0.48) * 1.2))));
        setRainRate(prev => parseFloat(Math.max(10, prev + (Math.random() - 0.5) * 1.5).toFixed(1)));
      }
    });

    return () => {
      unsub();
      unsubTick();
    };
  }, [activeCategory, isSimulating]);

  // Simulation handler for the active sensor
  const handleTriggerSimulation = () => {
    setIsSimulating(true);

    if (activeCategory === 'mpu6050') {
      realtimeService.triggerTremorSimulation(6000);
      showToast({
        type: 'warning',
        title: 'Seismic Wave Pulse Injected',
        message: 'Synthesizing shear wave excitation (decaying 6s pulse). Displacement velocity escalating.',
      });
      addAuditLog('SIMULATE_TREMOR', 'SN-014', 'Triggered 6s synthetic seismic pulse');
    } else if (activeCategory === 'ultrasonic_gauge') {
      setUltrasonicLevel(4.8);
      createAlert({
        title: 'River Breach Override: Khoh Flume',
        titleHi: 'खोह नदी जलस्तर आपातकालीन चेतावनी',
        body: 'JSN-SR04T ultrasonic gauge recorded river level 4.8 m (breaching danger datum 3.2 m by +1.6 m). Rule-based flood override engaged.',
        bodyHi: 'जलस्तर खतरे के निशान 3.2 मीटर से 1.6 मीटर ऊपर पहुंच गया है।',
        severity: 'critical',
        regionId: activeWard.id,
        channels: ['push', 'sms', 'ble_mesh'],
        directiveType: 'EVACUATION',
      });
      showToast({
        type: 'critical',
        title: 'Rule-Based Flood Breach Override',
        message: 'JSN-SR04T sensor detected +1.6 m datum breach along Khoh Flume.',
      });
    } else if (activeCategory === 'soil_moisture') {
      setSoilSaturation(94);
      showToast({
        type: 'warning',
        title: 'Subsurface Pore Pressure Exceeded',
        message: 'Capacitive probe recorded 94% saturation (threshold: 80%). LSTM live trigger armed.',
      });
      addAuditLog('SOIL_SATURATION_SPIKE', 'SN-018', 'Subsurface pore saturation reached 94%');
    } else if (activeCategory === 'rain_gauge') {
      setRainRate(88.5);
      showToast({
        type: 'warning',
        title: 'Downpour Precursor Triggered',
        message: 'Tipping bucket clocked 88.5 mm/h. CatBoost 7-day antecedent rainfall index elevated.',
      });
      addAuditLog('RAINFALL_BURST', 'SN-035', 'Rainfall intensity spike at 88.5 mm/h');
    } else if (activeCategory === 'decision_engine') {
      setDecisionScore(96);
      createAlert({
        title: 'AI Decision Engine: RED DIRECTIVE',
        titleHi: 'एआई निर्णय इंजन: रेड डायरेक्टिव',
        body: 'CatBoost (40%) and LSTM (60%) consensus reached score 96/100. Mandatory evacuation active.',
        bodyHi: 'कैटबूस्ट और एलएसटीएम मॉडल आम सहमति स्कोर 96/100 पर पहुंच गया।',
        severity: 'critical',
        regionId: activeWard.id,
        channels: ['push', 'sms', 'ble_mesh'],
        directiveType: 'EVACUATION',
      });
      showToast({
        type: 'critical',
        title: 'Multi-Model Consensus: RED DIRECTIVE',
        message: 'Blended CatBoost (40%) & LSTM (60%) generated Red Directive for Kotdwar.',
      });
    }

    setTimeout(() => {
      setIsSimulating(false);
      setUltrasonicLevel(3.2);
      setSoilSaturation(76);
      setRainRate(42.4);
      setDecisionScore(89);
    }, 6000);
  };

  const handleReset = () => {
    realtimeService.resetCalibration();
    setIsSimulating(false);
    setUltrasonicLevel(3.2);
    setSoilSaturation(76);
    setRainRate(42.4);
    setDecisionScore(89);
    showToast({
      type: 'info',
      title: 'Sensor Baselines Reset',
      message: 'Restored static nominal calibration matrix and telemetry thresholds',
    });
    addAuditLog('CALIBRATION_RESET', activeCategory, 'Zeroed kinematics & telemetry offsets');
  };

  // Miniature sparkline helper
  const renderSparkline = (values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values, min + 0.1);
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 48;
      const y = 14 - ((v - min) / (max - min)) * 12;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-12 h-3.5 inline-block ml-2 opacity-70" viewBox="0 0 48 14">
        <polyline fill="none" stroke="currentColor" strokeWidth="1" points={points} />
      </svg>
    );
  };

  // Pipeline documentation mapping
  const pipelineSpecs = {
    mpu6050: {
      title: 'MPU6050 6-Axis IMU (ESP32-S3 Node)',
      subtitle: 'Inclinometer & Seismic Shear Accelerometer',
      roleFormula: 'MPU6050 IMU → LSTM live trigger (vibration & displacement rate in mm/s)',
      modelNote: '50Hz high-frequency raw I2C sampling with Kalman filtering for creep detection.',
      hardware: {
        chip: 'TDK InvenSense MPU-6050 + ESP32-S3',
        bus: 'I2C 0x68 (400 kHz Fast-Mode)',
        link: 'LoRa 868.10 MHz (SF7/125kHz) + BLE Mesh',
        power: '3.7V 3200mAh LiFePO4 + 2W Solar Harvester',
        firmware: 'ZD-ESP32-v3.8.4',
        location: 'Kotdwar Ridge Slope A (Node 22)',
      },
    },
    ultrasonic_gauge: {
      title: 'JSN-SR04T Industrial Ultrasonic Gauge',
      subtitle: 'Waterproof Hydrology Crest Transducer',
      roleFormula: 'JSN-SR04T ultrasonic gauge → rule-based flood breach override when river level crosses danger datum',
      modelNote: 'Direct deterministic override bypassing ML latency when surge breaches safety threshold.',
      hardware: {
        chip: 'JSN-SR04T Integrated Transceiver Probe',
        bus: 'UART / GPIO Echo Burst (40 kHz Sonar)',
        link: 'LoRaWAN Class A Node 15',
        power: '12V Solar Backed Float Battery',
        firmware: 'ZD-WEIR-v2.1.0',
        location: 'Rampur Khoh Weir #3 Flume',
      },
    },
    soil_moisture: {
      title: 'Capacitive Subsurface Soil Moisture Probe',
      subtitle: 'Multi-Depth Soil Saturation & Pore Pressure Array',
      roleFormula: 'Capacitive soil moisture probe → LSTM live trigger (saturation above 80%)',
      modelNote: 'Subsurface moisture weakens slope shear resistance and triggers liquefaction.',
      hardware: {
        chip: 'Corrosion-Resistant Chirp I2C Capacitive Sensor',
        bus: 'I2C 0x20 Multi-Drop Bus',
        link: 'LoRa Mesh Hop 2',
        power: '3.6V Primary Lithium Thionyl Cell',
        firmware: 'ZD-SOIL-v1.4.2',
        location: 'Basin Escarpment Subsurface 40cm',
      },
    },
    rain_gauge: {
      title: 'Meteorological Rain Gauge & Copernicus 30m DEM',
      subtitle: 'Tipping Bucket & Digital Elevation Topographic Station',
      roleFormula: 'Rain gauge and Copernicus 30 m DEM → CatBoost seasonal susceptibility (3, 7 and 14-day rolling rainfall, slope, aspect)',
      modelNote: 'Antecedent precipitation saturation matrix fed into GBDT for seasonal slope fragility.',
      hardware: {
        chip: 'Optical Tipping Bucket 0.2mm Reed Sensor',
        bus: 'Pulse Accumulator Counter Interrupt',
        link: 'High-Gain Cellular LTE-M / LoRa Gateway Hub',
        power: 'Mains Float 12V 7Ah with PV Solar Array',
        firmware: 'ZD-METEO-v2.2.0',
        location: 'Kotdwar Tehsil Building Rooftop Station',
      },
    },
    decision_engine: {
      title: 'Alert Decision Engine & Consensus Gateway',
      subtitle: 'CatBoost (40%) + LSTM (60%) Hybrid Fusion Hub',
      roleFormula: 'Alert decision engine → blends CatBoost (40%) and LSTM (60%) into Safe, Advisory, Warning or Red directive',
      modelNote: 'Dual-neural ensemble combining long-term seasonal susceptibility with millisecond telemetry triggers.',
      hardware: {
        chip: 'NVIDIA Jetson Orin Nano Edge Gateway Hub',
        bus: 'PCIe 4.0 / Modbus RS485 Industrial Bus',
        link: 'Dual LoRa Concentrator (SX1302) + Starlink Satellite Failover',
        power: '24V Industrial UPS + Generator Auto-Start',
        firmware: 'ZD-FUSION-v5.2.0',
        location: 'Pauri Garhwal Central Operations Hub',
      },
    },
  };

  const currentSpec = pipelineSpecs[activeCategory];

  return (
    <div className={`relative w-full h-full flex flex-col p-6 overflow-hidden bg-zd-base text-zd-text select-none ${isSimulating ? 'ring-2 ring-sev-warning/60 ring-inset' : ''}`}>
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="flex flex-col gap-3 pb-4 border-b border-zd-border shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigateScreen('overview')}
              className="flex items-center gap-1.5 text-xs text-zd-muted hover:text-zd-accent mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-sans font-semibold text-lg text-zd-text">
                {currentSpec.title}
              </h1>
              <span className="font-mono text-xs text-zd-dim">
                ({currentSpec.subtitle})
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 font-sans text-xs text-zd-muted hover:text-zd-text"
              title="Reset calibration baselines"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset baseline</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleTriggerSimulation}
              className={`gap-1.5 font-sans text-xs ${isSimulating ? 'text-sev-warning font-semibold animate-pulse' : 'text-zd-muted hover:text-zd-text'}`}
              title="Test telemetry trigger"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Simulating trigger...' : 'Simulate trigger'}</span>
            </Button>

            <button
              onClick={() => setDeviceDetailsOpen(true)}
              className="h-8 px-3 rounded-[6px] border border-zd-border bg-zd-surface hover:bg-zd-raised flex items-center gap-1.5 font-sans text-xs text-zd-muted hover:text-zd-text transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-zd-accent" />
              <span>Device specs</span>
            </button>
          </div>
        </div>

        {/* 2. SENSOR MODALITY SELECTOR TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-zd-surface/80 rounded-panel border border-zd-border custom-scrollbar">
          {[
            { id: 'mpu6050' as const, label: 'MPU6050 6-Axis IMU', icon: Activity, tag: 'LSTM 50Hz' },
            { id: 'ultrasonic_gauge' as const, label: 'JSN-SR04T Ultrasonic', icon: Waves, tag: 'Datum Override' },
            { id: 'soil_moisture' as const, label: 'Capacitive Soil Probe', icon: Droplets, tag: 'Subsurface 80%' },
            { id: 'rain_gauge' as const, label: 'Rain Gauge & DEM', icon: CloudRain, tag: 'CatBoost 3/7/14D' },
            { id: 'decision_engine' as const, label: 'Alert Decision Engine', icon: Cpu, tag: 'Ensemble 40/60' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-control text-xs font-sans whitespace-nowrap transition-all",
                  isActive
                    ? "bg-zd-raised text-zd-text font-semibold shadow-xs border border-zd-border"
                    : "text-zd-muted hover:text-zd-text hover:bg-zd-hover"
                )}
              >
                <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-zd-accent" : "text-zd-dim")} />
                <span>{tab.label}</span>
                <span className={clsx(
                  "text-[9px] font-mono px-1.5 py-0.2 rounded",
                  isActive ? "bg-zd-accent/15 text-zd-accent font-bold" : "bg-zd-base text-zd-dim"
                )}>
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. AI PIPELINE FORMULA BANNER (As specified in System Architecture) */}
        <div className="p-2.5 bg-zd-surface/90 border border-zd-border rounded-panel flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-zd-accent shrink-0 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-zd-text truncate">
              {currentSpec.roleFormula}
            </span>
          </div>
          <span className="text-[11px] font-sans text-zd-dim hidden lg:inline-block ml-4 shrink-0">
            {currentSpec.modelNote}
          </span>
        </div>
      </div>

      {/* 4. LARGE 3D STAGE WITH FLOATING TELEMETRY GAUGES */}
      <div className="relative flex-1 w-full my-4 rounded-panel overflow-hidden bg-gradient-to-b from-[#0E151C] to-[#080D12] border border-zd-border">
        {/* Real 3D Three.js Interactive Canvas */}
        <div className="absolute inset-0">
          <Sensor3DCanvas
            sensorType={activeCategory}
            rotation={kinematics.rotation}
            filterAxis="ALL"
            isVibrating={isSimulating}
            metricValue={
              activeCategory === 'ultrasonic_gauge' ? ultrasonicLevel :
              activeCategory === 'soil_moisture' ? soilSaturation :
              activeCategory === 'rain_gauge' ? rainRate :
              decisionScore
            }
          />
        </div>

        {/* Floating Top-Left Status Pill */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className={clsx(
            "px-3 py-1 rounded-full text-xs font-sans font-medium flex items-center gap-2 backdrop-blur-md border",
            isSimulating
              ? "bg-sev-warning/20 border-sev-warning/40 text-sev-warning"
              : "bg-zd-surface/85 border-zd-border text-zd-text"
          )}>
            <span className={clsx(
              "w-2 h-2 rounded-full",
              isSimulating ? "bg-sev-warning animate-ping" : "bg-sev-normal"
            )} />
            <span>
              {isSimulating ? 'Threshold surge simulated' : 'Online · Continuous stream'}
            </span>
          </div>
        </div>

        {/* Dynamic Telemetry Readout: Top Right */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none text-right font-mono text-xs space-y-1.5 bg-zd-surface/80 p-2.5 rounded-panel border border-zd-border/60 backdrop-blur">
          {activeCategory === 'mpu6050' && (
            <>
              <span className="font-sans text-[11px] text-zd-dim block">Gyroscope (°/s)</span>
              <div className="text-zd-muted">
                <span className="text-zd-dim">X: </span>
                <span className="text-zd-text">{kinematics.gyro?.x?.toFixed(2) ?? '0.12'}</span>
                {renderSparkline(sparkHistory.primary)}
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Y: </span>
                <span className="text-zd-text">{kinematics.gyro?.y?.toFixed(2) ?? '-0.08'}</span>
                {renderSparkline(sparkHistory.secondary)}
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Z: </span>
                <span className="text-zd-text">{kinematics.gyro?.z?.toFixed(2) ?? '0.02'}</span>
                {renderSparkline(sparkHistory.tertiary)}
              </div>
            </>
          )}

          {activeCategory === 'ultrasonic_gauge' && (
            <>
              <span className="font-sans text-[11px] text-zd-dim block">River Hydrology Flume</span>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Level: </span>
                <span className={clsx("font-bold", ultrasonicLevel > 4.0 ? "text-sev-critical" : "text-zd-text")}>
                  {ultrasonicLevel.toFixed(2)} m
                </span>
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Datum Mark: </span>
                <span className="text-zd-text">3.20 m</span>
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Breach: </span>
                <span className={clsx("font-bold", ultrasonicLevel > 3.2 ? "text-sev-critical" : "text-sev-normal")}>
                  {ultrasonicLevel > 3.2 ? `+${(ultrasonicLevel - 3.2).toFixed(2)} m (OVERRIDE)` : 'Nominal clearance'}
                </span>
              </div>
            </>
          )}

          {activeCategory === 'soil_moisture' && (
            <>
              <span className="font-sans text-[11px] text-zd-dim block">Pore Saturation Matrix</span>
              <div className="text-zd-muted">
                <span className="text-zd-dim">40cm Saturation: </span>
                <span className={clsx("font-bold", soilSaturation > 80 ? "text-sev-critical" : "text-zd-text")}>
                  {soilSaturation}%
                </span>
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Trigger Level: </span>
                <span className="text-zd-accent">&gt; 80% Live Trigger</span>
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Pore Pressure: </span>
                <span className="text-zd-text">{(soilSaturation * 0.48).toFixed(1)} kPa</span>
              </div>
            </>
          )}

          {activeCategory === 'rain_gauge' && (
            <>
              <span className="font-sans text-[11px] text-zd-dim block">Copernicus & Rain Gauge</span>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Rainfall Rate: </span>
                <span className="text-zd-text font-bold">{rainRate.toFixed(1)} mm/h</span>
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">7-Day Rolling: </span>
                <span className="text-amber-400 font-bold">310 mm</span>
              </div>
              <div className="text-zd-muted">
                <span className="text-zd-dim">Slope / Aspect: </span>
                <span className="text-zd-text">34.2° / SE Facing</span>
              </div>
            </>
          )}

          {activeCategory === 'decision_engine' && (
            <>
              <span className="font-sans text-[11px] text-zd-dim block">Neural Ensemble Weights</span>
              <div className="text-amber-400">
                <span>CatBoost Seasonal (40%): </span>
                <span className="font-bold">85 / 100</span>
              </div>
              <div className="text-cyan-400">
                <span>LSTM Real-Time (60%): </span>
                <span className="font-bold">92 / 100</span>
              </div>
              <div className="text-sev-critical">
                <span>Blended Directive: </span>
                <span className="font-bold">RED EVACUATION</span>
              </div>
            </>
          )}
        </div>

        {/* Floating Bottom-Left Indicator */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none font-mono text-xs space-y-1 bg-zd-surface/80 p-2.5 rounded-panel border border-zd-border/60 backdrop-blur">
          <span className="font-sans text-[11px] text-zd-dim block">Node Telemetry Ping</span>
          <div className="text-zd-muted flex items-center gap-2">
            <Radio className="w-3 h-3 text-zd-accent" />
            <span>LoRa 868.1 MHz · SNR +9.2 dB · RSSI -72 dBm</span>
          </div>
          <div className="text-zd-muted flex items-center gap-2">
            <Battery className="w-3 h-3 text-sev-normal" />
            <span>Battery 94% · Solar Charging 2.1W</span>
          </div>
        </div>

        {/* Floating Bottom-Right Environmental Temp */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-right font-mono text-xs bg-zd-surface/80 p-2.5 rounded-panel border border-zd-border/60 backdrop-blur">
          <span className="font-sans text-[11px] text-zd-dim block mb-0.5">Core Enclosure Temp</span>
          <div className="flex items-center justify-end gap-1.5 text-zd-text">
            <Thermometer className="w-3.5 h-3.5 text-zd-muted" />
            <span className="text-sm font-semibold">{(kinematics.tempC ?? 18.84).toFixed(2)} °C</span>
          </div>
        </div>
      </div>

      {/* 5. THRESHOLD GAUGE BAR BELOW STAGE */}
      <div className="bg-zd-surface border border-zd-border rounded-panel p-4 shrink-0">
        <div className="flex items-baseline justify-between mb-2 font-mono">
          <div>
            <span className="font-sans text-xs text-zd-muted mr-3">
              {activeCategory === 'mpu6050' && 'Calculated Displacement Velocity (LSTM Input)'}
              {activeCategory === 'ultrasonic_gauge' && 'River Flume Clearance to Danger Datum (Rule Override)'}
              {activeCategory === 'soil_moisture' && 'Subsurface Pore Saturation Ratio (Liquefaction Trigger)'}
              {activeCategory === 'rain_gauge' && 'CatBoost 7-Day Antecedent Rainfall Susceptibility'}
              {activeCategory === 'decision_engine' && 'Ensemble Consensus Score (CatBoost 40% + LSTM 60%)'}
            </span>
            <span className="text-2xl font-light text-zd-text">
              {activeCategory === 'mpu6050' && `${kinematics.displacementRateMmPerSec.toFixed(2)} mm/s`}
              {activeCategory === 'ultrasonic_gauge' && `${ultrasonicLevel.toFixed(2)} m`}
              {activeCategory === 'soil_moisture' && `${soilSaturation}%`}
              {activeCategory === 'rain_gauge' && `${rainRate.toFixed(1)} mm/h`}
              {activeCategory === 'decision_engine' && `${decisionScore} / 100`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zd-dim font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sev-normal" /> Normal Baseline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sev-warning" /> Warning Threshold
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sev-critical" /> Critical Trigger
            </span>
          </div>
        </div>

        {/* Dynamic Zone Bar */}
        <div className="relative h-2.5 w-full bg-zd-base border border-zd-border rounded-full overflow-hidden flex mt-2">
          <div className="h-full bg-sev-normal/40 w-[45%]" />
          <div className="h-full bg-sev-warning/45 w-[30%]" />
          <div className="h-full bg-sev-critical/50 w-[25%]" />

          {/* Dynamic Marker Position */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-zd-text shadow-md transition-all duration-200 rounded-full"
            style={{
              left: `${Math.min(99, Math.max(1, 
                activeCategory === 'mpu6050' ? (kinematics.displacementRateMmPerSec / 3.5) * 100 :
                activeCategory === 'ultrasonic_gauge' ? (ultrasonicLevel / 5.5) * 100 :
                activeCategory === 'soil_moisture' ? soilSaturation :
                activeCategory === 'rain_gauge' ? (rainRate / 100) * 100 :
                decisionScore
              ))}%`,
            }}
          />
        </div>
      </div>

      {/* 6. HARDWARE ARCHITECTURE DRAWER */}
      <Drawer
        isOpen={deviceDetailsOpen}
        onClose={() => setDeviceDetailsOpen(false)}
        title="Hardware & Link Architecture"
        subtitle={`${currentSpec.title} · ${currentSpec.hardware.location}`}
        width="w-96"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Sensor Controller:</span>
              <span className="text-zd-text">{currentSpec.hardware.chip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Bus Interface:</span>
              <span className="text-zd-text">{currentSpec.hardware.bus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Telemetry Link:</span>
              <span className="text-zd-text">{currentSpec.hardware.link}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Power Architecture:</span>
              <span className="text-sev-normal font-semibold">{currentSpec.hardware.power}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Firmware Release:</span>
              <span className="text-zd-accent">{currentSpec.hardware.firmware}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Deployment Sector:</span>
              <span className="text-zd-text">{currentSpec.hardware.location}</span>
            </div>
          </div>

          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2">
            <span className="text-zd-dim font-bold block mb-1">AI Pipeline Integration Formula</span>
            <div className="p-2 bg-zd-surface rounded border border-zd-border font-mono text-[11px] text-zd-text">
              {currentSpec.roleFormula}
            </div>
            <p className="text-[11px] text-zd-muted leading-relaxed">
              Continuous 50Hz telemetry frames are timestamped and packetized with cryptographic signature before ingestion into ZeroDay's edge LSTM neural network and CatBoost seasonal risk models.
            </p>
          </div>
        </div>
      </Drawer>

    </div>
  );
};
