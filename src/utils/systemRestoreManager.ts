import { SystemRestorePoint, ConstantProfilesConfig, MaterialPricesConfig } from '../types';
export type { SystemRestorePoint };
import { DEFAULT_FABRICATION_CONSTANTS } from '../constants/defaultConstants';
import { DEFAULT_MATERIAL_PRICES } from '../constants/defaultPrices';
import {
  getStoredConstants,
  saveStoredConstants,
  getStoredPrices,
  saveStoredPrices,
} from './storage';
import {
  getStoredCompanyProfile,
  saveStoredCompanyProfile,
  DEFAULT_COMPANY_PROFILE,
  getStoredPricingRules,
  saveStoredPricingRules,
  DEFAULT_CLIENT_PRICING_RULES,
} from './workPricingCalculator';

const STORAGE_KEY_RESTORE_POINTS = 'alu_fab_system_restore_points_v1';
const STORAGE_KEY_ADMIN_BASELINE = 'alu_fab_admin_baseline_v1';
const STORAGE_KEY_CUSTOM_NAMES = 'alu_fab_custom_material_names_v1';

export function formatTimestampToReadable(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoDate;
  }
}

export function getRestorePoints(): SystemRestorePoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESTORE_POINTS);
    if (!raw) {
      // Seed with initial baseline point if empty
      const initialPoint: SystemRestorePoint = {
        id: 'initial-system-baseline',
        timestamp: new Date().toISOString(),
        formattedDate: formatTimestampToReadable(new Date().toISOString()),
        title: 'Initial System Baseline (Factory Defaults)',
        category: 'full',
        description: 'Original baseline configurations set upon system deployment.',
        snapshot: {
          constants: DEFAULT_FABRICATION_CONSTANTS,
          materialPrices: DEFAULT_MATERIAL_PRICES,
          companyProfile: DEFAULT_COMPANY_PROFILE,
          pricingRules: DEFAULT_CLIENT_PRICING_RULES,
          customNames: {},
        },
      };
      localStorage.setItem(STORAGE_KEY_RESTORE_POINTS, JSON.stringify([initialPoint]));
      return [initialPoint];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load system restore points:', e);
    return [];
  }
}

export function createRestorePoint(
  title: string,
  category: SystemRestorePoint['category'],
  description: string,
  partialSnapshot?: Partial<SystemRestorePoint['snapshot']>
): SystemRestorePoint {
  try {
    const nowIso = new Date().toISOString();

    // Collect complete snapshot
    let customNames: Record<string, string> = {};
    try {
      const namesRaw = localStorage.getItem(STORAGE_KEY_CUSTOM_NAMES);
      if (namesRaw) customNames = JSON.parse(namesRaw);
    } catch {}

    const fullSnapshot = {
      constants: partialSnapshot?.constants || getStoredConstants(),
      materialPrices: partialSnapshot?.materialPrices || getStoredPrices(),
      companyProfile: partialSnapshot?.companyProfile || getStoredCompanyProfile(),
      pricingRules: partialSnapshot?.pricingRules || getStoredPricingRules(),
      customNames: partialSnapshot?.customNames !== undefined ? partialSnapshot.customNames : customNames,
    };

    const newPoint: SystemRestorePoint = {
      id: `restore-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: nowIso,
      formattedDate: formatTimestampToReadable(nowIso),
      title,
      category,
      description,
      snapshot: fullSnapshot,
    };

    const existing = getRestorePoints();
    // Keep up to 35 most recent update points
    const updatedList = [newPoint, ...existing].slice(0, 35);
    localStorage.setItem(STORAGE_KEY_RESTORE_POINTS, JSON.stringify(updatedList));

    return newPoint;
  } catch (e) {
    console.error('Failed to create system restore point:', e);
    return {
      id: `err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      formattedDate: formatTimestampToReadable(new Date().toISOString()),
      title,
      category,
      description,
      snapshot: {},
    };
  }
}

/**
 * Saves the baseline configured in the Admin Panel
 */
