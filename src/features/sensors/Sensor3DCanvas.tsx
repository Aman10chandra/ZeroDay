import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

export type SensorCategory = 'mpu6050' | 'ultrasonic_gauge' | 'soil_moisture' | 'rain_gauge' | 'decision_engine';

interface SensorModelProps {
  rotation: { pitch: number; roll: number; yaw: number };
  filterAxis: 'ALL' | 'X' | 'Y' | 'Z';
  isVibrating: boolean;
  metricValue?: number;
}

// ==========================================
// 1. MPU-6050 6-AXIS IMU & ESP-32 HOUSING
// ==========================================
const MPU6050Model: React.FC<SensorModelProps> = ({ rotation, filterAxis, isVibrating }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const pitchRad = (filterAxis === 'ALL' || filterAxis === 'X' ? rotation.pitch : 0) * (Math.PI / 180);
    const rollRad = (filterAxis === 'ALL' || filterAxis === 'Y' ? rotation.roll : 0) * (Math.PI / 180);
    const yawRad = (filterAxis === 'ALL' || filterAxis === 'Z' ? rotation.yaw : 0) * (Math.PI / 180);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, pitchRad, 0.2);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, -rollRad, 0.2);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, yawRad, 0.2);

    if (isVibrating) {
      meshRef.current.position.x = (Math.random() - 0.5) * 0.12;
      meshRef.current.position.y = 0.5 + (Math.random() - 0.5) * 0.12;
      meshRef.current.position.z = (Math.random() - 0.5) * 0.12;
    } else {
      meshRef.current.position.set(0, 0.5, 0);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.5, 0]}>
      {/* Sensor Main Enclosure: Crisp Industrial Silver-Slate Anodized IP68 Enclosure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.6, 1.6]} />
        <meshStandardMaterial color="#6A8094" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Top Lid / PCB Cover Plate */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.0, 0.05, 1.4]} />
        <meshStandardMaterial color="#889EAF" metalness={0.6} roughness={0.25} />
      </mesh>

      {/* Industrial Mounting Flanges (Left & Right) */}
      <mesh position={[-1.25, -0.15, 0]}>
        <boxGeometry args={[0.3, 0.15, 1.2]} />
        <meshStandardMaterial color="#4A5C6D" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.25, -0.15, 0]}>
        <boxGeometry args={[0.3, 0.15, 1.2]} />
        <meshStandardMaterial color="#4A5C6D" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cable Gland */}
      <mesh position={[0, 0, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.35, 16]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Status LED */}
      <mesh position={[0.7, 0.36, 0.4]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={isVibrating ? "#E5484D" : "#5CC8BE"} />
      </mesh>

      {/* Axis Lines */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 1.8, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#E5484D" linewidth={2} />
      </line>

      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0, 1.6, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#4CB782" linewidth={2} />
      </line>

      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0, 0, 1.6]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#5CC8BE" linewidth={2} />
      </line>
    </group>
  );
};

