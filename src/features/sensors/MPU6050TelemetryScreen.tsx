import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Sensor3DCanvas, SensorCategory } from './Sensor3DCanvas';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { realtimeService } from '../../services/realtime';
import { MPU6050Kinematics } from '../../types';
import { 
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
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

export const MPU6050TelemetryScreen: React.FC = () => {
  const { 
    wards, 
    createAlert,
    showToast,
    addAuditLog 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<SensorCategory>('mpu6050');
  const [deviceDetailsOpen, setDeviceDetailsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Collapsible sections (collapsed by default per spec)
  const [modelPipelineOpen, setModelPipelineOpen] = useState(false);
  const [rawTelemetryOpen, setRawTelemetryOpen] = useState(false);

  // MPU-6050 Kinematics State
  const [kinematics, setKinematics] = useState<MPU6050Kinematics>(realtimeService.getLatestKinematics());
  const [sparkHistory, setSparkHistory] = useState<{
    primary: number[];
    secondary: number[];
    tertiary: number[];
  }>({
    primary: [0.1, 0.12, 0.08, 0.15, 0.11, 0.09, 0.14, 0.12],
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

  // Sparkline generator helper
  const renderSparkline = (values: number[], width = 40, height = 16, strokeColor = 'currentColor') => {
    const min = Math.min(...values);
    const max = Math.max(...values, min + 0.05);
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 2 - ((v - min) / (max - min)) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg className="shrink-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
    );
  };

  // Sensor definitions
  const sensorCatalog = [
    {
      id: 'mpu6050' as const,
      name: 'MPU6050 6-Axis IMU',
      subtitle: 'Ground movement',
      icon: Activity,
      status: 'online' as const,
      liveValue: kinematics.displacementRateMmPerSec.toFixed(2),
      unit: 'mm/s',
      spark: [0.12, 0.14, 0.10, 0.16, 0.11, 0.18, 0.14, parseFloat(kinematics.displacementRateMmPerSec.toFixed(2))],
      oneLiner: 'High-frequency 50Hz accelerometry monitoring micro-creeps and seismic shear waves.',
      warningAt: 1.5,
      criticalAt: 2.5,
      maxScale: 3.5,
      trendData: [0.12, 0.15, 0.18, 0.14, 0.22, 0.28, 0.32, 0.48],
      secondaryMetrics: [
        { label: 'Gyroscope (X / Y / Z)', value: `${kinematics.gyro.x.toFixed(2)} / ${kinematics.gyro.y.toFixed(2)} / ${kinematics.gyro.z.toFixed(2)}`, unit: '°/s', spark: [0.1, 0.14, -0.08, 0.02, 0.12] },
        { label: 'Enclosure Temp', value: (kinematics.tempC ?? 18.8).toFixed(1), unit: '°C', spark: [18.2, 18.4, 18.5, 18.7, 18.8] },
        { label: 'RF Signal & SNR', value: '-72 / +9.2', unit: 'dBm · dB', spark: [8.8, 9.0, 9.1, 9.2, 9.2] },
      ],
      pipelineModel: 'TDK InvenSense MPU-6050 + Kalman Filter → LSTM Recurrent Edge Inference (50Hz sample rate)',
      pingInfo: 'LoRa 868.10 MHz (SF7/125kHz) · Packet Latency 14ms · Battery 94% (LiFePO4 Solar float)',
      hardware: {
        chip: 'TDK InvenSense MPU-6050 + ESP32-S3',
        bus: 'I2C 0x68 (400 kHz Fast-Mode)',
        link: 'LoRa 868.10 MHz + BLE Mesh',
        power: '3.7V 3200mAh LiFePO4 + 2W Solar',
        firmware: 'ZD-ESP32-v3.8.4',
        location: 'Kotdwar Ridge Slope A (Node 22)',
      },
    },
    {
      id: 'ultrasonic_gauge' as const,
      name: 'JSN-SR04T Ultrasonic',
      subtitle: 'River crest override',
      icon: Waves,
      status: ultrasonicLevel > 3.2 ? 'warning' as const : 'online' as const,
      liveValue: ultrasonicLevel.toFixed(2),
      unit: 'm',
      spark: [2.8, 2.9, 3.0, 3.1, 3.15, 3.18, 3.2, ultrasonicLevel],
      oneLiner: 'Real-time waterproof sonar transducer measuring Khoh river weir water level and crest clearance.',
      warningAt: 3.0,
      criticalAt: 3.2,
      maxScale: 5.5,
      trendData: [2.10, 2.35, 2.60, 2.85, 3.00, 3.15, 3.20],
      secondaryMetrics: [
        { label: 'Danger Datum Mark', value: '3.20', unit: 'm', spark: [3.2, 3.2, 3.2, 3.2, 3.2] },
        { label: 'Datum Clearance', value: ultrasonicLevel > 3.2 ? `+${(ultrasonicLevel - 3.2).toFixed(2)}` : `-${(3.2 - ultrasonicLevel).toFixed(2)}`, unit: ultrasonicLevel > 3.2 ? 'm (OVERRIDE)' : 'm nominal', spark: [0.4, 0.3, 0.2, 0.05, ultrasonicLevel - 3.2] },
        { label: 'Transceiver Pulse', value: '40', unit: 'kHz Sonar', spark: [40, 40, 40, 40, 40] },
      ],
      pipelineModel: 'JSN-SR04T Sonar Echo → Deterministic rule-based flood crest override (bypasses ML latency)',
      pingInfo: 'LoRaWAN Class A Node 15 · RSSI -68 dBm · Battery 98% (12V Solar Backed Float)',
      hardware: {
        chip: 'JSN-SR04T Integrated Transceiver Probe',
        bus: 'UART / GPIO Echo Burst (40 kHz Sonar)',
        link: 'LoRaWAN Class A Node 15',
        power: '12V Solar Backed Float Battery',
        firmware: 'ZD-WEIR-v2.1.0',
        location: 'Rampur Khoh Weir #3 Flume',
      },
    },
    {
      id: 'soil_moisture' as const,
      name: 'Capacitive Soil Probe',
      subtitle: 'Soil saturation',
      icon: Droplets,
      status: soilSaturation > 80 ? 'warning' as const : 'online' as const,
      liveValue: `${soilSaturation}`,
      unit: '%',
      spark: [64, 68, 70, 72, 74, 75, 76, soilSaturation],
      oneLiner: 'Multi-depth corrosion-resistant capacitance array measuring pore water saturation and liquefaction risk.',
      warningAt: 75,
      criticalAt: 80,
      maxScale: 100,
      trendData: [58, 62, 65, 68, 72, 75, soilSaturation],
      secondaryMetrics: [
        { label: 'Pore Water Pressure', value: (soilSaturation * 0.48).toFixed(1), unit: 'kPa', spark: [30, 32, 34, 35, 36.5] },
        { label: 'Critical Threshold', value: '80.0', unit: '%', spark: [80, 80, 80, 80, 80] },
        { label: 'Subsurface Depth', value: '40', unit: 'cm Escarpment', spark: [40, 40, 40, 40, 40] },
      ],
      pipelineModel: 'Capacitive Frequency Resonator → Subsurface pore pressure tensor → LSTM live trigger',
      pingInfo: 'LoRa Mesh Hop 2 · Packet SNR +8.4 dB · Battery 91% (3.6V Primary Lithium Thionyl)',
      hardware: {
        chip: 'Corrosion-Resistant Chirp I2C Capacitive Sensor',
        bus: 'I2C 0x20 Multi-Drop Bus',
        link: 'LoRa Mesh Hop 2',
        power: '3.6V Primary Lithium Thionyl Cell',
        firmware: 'ZD-SOIL-v1.4.2',
        location: 'Basin Escarpment Subsurface 40cm',
      },
    },
    {
      id: 'rain_gauge' as const,
      name: 'Optical Rain Gauge & DEM',
      subtitle: 'Rain forecast',
      icon: CloudRain,
      status: 'online' as const,
      liveValue: rainRate.toFixed(1),
      unit: 'mm/h',
      spark: [20, 24, 28, 32, 36, 40, 41, rainRate],
      oneLiner: 'Optical rainfall accumulator fused with Copernicus 30m DEM terrain slope and aspect matrices.',
      warningAt: 50,
      criticalAt: 70,
      maxScale: 100,
      trendData: [12.0, 18.5, 26.0, 34.0, 38.5, rainRate],
      secondaryMetrics: [
        { label: '7-Day Antecedent Wetness', value: '310', unit: 'mm cumulative', spark: [180, 210, 250, 280, 310] },
        { label: 'Slope / Aspect Angle', value: '34.2 / SE', unit: 'degrees', spark: [34.2, 34.2, 34.2, 34.2, 34.2] },
        { label: 'Rain Bucket Pulse', value: '0.2', unit: 'mm/tip resolution', spark: [0.2, 0.2, 0.2, 0.2, 0.2] },
      ],
      pipelineModel: 'Tipping Reed Counter + Copernicus DEM → CatBoost Gradient Boosted Trees (3, 7, 14-day rolling)',
      pingInfo: 'Cellular LTE-M / LoRa Gateway Hub · RSSI -74 dBm · Mains 12V Float + PV Solar',
      hardware: {
        chip: 'Optical Tipping Bucket 0.2mm Reed Sensor',
        bus: 'Pulse Accumulator Counter Interrupt',
        link: 'High-Gain Cellular LTE-M / LoRa Gateway Hub',
        power: 'Mains Float 12V 7Ah with PV Solar Array',
        firmware: 'ZD-METEO-v2.2.0',
        location: 'Kotdwar Tehsil Building Rooftop Station',
      },
    },
    {
      id: 'decision_engine' as const,
      name: 'Alert Decision Engine',
      subtitle: 'Alert decision',
      icon: Cpu,
      status: 'warning' as const,
      liveValue: `${decisionScore}`,
      unit: '/ 100',
      spark: [65, 70, 75, 80, 84, 87, 88, decisionScore],
      oneLiner: 'Edge neural consensus gateway fusing long-term CatBoost seasonal priors (40%) with real-time LSTM telemetry (60%).',
      warningAt: 70,
      criticalAt: 85,
      maxScale: 100,
      trendData: [45, 52, 61, 74, 82, decisionScore],
      secondaryMetrics: [
        { label: 'CatBoost Seasonal Weight (40%)', value: '85', unit: '/ 100 prior', spark: [60, 68, 74, 80, 85] },
        { label: 'LSTM Telemetry Weight (60%)', value: '92', unit: '/ 100 live', spark: [70, 78, 85, 90, 92] },
        { label: 'Consensus Directive', value: 'RED EVAC', unit: 'Direct trigger', spark: [1, 1, 2, 2, 3] },
      ],
      pipelineModel: 'CatBoost (40%) + LSTM (60%) Weighted Ensemble Hub → Safe / Advisory / Warning / Red Directive',
      pingInfo: 'Edge Concentrator SX1302 · Modbus RS485 · Starlink Failover Link · Industrial UPS',
      hardware: {
        chip: 'NVIDIA Jetson Orin Nano Edge Gateway Hub',
        bus: 'PCIe 4.0 / Modbus RS485 Industrial Bus',
        link: 'Dual LoRa Concentrator (SX1302) + Starlink Satellite Failover',
        power: '24V Industrial UPS + Generator Auto-Start',
        firmware: 'ZD-FUSION-v5.2.0',
        location: 'Pauri Garhwal Central Operations Hub',
      },
    },
  ];

  const currentSensor = sensorCatalog.find(s => s.id === activeCategory) || sensorCatalog[0];

  // Derive dynamic threshold values for current sensor
  const currentMetricNum = 
    activeCategory === 'mpu6050' ? kinematics.displacementRateMmPerSec :
    activeCategory === 'ultrasonic_gauge' ? ultrasonicLevel :
    activeCategory === 'soil_moisture' ? soilSaturation :
    activeCategory === 'rain_gauge' ? rainRate :
    decisionScore;

  const isCurrentCritical = currentMetricNum >= currentSensor.criticalAt;
  const isCurrentWarning = currentMetricNum >= currentSensor.warningAt && !isCurrentCritical;
  const statusLabel = isCurrentCritical ? 'Critical Trigger' : isCurrentWarning ? 'Warning' : 'Normal';

  return (
    <div className={`relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-zd-base text-zd-text select-none ${isSimulating ? 'ring-2 ring-sev-warning/60 ring-inset' : ''}`}>

      {/* ========================================================= */}
      {/* 1. LEFT RAIL (260px): SENSORS LIST                       */}
      {/* ========================================================= */}
      <aside 
        id="sensors-left-rail"
        className="w-full md:w-[260px] h-auto md:h-full border-b md:border-b-0 md:border-r border-zd-border bg-zd-surface flex flex-col shrink-0 z-20 overflow-hidden"
      >
        {/* At-a-glance Health Summary Strip */}
        <div className="p-3.5 border-b border-zd-border bg-zd-raised/50 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-sans font-semibold text-xs text-zd-text tracking-tight">Sensors</span>
            <span className="font-sans text-[11px] text-zd-muted">
              5 sensors · 4 normal · 1 warning
            </span>
          </div>
        </div>

        {/* Scrollable Sensor Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zd-border/60 custom-scrollbar font-sans">
          {sensorCatalog.map((sensor) => {
            const isActive = activeCategory === sensor.id;
            const isWarn = sensor.status === 'warning';
            const strokeColor = isActive ? '#5CC8BE' : isWarn ? '#E8843A' : '#71859C';

            return (
              <button
                key={sensor.id}
                onClick={() => setActiveCategory(sensor.id)}
                className={clsx(
                  "w-full p-3 text-left transition-colors flex items-center justify-between group focus:outline-none",
                  isActive
                    ? "bg-zd-raised border-l-2 border-zd-accent"
                    : "hover:bg-zd-hover border-l-2 border-transparent"
                )}
              >
                <div className="min-w-0 pr-2">
                  {/* Line 1: Status Dot + Sensor Name */}
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "w-2 h-2 rounded-full shrink-0",
                      isWarn ? "bg-sev-warning" : "bg-sev-normal"
                    )} />
                    <span className={clsx(
                      "text-xs font-semibold truncate",
                      isActive ? "text-zd-text" : "text-zd-muted group-hover:text-zd-text"
                    )}>
                      {sensor.name}
                    </span>
                  </div>

                  {/* Line 2: Plain-language subtitle */}
                  <span className="text-[11px] text-zd-dim block mt-0.5 ml-4">
                    {sensor.subtitle}
                  </span>
                </div>

                {/* Right side: Live Value in Data Font + 40px Sparkline */}
                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="font-mono text-xs font-semibold tabular-nums text-zd-text">
                    <span>{sensor.liveValue}</span>
                    <span className="text-[10px] text-zd-dim ml-1 font-normal">{sensor.unit}</span>
                  </div>
                  <div className="mt-1">
                    {renderSparkline(sensor.spark, 40, 14, strokeColor)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Rail Footer System Note */}
        <div className="p-3 border-t border-zd-border bg-zd-surface/80 text-[11px] text-zd-dim font-sans shrink-0 hidden md:block">
          <span>Continuous edge polling active</span>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. DETAIL PANEL (RIGHT): PREDICTABLE STANDARDIZED TEMPLATE */}
      {/* ========================================================= */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col p-5 md:p-6 space-y-5 bg-zd-base">

        {/* 1. DETAIL PANEL HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zd-border shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-sans font-semibold text-lg text-zd-text leading-tight">
                {currentSensor.name}
              </h2>
              <span className="font-sans text-xs text-zd-dim">·</span>
              <span className="font-sans text-xs text-zd-muted font-medium">
                {currentSensor.subtitle}
              </span>
            </div>
            <p className="font-sans text-xs text-zd-muted mt-1 leading-relaxed max-w-2xl">
              {currentSensor.oneLiner}
            </p>

            {/* Health Chips Row (Sentence Case) */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 font-sans text-xs text-zd-muted">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zd-surface border border-zd-border">
                <span className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  isCurrentCritical ? "bg-sev-critical" : isCurrentWarning ? "bg-sev-warning" : "bg-sev-normal"
                )} />
                <span>{isCurrentCritical ? 'Critical state' : isCurrentWarning ? 'Elevated' : 'Online'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zd-surface border border-zd-border">
                <Battery className="w-3.5 h-3.5 text-sev-normal" />
                <span>Battery 94%</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zd-surface border border-zd-border">
                <Radio className="w-3.5 h-3.5 text-zd-accent" />
                <span className="font-mono text-[11px] tabular-nums">RSSI -72 dBm</span>
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
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
              className={clsx(
                "gap-1.5 font-sans text-xs border border-zd-border",
                isSimulating 
                  ? "bg-sev-warning/15 text-sev-warning border-sev-warning/40 font-semibold animate-pulse" 
                  : "text-zd-muted hover:text-zd-text hover:bg-zd-surface"
              )}
              title="Test telemetry trigger"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Simulating...' : 'Simulate trigger'}</span>
            </Button>

            {/* Device specs as a text link */}
            <button
              onClick={() => setDeviceDetailsOpen(true)}
              className="font-sans text-xs text-zd-accent hover:underline flex items-center gap-1 px-2 py-1 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Device specs</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. COCKPIT CENTER-STAGE: 3D VIEW IN MIDDLE, TELEMETRY AROUND IT */}
        {/* ========================================================= */}
        <section aria-label="Sensor Telemetry Cockpit" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* --------------------------------------------------------- */}
          {/* FLANK LEFT (3 COLS): HERO METRIC, GAUGE & 24H TREND       */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
            
            {/* Primary Reading & Gauge Card */}
            <div className="p-4 bg-zd-surface rounded-panel border border-zd-border flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs text-zd-dim">Live Primary Reading</span>
                  {/* Status Dot / Badge */}
                  {isCurrentCritical ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-sans text-[11px] font-semibold bg-sev-critical text-white shadow-sm">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{statusLabel}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zd-raised border border-zd-border font-sans text-[11px] font-medium text-zd-text">
                      <span className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        isCurrentWarning ? "bg-sev-warning" : "bg-sev-normal"
                      )} />
                      <span>{statusLabel}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-mono text-3xl xl:text-4xl font-semibold text-zd-text leading-none tabular-nums">
                    {currentSensor.liveValue}
                  </span>
                  <span className="font-mono text-xs text-zd-dim">
                    {currentSensor.unit}
                  </span>
                </div>
              </div>

              {/* Threshold Gauge with Labeled Tick Marks */}
              <div className="pt-3 border-t border-zd-border/60">
                <div className="flex justify-between items-center text-[10px] font-sans text-zd-muted mb-1.5">
                  <span>Threshold datum</span>
                  <span className="font-mono text-zd-dim">Max: {currentSensor.maxScale} {currentSensor.unit}</span>
                </div>

                {/* Visual Track */}
                <div className="relative h-2.5 w-full bg-zd-base border border-zd-border rounded-full overflow-hidden flex">
                  <div className="h-full bg-sev-normal/30 w-[50%]" />
                  <div className="h-full bg-sev-warning/35 w-[30%]" />
                  <div className="h-full bg-sev-critical/45 w-[20%]" />

                  {/* Live Needle Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] transition-all duration-300 rounded-full"
                    style={{
                      left: `${Math.min(99, Math.max(1, (currentMetricNum / currentSensor.maxScale) * 100))}%`,
                    }}
                  />
                </div>

                {/* Ticks */}
                <div className="relative flex justify-between text-[10px] font-sans text-zd-dim mt-1.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-sev-normal" />
                    <span>Normal</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px]">
                    <span className="w-1 h-1 rounded-full bg-sev-warning" />
                    <span>Warn ({currentSensor.warningAt})</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px]">
                    <span className="w-1 h-1 rounded-full bg-sev-critical" />
                    <span>Crit ({currentSensor.criticalAt})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 24h Trend Chart Card */}
            <div className="p-4 bg-zd-surface rounded-panel border border-zd-border flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-xs font-sans text-zd-muted mb-1">
                <span>24h Trend history</span>
                <TrendingUp className="w-3.5 h-3.5 text-zd-accent" />
              </div>

              {/* Spark Bars Graph */}
              <div className="h-16 flex items-end gap-1.5 pt-2 my-1">
                {currentSensor.trendData.map((val, idx) => {
                  const maxVal = Math.max(...currentSensor.trendData, currentSensor.criticalAt);
                  const heightPct = Math.min(100, Math.max(15, (val / maxVal) * 100));
                  const isOverCrit = val >= currentSensor.criticalAt;
                  const isOverWarn = val >= currentSensor.warningAt;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className={clsx(
                          "w-full rounded-t-sm transition-all duration-300",
                          isOverCrit ? "bg-sev-critical" : isOverWarn ? "bg-sev-warning" : "bg-zd-accent"
                        )}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="font-mono text-[9px] text-zd-dim">
                        {idx * 4}h
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] font-sans text-zd-dim pt-2 border-t border-zd-border/60 flex justify-between">
                <span>Sliding baseline</span>
                <span className="font-mono text-zd-muted">σ = ±0.03</span>
              </div>
            </div>

          </div>

          {/* --------------------------------------------------------- */}
          {/* CENTER STAGE (6 COLS): 3D DEVICE VIEW IN THE MIDDLE       */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-6 h-[400px] lg:h-auto min-h-[420px] bg-gradient-to-b from-[#0E151C] to-[#080D12] rounded-panel border border-zd-border flex flex-col overflow-hidden relative shadow-md order-1 lg:order-2">
            
            {/* 3D Stage Header */}
            <div className="p-3 border-b border-zd-border/80 bg-zd-surface/80 backdrop-blur flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zd-accent animate-pulse" />
                <span className="font-sans font-semibold text-xs text-zd-text">Device view (3D)</span>
                <span className="font-sans text-xs text-zd-dim">·</span>
                <span className="font-sans text-[11px] text-zd-muted">{currentSensor.name}</span>
              </div>

              <div className="flex items-center gap-2 font-sans text-[11px] text-zd-dim">
                <span>Drag to orbit · Scroll to zoom</span>
              </div>
            </div>

            {/* Orbitable 3D Canvas */}
            <div className="flex-1 relative w-full h-full">
              <Sensor3DCanvas
                sensorType={activeCategory}
                rotation={kinematics.rotation}
                filterAxis="ALL"
                isVibrating={isSimulating}
                metricValue={currentMetricNum}
              />

              {/* Bottom HUD: Live Orientation & Telemetry Readings */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                
                {/* Left HUD: Kinematic Orientation or Sensor State */}
                <div className="px-2.5 py-1 rounded bg-zd-base/85 backdrop-blur border border-zd-border/80 font-mono text-[10px] text-zd-muted flex items-center gap-2 pointer-events-auto">
                  {activeCategory === 'mpu6050' ? (
                    <>
                      <span className="text-zd-dim font-sans">Orientation:</span>
                      <span className="text-zd-accent tabular-nums">P: {(kinematics.rotation?.pitch ?? 0).toFixed(1)}°</span>
                      <span className="text-zd-border">|</span>
                      <span className="text-zd-accent tabular-nums">R: {(kinematics.rotation?.roll ?? 0).toFixed(1)}°</span>
                      <span className="text-zd-border">|</span>
                      <span className="text-zd-accent tabular-nums">Y: {(kinematics.rotation?.yaw ?? 0).toFixed(1)}°</span>
                    </>
                  ) : activeCategory === 'ultrasonic_gauge' ? (
                    <>
                      <span className="text-zd-dim font-sans">Sonar Echo:</span>
                      <span className="text-zd-accent tabular-nums">40 kHz Burst</span>
                      <span className="text-zd-border">|</span>
                      <span className="text-zd-dim font-sans">Datum:</span>
                      <span className="text-zd-text tabular-nums">3.20m</span>
                    </>
                  ) : activeCategory === 'soil_moisture' ? (
                    <>
                      <span className="text-zd-dim font-sans">Capacitance:</span>
                      <span className="text-zd-accent tabular-nums">Multi-Depth Probe</span>
                      <span className="text-zd-border">|</span>
                      <span className="text-zd-text tabular-nums">40cm Escarpment</span>
                    </>
                  ) : activeCategory === 'rain_gauge' ? (
                    <>
                      <span className="text-zd-dim font-sans">Optical Accumulator:</span>
                      <span className="text-zd-accent tabular-nums">0.2mm/tip</span>
                      <span className="text-zd-border">|</span>
                      <span className="text-zd-text tabular-nums">DEM Slope 34°</span>
                    </>
                  ) : (
                    <>
                      <span className="text-zd-dim font-sans">AI Consensus:</span>
                      <span className="text-zd-accent tabular-nums">CatBoost 40% + LSTM 60%</span>
                    </>
                  )}
                </div>

                {/* Right HUD: Active Node Controller */}
                <div className="px-2 py-1 rounded bg-zd-base/85 backdrop-blur border border-zd-border/80 font-sans text-[10px] text-zd-dim flex items-center gap-1.5 pointer-events-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-sev-normal" />
                  <span className="font-mono text-zd-text">{currentSensor.hardware.chip.split('+')[0].trim()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* FLANK RIGHT (3 COLS): SECONDARY CHANNELS & NODE SPECS     */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-4 order-3 lg:order-3">
            
            {/* Secondary Telemetry Channels Card */}
            <div className="p-4 bg-zd-surface rounded-panel border border-zd-border flex flex-col justify-between flex-1">
              <div>
                <span className="font-sans font-semibold text-xs text-zd-text block mb-3">
                  Secondary telemetry
                </span>

                <div className="space-y-2.5">
                  {currentSensor.secondaryMetrics.map((metric, i) => (
                    <div key={i} className="p-2.5 bg-zd-base rounded border border-zd-border/70 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-zd-dim text-[10px] font-sans block truncate">{metric.label}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-mono text-xs font-semibold text-zd-text tabular-nums">
                            {metric.value}
                          </span>
                          <span className="font-mono text-[9px] text-zd-dim truncate">
                            {metric.unit}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {renderSparkline(metric.spark, 34, 12, '#5CC8BE')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge Node Hardware Quick Spec */}
              <div className="pt-3 mt-3 border-t border-zd-border/60 font-sans text-xs">
                <div className="flex items-center justify-between text-[11px] text-zd-dim mb-1.5">
                  <span>Field deployment</span>
                  <span className="text-zd-accent">{currentSensor.hardware.location.split('(')[0].trim()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zd-dim">
                  <span>Protocol link:</span>
                  <span className="font-mono text-zd-text">{currentSensor.hardware.link.split('+')[0].trim()}</span>
                </div>
              </div>
            </div>

            {/* Architecture Link Drawer Trigger */}
            <div className="p-3.5 bg-zd-surface rounded-panel border border-zd-border flex items-center justify-between">
              <div>
                <span className="font-sans font-medium text-xs text-zd-text block">Hardware architecture</span>
                <span className="font-sans text-[11px] text-zd-dim block mt-0.5">Bus, power & firmware profiles</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceDetailsOpen(true)}
                className="font-sans text-xs text-zd-accent hover:text-zd-text gap-1 shrink-0"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Specs</span>
              </Button>
            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* 3. SURROUNDING BOTTOM ROW: PIPELINE & TELEMETRY PING      */}
        {/* ========================================================= */}
        <section aria-label="Pipeline and Telemetry Metrics" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Collapsible Section 1: Model & Pipeline */}
          <div className="border border-zd-border rounded-panel bg-zd-surface overflow-hidden">
            <button
              onClick={() => setModelPipelineOpen(!modelPipelineOpen)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zd-hover transition-colors font-sans text-xs focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zd-accent" />
                <span className="font-semibold text-zd-text">Model & pipeline integration</span>
              </div>
              <div className="flex items-center gap-2 text-zd-dim">
                <span className="text-[11px]">{modelPipelineOpen ? 'Hide' : 'Expand'}</span>
                {modelPipelineOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </button>

            {modelPipelineOpen && (
              <div className="p-3.5 pt-0 border-t border-zd-border/60 space-y-2.5 font-sans text-xs text-zd-muted animate-in fade-in-0">
                <p className="leading-relaxed">
                  {currentSensor.pipelineModel}
                </p>
                <div className="p-2.5 bg-zd-base rounded border border-zd-border font-mono text-[11px] text-zd-text flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-zd-accent shrink-0" />
                  <span>Edge feature extraction: 50Hz Fast Fourier transform windowing & Kalman noise filtration.</span>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Section 2: Raw Telemetry Ping */}
          <div className="border border-zd-border rounded-panel bg-zd-surface overflow-hidden">
            <button
              onClick={() => setRawTelemetryOpen(!rawTelemetryOpen)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zd-hover transition-colors font-sans text-xs focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-zd-accent" />
                <span className="font-semibold text-zd-text">Raw telemetry ping & packet metrics</span>
              </div>
              <div className="flex items-center gap-2 text-zd-dim">
                <span className="text-[11px]">{rawTelemetryOpen ? 'Hide' : 'Expand'}</span>
                {rawTelemetryOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </button>

            {rawTelemetryOpen && (
              <div className="p-3.5 pt-0 border-t border-zd-border/60 space-y-2 font-mono text-xs text-zd-muted animate-in fade-in-0">
                <div className="flex items-center justify-between py-1 border-b border-zd-border/40">
                  <span className="font-sans text-zd-dim">Link summary:</span>
                  <span className="text-zd-text">{currentSensor.pingInfo}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zd-border/40">
                  <span className="font-sans text-zd-dim">Bus address:</span>
                  <span className="text-zd-text">{currentSensor.hardware.bus}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-sans text-zd-dim">Firmware target:</span>
                  <span className="text-zd-accent">{currentSensor.hardware.firmware}</span>
                </div>
              </div>
            )}
          </div>

        </section>

      </main>

      {/* Hardware Architecture Drawer (Opens from "Device specs" text link) */}
      <Drawer
        isOpen={deviceDetailsOpen}
        onClose={() => setDeviceDetailsOpen(false)}
        title="Hardware & Link Architecture"
        subtitle={`${currentSensor.name} · ${currentSensor.hardware.location}`}
        width="w-96"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3.5 bg-zd-base border border-zd-border rounded-panel space-y-2.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Sensor Controller:</span>
              <span className="text-zd-text">{currentSensor.hardware.chip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Bus Interface:</span>
              <span className="text-zd-text">{currentSensor.hardware.bus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Telemetry Link:</span>
              <span className="text-zd-text">{currentSensor.hardware.link}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Power Architecture:</span>
              <span className="text-sev-normal font-semibold">{currentSensor.hardware.power}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Firmware Release:</span>
              <span className="text-zd-accent">{currentSensor.hardware.firmware}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Deployment Sector:</span>
              <span className="text-zd-text">{currentSensor.hardware.location}</span>
            </div>
          </div>

          <div className="p-3.5 bg-zd-base border border-zd-border rounded-panel space-y-2">
            <span className="text-zd-dim font-bold block mb-1">Telemetry Pipeline Formula</span>
            <div className="p-2.5 bg-zd-surface rounded border border-zd-border font-mono text-[11px] text-zd-text leading-relaxed">
              {currentSensor.pipelineModel}
            </div>
            <p className="text-[11px] text-zd-muted leading-relaxed">
              Continuous telemetry frames are sampled at edge nodes and ingested into ZeroDay's neural network inference pipeline and rule-based threshold engines.
            </p>
          </div>
        </div>
      </Drawer>

    </div>
  );
};
