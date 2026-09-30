import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Activity, ShieldAlert, Zap } from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function MPU6050TelemetryScreen({ 
  onBack, 
  onShowToast, 
  onTriggerDisaster,
  userRole = 'admin'
}) {
  // Gyroscope in rad/s
  const [gyro, setGyro] = useState({ x: 2.12, y: 0.77, z: -0.04 });
  // Accelerometer in m/s²
  const [accel, setAccel] = useState({ x: -3.81, y: 7.74, z: 0.86 });
  // Temperature in °C
  const [temp, setTemp] = useState(18.84);

  // 3D orientation angles in degrees
  const [rotation, setRotation] = useState({ pitch: 24, roll: -32, yaw: 15 });
  const [isSimulatingVibration, setIsSimulatingVibration] = useState(false);
  const [activeAxisFilter, setActiveAxisFilter] = useState('ALL');

  // Continuous micro-telemetry drift simulation (50Hz)
  useEffect(() => {
    const interval = setInterval(() => {
      const jitter = isSimulatingVibration ? 2.2 : 0.03;
      const accelJitter = isSimulatingVibration ? 4.5 : 0.06;

      setGyro(prev => ({
        x: parseFloat((prev.x + (Math.random() - 0.5) * jitter).toFixed(2)),
        y: parseFloat((prev.y + (Math.random() - 0.5) * jitter).toFixed(2)),
        z: parseFloat((prev.z + (Math.random() - 0.5) * (jitter * 0.4)).toFixed(2)),
      }));

      setAccel(prev => ({
        x: parseFloat((prev.x + (Math.random() - 0.5) * accelJitter).toFixed(2)),
        y: parseFloat((prev.y + (Math.random() - 0.5) * accelJitter).toFixed(2)),
        z: parseFloat((prev.z + (Math.random() - 0.5) * (accelJitter * 0.3)).toFixed(2)),
      }));

      if (isSimulatingVibration) {
        setRotation(prev => ({
          pitch: prev.pitch + (Math.random() - 0.5) * 6,
          roll: prev.roll + (Math.random() - 0.5) * 6,
          yaw: prev.yaw + (Math.random() - 0.5) * 4,
        }));
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isSimulatingVibration]);

  // Recalibrate sensor to baseline
  const handleRecalibrate = () => {
    setRotation({ pitch: 0, roll: 0, yaw: 0 });
    setGyro({ x: 0.00, y: 0.00, z: 0.00 });
    setAccel({ x: 0.00, y: 9.81, z: 0.00 });
    if (onShowToast) onShowToast("Sensor recalibrated. Baseline zeroed.", "success");
  };

  const handleToggleAxis = (axis) => {
    setActiveAxisFilter(axis);
    if (axis === 'X') {
      setRotation({ pitch: 45, roll: 0, yaw: 0 });
      setAccel({ x: 7.20, y: 3.10, z: 0.86 });
    } else if (axis === 'Y') {
      setRotation({ pitch: 0, roll: 55, yaw: 0 });
      setAccel({ x: 0.50, y: 9.60, z: 0.86 });
    } else if (axis === 'Z') {
      setRotation({ pitch: 0, roll: 0, yaw: 60 });
      setAccel({ x: 0.00, y: 0.00, z: 4.80 });
    } else {
      setRotation({ pitch: 24, roll: -32, yaw: 15 });
    }
  };

  const triggerLandslideTremor = () => {
    setIsSimulatingVibration(true);
    setGyro({ x: 6.84, y: 5.12, z: 1.45 });
    setAccel({ x: -8.92, y: 14.30, z: 4.15 });
    if (onShowToast) onShowToast("Displacement pulse detected on Kotdwar Ridge A.", "warning");
    setTimeout(() => {
      setIsSimulatingVibration(false);
      setGyro({ x: 2.12, y: 0.77, z: -0.04 });
      setAccel({ x: -3.81, y: 7.74, z: 0.86 });
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-12 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Sensor N-022" userRole={userRole} />

      {/* Subheader */}
      <div className="w-full bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-1 -ml-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
              title="Return"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight leading-tight">
                  MPU-6050 telemetry
                </h1>
                <span className="text-[10px] font-mono uppercase text-[#2E7D4F] dark:text-[#389E65] border border-[#2E7D4F]/40 dark:border-[#389E65]/40 px-1 py-0.2 rounded-[3px]">
                  50Hz Live
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
                Node N-022 · Kotdwar Ridge Slope A · 192.168.1.75
              </p>
            </div>
          </div>

          <button
            onClick={triggerLandslideTremor}
            className={`h-8 px-2.5 rounded-[8px] text-xs font-mono font-medium border transition-calm flex items-center gap-1.5 ${
              isSimulatingVibration 
                ? 'bg-[#C1271D] text-white border-[#C1271D]' 
                : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#1A1D1B] dark:text-[#ECEAE4] hover:bg-[#ECE9E2] dark:hover:bg-[#2A302D]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{isSimulatingVibration ? 'Tremor active' : 'Simulate tremor'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {/* Three aligned mono readouts in one clean panel */}
        <section aria-label="6-axis kinematic readouts">
          <div className="py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Kinematic readouts
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 bg-[#FAF9F6] dark:bg-[#171B19]">
            <div className="grid grid-cols-3 gap-3 divide-x divide-[#D8D4CA] dark:divide-[#2A302D]">
              {/* Gyroscope Column */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block">
                  Gyro (rad/s)
                </span>
                <div className="font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#8A4A48] font-semibold">X:</span>
                    <span>{gyro.x > 0 ? `+${gyro.x}` : gyro.x}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4D7858] font-semibold">Y:</span>
                    <span>{gyro.y > 0 ? `+${gyro.y}` : gyro.y}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6C8A] font-semibold">Z:</span>
                    <span>{gyro.z > 0 ? `+${gyro.z}` : gyro.z}</span>
                  </div>
                </div>
              </div>

              {/* Accelerometer Column */}
              <div className="pl-3 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block">
                  Accel (m/s²)
                </span>
                <div className="font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#8A4A48] font-semibold">X:</span>
                    <span>{accel.x > 0 ? `+${accel.x}` : accel.x}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4D7858] font-semibold">Y:</span>
                    <span>{accel.y > 0 ? `+${accel.y}` : accel.y}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6C8A] font-semibold">Z:</span>
                    <span>{accel.z > 0 ? `+${accel.z}` : accel.z}</span>
                  </div>
                </div>
              </div>

              {/* Temperature & Calibration Column */}
              <div className="pl-3 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block">
                    Core temp
                  </span>
                  <div className="font-mono text-sm font-semibold mt-1">
                    {temp} <span className="text-xs text-[#5C635E] dark:text-[#8A928D] font-normal">°C</span>
                  </div>
                </div>

                <button
                  onClick={handleRecalibrate}
                  className="h-7 px-2 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[4px] text-[10.5px] font-mono text-[#1A1D1B] dark:text-[#ECEAE4] hover:bg-[#ECE9E2] dark:hover:bg-[#2A302D] transition-calm flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                  <span>Recalibrate</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Prism Orientation Stage (Neutral greys with single severity LED) */}
        <section aria-label="3D sensor orientation model">
          <div className="flex items-center justify-between py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              3D sensor orientation
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {['ALL', 'X', 'Y', 'Z'].map((axis) => (
                <button
                  key={axis}
                  onClick={() => handleToggleAxis(axis)}
                  className={`px-1.5 py-0.5 rounded transition-calm ${
                    activeAxisFilter === axis 
                      ? 'bg-[#1A1D1B] text-[#FAF9F6] dark:bg-[#ECEAE4] dark:text-[#0F1211] font-semibold' 
                      : 'text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B]'
                  }`}
                >
                  {axis}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 bg-[#FAF9F6] dark:bg-[#171B19]">
            <div 
              className="w-full h-48 bg-[#0F1211] rounded-[8px] relative overflow-hidden flex items-center justify-center select-none"
              style={{ perspective: '700px' }}
            >
              {/* Neutral Depth Grid */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center"
                style={{ transform: 'rotateX(60deg) translateY(30px)' }}
              >
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mpu-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ECEAE4" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mpu-grid)" />
                </svg>
              </div>

              {/* 3D Prism in neutral greys */}
              <div
                className="relative w-24 h-24 transition-transform duration-150 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rotation.pitch}deg) rotateY(${rotation.roll}deg) rotateZ(${rotation.yaw}deg)`,
                }}
              >
                {/* Front Face: Neutral grey with single severity LED */}
                <div 
                  className="absolute inset-0 bg-[#2A302D] border border-[#5C635E] flex flex-col items-center justify-center text-[#ECEAE4]"
                  style={{ transform: 'translateZ(48px)' }}
                >
                  <span className="text-[10px] font-mono tracking-wider font-semibold">MPU-6050</span>
                  {/* Single severity-colored LED: safe green normally, red on tremor */}
                  <span 
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      isSimulatingVibration 
                        ? 'bg-[#C1271D] dark:bg-[#D9382E] animate-slow-pulse' 
                        : 'bg-[#2E7D4F] dark:bg-[#389E65]'
                    }`}
                  />
                </div>

                {/* Back Face */}
                <div 
                  className="absolute inset-0 bg-[#1E2321] border border-[#3E4542]"
                  style={{ transform: 'rotateY(180deg) translateZ(48px)' }}
                />

                {/* Right Face */}
                <div 
                  className="absolute inset-0 bg-[#242927] border border-[#48504D] flex items-center justify-center text-[#8A928D] text-[9px] font-mono"
                  style={{ transform: 'rotateY(90deg) translateZ(48px)' }}
                >
                  X
                </div>

                {/* Left Face */}
                <div 
                  className="absolute inset-0 bg-[#242927] border border-[#48504D] flex items-center justify-center text-[#8A928D] text-[9px] font-mono"
                  style={{ transform: 'rotateY(-90deg) translateZ(48px)' }}
                >
                  Y
                </div>

                {/* Top Face */}
                <div 
                  className="absolute inset-0 bg-[#2F3633] border border-[#545E5A]"
                  style={{ transform: 'rotateX(90deg) translateZ(48px)' }}
                />

                {/* Bottom Face */}
                <div 
                  className="absolute inset-0 bg-[#121514] border border-[#2A302D]"
                  style={{ transform: 'rotateX(-90deg) translateZ(48px)' }}
                />
              </div>

              {/* Status readout */}
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-[#8A928D]">
                Pitch: {Math.round(rotation.pitch)}° · Roll: {Math.round(rotation.roll)}°
              </div>

              <div className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#2A302D] text-[#ECEAE4]">
                {isSimulatingVibration ? 'SEISMIC TRIGGER' : 'STATIC COUPLING'}
              </div>
            </div>
          </div>
        </section>

        {/* Displacement Bar as Segmented Scale with Labeled Thresholds */}
        <section aria-label="Landslide displacement scale">
          <div className="py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Displacement velocity index
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 bg-[#FAF9F6] dark:bg-[#171B19] space-y-2">
            <div className="flex justify-between items-baseline text-xs font-mono">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Dynamic ground velocity</span>
              <span className={`font-semibold ${isSimulatingVibration ? 'text-[#C1271D] dark:text-[#D9382E]' : 'text-[#1A1D1B] dark:text-[#ECEAE4]'}`}>
                {isSimulatingVibration ? '3.42 mm/s (Breach)' : '0.04 mm/s (Nominal)'}
              </span>
            </div>

            {/* Segmented scale bar */}
            <div className="grid grid-cols-3 gap-1 h-2 rounded overflow-hidden">
              {/* Segment 1: Safe */}
              <div className={`h-full rounded-sm transition-calm ${
                !isSimulatingVibration ? 'bg-[#2E7D4F] dark:bg-[#389E65]' : 'bg-[#2E7D4F]/30 dark:bg-[#389E65]/30'
              }`} />
              
              {/* Segment 2: Advisory */}
              <div className={`h-full rounded-sm transition-calm ${
                isSimulatingVibration ? 'bg-[#A87A00] dark:bg-[#C79200]' : 'bg-[#D8D4CA]/40 dark:bg-[#2A302D]'
              }`} />
              
              {/* Segment 3: Critical */}
              <div className={`h-full rounded-sm transition-calm ${
                isSimulatingVibration ? 'bg-[#C1271D] dark:bg-[#D9382E]' : 'bg-[#D8D4CA]/40 dark:bg-[#2A302D]'
              }`} />
            </div>

            {/* Scale Threshold labels */}
            <div className="grid grid-cols-3 text-[10px] font-mono text-[#5C635E] dark:text-[#8A928D] pt-0.5">
              <span>0.0 – 1.5 (Safe)</span>
              <span className="text-center">1.5 – 2.5 (Advisory)</span>
              <span className="text-right">&gt; 2.5 mm/s (Evacuation)</span>
            </div>
          </div>
        </section>

        {/* Hardware Specifications Table */}
        <section aria-label="Field node hardware configuration">
          <div className="py-1 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
              Hardware configuration
            </span>
          </div>

          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs font-mono">
            <div className="p-2.5 flex justify-between">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Microcontroller</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">ESP32-WROOM-32</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#5C635E] dark:text-[#8A928D]">I2C bus address</span>
              <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">0x68 (400 kHz)</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Solar battery storage</span>
              <span className="text-[#2E7D4F] dark:text-[#389E65] font-semibold">4.18 V (98%)</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Telemetry uplink</span>
              <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">SX1276 LoRA 868MHz</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