// ==========================================
// 2. JSN-SR04T ULTRASONIC RIVER LEVEL GAUGE
// ==========================================
const UltrasonicGaugeModel: React.FC<SensorModelProps> = ({ isVibrating, metricValue = 3.2 }) => {
  const pulseRingsRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRingsRef.current) {
      pulseRingsRef.current.children.forEach((child, i) => {
        const ring = child as THREE.Mesh;
        const progress = ((t * 1.5 + i * 0.33) % 1);
        ring.position.y = -0.5 - progress * 1.8;
        ring.scale.set(1 + progress * 1.6, 1 + progress * 1.6, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.7;
      });
    }

    if (waterRef.current) {
      const targetWaterY = -2.2 + (isVibrating ? 0.6 : Math.min(1.2, metricValue / 5.0));
      waterRef.current.position.y = THREE.MathUtils.lerp(waterRef.current.position.y, targetWaterY, 0.05);
    }
  });

  return (
    <group position={[0, 1.2, 0]}>
      {/* Mounting Overhead Bracket */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.6, 0.15, 0.6]} />
        <meshStandardMaterial color="#4A5C6D" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Waterproof Rubber Grommet & Hex Nut */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.25, 6]} />
        <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Stainless Steel Transducer Barrel */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.9, 32]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Ultrasonic Emitting Face (Mesh Grille) */}
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 32]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>

      {/* Top Cable Lead */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.5} />
      </mesh>

      {/* Acoustic Pulse Rings (Simulating 40kHz Sonar Wave) */}
      <group ref={pulseRingsRef}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.25, 32]} />
            <meshBasicMaterial 
              color={isVibrating ? "#EF4444" : "#06B6D4"} 
              transparent 
              opacity={0.6} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        ))}
      </group>

      {/* River Surface Reflection Plane */}
      <mesh ref={waterRef} position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial 
          color={isVibrating ? "#991B1B" : "#0284C7"} 
          metalness={0.4} 
          roughness={0.1} 
          transparent 
          opacity={0.65} 
        />
      </mesh>

      {/* Datum Mark Marker Line */}
      <mesh position={[1.4, -1.5, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.04]} />
        <meshBasicMaterial color="#E5484D" />
      </mesh>
    </group>
  );
};

// ==========================================
// 3. CAPACITIVE SOIL MOISTURE PROBE
// ==========================================
const SoilMoistureModel: React.FC<SensorModelProps> = ({ isVibrating, metricValue = 75 }) => {
  const probeRef = useRef<THREE.Group>(null);
  const moistureGlowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (probeRef.current && isVibrating) {
      probeRef.current.position.y = 0.2 + Math.sin(clock.getElapsedTime() * 12) * 0.03;
    }
    if (moistureGlowRef.current) {
      const pulse = (Math.sin(clock.getElapsedTime() * 3) + 1) * 0.5;
      (moistureGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse * 0.35;
    }
  });

  const isSaturated = isVibrating || metricValue > 80;

  return (
    <group ref={probeRef} position={[0, 0.2, 0]}>
      {/* Top Waterproof Epoxy Enclosure / Head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.0, 0.7, 0.4]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Top Industrial Cable Strain Relief */}
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 16]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      {/* Status LED on Head */}
      <mesh position={[0.3, 1.3, 0.21]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={isSaturated ? "#E5484D" : "#10B981"} />
      </mesh>

      {/* Flat Fiberglass PCB Sensor Blade */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 2.0, 0.08]} />
        <meshStandardMaterial color="#047857" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Tapered Pointed Tip (Easier Soil Insertion) */}
      <mesh position={[0, -1.25, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.35, 0.4, 4]} />
        <meshStandardMaterial color="#047857" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Dual Capacitive Copper Sensing Traces (Left & Right) */}
      <mesh position={[-0.2, -0.15, 0.045]}>
        <boxGeometry args={[0.14, 1.7, 0.01]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.2, -0.15, 0.045]}>
        <boxGeometry args={[0.14, 1.7, 0.01]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Moisture Field Halo */}
      <mesh ref={moistureGlowRef} position={[0, -0.3, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.5]} />
        <meshBasicMaterial 
          color={isSaturated ? "#38BDF8" : "#059669"} 
          transparent 
          opacity={0.3} 
          wireframe 
        />
      </mesh>

      {/* Soil Strata Horizon Disk */}
      <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshStandardMaterial color="#543D2B" roughness={0.9} opacity={0.6} transparent />
      </mesh>
    </group>
  );
};

