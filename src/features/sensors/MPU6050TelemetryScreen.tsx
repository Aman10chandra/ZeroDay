import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Sensor3DCanvas } from './Sensor3DCanvas';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { realtimeService } from '../../services/realtime';
import { MPU6050Kinematics } from '../../types';
import { 
  ArrowLeft, 
  RotateCcw, 
  Zap, 
  Sliders, 
  Info, 
  Cpu, 
  Radio, 
  Wifi, 
  Battery, 
  Thermometer 
} from 'lucide-react';

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

  const sensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];
  const ward = wards.find(w => w.id === sensor.wardId) || wards[0];

  const [kinematics, setKinematics] = useState<MPU6050Kinematics>(realtimeService.getLatestKinematics());
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [deviceDetailsOpen, setDeviceDetailsOpen] = useState(false);

  // Sparkline history buffers
  const [sparkHistory, setSparkHistory] = useState<{
    gx: number[];
    gy: number[];
    gz: number[];
  }>({
    gx: [0.1, 0.12, 0.08, 0.15, 0.11, 0.09, 0.14, 0.1],
    gy: [0.05, 0.04, 0.06, 0.08, 0.05, 0.07, 0.05, 0.06],
    gz: [0.02, 0.01, 0.03, 0.02, 0.04, 0.01, 0.02, 0.03],
  });

  // Telemetry stream
  useEffect(() => {
    const unsub = realtimeService.on('mpu_telemetry', (data: MPU6050Kinematics) => {
      setKinematics(data);
      setSparkHistory(prev => ({
        gx: [...prev.gx.slice(1), data.gyro.x],
        gy: [...prev.gy.slice(1), data.gyro.y],
        gz: [...prev.gz.slice(1), data.gyro.z],
      }));
    });

    const unsubBreach = realtimeService.on('threshold_breach', (event: any) => {
      createAlert({
        title: `CRITICAL DISPLACEMENT: ${sensor.name}`,
        titleHi: `गंभीर विस्थापन चेतावनी: ${sensor.name}`,
        body: `Displacement velocity crossed critical 2.5 mm/s threshold (${event.displacement} mm/s). Immediate slope failure imminent.`,
        bodyHi: `विस्थापन वेग खतरनाक 2.5 मिमी/सेकंड सीमा को पार कर गया।`,
        severity: 'critical',
        regionId: ward.id,
        channels: ['push', 'sms', 'ble_mesh'],
        directiveType: 'EVACUATION',
      });

      showToast({
        type: 'critical',
        title: 'Seismic Displacement Breach',
        message: `${sensor.code} detected shear velocity ${event.displacement} mm/s in Kotdwar ridge.`,
      });
    });

    return () => {
      unsub();
      unsubBreach();
    };
  }, [sensor, ward, createAlert, showToast]);

  const handleSimulateTremor = () => {
    setIsVibrating(true);
    realtimeService.triggerTremorSimulation(5000);
    showToast({
      type: 'warning',
      title: 'Simulated Tremor Injected',
      message: 'Synthesizing shear wave excitation (decaying 5s pulse)',
    });
    addAuditLog('SIMULATE_TREMOR', sensor.code, 'Triggered 5s synthetic seismic pulse');
    setTimeout(() => setIsVibrating(false), 5000);
  };

  const handleResetPosition = () => {
    realtimeService.resetCalibration();
    showToast({
      type: 'info',
      title: 'Orientation Baseline Reset',
      message: 'Zeroed pitch, roll, and yaw drift offsets',
    });
    addAuditLog('CALIBRATION_RESET', sensor.code, 'Zeroed kinematics offset');
  };

  const displacement = kinematics.displacementRateMmPerSec;
  const isTriggered = isVibrating || displacement > 1.8;

  // Render miniature sparkline
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

  return (
    <div className={`relative w-full h-full flex flex-col p-6 overflow-hidden bg-zd-base text-zd-text select-none ${isVibrating ? 'ring-2 ring-sev-warning/60 ring-inset' : ''}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zd-border shrink-0 z-10">
        <div>
          <button
            onClick={() => navigateScreen('region_detail')}
            className="flex items-center gap-1.5 text-xs text-zd-muted hover:text-zd-accent mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Region Detail</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-semibold text-lg text-zd-text">
              {sensor.name}
            </h1>
            <span className="font-mono text-xs text-zd-dim">
              ({sensor.code} · Inclinometer)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetPosition}
            className="gap-1.5 font-sans text-xs text-zd-muted hover:text-zd-text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset position</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSimulateTremor}
            className={`gap-1.5 font-sans text-xs ${isVibrating ? 'text-sev-warning' : 'text-zd-muted hover:text-zd-text'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate tremor</span>
          </Button>

          <button
            onClick={() => setDeviceDetailsOpen(true)}
            className="h-8 px-3 rounded-[6px] border border-zd-border bg-zd-surface hover:bg-zd-raised flex items-center gap-1.5 font-sans text-xs text-zd-muted hover:text-zd-text transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Device details</span>
          </button>
        </div>
      </div>

      {/* Large Full-Width Dark Stage with Floating Overlays */}
      <div className="relative flex-1 w-full my-4 rounded-panel overflow-hidden bg-[#070B0E] border border-zd-border">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Sensor3DCanvas
            rotation={kinematics.rotation}
            filterAxis="ALL"
            isVibrating={isVibrating}
          />
        </div>

        {/* Slim Floating Status Pill */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className={`px-3 py-1 rounded-full text-xs font-sans font-medium flex items-center gap-2 backdrop-blur-md border ${
            isTriggered 
              ? 'bg-sev-warning/20 border-sev-warning/40 text-sev-warning' 
              : 'bg-zd-surface/80 border-zd-border text-zd-text'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isTriggered ? 'bg-sev-warning animate-pulse' : 'bg-sev-normal'}`} />
            <span>{isTriggered ? 'Seismic trigger' : 'Static coupling'}</span>
          </div>
        </div>

        {/* Quiet Readout: Gyroscope (Top Right) */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none text-right font-mono text-xs space-y-1">
          <span className="font-sans text-[11px] text-zd-dim block mb-1">Gyroscope (°/s)</span>
          <div className="text-zd-muted">
            <span className="text-zd-dim">X: </span>
            <span className="text-zd-text">{kinematics.gyro?.x?.toFixed(2) ?? '0.12'}</span>
            {renderSparkline(sparkHistory.gx)}
          </div>
          <div className="text-zd-muted">
            <span className="text-zd-dim">Y: </span>
            <span className="text-zd-text">{kinematics.gyro?.y?.toFixed(2) ?? '-0.08'}</span>
            {renderSparkline(sparkHistory.gy)}
          </div>
          <div className="text-zd-muted">
            <span className="text-zd-dim">Z: </span>
            <span className="text-zd-text">{kinematics.gyro?.z?.toFixed(2) ?? '0.02'}</span>
            {renderSparkline(sparkHistory.gz)}
          </div>
        </div>

        {/* Quiet Readout: Accelerometer (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none font-mono text-xs space-y-1">
          <span className="font-sans text-[11px] text-zd-dim block mb-1">Accelerometer (g)</span>
          <div className="text-zd-muted">
            <span className="text-zd-dim">X: </span>
            <span className="text-zd-text">{(kinematics.accel?.x ?? 0.05).toFixed(3)}g</span>
          </div>
          <div className="text-zd-muted">
            <span className="text-zd-dim">Y: </span>
            <span className="text-zd-text">{(kinematics.accel?.y ?? 0.12).toFixed(3)}g</span>
          </div>
          <div className="text-zd-muted">
            <span className="text-zd-dim">Z: </span>
            <span className="text-zd-text">{(kinematics.accel?.z ?? 9.81).toFixed(3)}g</span>
          </div>
        </div>

        {/* Quiet Readout: Temperature (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-right font-mono text-xs">
          <span className="font-sans text-[11px] text-zd-dim block mb-1">Core Enclosure Temp</span>
          <div className="flex items-center justify-end gap-1.5 text-zd-text">
            <Thermometer className="w-3.5 h-3.5 text-zd-muted" />
            <span className="text-sm font-semibold">{(kinematics.tempC ?? 18.84).toFixed(2)} °C</span>
          </div>
        </div>
      </div>

      {/* Thin Horizontal Displacement Bar Below Stage */}
      <div className="bg-zd-surface border border-zd-border rounded-panel p-4 shrink-0">
        <div className="flex items-baseline justify-between mb-2 font-mono">
          <div>
            <span className="font-sans text-xs text-zd-muted mr-3">Calculated Displacement Velocity</span>
            <span className={`text-2xl font-light ${displacement > 2.5 ? 'text-sev-critical font-bold' : displacement > 1.5 ? 'text-sev-warning' : 'text-zd-text'}`}>
              {displacement.toFixed(2)}
            </span>
            <span className="font-sans text-xs text-zd-dim ml-1.5">mm/s</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zd-dim font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sev-normal" /> Safe (&lt;1.5)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sev-warning" /> Warning (1.5 - 2.5)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sev-critical" /> Critical (&gt;2.5)
            </span>
          </div>
        </div>

        {/* The Bar with Zones */}
        <div className="relative h-2.5 w-full bg-zd-base border border-zd-border rounded-full overflow-hidden flex mt-3">
          <div className="h-full bg-sev-normal/40 w-[45%]" />
          <div className="h-full bg-sev-warning/45 w-[30%]" />
          <div className="h-full bg-sev-critical/50 w-[25%]" />

          {/* Moving Marker */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-zd-text shadow-md transition-all duration-150 rounded-full"
            style={{
              left: `${Math.min(99, Math.max(1, (displacement / 3.5) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Device Details Drawer */}
      <Drawer
        isOpen={deviceDetailsOpen}
        onClose={() => setDeviceDetailsOpen(false)}
        title="Hardware & Link Architecture"
        subtitle={`${sensor.name} · ${sensor.code}`}
        width="w-96"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Microcontroller:</span>
              <span className="text-zd-text">ESP32-S3 Dual-Core</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">IMU Sensor:</span>
              <span className="text-zd-text">TDK InvenSense MPU-6050</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Bus Address:</span>
              <span className="text-zd-text">I2C 0x68 (400 kHz)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Sampling Stream:</span>
              <span className="text-zd-accent">WebSocket 50 Hz Raw</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">LoRA Uplink:</span>
              <span className="text-zd-text">868.10 MHz (SF7 / 125 kHz)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">RSSI / SNR:</span>
              <span className="text-zd-text">-74 dBm / +9.2 dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Battery Reserve:</span>
              <span className="text-sev-normal font-semibold">94% (LiFePO4 Solar)</span>
            </div>
          </div>

          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1">
            <span className="text-zd-dim block mb-1">Calibration Matrix</span>
            <p className="font-mono text-[11px] text-zd-muted leading-relaxed">
              Offset Zero: X [-0.02] Y [+0.01] Z [+0.98g]<br />
              Damping Filter: Kalman 2nd Order α=0.88
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
