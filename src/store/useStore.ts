import { create } from 'zustand';
import { 
  WardRegion, 
  SensorNode, 
  ShelterPoint, 
  AlertNotification, 
  CommunityFieldReport, 
  AuditLogEntry, 
  GatewayMeshState, 
  EvacuationCorridor,
  UserProfile, 
  UserRole 
} from '../types';
import { 
  INITIAL_WARDS, 
  INITIAL_SENSORS, 
  INITIAL_SHELTERS, 
  INITIAL_ALERTS, 
  INITIAL_REPORTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_GATEWAY_MESH, 
  INITIAL_EVACUATION_ROUTES 
} from '../services/mockData';
import { 
  initStorage, 
  getStoredShelters, 
  saveStoredShelter, 
  deleteStoredShelter, 
  getStoredAlerts, 
  saveStoredAlert, 
  getStoredReports, 
  saveStoredReport, 
  getStoredAuditLogs, 
  appendStoredAuditLog, 
  getStoredWards, 
  saveStoredWard 
} from '../services/storage';
import { sirenService } from '../services/audio';

export type ScreenId = 
  | 'overview' 
  | 'region_detail' 
  | 'sensors_mpu' 
  | 'risk_engine' 
  | 'gateway_mesh' 
  | 'evacuation' 
  | 'alerts' 
  | 'reports' 
  | 'settings';

interface StoreState {
  // Navigation & Shell
  activeScreen: ScreenId;
  selectedWardId: string;
  selectedSensorId: string;
  isRailCollapsed: boolean;
  commandPaletteOpen: boolean;

  // Drawer
  rightDrawer: {
    isOpen: boolean;
    type: 'ward' | 'sensor' | 'model' | 'report' | null;
    data: any;
  };

  // Toasts
  toasts: Array<{
    id: string;
    type: 'success' | 'warning' | 'info' | 'critical';
    title: string;
    message?: string;
    onUndo?: () => void;
    undoLabel?: string;
  }>;
  showToast: (toast: {
    type: 'success' | 'warning' | 'info' | 'critical';
    title: string;
    message?: string;
    onUndo?: () => void;
    undoLabel?: string;
  }) => void;
  dismissToast: (id: string) => void;

  // Auth / RBAC
  currentUser: UserProfile;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;

  // System & Environment
  isOpsMode: boolean; // Dark mode (true) vs Light (false)
  language: 'en' | 'hi';
  sirenActive: boolean;
  sirenVolume: number;
  strobeEnabled: boolean;

  // Domain data
  wards: WardRegion[];
  sensors: SensorNode[];
  shelters: ShelterPoint[];
  alerts: AlertNotification[];
  reports: CommunityFieldReport[];
  auditLogs: AuditLogEntry[];
  gatewayMesh: GatewayMeshState;
  evacuationRoutes: EvacuationCorridor[];

  // Actions
  navigateScreen: (screen: ScreenId) => void;
  selectWard: (wardId: string) => void;
  selectSensor: (sensorId: string) => void;
  toggleRail: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openRightDrawer: (type: 'ward' | 'sensor' | 'model' | 'report', data: any) => void;
  closeRightDrawer: () => void;

  setRole: (role: UserRole) => void;
  toggleOpsMode: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleSiren: () => void;
  setSirenVolume: (vol: number) => void;

  updateSluiceAperture: (wardId: string, aperture: number) => Promise<void>;
  addShelter: (shelter: Omit<ShelterPoint, 'id' | 'code'>) => Promise<ShelterPoint>;
  updateShelter: (shelter: ShelterPoint) => Promise<void>;
  deleteShelter: (id: string) => Promise<void>;
  
  createAlert: (alertData: Partial<AlertNotification>) => Promise<AlertNotification>;
  resolveAlert: (id: string) => Promise<void>;

  addReport: (reportData: Partial<CommunityFieldReport>) => Promise<CommunityFieldReport>;
  verifyReport: (id: string, notes?: string) => Promise<void>;
  markReportUrgent: (id: string) => Promise<void>;
  escalateReport: (id: string) => Promise<void>;
  dismissReport: (id: string) => Promise<void>;

