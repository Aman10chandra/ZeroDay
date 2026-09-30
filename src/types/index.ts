export type SeverityLevel = 'safe' | 'advisory' | 'warning' | 'critical';

export type UserRole = 'super_admin' | 'district_officer' | 'ward_rep' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  badgeNumber: string;
  role: UserRole;
  station: string;
  email: string;
}

export interface WardRegion {
  id: string;
  code: string;
  name: string;
  district: string;
  basin: string;
  riskLevel: SeverityLevel;
  riskScore: number; // 0 - 100
  rainfall1h: number; // mm/h
  rainfallDelta1h: number; // mm/h
  soilSaturationPct: number; // 0 - 100
  riverLevelM: number;
  riverDangerMarkM: number;
  datumBreachM: number; // positive if over danger mark
  householdsAtRisk: number;
  population: number;
  lat: number;
  lng: number;
  polygon: [number, number][];
  sensorIds: string[];
  weirDischargeRate: number; // m3/s
  sluiceAperturePct: number; // 0 - 100
  lastAssessmentTime: string;
  statusSummary: string;
}

export type SensorType = 'mpu6050' | 'ultrasonic_weir' | 'soil_moisture' | 'sluice_actuator' | 'rain_gauge';

export interface SensorNode {
  id: string;
  code: string;
  name: string;
  type: SensorType;
  wardId: string;
  locationName: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'degraded';
  batteryVoltage: number;
  batteryPct: number;
  rssiDbm: number;
  snrDb: number;
  lastSeen: string;
  ipOrAddress: string;
  firmware: string;
}

export interface MPU6050Kinematics {
  timestamp: string;
  gyro: { x: number; y: number; z: number }; // rad/s
  accel: { x: number; y: number; z: number }; // m/s^2
  tempC: number;
  rotation: { pitch: number; roll: number; yaw: number }; // degrees
  displacementRateMmPerSec: number;
  displacementThresholdExceeded: boolean;
}

export interface AlertNotification {
  id: string;
  code: string;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  severity: SeverityLevel;
  regionId: string;
  regionName: string;
  channels: ('push' | 'sms' | 'ble_mesh')[];
  timestamp: string;
  status: 'active' | 'scheduled' | 'resolved' | 'cancelled';
  deliveryStats: {
    targetNodes: number;
    deliveredNodes: number;
    avgLatencySec: number;
  };
  author: string;
  authorRole: UserRole;
  directiveType: 'EVACUATION' | 'SHELTER_IN_PLACE' | 'STANDBY' | 'CLEARANCE';
}

export interface ShelterPoint {
  id: string;
  code: string;
  name: string;
  wardId: string;
  wardName: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  elevationM: number;
  bedrockStability: 'Stable bedrock' | 'Moderately weathered' | 'Fractured' | 'Unconsolidated';
  contactPhone: string;
  contactOfficer: string;
  status: 'open' | 'staged' | 'full' | 'inaccessible';
  routeNotes: string;
  suppliesDays: number;
}

export interface EvacuationCorridor {
  id: string;
  code: string;
  originWardId: string;
  destinationShelterId: string;
  shelterName: string;
  distanceKm: number;
  walkTimeMinutes: number;
  hazardAvoidanceNotes: string;
  waypoints: [number, number][];
  elevationGainM: number;
  clearanceStatus: 'Clear' | 'Caution' | 'Hazard Blocked';
  lastChecked: string;
}

export interface CommunityFieldReport {
  id: string;
  code: string;
  category: 'rockfall' | 'slope_movement' | 'culvert_blockage' | 'river_surge' | 'road_crack';
  description: string;
  wardId: string;
  wardName: string;
  lat: number;
  lng: number;
  status: 'pending' | 'verified' | 'urgent' | 'dismissed' | 'escalated';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  reporterName: string;
  reporterContact: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
}

export interface GatewayMeshState {
  loraFrequencyMhz: number;
  pdrPct: number;
  packetCount: number;
  activeMeshNodes: number;
  totalMeshNodes: number;
  rangeKm: number;
  cellGridActive: boolean;
  nodes: {
    id: string;
    label: string;
    role: 'gateway' | 'repeater' | 'endpoint';
    lat: number;
    lng: number;
    distanceKm: number;
    batteryPct: number;
    lastPingMs: number;
    hopCount: number;
    parent?: string;
  }[];
}
