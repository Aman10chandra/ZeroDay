import { openDB, IDBPDatabase } from 'idb';
import { 
  ShelterPoint, 
  AlertNotification, 
  CommunityFieldReport, 
  AuditLogEntry, 
  WardRegion 
} from '../types';
import { 
  SEED_WARDS, 
  SEED_SHELTERS, 
  SEED_ALERTS 
} from './seed';
import { 
  INITIAL_REPORTS, 
  INITIAL_AUDIT_LOGS 
} from './mockData';

const DB_NAME = 'ZeroDayOpsDB_v3';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('wards')) {
          db.createObjectStore('wards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('shelters')) {
          db.createObjectStore('shelters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('alerts')) {
          db.createObjectStore('alerts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audit_logs')) {
          db.createObjectStore('audit_logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export async function initStorage() {
  try {
    const db = await getDB();
    
    // Seed wards if empty
    const countWards = await db.count('wards');
    if (countWards === 0) {
      const tx = db.transaction('wards', 'readwrite');
      for (const w of SEED_WARDS) {
        await tx.store.put(w);
      }
      await tx.done;
    }

    // Seed shelters if empty
    const countShelters = await db.count('shelters');
    if (countShelters === 0) {
      const tx = db.transaction('shelters', 'readwrite');
      for (const s of SEED_SHELTERS) {
        await tx.store.put(s);
      }
      await tx.done;
    }

    // Seed alerts if empty
    const countAlerts = await db.count('alerts');
    if (countAlerts === 0) {
      const tx = db.transaction('alerts', 'readwrite');
      for (const a of SEED_ALERTS) {
        await tx.store.put(a);
      }
      await tx.done;
    }

    // Seed reports if empty
    const countReports = await db.count('reports');
    if (countReports === 0) {
      const tx = db.transaction('reports', 'readwrite');
      for (const r of INITIAL_REPORTS) {
        await tx.store.put(r);
      }
      await tx.done;
    }

    // Seed audit logs if empty
    const countAudit = await db.count('audit_logs');
    if (countAudit === 0) {
      const tx = db.transaction('audit_logs', 'readwrite');
      for (const l of INITIAL_AUDIT_LOGS) {
        await tx.store.put(l);
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('[Storage] IndexedDB initialization warning, fallback memory used:', err);
  }
}

// Shelters
export async function getStoredShelters(): Promise<ShelterPoint[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('shelters');
    return all.length ? all : SEED_SHELTERS;
  } catch {
    return SEED_SHELTERS;
  }
}

export async function saveStoredShelter(shelter: ShelterPoint): Promise<void> {
  try {
    const db = await getDB();
    await db.put('shelters', shelter);
  } catch (e) {
    console.warn('[Storage] Failed to put shelter', e);
  }
}

export async function deleteStoredShelter(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('shelters', id);
  } catch (e) {
    console.warn('[Storage] Failed to delete shelter', e);
  }
}

// Alerts
export async function getStoredAlerts(): Promise<AlertNotification[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('alerts');
    return all.length ? all : SEED_ALERTS;
  } catch {
    return SEED_ALERTS;
  }
}

export async function saveStoredAlert(alert: AlertNotification): Promise<void> {
  try {
    const db = await getDB();
    await db.put('alerts', alert);
  } catch (e) {
    console.warn('[Storage] Failed to put alert', e);
  }
}

// Reports
export async function getStoredReports(): Promise<CommunityFieldReport[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('reports');
    return all.length ? all : INITIAL_REPORTS;
  } catch {
    return INITIAL_REPORTS;
  }
}

export async function saveStoredReport(report: CommunityFieldReport): Promise<void> {
  try {
    const db = await getDB();
    await db.put('reports', report);
  } catch (e) {
    console.warn('[Storage] Failed to put report', e);
  }
}

// Audit Logs
export async function getStoredAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('audit_logs');
    return all.length ? all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)) : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export async function appendStoredAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDB();
    await db.put('audit_logs', entry);
  } catch (e) {
    console.warn('[Storage] Failed to append audit log', e);
  }
}

// Wards
export async function getStoredWards(): Promise<WardRegion[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('wards');
    return all.length ? all : SEED_WARDS;
  } catch {
    return SEED_WARDS;
  }
}

export async function saveStoredWard(ward: WardRegion): Promise<void> {
  try {
    const db = await getDB();
    await db.put('wards', ward);
  } catch (e) {
    console.warn('[Storage] Failed to save ward', e);
  }
}
