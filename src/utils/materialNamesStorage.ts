import { MaterialCatalogItem } from '../types';
import { getStoredConstants, saveStoredConstants, getStoredPrices, saveStoredPrices } from './storage';
import { createRestorePoint } from './systemRestoreManager';

const STORAGE_KEY_CUSTOM_NAMES = 'alu_fab_custom_material_names_v1';

export const DEFAULT_MATERIAL_CATALOG: MaterialCatalogItem[] = [
  // 1. Sliding Window & Door Profiles
  {
    key: 'topBottomTrack',
    defaultName: 'Top / Bottom Track / Two Track Profile',
    category: 'Sliding Systems',
    unit: 'per 5.8m bar',
    description: 'Upper guide and lower running track for sliding window panels',
  },
  {
    key: 'sideJambs',
    defaultName: 'Double / Side Jambs Profile',
    category: 'Sliding Systems',
    unit: 'per 5.8m bar',
    description: 'Vertical wall outer perimeter frame receiving the sliding sashes',
  },
  {
    key: 'bottomSashRail',
    defaultName: 'Bottom Sash Rail Profile',
    category: 'Sliding Systems',
    unit: 'per 5.8m bar',
    description: 'Horizontal bottom frame of sliding glass panel housing the rollers',
  },
  {
    key: 'topSashRail',
    defaultName: 'Top Sash Rail Profile',
    category: 'Sliding Systems',
    unit: 'per 5.8m bar',
    description: 'Horizontal top frame of sliding glass panel sliding into top track',
  },
  {
    key: 'lockFrameStile',
    defaultName: 'Lock Frame Profile / Sash Stile (Handle Side)',
    category: 'Sliding Systems',
    unit: 'per 5.8m bar',
    description: 'Vertical handle/lock side stile of sliding sash panel',
  },
  {
    key: 'interlockFrameStile',
    defaultName: 'Interlock Frame Profile (Hook/Meeting Stile)',
    category: 'Sliding Systems',
    unit: 'per 5.8m bar',
    description: 'Vertical interlocking hook stile where overlapping sliding panels meet',
  },

  // 2. Casement Window Profiles
  {
    key: 'casementOuterWidth',
    defaultName: 'Casement Outer Width Profile (Top / Bottom)',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Horizontal perimeter outer frame head and sill for casement windows',
  },
  {
    key: 'casementOuterHeight',
    defaultName: 'Casement Outer Height Profile (Side Jambs)',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Vertical perimeter outer jamb frame for casement window openings',
  },
  {
    key: 'casementOuterFrame',
    defaultName: 'Casement Outer Frame Profile',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'General perimeter outer framing extrusion for hinged casement units',
  },
  {
    key: 'casement2Mullion',
    defaultName: 'Casement 2-Mullion Profile (Standard T-Bar)',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Standard intermediate vertical divider separating fixed and open panes',
  },
  {
    key: 'casement3Mullion',
    defaultName: 'Casement 3-Mullion Profile (Heavy Hinge-Receiver)',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Heavy duty reinforced mullion with hinge-pocket receiver (+6mm)',
  },
  {
    key: 'casementMullion',
    defaultName: 'Casement Mullion Profile (T-Bar)',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Vertical dividing T-bar between side-by-side casement window sections',
  },
  {
    key: 'casementDeCurveSash',
    defaultName: 'Casement Inner Frame (De Curve Sash)',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Operable hinged window vent frame holding glass with decorative contour',
  },
  {
    key: 'casementGlazingBead',
    defaultName: 'Casement Glazing Snap-in Bead',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Snap-in aluminum clip securing the glass pane in the casement sash',
  },
  {
    key: 'casementBurglaryTopSideFrame',
    defaultName: 'Casement Burglary Top & Side Frame Profile',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Integrated security grill outer channel frame (top and vertical sides)',
  },
  {
    key: 'casementBurglaryBottomFrame',
    defaultName: 'Casement Burglary Bottom Frame Profile',
    category: 'Casement Systems',
    unit: 'per 5.8m bar',
    description: 'Lower horizontal channel profile supporting burglary rods and drainage',
  },
  {
    key: 'casementIronAngle',
    defaultName: 'Casement Inner Corner Iron Angle Cleat (5.0m Stock)',
    category: 'Casement Systems',
    unit: 'per 5.0m bar',
    description: 'Internal heavy aluminum/iron angle cleat cut to 35mm pieces for miter joint corners',
  },

  // 3. Insect Netting & Security
  {
    key: 'netFrame1125',
    defaultName: '11:25 Net Frame Profile (Sides & Bottom)',
    category: 'Insect Netting Systems',
    unit: 'per 5.8m bar',
    description: 'Outer perimeter receiver guide channel for mosquito wire netting screens',
  },
  {
    key: 'netFrame1126',
    defaultName: '11:26 Net Frame Profile (Top)',
    category: 'Insect Netting Systems',
    unit: 'per 5.8m bar',
    description: 'Upper top channel track for mosquito netting frame',
  },
  {
    key: 'netFrame1132',
    defaultName: '11:32 Net Frame Profile (Net Perimeter)',
    category: 'Insect Netting Systems',
    unit: 'per 5.8m bar',
    description: 'Removable mosquito net sash frame perimeter holding spline gasket and wire mesh',
  },
  {
    key: 'burglaryIronRod',
    defaultName: 'Burglary Iron Rod / Ballo Straight (5.8m)',
    category: 'Security & Grills',
    unit: 'per 5.8m bar',
    description: 'Solid galvanized/painted security grill bars with pressed end connections',
  },

  // 4. Glazing Dividers & Transom Systems
  {
    key: 'glazingDivider',
    defaultName: 'Glazing Divider Bar Profile (Georgian/Colonial)',
    category: 'Glazing Bars',
    unit: 'per 5.8m bar',
    description: 'Colonial / Georgian decorative grid bar applied over glass surface',
  },
  {
    key: 'transomOuterFrame',
    defaultName: 'Transom Window Outer Frame Profile',
    category: 'Transom Systems',
    unit: 'per 5.8m bar',
    description: 'Outer perimeter frame for high-level transom and vent windows',
  },
  {
    key: 'transomMullion',
    defaultName: 'Transom Intermediate Mullion T-Bar',
    category: 'Transom Systems',
    unit: 'per 5.8m bar',
    description: 'Horizontal and vertical intermediate dividing bar for transom combinations',
  },
  {
    key: 'transomTopHungSash',
    defaultName: 'Transom Top-Hung Vent Sash Profile',
    category: 'Transom Systems',
    unit: 'per 5.8m bar',
    description: 'Awning / top-hung outward projecting sash frame',
  },
  {
    key: 'transomGlazingBead',
    defaultName: 'Transom Glazing Bead Profile',
    category: 'Transom Systems',
    unit: 'per 5.8m bar',
    description: 'Snap-in glass retaining bead profile for transom units',
  },

  // 5. Fixed & Door Profiles
  {
    key: 'fixedFrame',
    defaultName: 'Fixed Window Outer Frame / Bead Profile',
    category: 'Fixed Windows',
    unit: 'per 5.8m bar',
    description: 'Perimeter framing section for direct-glazed non-opening picture windows',
  },
  {
    key: 'doorOuterFrame',
    defaultName: 'Heavy Duty Door Outer Frame',
    category: 'Hinged Doors',
    unit: 'per 5.8m bar',
    description: 'Deep perimeter door jamb and header section for swing aluminum doors',
  },
  {
    key: 'doorStile',
    defaultName: 'Door Vertical Stile (Hinge/Lock)',
    category: 'Hinged Doors',
    unit: 'per 5.8m bar',
    description: '85mm heavy-duty vertical door stile accommodating locks and hinges',
  },
  {
    key: 'doorTopRail',
    defaultName: 'Door Top Rail',
    category: 'Hinged Doors',
    unit: 'per 5.8m bar',
    description: 'Horizontal top door rail with deep glass pocket',
  },
  {
    key: 'doorBottomRail',
    defaultName: 'Door Bottom Rail (Kick Plate Profile)',
    category: 'Hinged Doors',
    unit: 'per 5.8m bar',
    description: '110mm heavy bottom kick-plate rail preventing damage at floor level',
  },

  // 6. Glass & Glazing
  {
    key: 'glassTypeName',
    defaultName: '5mm Clear / Tinted Float Glass',
    category: 'Glass & Glazing',
    unit: 'per m²',
    description: 'Primary architectural glazing pane (clear, tinted bronze, reflective, or obscure)',
  },

  // 7. Hardware & Accessories
  {
    key: 'slidingRollerPair',
    defaultName: 'Sliding Sash Ball Bearing Rollers',
    category: 'Sliding Hardware',
    unit: 'per pair',
    description: 'Twin adjustable brass/nylon wheels fitted into bottom sash rail',
  },
  {
    key: 'crescentHookLock',
    defaultName: 'Crescent Sash Lock / Flush Lock',
    category: 'Sliding Hardware',
    unit: 'per piece',
    description: 'Positive crescent cam-lock latch locking meeting sliding sashes',
  },
  {
    key: 'woolpilePerMeter',
    defaultName: 'Woolpile Weatherstripping Seal (Brush Gasket)',
    category: 'Weatherstripping & Seals',
    unit: 'per meter',
    description: 'High-density polypropylene brush pile sliding draught and dust seal',
  },
  {
    key: 'rubberGasketPerMeter',
    defaultName: 'U-Channel Rubber Glazing Gasket (EPDM)',
    category: 'Weatherstripping & Seals',
    unit: 'per meter',
    description: 'EPDM synthetic rubber wrapping glass edge against aluminum friction',
  },
  {
    key: 'frictionStayPair',
    defaultName: 'Casement Heavy-Duty Friction Stays (Pair)',
    category: 'Casement Hardware',
    unit: 'per pair',
    description: 'Stainless steel scissor friction hinges supporting projecting casement sash',
  },
  {
    key: 'casementCamHandle',
    defaultName: 'Casement Cockspur Cam Handle',
    category: 'Casement Hardware',
    unit: 'per piece',
    description: 'Die-cast locking cam fastener handle for closing casement vents tight',
  },
  {
    key: 'cornerCleatPiece',
    defaultName: 'Corner Cleat / Miter Joint Piece',
    category: 'Joints & Assembly',
    unit: 'per piece',
    description: 'Internal bracket inserted into 45° frame corners for rigid screw anchoring',
  },
  {
    key: 'siliconeSealantTube',
    defaultName: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'Chemicals & Sealants',
    unit: 'per tube (300ml)',
    description: 'UV-resistant weatherproof architectural silicone for exterior frame waterproofing',
  },
  {
    key: 'doorMortiseLockset',
    defaultName: 'Sliding Door Hook Mortise Lock with Key',
    category: 'Door Hardware',
    unit: 'per set',
    description: 'Full mortise lock cylinder body with keyed entry and safety latch',
  },
  {
    key: 'doorHingePair',
    defaultName: 'Heavy-Duty Aluminum Door Hinges (Pair)',
    category: 'Door Hardware',
    unit: 'per pair',
    description: '3-leaf commercial grade aluminum door hinges with stainless steel pin',
  },
  {
    key: 'steelStopperPiece',
    defaultName: 'Stainless Steel Anti-Lift Sash Stopper',
    category: 'Sliding Hardware',
    unit: 'per piece',
    description: 'Upper security block preventing sliding panels from being pried or lifted off tracks',
  },
  {
    key: 'casementHingePiece',
    defaultName: 'Casement Butt / Stainless Hinge',
    category: 'Casement Hardware',
    unit: 'per piece',
    description: 'Heavy duty stainless steel butt hinge for side-hung casement sash',
  },
  {
    key: 'netRollPrice',
    defaultName: 'Insect / Mosquito Net Mesh Roll',
    category: 'Insect Netting Systems',
    unit: 'per roll',
    description: 'Fiberglass or stainless insect screen mesh for netting panels',
  },
  {
    key: 'netRubberRollPrice',
    defaultName: 'Net Rubber Spline Gasket Roll',
    category: 'Insect Netting Systems',
    unit: 'per roll',
    description: 'Flexible rubber spline cord pressed into net frame groove to lock mesh in place',
  },
  {
    key: 'assemblyScrewPiece',
    defaultName: 'Self-Tapping Assembly Screws (#8 x 1½")',
    category: 'Fasteners & Screws',
    unit: 'per piece',
    description: 'Corrosion-resistant zinc-plated screws for outer frame and sash corner fabrication',
  },
  {
    key: 'wallAnchorPlug',
    defaultName: 'Heavy Duty Wall Anchor Screws & Plugs',
    category: 'Fasteners & Screws',
    unit: 'per piece',
    description: 'Masonry nylon wall plugs and long fixing screws for structural frame anchoring',
  },
];

