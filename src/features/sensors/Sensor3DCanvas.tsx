import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface SensorModelProps {
  rotation: { pitch: number; roll: number; yaw: number };
  filterAxis: 'ALL' | 'X' | 'Y' | 'Z';
  isVibrating: boolean;
}

const IndustrialSensorHousing: React.FC<SensorModelProps> = ({ rotation, filterAxis, isVibrating }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    // Convert degrees to radians
    const pitchRad = (filterAxis === 'ALL' || filterAxis === 'X' ? rotation.pitch : 0) * (Math.PI / 180);
    const rollRad = (filterAxis === 'ALL' || filterAxis === 'Y' ? rotation.roll : 0) * (Math.PI / 180);
    const yawRad = (filterAxis === 'ALL' || filterAxis === 'Z' ? rotation.yaw : 0) * (Math.PI / 180);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, pitchRad, 0.2);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, -rollRad, 0.2);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, yawRad, 0.2);

    if (isVibrating) {
      meshRef.current.position.x = (Math.random() - 0.5) * 0.12;
      meshRef.current.position.y = (Math.random() - 0.5) * 0.12;
      meshRef.current.position.z = (Math.random() - 0.5) * 0.12;
    } else {
      meshRef.current.position.set(0, 0.5, 0);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.5, 0]}>
      {/* Sensor Main Enclosure: Anodized Dark Slate IP68 Enclosure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.6, 1.6]} />
        <meshStandardMaterial color="#3A4A58" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Top Lid / PCB Cover Plate */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.0, 0.05, 1.4]} />
        <meshStandardMaterial color="#4A5B6A" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Industrial Mounting Flanges (Left & Right) */}
      <mesh position={[-1.25, -0.15, 0]}>
        <boxGeometry args={[0.3, 0.15, 1.2]} />
        <meshStandardMaterial color="#2A3540" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.25, -0.15, 0]}>
        <boxGeometry args={[0.3, 0.15, 1.2]} />
        <meshStandardMaterial color="#2A3540" metalness={0.9} roughness={0.2} />
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

// Isometric SVG representation if WebGL is unsupported in headless environment
const IsometricSensorFallback: React.FC<SensorModelProps> = ({ rotation, isVibrating }) => {
  const pitch = rotation.pitch || 0;
  const roll = rotation.roll || 0;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#070B0E]">
      {/* Perspective Ground Grid */}
      <svg className="w-full h-full absolute inset-0 opacity-20 pointer-events-none" viewBox="0 0 800 500">
        <defs>
          <pattern id="isoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#isoGrid)" />
      </svg>

      {/* Isometric 3D Enclosure Render */}
      <div 
        className="relative z-10 transition-transform duration-150 flex flex-col items-center"
        style={{
          transform: `perspective(600px) rotateX(${25 + pitch}deg) rotateY(${30 + roll}deg) rotateZ(0deg) ${isVibrating ? 'translateY(2px)' : ''}`,
        }}
      >
        {/* Metal Case */}
        <div className="w-48 h-28 bg-gradient-to-br from-[#3A4A58] to-[#242E36] border border-[rgba(255,255,255,0.25)] rounded-[6px] shadow-2xl relative p-4 flex flex-col justify-between">
          {/* PCB Top Edge */}
          <div className="w-full h-1 bg-[#2C6E49] rounded-sm opacity-80" />

          {/* Center Chip */}
          <div className="w-16 h-16 bg-[#0E1317] border border-white/10 rounded mx-auto flex flex-col items-center justify-center font-mono text-[9px] text-zd-dim">
            <span>MPU6050</span>
            <span className="text-[7px] text-zd-accent">I2C 0x68</span>
          </div>

          {/* Tiny LED */}
          <div className="flex items-center justify-between text-[8px] font-mono text-zd-dim">
            <span>IP68 ENCLOSURE</span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isVibrating ? 'bg-sev-critical animate-ping' : 'bg-zd-accent animate-pulse'}`} />
              <span className="text-[9px] text-zd-text">SYS</span>
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div className="w-44 h-8 bg-black/60 blur-md rounded-full mt-4" />
      </div>

      {/* Axis Gizmo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] text-zd-dim bg-zd-surface/80 px-2.5 py-1 rounded border border-zd-border flex items-center gap-3">
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sev-critical inline-block" /> X Pitch</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sev-normal inline-block" /> Y Roll</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-zd-accent inline-block" /> Z Yaw</span>
      </div>
    </div>
  );
};

// WebGL Error Boundary Wrapper
class WebGLBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('WebGL Renderer unavailable, using high-precision isometric fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const Sensor3DCanvas: React.FC<{
  rotation: { pitch: number; roll: number; yaw: number };
  filterAxis: 'ALL' | 'X' | 'Y' | 'Z';
  isVibrating: boolean;
}> = ({ rotation, filterAxis, isVibrating }) => {
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
      rotation={rotation}
      filterAxis={filterAxis}
      isVibrating={isVibrating}
    />
  );

  if (!hasWebGL) {
    return fallback;
  }

  return (
    <div className="w-full h-full min-h-[360px] relative bg-gradient-to-b from-[#0C1218] to-[#070B0E] rounded-panel border border-zd-border overflow-hidden select-none">
      <WebGLBoundary fallback={fallback}>
        <Canvas
          camera={{ position: [3.5, 2.5, 4.0], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-3, 4, -2]} intensity={0.8} />
          <pointLight position={[-4, 2, -4]} intensity={0.7} />
          <pointLight position={[4, 1, 3]} intensity={0.5} color="#5CC8BE" />

          <IndustrialSensorHousing
            rotation={rotation}
            filterAxis={filterAxis}
            isVibrating={isVibrating}
          />

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
            minDistance={2.5}
            maxDistance={8}
            dampingFactor={0.08}
          />
        </Canvas>
      </WebGLBoundary>

      {/* Axis Gizmo */}
      <div className="absolute bottom-2.5 left-2.5 font-mono text-[10px] text-zd-dim bg-zd-surface/80 px-2 py-0.5 rounded border border-zd-border flex items-center gap-3">
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sev-critical inline-block" /> X Pitch</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sev-normal inline-block" /> Y Roll</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-zd-accent inline-block" /> Z Yaw</span>
      </div>
    </div>
  );
};