export function saveAdminBaseline(
  constants: ConstantProfilesConfig,
  prices: MaterialPricesConfig
): void {
  try {
    const baseline = {
      constants,
      prices,
      timestamp: new Date().toISOString(),
      formattedDate: formatTimestampToReadable(new Date().toISOString()),
    };
    localStorage.setItem(STORAGE_KEY_ADMIN_BASELINE, JSON.stringify(baseline));

    // Also register an admin update restore point
    createRestorePoint(
      'Admin Panel Update Baseline',
      'admin',
      'Configurations saved by the Administrator from the Admin Panel (/admin)',
      {
        constants,
        materialPrices: prices,
      }
    );
  } catch (e) {
    console.error('Failed to save admin baseline:', e);
  }
}

export function getAdminBaseline(): {
  constants?: ConstantProfilesConfig;
  prices?: MaterialPricesConfig;
  timestamp?: string;
  formattedDate?: string;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_BASELINE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Restores the system to a chosen historical restore point
 */
export function restoreToPoint(pointId: string): { success: boolean; message: string } {
  try {
    const points = getRestorePoints();
    const targetPoint = points.find((p) => p.id === pointId);

    if (!targetPoint) {
      return { success: false, message: 'Restore point not found in history.' };
    }

    const { snapshot } = targetPoint;

    // 1. Restore Custom Material Names
    if (snapshot.customNames !== undefined) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_NAMES, JSON.stringify(snapshot.customNames));
    }

    // 2. Restore Constants
    if (snapshot.constants) {
      saveStoredConstants(snapshot.constants);
    }

    // 3. Restore Material Prices
    if (snapshot.materialPrices) {
      saveStoredPrices(snapshot.materialPrices);
    }

    // 4. Restore Company Profile
    if (snapshot.companyProfile) {
      saveStoredCompanyProfile(snapshot.companyProfile);
    }

    // 5. Restore Pricing Rules
    if (snapshot.pricingRules) {
      saveStoredPricingRules(snapshot.pricingRules);
    }

    // Create a new restore point marking this restoration
    createRestorePoint(
      `System Restored: "${targetPoint.title}"`,
      'full',
      `Restored all system settings to the snapshot from ${targetPoint.formattedDate}`,
      snapshot
    );

    // Dispatch global events
    window.dispatchEvent(new CustomEvent('alu_fab_system_restored', { detail: targetPoint }));
    window.dispatchEvent(new CustomEvent('alu_fab_material_names_updated', { detail: snapshot.customNames || {} }));

    return {
      success: true,
      message: `System successfully restored to update from ${targetPoint.formattedDate}.`,
    };
  } catch (e) {
    console.error('Failed to restore to point:', e);
    return { success: false, message: 'An unexpected error occurred during restoration.' };
  }
}

/**
 * Requirement 13: Restore to default update (the settings set by the admin from the admin panel)
 */
export function restoreToAdminDefault(): { success: boolean; message: string } {
  try {
    const adminBaseline = getAdminBaseline();

    const targetConstants = adminBaseline?.constants || DEFAULT_FABRICATION_CONSTANTS;
    const targetPrices = adminBaseline?.prices || DEFAULT_MATERIAL_PRICES;
    const targetCompany = DEFAULT_COMPANY_PROFILE;
    const targetRules = DEFAULT_CLIENT_PRICING_RULES;

    // Reset user custom material names to defaults
    localStorage.removeItem(STORAGE_KEY_CUSTOM_NAMES);

    // Save target configurations
    saveStoredConstants(targetConstants);
    saveStoredPrices(targetPrices);
    saveStoredCompanyProfile(targetCompany);
    saveStoredPricingRules(targetRules);

    // Create restore point
    createRestorePoint(
      'Restored to Admin Default Update',
      'admin',
      adminBaseline
        ? `Restored system to the configuration configured by the Administrator from the Admin Panel.`
        : 'Restored system to standard factory baseline default parameters.',
      {
        constants: targetConstants,
        materialPrices: targetPrices,
        companyProfile: targetCompany,
        pricingRules: targetRules,
        customNames: {},
      }
    );

    // Dispatch global notification events
    window.dispatchEvent(new CustomEvent('alu_fab_system_restored', { detail: { type: 'admin_default' } }));
    window.dispatchEvent(new CustomEvent('alu_fab_material_names_updated', { detail: {} }));

    return {
      success: true,
      message: 'System successfully restored to the default configuration set by the Admin Panel.',
    };
  } catch (e) {
    console.error('Failed to restore admin defaults:', e);
    return { success: false, message: 'Could not restore admin default update.' };
  }
}