export function getCustomMaterialNames(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_NAMES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom material names:', e);
    return {};
  }
}

export function saveCustomMaterialNames(names: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_NAMES, JSON.stringify(names));

    // Synchronize into ConstantProfilesConfig so cuts & optimizations automatically carry the custom name
    const currentConstants = getStoredConstants();
    let constantsChanged = false;

    for (const item of DEFAULT_MATERIAL_CATALOG) {
      if (item.key in currentConstants) {
        const customName = names[item.key];
        const targetObj = (currentConstants as any)[item.key];
        if (targetObj && typeof targetObj === 'object') {
          targetObj.name = customName && customName.trim() !== '' ? customName.trim() : item.defaultName;
          constantsChanged = true;
        }
      }
    }

    if (constantsChanged) {
      saveStoredConstants(currentConstants);
    }

    // Synchronize glass name into prices if set
    const currentPrices = getStoredPrices();
    if (names['glassTypeName'] && names['glassTypeName'].trim() !== '') {
      currentPrices.glassTypeName = names['glassTypeName'].trim();
      saveStoredPrices(currentPrices);
    }

    // Auto-record a system restore point (Requirement 13)
    createRestorePoint(
      'Updated Custom Material Names',
      'names',
      `Customized display names for ${Object.keys(names).length} workshop materials`,
      {
        customNames: names,
        constants: currentConstants,
        materialPrices: currentPrices,
      }
    );

    // Notify all active application components
    window.dispatchEvent(new CustomEvent('alu_fab_material_names_updated', { detail: names }));
  } catch (e) {
    console.error('Failed to save custom material names:', e);
  }
}