  addAuditLog: (action: string, target: string, details: string) => Promise<void>;
  refreshStorageData: () => Promise<void>;
}

const getInitialParams = () => {
  if (typeof window === 'undefined') return { screen: 'overview' as ScreenId, auth: true };
  const params = new URLSearchParams(window.location.search);
  const screen = (params.get('screen') as ScreenId) || 'overview';
  const auth = params.get('auth') === 'false' ? false : true;
  return { screen, auth };
};

const initialConfig = getInitialParams();

export const useStore = create<StoreState>((set, get) => ({
  activeScreen: initialConfig.screen,
  selectedWardId: 'ward-rampur-4b',
  selectedSensorId: 'sn-014',
  isRailCollapsed: false,
  commandPaletteOpen: false,

  rightDrawer: {
    isOpen: false,
    type: null,
    data: null,
  },

  toasts: [],
  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { ...toast, id };
    set(state => ({ toasts: [...state.toasts, newToast] }));
    if (toast.type !== 'critical') {
      setTimeout(() => {
        get().dismissToast(id);
      }, 5000);
    }
  },
  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  currentUser: {
    id: 'usr-01',
    name: 'M. Joshi',
    badgeNumber: 'SDRF-UK-8842',
    role: 'super_admin',
    station: 'Kotdwar District Emergency Operations Centre (DEOC)',
    email: 'm.joshi@sdrf.uk.gov.in',
  },
  isAuthenticated: initialConfig.auth,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),

  isOpsMode: true,
  language: 'en',
  sirenActive: false,
  sirenVolume: 0.5,
  strobeEnabled: true,

  wards: INITIAL_WARDS,
  sensors: INITIAL_SENSORS,
  shelters: INITIAL_SHELTERS,
  alerts: INITIAL_ALERTS,
  reports: INITIAL_REPORTS,
  auditLogs: INITIAL_AUDIT_LOGS,
  gatewayMesh: INITIAL_GATEWAY_MESH,
  evacuationRoutes: INITIAL_EVACUATION_ROUTES,

  navigateScreen: (screen) => set({ activeScreen: screen }),

  selectWard: (wardId) => {
    set({ selectedWardId: wardId });
    const ward = get().wards.find(w => w.id === wardId);
    if (ward) {
      set({
        rightDrawer: {
          isOpen: true,
          type: 'ward',
          data: ward,
        },
      });
    }
  },

  selectSensor: (sensorId) => {
    set({ selectedSensorId: sensorId, activeScreen: 'sensors_mpu' });
  },

  toggleRail: () => set(state => ({ isRailCollapsed: !state.isRailCollapsed })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  openRightDrawer: (type, data) => set({
    rightDrawer: {
      isOpen: true,
      type,
      data,
    },
  }),

  closeRightDrawer: () => set({
    rightDrawer: {
      isOpen: false,
      type: null,
      data: null,
    },
  }),

  setRole: (role) => {
    set(state => ({
      currentUser: { ...state.currentUser, role },
    }));
    get().addAuditLog('ROLE_SWITCH', 'AUTH', `Role switched to ${role}`);
  },

  toggleOpsMode: () => {
    set(state => {
      const next = !state.isOpsMode;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isOpsMode: next };
    });
  },

  setLanguage: (lang) => set({ language: lang }),

  toggleSiren: () => {
    const nextActive = sirenService.toggle();
    set({ sirenActive: nextActive });
    if (nextActive) {
      get().addAuditLog('SIREN_TEST_ACTIVATED', 'AUDIO_STATION', 'Emergency siren manual sound cycle initiated');
    } else {
      get().addAuditLog('SIREN_TEST_SILENCED', 'AUDIO_STATION', 'Emergency siren stopped');
    }
  },

  setSirenVolume: (vol) => {
    sirenService.setVolume(vol);
    set({ sirenVolume: vol });
  },

  updateSluiceAperture: async (wardId, aperture) => {
    const ward = get().wards.find(w => w.id === wardId);
    if (!ward) return;

    // Recalculate discharge
    const newDischarge = Math.round(aperture * 19.07);
    const updatedWard: WardRegion = {
      ...ward,
      sluiceAperturePct: aperture,
      weirDischargeRate: newDischarge,
    };

    set(state => ({
      wards: state.wards.map(w => w.id === wardId ? updatedWard : w),
    }));

    await saveStoredWard(updatedWard);
    await get().addAuditLog(
      'SLUICE_APERTURE_OVERRIDE',
      `ward:${ward.code}`,
      `Aperture modified to ${aperture}%. Discharge recalculated to ${newDischarge} m³/s.`
    );
  },

  addShelter: async (shelterData) => {
    const id = `sh-${Date.now()}`;
    const code = `SH-${(get().shelters.length + 1).toString().padStart(2, '0')}`;
    const newShelter: ShelterPoint = {
      ...shelterData,
      id,
      code,
    };

    set(state => ({
      shelters: [...state.shelters, newShelter],
    }));

    await saveStoredShelter(newShelter);
    await get().addAuditLog(
      'SHELTER_CREATED',
      newShelter.code,
      `Registered haven "${newShelter.name}" with capacity ${newShelter.capacity} at elevation +${newShelter.elevationM}m MSL.`
    );
    return newShelter;
  },

  updateShelter: async (shelter) => {
    set(state => ({
      shelters: state.shelters.map(s => s.id === shelter.id ? shelter : s),
    }));
    await saveStoredShelter(shelter);
    await get().addAuditLog('SHELTER_UPDATED', shelter.code, `Modified shelter specs for "${shelter.name}".`);
  },

  deleteShelter: async (id) => {
    const target = get().shelters.find(s => s.id === id);
    set(state => ({
      shelters: state.shelters.filter(s => s.id !== id),
    }));
    await deleteStoredShelter(id);
    if (target) {
      await get().addAuditLog('SHELTER_DELETED', target.code, `Removed haven point "${target.name}".`);
    }
  },

  createAlert: async (alertData) => {
    const id = `alt-${Date.now()}`;
    const code = `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const ward = get().wards.find(w => w.id === alertData.regionId);
    
    const newAlert: AlertNotification = {
      id,
      code,
      title: alertData.title || 'OPERATIONAL ALERT',
      titleHi: alertData.titleHi || 'संचालन चेतावनी',
      body: alertData.body || 'Advisory issued for sector catchment.',
      bodyHi: alertData.bodyHi || 'क्षेत्र के लिए निर्देश जारी।',
      severity: alertData.severity || 'warning',
      regionId: alertData.regionId || 'ward-rampur-4b',
      regionName: ward?.name || 'Rampur Basin 4B',
      channels: alertData.channels || ['push', 'sms'],
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
      status: 'active',
      deliveryStats: {
        targetNodes: ward?.householdsAtRisk || 1240,
        deliveredNodes: Math.round((ward?.householdsAtRisk || 1240) * 0.98),
        avgLatencySec: 1.8,
      },
      author: get().currentUser.name,
      authorRole: get().currentUser.role,
      directiveType: alertData.directiveType || 'EVACUATION',
    };

    set(state => ({
      alerts: [newAlert, ...state.alerts],
    }));

    await saveStoredAlert(newAlert);
    await get().addAuditLog(
      'ALERT_DISPATCHED',
      newAlert.code,
      `Dispatched [${newAlert.severity.toUpperCase()}] directive to ${newAlert.regionName} via ${newAlert.channels.join(', ')}.`
    );

    sirenService.playChime();
    return newAlert;
  },

  resolveAlert: async (id) => {
    const alert = get().alerts.find(a => a.id === id);
    if (!alert) return;

    const updated: AlertNotification = { ...alert, status: 'resolved' };
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? updated : a),
    }));

    await saveStoredAlert(updated);
    await get().addAuditLog('ALERT_RESOLVED', alert.code, `De-escalated and closed directive ${alert.code}.`);
  },

  addReport: async (reportData) => {
    const id = `rep-${Date.now()}`;
    const code = `RPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ward = get().wards.find(w => w.id === reportData.wardId);

    const newReport: CommunityFieldReport = {
      id,
      code,
      category: reportData.category || 'slope_movement',
      description: reportData.description || 'Observed runoff anomaly.',
      wardId: reportData.wardId || 'ward-rampur-4b',
      wardName: ward?.name || 'Rampur Basin 4B',
      lat: reportData.lat || 29.7468,
      lng: reportData.lng || 78.5292,
      status: 'pending',
      urgency: reportData.urgency || 'medium',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      reporterName: reportData.reporterName || 'Citizen Observer',
      reporterContact: reportData.reporterContact || '+91-90000-00000',
    };

    set(state => ({
      reports: [newReport, ...state.reports],
    }));

    await saveStoredReport(newReport);
    await get().addAuditLog('REPORT_SUBMITTED', newReport.code, `Field observation filed: ${newReport.category} in ${newReport.wardName}`);
    return newReport;
  },

  verifyReport: async (id, notes) => {
    const rep = get().reports.find(r => r.id === id);
    if (!rep) return;
    const updated: CommunityFieldReport = {
      ...rep,
      status: 'verified',
      verifiedBy: `${get().currentUser.name} (${get().currentUser.role})`,
      verificationNotes: notes || 'Verified with local sensor telemetry correlation.',
    };

    set(state => ({
      reports: state.reports.map(r => r.id === id ? updated : r),
    }));

    await saveStoredReport(updated);
    await get().addAuditLog('REPORT_VERIFIED', rep.code, `Observation confirmed by operator.`);
  },

  markReportUrgent: async (id) => {
    const rep = get().reports.find(r => r.id === id);
    if (!rep) return;
    const updated: CommunityFieldReport = { ...rep, urgency: 'critical', status: 'urgent' };
    set(state => ({
      reports: state.reports.map(r => r.id === id ? updated : r),
    }));
    await saveStoredReport(updated);
    await get().addAuditLog('REPORT_PRIORITIZED', rep.code, `Escalated report urgency to CRITICAL.`);
  },

  escalateReport: async (id) => {
    const rep = get().reports.find(r => r.id === id);
    if (!rep) return;
    const updated: CommunityFieldReport = { ...rep, status: 'escalated' };
    set(state => ({
      reports: state.reports.map(r => r.id === id ? updated : r),
    }));
    await saveStoredReport(updated);

    // Auto trigger alert creation modal or action
    await get().addAuditLog('REPORT_ESCALATED_TO_ALERT', rep.code, `Triggered emergency alert protocol from community observation.`);
  },

  dismissReport: async (id) => {
    const rep = get().reports.find(r => r.id === id);
    if (!rep) return;
    const updated: CommunityFieldReport = { ...rep, status: 'dismissed' };
    set(state => ({
      reports: state.reports.map(r => r.id === id ? updated : r),
    }));
    await saveStoredReport(updated);
    await get().addAuditLog('REPORT_DISMISSED', rep.code, `Observation dismissed as false alarm or duplicate.`);
  },

  addAuditLog: async (action, target, details) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
      actor: get().currentUser.name,
      role: get().currentUser.role,
      action,
      target,
      details,
      ipAddress: '10.14.2.45',
    };

    set(state => ({
      auditLogs: [entry, ...state.auditLogs],
    }));

    await appendStoredAuditLog(entry);
  },

  refreshStorageData: async () => {
    await initStorage();
    const [wards, shelters, alerts, reports, auditLogs] = await Promise.all([
      getStoredWards(),
      getStoredShelters(),
      getStoredAlerts(),
      getStoredReports(),
      getStoredAuditLogs(),
    ]);

    set({
      wards: wards.length ? wards : INITIAL_WARDS,
      shelters: shelters.length ? shelters : INITIAL_SHELTERS,
      alerts: alerts.length ? alerts : INITIAL_ALERTS,
      reports: reports.length ? reports : INITIAL_REPORTS,
      auditLogs: auditLogs.length ? auditLogs : INITIAL_AUDIT_LOGS,
    });
  },
}));
