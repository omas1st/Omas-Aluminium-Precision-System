import { SavedProject, ConstantProfilesConfig, MaterialPricesConfig } from '../types';
import { DEFAULT_FABRICATION_CONSTANTS } from '../constants/defaultConstants';
import { DEFAULT_MATERIAL_PRICES } from '../constants/defaultPrices';

const STORAGE_KEYS = {
  PROJECTS: 'alu_fab_saved_projects_v1',
  CONSTANTS: 'alu_fab_constant_measurements_v1',
  PRICES: 'alu_fab_material_prices_v1',
  ACTIVE_DRAFT: 'alu_fab_active_draft_v1',
};

const SAMPLE_PROJECTS: SavedProject[] = [];

export function getSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      return [];
    }
    const list: SavedProject[] = JSON.parse(raw);
    // Filter out any default sample projects
    const filtered = list.filter(
      (p) => p.id !== 'sample-project-1' && p.id !== 'sample-project-2' && !p.id.startsWith('sample-project-')
    );
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Failed to load saved projects:', e);
    return [];
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
    const loadedTrack = { ...DEFAULT_FABRICATION_CONSTANTS.topBottomTrack, ...(parsed.topBottomTrack || parsed.slidingTopBottomTrack || {}) };
    if (!loadedTrack.name || loadedTrack.name === 'Top / Bottom Track Profile') {
      loadedTrack.name = DEFAULT_FABRICATION_CONSTANTS.topBottomTrack.name;
    }

    const loadedBottomSash = { ...DEFAULT_FABRICATION_CONSTANTS.bottomSashRail, ...(parsed.bottomSashRail || parsed.slidingBottomSashRail || {}) };
    if (!loadedBottomSash.name || loadedBottomSash.name === 'Bottom Sash Rail (Roller Extrusion)') {
      loadedBottomSash.name = DEFAULT_FABRICATION_CONSTANTS.bottomSashRail.name;
    }

    const loadedTopSash = { ...DEFAULT_FABRICATION_CONSTANTS.topSashRail, ...(parsed.topSashRail || parsed.slidingTopSashRail || {}) };
    if (!loadedTopSash.name || loadedTopSash.name === 'Top Sash Rail Profile') {
      loadedTopSash.name = DEFAULT_FABRICATION_CONSTANTS.topSashRail.name;
    }

    const loadedOuterWidth = { ...DEFAULT_FABRICATION_CONSTANTS.casementOuterWidth, ...(parsed.casementOuterWidth || parsed.casementOuterFrame || {}) };
    const loadedOuterHeight = { ...DEFAULT_FABRICATION_CONSTANTS.casementOuterHeight, ...(parsed.casementOuterHeight || parsed.casementOuterFrame || {}) };
    const loaded2Mullion = { ...DEFAULT_FABRICATION_CONSTANTS.casement2Mullion, ...(parsed.casement2Mullion || parsed.casementMullion || {}) };
    const loaded3Mullion = { ...DEFAULT_FABRICATION_CONSTANTS.casement3Mullion, ...(parsed.casement3Mullion || {}) };

    return {
      ...DEFAULT_FABRICATION_CONSTANTS,
      ...parsed,
      topBottomTrack: loadedTrack,
      sideJambs: { ...DEFAULT_FABRICATION_CONSTANTS.sideJambs, ...(parsed.sideJambs || parsed.slidingSideJamb || {}) },
      bottomSashRail: loadedBottomSash,
      topSashRail: loadedTopSash,
      lockFrameStile: { ...DEFAULT_FABRICATION_CONSTANTS.lockFrameStile, ...(parsed.lockFrameStile || parsed.slidingLockStile || {}) },
      interlockFrameStile: { ...DEFAULT_FABRICATION_CONSTANTS.interlockFrameStile, ...(parsed.interlockFrameStile || parsed.slidingInterlockStile || {}) },
      casementOuterWidth: loadedOuterWidth,
      casementOuterHeight: loadedOuterHeight,
      casementOuterFrame: { ...DEFAULT_FABRICATION_CONSTANTS.casementOuterFrame, ...(parsed.casementOuterFrame || {}) },
      casement2Mullion: loaded2Mullion,
      casement3Mullion: loaded3Mullion,
      casementMullion: { ...DEFAULT_FABRICATION_CONSTANTS.casementMullion, ...(parsed.casementMullion || {}) },
      casementDeCurveSash: { ...DEFAULT_FABRICATION_CONSTANTS.casementDeCurveSash, ...(parsed.casementDeCurveSash || {}) },
      casementGlazingBead: { ...DEFAULT_FABRICATION_CONSTANTS.casementGlazingBead, ...(parsed.casementGlazingBead || {}) },
      casementBurglaryTopSideFrame: { ...DEFAULT_FABRICATION_CONSTANTS.casementBurglaryTopSideFrame, ...(parsed.casementBurglaryTopSideFrame || {}) },
      casementBurglaryBottomFrame: { ...DEFAULT_FABRICATION_CONSTANTS.casementBurglaryBottomFrame, ...(parsed.casementBurglaryBottomFrame || {}) },
      netFrame1125: { ...DEFAULT_FABRICATION_CONSTANTS.netFrame1125, ...(parsed.netFrame1125 || {}) },
      netFrame1126: { ...DEFAULT_FABRICATION_CONSTANTS.netFrame1126, ...(parsed.netFrame1126 || {}) },
      netFrame1132: { ...DEFAULT_FABRICATION_CONSTANTS.netFrame1132, ...(parsed.netFrame1132 || {}) },
      burglaryIronRod: { ...DEFAULT_FABRICATION_CONSTANTS.burglaryIronRod, ...(parsed.burglaryIronRod || {}) },
      casementIronAngle: { ...DEFAULT_FABRICATION_CONSTANTS.casementIronAngle, ...(parsed.casementIronAngle || {}) },
      glazingDivider: { ...DEFAULT_FABRICATION_CONSTANTS.glazingDivider, ...(parsed.glazingDivider || {}) },
      netRoll: { ...DEFAULT_FABRICATION_CONSTANTS.netRoll, ...(parsed.netRoll || {}) },
      netRubberRoll: { ...DEFAULT_FABRICATION_CONSTANTS.netRubberRoll, ...(parsed.netRubberRoll || {}) },
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