export function resetCustomMaterialNames(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_NAMES);

    // Restore default names in constants
    const currentConstants = getStoredConstants();
    for (const item of DEFAULT_MATERIAL_CATALOG) {
      if (item.key in currentConstants) {
        const targetObj = (currentConstants as any)[item.key];
        if (targetObj && typeof targetObj === 'object') {
          targetObj.name = item.defaultName;
        }
      }
    }
    saveStoredConstants(currentConstants);

    // Restore glass default
    const currentPrices = getStoredPrices();
    currentPrices.glassTypeName = '5mm Clear / Tinted Float Glass';
    saveStoredPrices(currentPrices);

    createRestorePoint(
      'Reset Material Names to Default',
      'names',
      'Restored standard industry names for all profiles and accessories',
      {
        customNames: {},
        constants: currentConstants,
        materialPrices: currentPrices,
      }
    );

    window.dispatchEvent(new CustomEvent('alu_fab_material_names_updated', { detail: {} }));
  } catch (e) {
    console.error('Failed to reset custom material names:', e);
  }
}

/**
 * Given a material catalog key OR an original/default material string,
 * returns the user's custom name if set, or the clean default name.
 */
export function getMaterialDisplayName(keyOrDefaultName: string): string {
  if (!keyOrDefaultName) return '';
  const customNames = getCustomMaterialNames();

  // 1. Direct match by catalog key
  if (customNames[keyOrDefaultName] && customNames[keyOrDefaultName].trim() !== '') {
    return customNames[keyOrDefaultName].trim();
  }

  // 2. Match by exact defaultName in catalog
  const catalogMatch = DEFAULT_MATERIAL_CATALOG.find(
    (c) => c.defaultName.toLowerCase() === keyOrDefaultName.toLowerCase()
  );
  if (catalogMatch && customNames[catalogMatch.key]) {
    return customNames[catalogMatch.key].trim();
  }

  // 3. Substring fuzzy match for accessories & profiles
  const lower = keyOrDefaultName.toLowerCase();

  // Profiles
  if (lower.includes('top / bottom track') || lower.includes('two track') || lower.includes('sliding track')) {
    if (customNames['topBottomTrack']) return customNames['topBottomTrack'];
  }
  if (lower.includes('side jamb')) {
    if (customNames['sideJambs']) return customNames['sideJambs'];
  }
  if (lower.includes('bottom sash rail')) {
    if (customNames['bottomSashRail']) return customNames['bottomSashRail'];
  }
  if (lower.includes('top sash rail')) {
    if (customNames['topSashRail']) return customNames['topSashRail'];
  }
  if (lower.includes('lock frame') || lower.includes('handle side')) {
    if (customNames['lockFrameStile']) return customNames['lockFrameStile'];
  }
  if (lower.includes('interlock frame') || lower.includes('meeting stile')) {
    if (customNames['interlockFrameStile']) return customNames['interlockFrameStile'];
  }
  if (lower.includes('casement outer width')) {
    if (customNames['casementOuterWidth']) return customNames['casementOuterWidth'];
  }
  if (lower.includes('casement outer height')) {
    if (customNames['casementOuterHeight']) return customNames['casementOuterHeight'];
  }
  if (lower.includes('casement outer frame')) {
    if (customNames['casementOuterFrame']) return customNames['casementOuterFrame'];
  }
  if (lower.includes('3-mullion')) {
    if (customNames['casement3Mullion']) return customNames['casement3Mullion'];
  }
  if (lower.includes('2-mullion')) {
    if (customNames['casement2Mullion']) return customNames['casement2Mullion'];
  }
  if (lower.includes('de curve sash') || lower.includes('de-curve')) {
    if (customNames['casementDeCurveSash']) return customNames['casementDeCurveSash'];
  }
  if (lower.includes('snap-in bead') || lower.includes('glazing bead')) {
    if (customNames['casementGlazingBead']) return customNames['casementGlazingBead'];
  }
  if (lower.includes('burglary top & side') || lower.includes('burglary top')) {
    if (customNames['casementBurglaryTopSideFrame']) return customNames['casementBurglaryTopSideFrame'];
  }
  if (lower.includes('burglary bottom')) {
    if (customNames['casementBurglaryBottomFrame']) return customNames['casementBurglaryBottomFrame'];
  }
  if (lower.includes('burglary iron rod') || lower.includes('ballo straight')) {
    if (customNames['burglaryIronRod']) return customNames['burglaryIronRod'];
  }
  if (lower.includes('11:25') || lower.includes('1125')) {
    if (customNames['netFrame1125']) return customNames['netFrame1125'];
  }
  if (lower.includes('11:26') || lower.includes('1126')) {
    if (customNames['netFrame1126']) return customNames['netFrame1126'];
  }
  if (lower.includes('11:32') || lower.includes('1132')) {
    if (customNames['netFrame1132']) return customNames['netFrame1132'];
  }

  // Accessories
  if (lower.includes('roller')) {
    if (customNames['slidingRollerPair']) return customNames['slidingRollerPair'];
  }
  if (lower.includes('crescent') || lower.includes('hook lock') || lower.includes('flush lock')) {
    if (customNames['crescentHookLock']) return customNames['crescentHookLock'];
  }
  if (lower.includes('woolpile') || lower.includes('brush gasket')) {
    if (customNames['woolpilePerMeter']) return customNames['woolpilePerMeter'];
  }
  if (lower.includes('rubber') || lower.includes('epdm') || lower.includes('glazing gasket')) {
    if (customNames['rubberGasketPerMeter']) return customNames['rubberGasketPerMeter'];
  }
  if (lower.includes('friction stay')) {
    if (customNames['frictionStayPair']) return customNames['frictionStayPair'];
  }
  if (lower.includes('cam handle') || lower.includes('cockspur')) {
    if (customNames['casementCamHandle']) return customNames['casementCamHandle'];
  }
  if (lower.includes('corner cleat') || lower.includes('iron angle cleat') || lower.includes('miter joint')) {
    if (customNames['cornerCleatPiece']) return customNames['cornerCleatPiece'];
  }
  if (lower.includes('silicone') || lower.includes('sealant')) {
    if (customNames['siliconeSealantTube']) return customNames['siliconeSealantTube'];
  }
  if (lower.includes('door mortise') || lower.includes('hook mortise')) {
    if (customNames['doorMortiseLockset']) return customNames['doorMortiseLockset'];
  }
  if (lower.includes('door hinge')) {
    if (customNames['doorHingePair']) return customNames['doorHingePair'];
  }
  if (lower.includes('stopper') || lower.includes('anti-lift')) {
    if (customNames['steelStopperPiece']) return customNames['steelStopperPiece'];
  }
  if (lower.includes('butt hinge') || lower.includes('casement hinge')) {
    if (customNames['casementHingePiece']) return customNames['casementHingePiece'];
  }
  if (lower.includes('mosquito net') || lower.includes('net mesh roll')) {
    if (customNames['netRollPrice']) return customNames['netRollPrice'];
  }
  if (lower.includes('spline') || lower.includes('net rubber')) {
    if (customNames['netRubberRollPrice']) return customNames['netRubberRollPrice'];
  }
  if (lower.includes('screw') || lower.includes('self-tapping')) {
    if (customNames['assemblyScrewPiece']) return customNames['assemblyScrewPiece'];
  }
  if (lower.includes('wall anchor') || lower.includes('plug')) {
    if (customNames['wallAnchorPlug']) return customNames['wallAnchorPlug'];
  }
  if (lower.includes('float glass') || lower.includes('5mm clear') || lower.includes('tinted')) {
    if (customNames['glassTypeName']) return customNames['glassTypeName'];
  }

  return keyOrDefaultName;
}
