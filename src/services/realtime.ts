import { MPU6050Kinematics } from '../types';

type Listener = (data: any) => void;

class RealtimeTelemetryService {
  private listeners: Map<string, Set<Listener>> = new Map();
  private mpuInterval: number | null = null;
  private envInterval: number | null = null;
  private isSimulatingTremor: boolean = false;
  private tremorTimeout: number | null = null;

  // Baseline calibration offset
  private calibration = {
    pitch: 0,
    roll: 0,
    yaw: 0,
  };

  // State
  private currentKinematics: MPU6050Kinematics = {
    timestamp: new Date().toISOString(),
    gyro: { x: 0.12, y: -0.08, z: 0.02 },
    accel: { x: 0.05, y: 0.12, z: 9.81 },
    tempC: 18.8,
    rotation: { pitch: 14.2, roll: -8.5, yaw: 3.1 },
    displacementRateMmPerSec: 0.42,
    displacementThresholdExceeded: false,
  };

  constructor() {
    this.startStreaming();
  }

  public on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  public off(event: string, fn: Listener) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(fn);
    }
  }

  public emit(event: string, data: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(fn => fn(data));
    }
  }

  public resetCalibration() {
    this.calibration = {
      pitch: this.currentKinematics.rotation.pitch,
      roll: this.currentKinematics.rotation.roll,
      yaw: this.currentKinematics.rotation.yaw,
    };
    this.currentKinematics.rotation = { pitch: 0, roll: 0, yaw: 0 };
    this.emit('mpu_telemetry', { ...this.currentKinematics });
  }

  public triggerTremorSimulation(durationMs = 6000) {
    this.isSimulatingTremor = true;
    if (this.tremorTimeout) clearTimeout(this.tremorTimeout);

    this.tremorTimeout = window.setTimeout(() => {
      this.isSimulatingTremor = false;
      this.currentKinematics.displacementRateMmPerSec = 0.42;
      this.currentKinematics.displacementThresholdExceeded = false;
      this.emit('mpu_telemetry', { ...this.currentKinematics });
    }, durationMs);
  }

  public getLatestKinematics(): MPU6050Kinematics {
    return { ...this.currentKinematics };
  }

  private startStreaming() {
    // 50Hz (20ms) loop for MPU-6050 kinematics
    this.mpuInterval = window.setInterval(() => {
      const jitter = this.isSimulatingTremor ? 3.8 : 0.04;
      const accelJitter = this.isSimulatingTremor ? 8.2 : 0.08;

      const gx = parseFloat((this.currentKinematics.gyro.x + (Math.random() - 0.5) * jitter).toFixed(3));
      const gy = parseFloat((this.currentKinematics.gyro.y + (Math.random() - 0.5) * jitter).toFixed(3));
      const gz = parseFloat((this.currentKinematics.gyro.z + (Math.random() - 0.5) * (jitter * 0.5)).toFixed(3));

      const ax = parseFloat((this.currentKinematics.accel.x + (Math.random() - 0.5) * accelJitter).toFixed(2));
      const ay = parseFloat((this.currentKinematics.accel.y + (Math.random() - 0.5) * accelJitter).toFixed(2));
      const az = parseFloat((9.81 + (Math.random() - 0.5) * accelJitter).toFixed(2));

      let pitch = this.currentKinematics.rotation.pitch;
      let roll = this.currentKinematics.rotation.roll;
      let yaw = this.currentKinematics.rotation.yaw;

      if (this.isSimulatingTremor) {
        pitch += (Math.random() - 0.5) * 5.5;
        roll += (Math.random() - 0.5) * 5.0;
        yaw += (Math.random() - 0.5) * 3.5;
      } else {
        // Slow gentle micro-sway
        pitch += (Math.random() - 0.5) * 0.1;
        roll += (Math.random() - 0.5) * 0.1;
      }

      const displacement = this.isSimulatingTremor
        ? parseFloat((2.85 + Math.random() * 1.5).toFixed(2))
        : parseFloat((0.35 + Math.random() * 0.15).toFixed(2));

      const exceeded = displacement > 2.5;

      this.currentKinematics = {
        timestamp: new Date().toISOString(),
        gyro: { x: gx, y: gy, z: gz },
        accel: { x: ax, y: ay, z: az },
        tempC: parseFloat((18.84 + Math.sin(Date.now() / 10000) * 0.3).toFixed(2)),
        rotation: { pitch, roll, yaw },
        displacementRateMmPerSec: displacement,
        displacementThresholdExceeded: exceeded,
      };

      this.emit('mpu_telemetry', this.currentKinematics);

      if (exceeded && this.isSimulatingTremor) {
        this.emit('threshold_breach', {
          sensorId: 'sn-014',
          displacement,
          message: 'CRITICAL: Displacement rate exceeded 2.5 mm/s on Kotdwar Ridge Node 22',
        });
      }
    }, 40); // 25Hz - 50Hz smooth cadence

    // Low-frequency environmental telemetry tick every 2.5s
    this.envInterval = window.setInterval(() => {
      this.emit('env_telemetry_tick', {
        timestamp: new Date().toISOString(),
        rainfallJitter: (Math.random() - 0.45) * 0.4,
        riverLevelJitter: (Math.random() - 0.48) * 0.03,
      });
    }, 2500);
  }

  public destroy() {
    if (this.mpuInterval) clearInterval(this.mpuInterval);
    if (this.envInterval) clearInterval(this.envInterval);
    if (this.tremorTimeout) clearTimeout(this.tremorTimeout);
    this.listeners.clear();
  }
}

export const realtimeService = new RealtimeTelemetryService();
