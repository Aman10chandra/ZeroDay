export type SeverityLevel = 'normal' | 'safe' | 'advisory' | 'warning' | 'critical';

export type UserRole = 'super_admin' | 'district_officer' | 'ward_rep' | 'viewer' | 'sdrf_operator';

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

export type SensorType = 
  | 'mpu6050' 
  | 'ultrasonic_weir' 
  | 'soil_moisture' 
  | 'sluice_actuator' 
  | 'rain_gauge'
  | 'piezometer_imu'
  | 'ultrasonic_river'
  | 'tiltmeter';

export interface SensorNode {
  id: string;
  code: string;
  name?: string;
  type: SensorType;
  wardId: string;
  wardName?: string;
  locationName?: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'degraded';
  healthStatus?: 'healthy' | 'warning' | 'critical' | 'nominal';
  batteryVoltage?: number;
  batteryPct: number;
  solarCharging?: boolean;
  bleMeshRelayHops?: number;
  loraRssi?: number;
  lastPingTime?: string;
  elevationM?: number;
  calibrationOffset?: { pitch: number; roll: number };
  rssiDbm?: number;
  snrDb?: number;
  lastSeen?: string;
  ipOrAddress?: string;
  firmware?: string;
  telemetry?: any;
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
  mediaUrl?: string;
  confirmationsCount?: number;
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
  gatewayId?: string;
  frequencyBand?: string;
  spreadingFactor?: string;
  txPowerDbm?: number;
  activeBleMeshNodes?: number;
  totalBleMeshNodes?: number;
  meshPacketsPerMinute?: number;
  deadZoneHopsMax?: number;
  effectiveRangeKm?: number;
  activeNodes?: any[];
  loraFrequencyMhz?: number;
  pdrPct?: number;
  packetCount?: number;
  activeMeshNodes?: number;
  totalMeshNodes?: number;
  rangeKm?: number;
  cellGridActive?: boolean;
  nodes?: {
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

export type RescueUrgency = 'critical' | 'urgent' | 'moderate' | 'safe';
export type RescueStatus = 'pending' | 'dispatched' | 'in_progress' | 'rescued' | 'cancelled';
export type RescueHazardType = 'flood_inundation' | 'landslide_trap' | 'building_collapse' | 'medical_trauma' | 'isolated_cut_off';

export interface RescueRequest {
  id: string;
  code: string;
  citizenName: string;
  phone: string;
  alternatePhone?: string;
  wardId: string;
  wardName: string;
  district: string;
  addressText: string;
  lat: number;
  lng: number;
  peopleCount: number;
  vulnerableDetails?: string;
  urgency: RescueUrgency;
  status: RescueStatus;
  situation: string;
  hazardType: RescueHazardType;
  timestamp: string;
  batteryPct?: number;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedUnit?: string;
  notes?: string;
}

export interface StateOfficer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  department: 'SDRF' | 'NDRF' | 'DDMA' | 'ITBP' | 'State Fire & Rescue';
  phone: string;
  email: string;
  assignedAreaId?: string;
  assignedAreaName?: string;
  status: 'on_duty' | 'deployed' | 'standby';
  unitName: string;
  personnelCount: number;
  equipment: string[];
}

export interface StateSection {
  id: string;
  code: string;
  name: string;
  district: string;
  riverBasin: string;
  riskLevel: SeverityLevel;
  riskScore: number;
  activeRescueCount: number;
  totalPopulation: number;
  evacuatedCount: number;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerRank?: string;
  assignedUnit?: string;
  officerPhone?: string;
  lat: number;
  lng: number;
  weatherCondition: string;
  roadAccessStatus: 'Open' | 'Caution' | 'Blocked / Cut Off';
  bridgeStatus: 'Intact' | 'Submerged' | 'Damaged';
  rainfallLast3hMm: number;
}

