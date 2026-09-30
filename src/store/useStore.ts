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
  UserRole,
  RescueRequest,
  RescueStatus,
  StateOfficer,
  StateSection
} from '../types';
import { 
  SEED_WARDS, 
  SEED_SENSORS, 
  SEED_SHELTERS, 
  SEED_ALERTS, 
  SEED_GATEWAY_MESH 
} from '../services/seed';
import { 
  INITIAL_REPORTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_EVACUATION_ROUTES,
  INITIAL_RESCUE_REQUESTS,
  INITIAL_OFFICERS,
  INITIAL_STATE_SECTIONS
} from '../services/mockData';
import { useOverlay } from './useOverlay';
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
  | 'rescue_requests'
  | 'super_admin'
  | 'settings';

interface StoreState {
  // Navigation & Shell
  activeScreen: ScreenId;
  selectedWardId: string;
  selectedSensorId: string;

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

  // Rescue Requests & State Command
  rescueRequests: RescueRequest[];
  stateOfficers: StateOfficer[];
  stateSections: StateSection[];
  selectedRescueId: string | null;
  selectedSectionId: string | null;

  isRailCollapsed: boolean;
  isRailPinned: boolean;
  toggleRailPinned: () => void;
  commandPaletteOpen: boolean;

  rightDrawer: {
    isOpen: boolean;
    type: 'ward' | 'sensor' | 'model' | 'report' | null;
    data: any;
  };

  // Actions
  navigateScreen: (screen: ScreenId) => void;
  selectWard: (wardId: string) => void;
  selectSensor: (sensorId: string) => void;
  selectRescueRequest: (id: string | null) => void;
  selectStateSection: (id: string | null) => void;
  toggleRail: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openRightDrawer: (type: 'ward' | 'sensor' | 'model' | 'report', data: any) => void;
  closeRightDrawer: () => void;

  setRole: (role: UserRole) => void;
  toggleOpsMode: () => void;
  setOpsMode: (isDark: boolean) => void;
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

  // Rescue & State Command Actions
  addRescueRequest: (req: Partial<RescueRequest>) => Promise<RescueRequest>;
  updateRescueStatus: (id: string, status: RescueStatus, notes?: string) => Promise<void>;
  assignRescueOfficer: (requestId: string, officerId: string) => Promise<void>;
  assignSectionOfficer: (sectionId: string, officerId: string) => Promise<void>;
  addOfficer: (officer: Omit<StateOfficer, 'id' | 'badgeNumber'>) => Promise<StateOfficer>;
  updateOfficerStatus: (officerId: string, status: 'on_duty' | 'deployed' | 'standby') => Promise<void>;

  addAuditLog: (action: string, target: string, details: string) => Promise<void>;
  refreshStorageData: () => Promise<void>;
}

let lastNavTime = 0;

const loadInitialRescueRequests = (): RescueRequest[] => {
  if (typeof window === 'undefined') return INITIAL_RESCUE_REQUESTS;
  try {
    const raw = localStorage.getItem('zd_rescue_requests');
    return raw ? JSON.parse(raw) : INITIAL_RESCUE_REQUESTS;
  } catch {
    return INITIAL_RESCUE_REQUESTS;
  }
};

const loadInitialOfficers = (): StateOfficer[] => {
  if (typeof window === 'undefined') return INITIAL_OFFICERS;
  try {
    const raw = localStorage.getItem('zd_state_officers');
    return raw ? JSON.parse(raw) : INITIAL_OFFICERS;
  } catch {
    return INITIAL_OFFICERS;
  }
};

