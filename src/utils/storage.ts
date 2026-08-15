import { SavedProject, ConstantProfilesConfig, MaterialPricesConfig } from '../types';
import { DEFAULT_FABRICATION_CONSTANTS } from '../constants/defaultConstants';
import { DEFAULT_MATERIAL_PRICES } from '../constants/defaultPrices';

const STORAGE_KEYS = {
  PROJECTS: 'alu_fab_saved_projects_v1',
  CONSTANTS: 'alu_fab_constant_measurements_v1',
  PRICES: 'alu_fab_material_prices_v1',
  ACTIVE_DRAFT: 'alu_fab_active_draft_v1',
};

const SAMPLE_PROJECTS: SavedProject[] = [
  {
    id: 'sample-project-1',
    name: 'Luxury Residential Villa - Ground Floor',
    dateCreated: new Date(Date.now() - 86400000 * 2).toISOString(),
    dateUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        id: 'item-1',
        tag: 'W1 - Living Room Main Slider',
        type: 'window',
        kind: 'sliding_2_panel',
        width: 1800,
        height: 1500,
        quantity: 2,
        notes: 'Bronze anodized frame with 5mm tinted glass',
      },
      {
        id: 'item-2',
        tag: 'W2 - Master Bedroom Slider',
        type: 'window',
        kind: 'sliding_2_panel',
        width: 1500,
        height: 1200,
        quantity: 3,
        notes: 'White powder coated',
      },
      {
        id: 'item-3',
        tag: 'W3 - Dining Casement',
        type: 'window',
        kind: 'casement_2_panel',
        width: 1200,
        height: 1400,
        quantity: 1,
        notes: 'Projected top hung with friction stays',
      },
      {
        id: 'item-4',
        tag: 'W4 - Kitchen Fixed Highlight',
        type: 'window',
        kind: 'fixed_window',
        width: 1200,
        height: 600,
        quantity: 2,
        notes: 'Clear laminated glass',
      },
    ],
  },
  {
    id: 'sample-project-2',
    name: 'Commercial Office Partition & Windows',
    dateCreated: new Date(Date.now() - 86400000 * 5).toISOString(),
    dateUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
    items: [
      {
        id: 'item-201',
        tag: 'D1 - Main Entrance Sliding Door',
        type: 'door',
        kind: 'sliding_door_2_panel',
        width: 2000,
        height: 2200,
        quantity: 1,
        notes: 'Heavy duty bottom track and hook lock',
      },
      {
        id: 'item-202',
        tag: 'W10 - Executive Office 3-Panel Slider',
        type: 'window',
        kind: 'sliding_3_panel',
        width: 2400,
        height: 1500,
        quantity: 2,
        notes: '3-track smooth running profile',
      },
    ],
  },
];

export function getSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved projects:', e);
    return SAMPLE_PROJECTS;
  }
}

