import { backupDataToCloud } from '../services/api';
import { getSavedProjects, getStoredConstants, getStoredPrices } from './storage';

export const CLOUD_SYNC_STORAGE_KEYS = {
  EMAIL: 'omas_cloud_backup_email',
  LAST_SYNCED: 'omas_cloud_last_synced_at',
  AUTO_SYNC_ENABLED: 'omas_cloud_auto_sync_enabled',
};

export interface LocalStorageSnapshot {
  version: string;
  timestamp: string;
  projects: any[];
  constants: any;
  prices: any;
  activeDraft?: any;
  theme?: string;
  metadata?: {
    totalProjects: number;
    currency: string;
    userAgent: string;
  };
}

/**
 * Gathers all current application data from local storage into a snapshot
 */
export function getCompleteLocalSnapshot(): LocalStorageSnapshot {
  const projects = getSavedProjects();
  const constants = getStoredConstants();
  const prices = getStoredPrices();

  let activeDraft = null;
  try {
    const rawDraft = localStorage.getItem('alu_fab_active_draft_v1');
    if (rawDraft) activeDraft = JSON.parse(rawDraft);
  } catch (e) {
    console.warn('Draft parse error:', e);
  }

  const theme = localStorage.getItem('omas_3d_bg_theme') || 'system';

  return {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    projects,
    constants,
    prices,
    activeDraft,
    theme,
    metadata: {
      totalProjects: projects.length,
      currency: prices.currency || 'USD',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    },
  };
}

/**
 * Applies a restored snapshot from MongoDB into browser's local storage
 */
export function applyCloudSnapshotToLocalStorage(snapshot: Record<string, any>): boolean {
  try {
    if (!snapshot) return false;

    if (snapshot.projects && Array.isArray(snapshot.projects)) {
      localStorage.setItem('alu_fab_saved_projects_v1', JSON.stringify(snapshot.projects));
    }

    if (snapshot.constants && typeof snapshot.constants === 'object') {
      localStorage.setItem('alu_fab_constant_measurements_v1', JSON.stringify(snapshot.constants));
    }

    if (snapshot.prices && typeof snapshot.prices === 'object') {
      localStorage.setItem('alu_fab_material_prices_v1', JSON.stringify(snapshot.prices));
    }

    if (snapshot.activeDraft) {
      localStorage.setItem('alu_fab_active_draft_v1', JSON.stringify(snapshot.activeDraft));
    }

    if (snapshot.theme) {
      localStorage.setItem('omas_3d_bg_theme', snapshot.theme);
    }

    // Trigger local storage event for reactive UI updates
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('omas_cloud_data_restored', { detail: snapshot }));

    return true;
  } catch (error) {
    console.error('Failed to apply cloud snapshot to localStorage:', error);
    return false;
  }
}

/**
 * Get stored cloud sync email
 */
export function getSavedSyncEmail(): string {
  try {
    return localStorage.getItem(CLOUD_SYNC_STORAGE_KEYS.EMAIL) || '';
  } catch {
    return '';
  }
}

/**
 * Save sync email to localStorage
 */
export function setSavedSyncEmail(email: string): void {
  try {
    localStorage.setItem(CLOUD_SYNC_STORAGE_KEYS.EMAIL, email.trim().toLowerCase());
  } catch (e) {
    console.error('Error saving sync email:', e);
  }
}

/**
 * Get last synced timestamp
 */
export function getLastSyncedAt(): string | null {
  try {
    return localStorage.getItem(CLOUD_SYNC_STORAGE_KEYS.LAST_SYNCED);
  } catch {
    return null;
  }
}

/**
 * Perform manual or automatic cloud sync
 */
export async function syncLocalDataToCloud(customEmail?: string): Promise<{ success: boolean; message: string; lastSyncedAt: string }> {
  const email = (customEmail || getSavedSyncEmail()).trim().toLowerCase();

  if (!email) {
    throw new Error('Please specify an email address to sync your data to MongoDB cloud storage.');
  }

  setSavedSyncEmail(email);
  const snapshot = getCompleteLocalSnapshot();

  const response = await backupDataToCloud(email, snapshot, {
    projectCount: snapshot.projects.length,
    syncSource: 'frontend_client',
  });

  const syncedTime = response.lastSyncedAt || new Date().toISOString();
  localStorage.setItem(CLOUD_SYNC_STORAGE_KEYS.LAST_SYNCED, syncedTime);

  window.dispatchEvent(new CustomEvent('omas_cloud_synced', { detail: { lastSyncedAt: syncedTime, email } }));

  return {
    success: true,
    message: response.message || 'Data successfully backed up to MongoDB Cloud!',
    lastSyncedAt: syncedTime,
  };
}

/**
 * Check if 24 hours have elapsed since the last backup, and if so, trigger background sync
 */
export async function checkAndRunDailyBackgroundSync(): Promise<boolean> {
  const email = getSavedSyncEmail();
  if (!email) {
    return false; // No email configured yet
  }

  const lastSynced = getLastSyncedAt();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  if (!lastSynced || Date.now() - new Date(lastSynced).getTime() >= TWENTY_FOUR_HOURS_MS) {
    try {
      console.log('🔄 Triggering automated 24-hour daily background cloud backup for:', email);
      await syncLocalDataToCloud(email);
      console.log('✅ Daily background cloud backup completed.');
      return true;
    } catch (e) {
      console.warn('Daily background cloud backup warning:', e);
      return false;
    }
  }

  return false;
}
