export type FabricationType = 'window' | 'door';

export type WindowType =
  | 'sliding_2_panel'
  | 'sliding_3_panel'
  | 'sliding_4_panel'
  | 'casement_1_panel'
  | 'casement_2_panel'
  | 'casement_3_panel'
  | 'casement_4_panel'
  | 'fixed_window'
  | 'transom_window';

export type DoorType =
  | 'sliding_door_2_panel'
  | 'sliding_door_3_panel'
  | 'sliding_door_4_panel'
  | 'casement_door_single'
  | 'casement_door_double';

export type FabricationKind = WindowType | DoorType;

export interface ConstantProfilesConfig {
  stockProfileLength: number; // default 5800mm
  bladeKerf: number; // default 4mm saw cut loss
  
  // Sliding Window / Door Constants (Outer Frame)
  topBottomTrack: {
    name: string;
    faceWidth: number; // default 30mm or 60mm
    pocketDepth: number; // default 26mm or 40mm
    stockLength: number; // 5800mm
  };
  sideJambs: {
    name: string;
    faceWidth: number; // default 30mm
    pocketDepth: number; // default 18mm
    stockLength: number; // 5800mm
  };
  
  // Sliding Sash Profiles (Operable Panels)
  bottomSashRail: {
    name: string;
    faceWidth: number; // default 50mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };
  topSashRail: {
    name: string;
    faceWidth: number; // default 50mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };
  lockFrameStile: {
    name: string;
    faceWidth: number; // default 53mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };
  interlockFrameStile: {
    name: string;
    faceWidth: number; // default 35mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };

  // Casement Profiles
  casementOuterFrame: {
    name: string;
    faceWidth: number; // default 40mm
    edgeOverlap: number; // default 10mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };
  casementMullion: {
    name: string;
    faceWidth: number; // default 60mm
    edgeOverlap: number; // default 10mm
    stockLength: number; // 5800mm
  };
  casementDeCurveSash: {
    name: string;
    faceWidth: number; // default 60mm
    edgeOverlap: number; // default 10mm
    pocketDepth: number; // default 10mm
    stockLength: number; // 5800mm
  };

  // Fixed / Transom Profiles
  fixedFrame: {
    name: string;
    faceWidth: number; // default 40mm
    pocketDepth: number; // default 15mm
    glassBeadWidth: number; // default 15mm
    stockLength: number; // 5800mm
  };

  // Door Specific Profiles
  doorOuterFrame: {
    name: string;
    faceWidth: number; // default 45mm
    pocketDepth: number; // default 20mm
    stockLength: number; // 5800mm
  };
  doorStile: {
    name: string;
    faceWidth: number; // default 85mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };
  doorTopRail: {
    name: string;
    faceWidth: number; // default 85mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };
  doorBottomRail: {
    name: string;
    faceWidth: number; // default 110mm
    pocketDepth: number; // default 15mm
    stockLength: number; // 5800mm
  };

  // Tolerances and Clearances
  glassClearance: number; // default 4mm
  sashClearance: number; // default 3mm
}

export interface FabricationItemInput {
  id: string;
  tag: string; // e.g. "W1 - Living Room"
  type: FabricationType; // 'window' | 'door'
  kind: FabricationKind; // 'sliding_2_panel', 'casement_2_panel', etc.
  width: number; // in mm
  height: number; // in mm
  quantity: number; // number of identical units
  notes?: string;
}

export interface CutPiece {
  id: string;
  itemId: string;
  itemTag: string;
  profileType: string;
  profileName: string;
  length: number; // mm
  quantity: number;
  cutAngle: '90°' | '45°' | '90° / 45°';
  purpose: string; // e.g. "Top Track", "Bottom Track", "Side Jamb (Left/Right)", "Lock Stile", "Top Sash Rail"
  componentType: 'outer_frame' | 'sash' | 'mullion' | 'bead' | 'door_frame';
}

export interface GlassCutSize {
  itemId: string;
  itemTag: string;
  paneNumber: number;
  width: number; // mm
  height: number; // mm
  quantity: number; // total count across units
  areaM2: number; // area in square meters
  paneDescription: string; // e.g., "Left Sliding Sash Glass", "Fixed Top Glass"
}

export interface AccessoryRequirement {
  name: string;
  category: 'hardware' | 'fastener' | 'seal' | 'chemical';
  quantity: number;
  unit: string; // 'pcs', 'meters', 'tubes', 'rolls'
  description: string;
}

export interface StockBarCut {
  cutLength: number;
  itemTag: string;
  purpose: string;
}

export interface OptimizedStockBar {
  barNumber: number;
  profileName: string;
  stockLength: number;
  usedLength: number;
  wasteLength: number;
  wastePercentage: number;
  cuts: StockBarCut[];
}

export interface ProfileOptimizationResult {
  profileName: string;
  totalLengthRequired: number; // mm
  totalPieces: number;
  barsNeeded: number;
  stockLength: number;
  totalWasteLength: number;
  wastePercentage: number;
  bars: OptimizedStockBar[];
}

export interface ItemCalculationResult {
  item: FabricationItemInput;
  cuts: CutPiece[];
  glasses: GlassCutSize[];
  accessories: AccessoryRequirement[];
}

export interface CombinedProjectCalculation {
  projectName: string;
  dateCalculated: string;
  items: ItemCalculationResult[];
  allCuts: CutPiece[];
  allGlasses: GlassCutSize[];
  profileOptimizations: ProfileOptimizationResult[];
  allAccessories: AccessoryRequirement[];
  totalBarsCount: number;
  totalGlassAreaM2: number;
  totalCutPiecesCount: number;
}

export interface SavedProject {
  id: string;
  name: string;
  dateCreated: string;
  dateUpdated: string;
  items: FabricationItemInput[];
  constantsSnapshot?: ConstantProfilesConfig;
}