export function saveProject(project: SavedProject): void {
  try {
    const current = getSavedProjects();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      current[existingIndex] = { ...project, dateUpdated: new Date().toISOString() };
    } else {
      current.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function deleteProject(id: string): void {
  try {
    const current = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete project:', e);
  }
}

export function getStoredConstants(): ConstantProfilesConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSTANTS);
    if (!raw) {
      return DEFAULT_FABRICATION_CONSTANTS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_FABRICATION_CONSTANTS,
      ...parsed,
      topBottomTrack: { ...DEFAULT_FABRICATION_CONSTANTS.topBottomTrack, ...(parsed.topBottomTrack || parsed.slidingTopBottomTrack || {}) },
      sideJambs: { ...DEFAULT_FABRICATION_CONSTANTS.sideJambs, ...(parsed.sideJambs || parsed.slidingSideJamb || {}) },
      bottomSashRail: { ...DEFAULT_FABRICATION_CONSTANTS.bottomSashRail, ...(parsed.bottomSashRail || parsed.slidingBottomSashRail || {}) },
      topSashRail: { ...DEFAULT_FABRICATION_CONSTANTS.topSashRail, ...(parsed.topSashRail || parsed.slidingTopSashRail || {}) },
      lockFrameStile: { ...DEFAULT_FABRICATION_CONSTANTS.lockFrameStile, ...(parsed.lockFrameStile || parsed.slidingLockStile || {}) },
      interlockFrameStile: { ...DEFAULT_FABRICATION_CONSTANTS.interlockFrameStile, ...(parsed.interlockFrameStile || parsed.slidingInterlockStile || {}) },
      casementOuterFrame: { ...DEFAULT_FABRICATION_CONSTANTS.casementOuterFrame, ...(parsed.casementOuterFrame || {}) },
      casementMullion: { ...DEFAULT_FABRICATION_CONSTANTS.casementMullion, ...(parsed.casementMullion || {}) },
      casementDeCurveSash: { ...DEFAULT_FABRICATION_CONSTANTS.casementDeCurveSash, ...(parsed.casementDeCurveSash || {}) },
      casementGlazingBead: { ...DEFAULT_FABRICATION_CONSTANTS.casementGlazingBead, ...(parsed.casementGlazingBead || {}) },
      transomOuterFrame: { ...DEFAULT_FABRICATION_CONSTANTS.transomOuterFrame, ...(parsed.transomOuterFrame || {}) },
      transomMullion: { ...DEFAULT_FABRICATION_CONSTANTS.transomMullion, ...(parsed.transomMullion || {}) },
      transomTopHungSash: { ...DEFAULT_FABRICATION_CONSTANTS.transomTopHungSash, ...(parsed.transomTopHungSash || {}) },
      transomGlazingBead: { ...DEFAULT_FABRICATION_CONSTANTS.transomGlazingBead, ...(parsed.transomGlazingBead || {}) },
      fixedFrame: { ...DEFAULT_FABRICATION_CONSTANTS.fixedFrame, ...(parsed.fixedFrame || {}) },
      doorOuterFrame: { ...DEFAULT_FABRICATION_CONSTANTS.doorOuterFrame, ...(parsed.doorOuterFrame || {}) },
      doorStile: { ...DEFAULT_FABRICATION_CONSTANTS.doorStile, ...(parsed.doorStile || {}) },
      doorBottomRail: { ...DEFAULT_FABRICATION_CONSTANTS.doorBottomRail, ...(parsed.doorBottomRail || {}) },
    };
  } catch (e) {
    console.error('Failed to load constants:', e);
    return DEFAULT_FABRICATION_CONSTANTS;
  }
}

export function saveStoredConstants(constants: ConstantProfilesConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONSTANTS, JSON.stringify(constants));
  } catch (e) {
    console.error('Failed to save constants:', e);
  }
}

export function resetStoredConstants(): ConstantProfilesConfig {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONSTANTS);
    return DEFAULT_FABRICATION_CONSTANTS;
  } catch (e) {
    console.error('Failed to reset constants:', e);
    return DEFAULT_FABRICATION_CONSTANTS;
  }
}

export function getStoredPrices(): MaterialPricesConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (!raw) {
      return DEFAULT_MATERIAL_PRICES;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MATERIAL_PRICES,
      ...parsed,
      profileBarPrices: {
        ...DEFAULT_MATERIAL_PRICES.profileBarPrices,
        ...(parsed.profileBarPrices || {}),
      },
      accessoryPrices: {
        ...DEFAULT_MATERIAL_PRICES.accessoryPrices,
        ...(parsed.accessoryPrices || {}),
      },
    };
  } catch (e) {
    console.error('Failed to load prices:', e);
    return DEFAULT_MATERIAL_PRICES;
  }
}

export function saveStoredPrices(prices: MaterialPricesConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
  } catch (e) {
    console.error('Failed to save prices:', e);
  }
}

export function resetStoredPrices(): MaterialPricesConfig {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRICES);
    return DEFAULT_MATERIAL_PRICES;
  } catch (e) {
    console.error('Failed to reset prices:', e);
    return DEFAULT_MATERIAL_PRICES;
  }
}