const loadInitialStateSections = (): StateSection[] => {
  if (typeof window === 'undefined') return INITIAL_STATE_SECTIONS;
  try {
    const raw = localStorage.getItem('zd_state_sections');
    return raw ? JSON.parse(raw) : INITIAL_STATE_SECTIONS;
  } catch {
    return INITIAL_STATE_SECTIONS;
  }
};

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
  selectedWardId: null,
  selectedSensorId: 'sn-014',
  selectedRescueId: null,
  selectedSectionId: null,
  selectRescueRequest: (id) => set({ selectedRescueId: id }),
  selectStateSection: (id) => set({ selectedSectionId: id }),
  isRailCollapsed: false,
  isRailPinned: typeof window !== 'undefined' ? localStorage.getItem('zd_rail_pinned') === 'true' : false,
  toggleRailPinned: () => set(state => {
    const next = !state.isRailPinned;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_rail_pinned', String(next));
    }
    return { isRailPinned: next };
  }),
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

  // Light mode by default (false), unless explicitly saved as 'dark'
  isOpsMode: typeof window !== 'undefined' ? localStorage.getItem('zd_theme') === 'dark' : false,
  language: 'en',
  sirenActive: false,
  sirenVolume: 0.5,
  strobeEnabled: true,

  wards: SEED_WARDS,
  sensors: SEED_SENSORS,
  shelters: SEED_SHELTERS,
  alerts: SEED_ALERTS,
  reports: INITIAL_REPORTS,
  auditLogs: INITIAL_AUDIT_LOGS,
  gatewayMesh: SEED_GATEWAY_MESH,
  evacuationRoutes: INITIAL_EVACUATION_ROUTES,
  rescueRequests: loadInitialRescueRequests(),
  stateOfficers: loadInitialOfficers(),
  stateSections: loadInitialStateSections(),

  navigateScreen: (screen) => {
    const now = Date.now();
    if (now - lastNavTime < 250) return;
    lastNavTime = now;

    useOverlay.getState().resetOverlays();

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('screen', screen);
      window.history.pushState({}, '', url.toString());
    }

    set({ 
      activeScreen: screen,
      rightDrawer: { isOpen: false, type: null, data: null }
    });
  },

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('zd_theme', next ? 'dark' : 'light');
      }
      return { isOpsMode: next };
    });
  },

  setOpsMode: (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_theme', isDark ? 'dark' : 'light');
    }
    set({ isOpsMode: isDark });
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

  addRescueRequest: async (req) => {
    const id = `req-${Date.now()}`;
    const code = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
    const ward = get().wards.find(w => w.id === req.wardId);
    const newReq: RescueRequest = {
      id,
      code,
      citizenName: req.citizenName || 'Citizen in Distress',
      phone: req.phone || '+91-98000-00000',
      alternatePhone: req.alternatePhone,
      wardId: req.wardId || 'ward-rampur-4b',
      wardName: ward?.name || req.wardName || 'Rampur Basin 4B',
      district: req.district || 'Pauri Garhwal',
      addressText: req.addressText || 'Near Khoh river corridor',
      lat: req.lat || 29.7468,
      lng: req.lng || 78.5292,
      peopleCount: req.peopleCount || 1,
      vulnerableDetails: req.vulnerableDetails,
      urgency: req.urgency || 'critical',
      status: 'pending',
      situation: req.situation || 'Flash flood water entering structure. Immediate rescue required.',
      hazardType: req.hazardType || 'flood_inundation',
      timestamp: 'Just now',
      batteryPct: req.batteryPct ?? 85,
      notes: req.notes,
    };

    const nextRequests = [newReq, ...get().rescueRequests];
    set({ rescueRequests: nextRequests });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_rescue_requests', JSON.stringify(nextRequests));
    }

    set(state => ({
      stateSections: state.stateSections.map(sec => 
        (sec.name.includes(newReq.wardName) || sec.id === newReq.wardId || sec.district === newReq.district)
          ? { ...sec, activeRescueCount: sec.activeRescueCount + 1 }
          : sec
      )
    }));

    await get().addAuditLog(
      'CITIZEN_RESCUE_REQUEST_RAISED',
      newReq.code,
      `SOS signal registered from ${newReq.citizenName} in ${newReq.wardName}. ${newReq.peopleCount} souls reported.`
    );
    sirenService.playChime();
    return newReq;
  },

  updateRescueStatus: async (id, status, notes) => {
    const target = get().rescueRequests.find(r => r.id === id);
    if (!target) return;
    const updated: RescueRequest = {
      ...target,
      status,
      notes: notes ? `${target.notes ? target.notes + ' | ' : ''}${notes}` : target.notes,
    };
    const nextRequests = get().rescueRequests.map(r => r.id === id ? updated : r);
    set({ rescueRequests: nextRequests });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_rescue_requests', JSON.stringify(nextRequests));
    }

    if (status === 'rescued') {
      set(state => ({
        stateSections: state.stateSections.map(sec => 
          (sec.name.includes(target.wardName) || sec.district === target.district) && sec.activeRescueCount > 0
            ? { ...sec, activeRescueCount: Math.max(0, sec.activeRescueCount - 1), evacuatedCount: sec.evacuatedCount + target.peopleCount }
            : sec
        )
      }));
    }

    await get().addAuditLog(
      'RESCUE_STATUS_UPDATED',
      target.code,
      `Rescue request status changed to [${status.toUpperCase()}] for ${target.citizenName}.`
    );
  },

  assignRescueOfficer: async (requestId, officerId) => {
    const request = get().rescueRequests.find(r => r.id === requestId);
    const officer = get().stateOfficers.find(o => o.id === officerId);
    if (!request || !officer) return;

    const updatedRequest: RescueRequest = {
      ...request,
      assignedOfficerId: officer.id,
      assignedOfficerName: `${officer.name} (${officer.rank})`,
      assignedUnit: officer.unitName,
      status: request.status === 'pending' ? 'dispatched' : request.status,
    };

    const nextRequests = get().rescueRequests.map(r => r.id === requestId ? updatedRequest : r);
    const nextOfficers = get().stateOfficers.map(o => o.id === officerId ? { ...o, status: 'deployed' as const } : o);

    set({
      rescueRequests: nextRequests,
      stateOfficers: nextOfficers,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_rescue_requests', JSON.stringify(nextRequests));
      localStorage.setItem('zd_state_officers', JSON.stringify(nextOfficers));
    }

    await get().addAuditLog(
      'RESCUE_TEAM_DISPATCHED',
      request.code,
      `Officer ${officer.name} (${officer.unitName}) dispatched to citizen ${request.citizenName} at ${request.wardName}.`
    );

    get().showToast({
      type: 'success',
      title: 'Rescue Team Dispatched',
      message: `${officer.name} (${officer.unitName}) assigned to ${request.citizenName} (${request.code}).`,
    });
  },

  assignSectionOfficer: async (sectionId, officerId) => {
    const section = get().stateSections.find(s => s.id === sectionId);
    const officer = get().stateOfficers.find(o => o.id === officerId);
    if (!section || !officer) return;

    const updatedSection: StateSection = {
      ...section,
      assignedOfficerId: officer.id,
      assignedOfficerName: officer.name,
      assignedOfficerRank: officer.rank,
      assignedUnit: officer.unitName,
      officerPhone: officer.phone,
    };

    const updatedOfficer: StateOfficer = {
      ...officer,
      assignedAreaId: section.id,
      assignedAreaName: section.name,
      status: 'deployed',
    };

    const nextSections = get().stateSections.map(s => s.id === sectionId ? updatedSection : s);
    const nextOfficers = get().stateOfficers.map(o => o.id === officerId ? updatedOfficer : o);

    set({
      stateSections: nextSections,
      stateOfficers: nextOfficers,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_state_sections', JSON.stringify(nextSections));
      localStorage.setItem('zd_state_officers', JSON.stringify(nextOfficers));
    }

    await get().addAuditLog(
      'OFFICER_ASSIGNED_TO_SECTION',
      section.code,
      `Super Admin assigned ${officer.name} (${officer.rank}, ${officer.department}) to command sector "${section.name}".`
    );

    get().showToast({
      type: 'success',
      title: 'Command Area Assigned',
      message: `${officer.name} (${officer.rank}) assigned to ${section.name}.`,
    });
  },

  addOfficer: async (officerData) => {
    const id = `off-${Date.now()}`;
    const badgeNumber = `${officerData.department}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOfficer: StateOfficer = {
      ...officerData,
      id,
      badgeNumber,
      status: officerData.status || 'standby',
      personnelCount: officerData.personnelCount || 10,
      equipment: officerData.equipment || ['Standard Rescue Kit', 'Satellite Radios'],
    };

    const nextOfficers = [...get().stateOfficers, newOfficer];
    set({ stateOfficers: nextOfficers });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_state_officers', JSON.stringify(nextOfficers));
    }

    await get().addAuditLog(
      'OFFICER_COMMISSIONED',
      newOfficer.badgeNumber,
      `Registered officer ${newOfficer.name} (${newOfficer.rank}) in ${newOfficer.department}.`
    );
    return newOfficer;
  },

  updateOfficerStatus: async (officerId, status) => {
    const nextOfficers = get().stateOfficers.map(o => o.id === officerId ? { ...o, status } : o);
    set({ stateOfficers: nextOfficers });
    if (typeof window !== 'undefined') {
      localStorage.setItem('zd_state_officers', JSON.stringify(nextOfficers));
    }
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
      wards: wards.length ? wards : SEED_WARDS,
      shelters: shelters.length ? shelters : SEED_SHELTERS,
      alerts: alerts.length ? alerts : SEED_ALERTS,
      reports: reports.length ? reports : INITIAL_REPORTS,
      auditLogs: auditLogs.length ? auditLogs : INITIAL_AUDIT_LOGS,
    });
  },
}));