// ==========================================
// 4. RAIN GAUGE & METEOROLOGICAL COLLECTOR
// ==========================================
const RainGaugeModel: React.FC<SensorModelProps> = ({ isVibrating, metricValue = 42 }) => {
  const bucketRef = useRef<THREE.Group>(null);
  const rainGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Tipping bucket rocking motion
    if (bucketRef.current) {
      const tipSpeed = isVibrating ? 8 : (metricValue > 30 ? 4 : 1.5);
      bucketRef.current.rotation.z = Math.sin(t * tipSpeed) * 0.28;
    }

    // Falling rain drops inside the funnel
    if (rainGroupRef.current) {
      rainGroupRef.current.children.forEach((child, i) => {
        const drop = child as THREE.Mesh;
        drop.position.y -= 0.08 + (i % 3) * 0.02;
        if (drop.position.y < 0.2) {
          drop.position.y = 2.2 + (Math.random() * 0.8);
          drop.position.x = (Math.random() - 0.5) * 1.2;
          drop.position.z = (Math.random() - 0.5) * 1.2;
        }
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Cylindrical Stainless Steel Collector Rim */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.8, 32, 1, true]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Internal Funnel Cone */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.98, 0.6, 32, 1, true]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Lower Enclosure Chamber */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.9, 32]} />
        <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Tipping Bucket Mechanism Inside (Visible via cutaway) */}
      <group ref={bucketRef} position={[0, 0.2, 0]}>
        {/* Pivot Shaft */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        {/* Left Bucket Compartment */}
        <mesh position={[-0.25, 0.08, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.35, 0.22, 0.35]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Right Bucket Compartment */}
        <mesh position={[0.25, 0.08, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.35, 0.22, 0.35]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Heavy Base Stand with Leveling Tripod Feet */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1.15, 1.25, 0.15, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-0.9, 0, 0.9].map((pos, idx) => (
        <mesh key={idx} position={[pos * 1.1, -0.6, pos * 0.4]}>
          <cylinderGeometry args={[0.1, 0.14, 0.2, 16]} />
          <meshStandardMaterial color="#D97706" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Falling Rain Particle Streaks */}
      <group ref={rainGroupRef}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 1.2, 1.0 + Math.random() * 1.5, (Math.random() - 0.5) * 1.2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.75} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ==========================================
// 5. ALERT DECISION ENGINE & MULTI-MODEL HUB
// ==========================================
const DecisionEngineModel: React.FC<SensorModelProps> = ({ isVibrating }) => {
  const hubRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current) {
      const pulse = (Math.sin(t * 4) + 1) * 0.5;
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.4;
    }
  });

  return (
    <group ref={hubRef} position={[0, 0.4, 0]}>
      {/* Industrial Edge Gateway Main Casing */}
      <mesh castShadow>
        <boxGeometry args={[2.4, 1.6, 0.8]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Cooling Fins (Rear Aluminum Heat Sink) */}
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.45]}>
          <boxGeometry args={[0.08, 1.4, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      ))}

      {/* High-Gain LoRa & BLE Dipole Antennas */}
      <mesh position={[-0.8, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>
      <mesh position={[0.8, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* Front Face Glass Plate */}
      <mesh position={[0, 0, 0.42]}>
        <boxGeometry args={[2.1, 1.3, 0.04]} />
        <meshStandardMaterial color="#090D12" metalness={0.3} roughness={0.1} />
      </mesh>

      {/* Dual Neural Model Indicators: CatBoost 40% (Amber) & LSTM 60% (Cyan) */}
      <mesh position={[-0.5, 0.2, 0.45]}>
        <boxGeometry args={[0.6, 0.15, 0.02]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>
      <mesh position={[0.5, 0.2, 0.45]}>
        <boxGeometry args={[0.6, 0.15, 0.02]} />
        <meshBasicMaterial color="#06B6D4" />
      </mesh>

      {/* Blended Risk Consensus Beacon */}
      <mesh ref={pulseRef} position={[0, -0.25, 0.46]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color={isVibrating ? "#EF4444" : "#10B981"} />
      </mesh>
    </group>
  );
};

// ==========================================
// ISOMETRIC SVG FALLBACK (FOR NON-WEBGL)
// ==========================================
const IsometricSensorFallback: React.FC<{
  sensorType: SensorCategory;
  rotation: { pitch: number; roll: number; yaw: number };
  isVibrating: boolean;
}> = ({ sensorType, rotation, isVibrating }) => {
  const pitch = rotation.pitch || 0;
  const roll = rotation.roll || 0;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#070B0E]">
      <svg className="w-full h-full absolute inset-0 opacity-20 pointer-events-none" viewBox="0 0 800 500">
        <defs>
          <pattern id="isoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#isoGrid)" />
      </svg>

      <div 
        className="relative z-10 transition-transform duration-150 flex flex-col items-center"
        style={{
          transform: `perspective(600px) rotateX(${25 + pitch}deg) rotateY(${30 + roll}deg) ${isVibrating ? 'translateY(2px)' : ''}`,
        }}
      >
        {sensorType === 'mpu6050' && (
          <div className="w-52 h-32 bg-gradient-to-br from-[#3A4A58] to-[#242E36] border border-white/20 rounded-[8px] shadow-2xl p-4 flex flex-col justify-between">
            <div className="w-full h-1 bg-[#2C6E49] rounded-sm opacity-80" />
            <div className="w-20 h-16 bg-[#0E1317] border border-zd-border rounded mx-auto flex flex-col items-center justify-center font-mono text-[10px] text-zd-dim">
              <span className="font-bold text-zd-text">MPU6050</span>
              <span className="text-[8px] text-zd-accent">I2C 0x68 · 50Hz</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-zd-dim">
              <span>IP68 Enclosure</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isVibrating ? 'bg-sev-critical animate-ping' : 'bg-zd-accent animate-pulse'}`} />
            </div>
          </div>
        )}

        {sensorType === 'ultrasonic_gauge' && (
          <div className="w-48 h-40 flex flex-col items-center justify-between">
            <div className="w-16 h-24 bg-gradient-to-b from-[#94A3B8] to-[#475569] border border-cyan-400/40 rounded-t-md relative flex flex-col items-center p-2 shadow-lg">
              <div className="w-8 h-2 bg-amber-400 rounded-sm mb-2" />
              <div className="w-12 h-12 rounded-full border-2 border-cyan-400/60 bg-cyan-950/40 flex items-center justify-center font-mono text-[9px] text-cyan-300">
                40kHz
              </div>
            </div>
            <div className="w-36 h-2 border-b-2 border-dashed border-cyan-400 animate-pulse mt-2" />
            <div className="w-44 h-4 bg-sky-600/40 border border-sky-400/50 rounded-full mt-2 flex items-center justify-center text-[9px] font-mono text-sky-200">
              Khoh River Water Level
            </div>
          </div>
        )}

        {sensorType === 'soil_moisture' && (
          <div className="w-44 h-44 flex flex-col items-center">
            <div className="w-16 h-10 bg-slate-800 border border-emerald-500/40 rounded-t-md flex items-center justify-center text-[9px] font-mono text-emerald-400">
              I2C SOIL
            </div>
            <div className="w-10 h-28 bg-emerald-900 border-x-2 border-amber-400/80 relative flex flex-col justify-around px-1">
              <span className="text-[8px] font-mono text-amber-300">10cm</span>
              <span className="text-[8px] font-mono text-amber-300">20cm</span>
              <span className="text-[8px] font-mono text-amber-300">30cm</span>
              <span className="text-[8px] font-mono text-amber-300">40cm</span>
            </div>
            <div className="w-40 h-3 bg-amber-950/60 border border-amber-800/60 rounded-full -mt-1 text-[8px] font-mono text-amber-200 text-center">
              Pore Water Saturation
            </div>
          </div>
        )}

        {sensorType === 'rain_gauge' && (
          <div className="w-44 h-40 flex flex-col items-center justify-between">
            <div className="w-28 h-16 bg-gradient-to-b from-slate-300 to-slate-500 border border-white/40 rounded-t-full flex items-center justify-center font-mono text-[9px] text-slate-800 font-bold shadow-md">
              0.2mm Funnel
            </div>
            <div className="w-20 h-14 bg-slate-700 border border-slate-500 rounded p-1 flex items-center justify-center">
              <div className="w-14 h-6 bg-sky-500/30 border border-sky-400 rounded-sm text-[8px] font-mono text-sky-200 flex items-center justify-center">
                Tipping Pivot
              </div>
            </div>
            <div className="w-32 h-3 bg-slate-800 rounded-full" />
          </div>
        )}

        {sensorType === 'decision_engine' && (
          <div className="w-52 h-36 bg-slate-900 border-2 border-zd-accent/40 rounded-lg p-3 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-center text-[9px] font-mono text-zd-muted border-b border-zd-border pb-1">
              <span>ALERT DECISION HUB</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className="flex justify-between text-amber-400">
                <span>CatBoost Seasonal (40%)</span>
                <span>85/100</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>LSTM Real-time (60%)</span>
                <span>92/100</span>
              </div>
            </div>
            <div className="w-full h-2 bg-zd-base rounded-full overflow-hidden flex">
              <div className="w-[40%] bg-amber-500" />
              <div className="w-[60%] bg-cyan-400" />
            </div>
          </div>
        )}

        <div className="w-44 h-6 bg-black/60 blur-md rounded-full mt-3" />
      </div>
    </div>
  );
};

// ==========================================
// MAIN EXPORT: SENSOR 3D CANVAS COMPONENT
// ==========================================
export const Sensor3DCanvas: React.FC<{
  sensorType?: SensorCategory;
  rotation?: { pitch: number; roll: number; yaw: number };
  filterAxis?: 'ALL' | 'X' | 'Y' | 'Z';
  isVibrating?: boolean;
  metricValue?: number;
}> = ({ 
  sensorType = 'mpu6050',
  rotation = { pitch: 14.2, roll: -8.5, yaw: 3.1 }, 
  filterAxis = 'ALL', 
  isVibrating = false,
  metricValue = 50,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const fallback = (
    <IsometricSensorFallback
      sensorType={sensorType}
      rotation={rotation}
      isVibrating={isVibrating}
    />
  );

  if (!hasWebGL) {
    return fallback;
  }

  return (
    <div className="w-full h-full min-h-[360px] relative bg-gradient-to-b from-[#0C1218] to-[#070B0E] rounded-panel border border-zd-border overflow-hidden select-none">
      <Canvas
        camera={{ position: [3.5, 2.5, 4.0], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={0.8} />
        <pointLight position={[-4, 2, -4]} intensity={0.7} />
        <pointLight position={[4, 1, 3]} intensity={0.6} color="#5CC8BE" />

        {sensorType === 'mpu6050' && (
          <MPU6050Model
            rotation={rotation}
            filterAxis={filterAxis}
            isVibrating={isVibrating}
            metricValue={metricValue}
          />
        )}

        {sensorType === 'ultrasonic_gauge' && (
          <UltrasonicGaugeModel
            rotation={rotation}
            filterAxis={filterAxis}
            isVibrating={isVibrating}
            metricValue={metricValue}
          />
        )}

        {sensorType === 'soil_moisture' && (
          <SoilMoistureModel
            rotation={rotation}
            filterAxis={filterAxis}
            isVibrating={isVibrating}
            metricValue={metricValue}
          />
        )}

        {sensorType === 'rain_gauge' && (
          <RainGaugeModel
            rotation={rotation}
            filterAxis={filterAxis}
            isVibrating={isVibrating}
            metricValue={metricValue}
          />
        )}

        {sensorType === 'decision_engine' && (
          <DecisionEngineModel
            rotation={rotation}
            filterAxis={filterAxis}
            isVibrating={isVibrating}
            metricValue={metricValue}
          />
        )}

        <Grid
          position={[0, -0.01, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.7}
          cellColor="#2A3540"
          sectionSize={2.0}
          sectionThickness={1.2}
          sectionColor="#5CC8BE"
          fadeDistance={12}
        />

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={2.2}
          maxDistance={8}
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Axis Gizmo / Metric indicator badge */}
      <div className="absolute bottom-2.5 left-2.5 font-mono text-[10px] text-zd-dim bg-zd-surface/85 px-2.5 py-1 rounded border border-zd-border flex items-center gap-3 backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zd-accent inline-block animate-pulse" />
          <span className="uppercase text-zd-text font-semibold">{sensorType.replace('_', ' ')}</span>
        </span>
        <span className="text-zd-dim">·</span>
        <span>Drag to rotate 3D model</span>
      </div>
    </div>
  );
};
