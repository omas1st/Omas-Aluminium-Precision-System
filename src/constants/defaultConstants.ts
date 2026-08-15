import { ConstantProfilesConfig } from '../types';

export const DEFAULT_FABRICATION_CONSTANTS: ConstantProfilesConfig = {
  stockProfileLength: 5800, // standard aluminum profile extrusion bar length in mm
  bladeKerf: 4, // 4mm standard saw blade cut loss

  // 1. Sliding Outer Frame Profiles
  topBottomTrack: {
    name: 'Top / Bottom Track Profile',
    faceWidth: 30, // mm (editable in admin)
    pocketDepth: 26, // mm (rebate depth where side jamb sits)
    stockLength: 5800,
  },
  sideJambs: {
    name: 'Double / Side Jambs Profile',
    faceWidth: 30, // mm
    pocketDepth: 18, // mm
    stockLength: 5800,
  },

  // 2. Sliding Sash Profiles (Operable Panels)
  bottomSashRail: {
    name: 'Bottom Sash Rail (Roller Extrusion)',
    faceWidth: 50, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  topSashRail: {
    name: 'Top Sash Rail Profile',
    faceWidth: 50, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  lockFrameStile: {
    name: 'Lock Frame Profile / Sash Stile (Handle Side)',
    faceWidth: 53, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  interlockFrameStile: {
    name: 'Interlock Frame Profile (Hook/Meeting Stile)',
    faceWidth: 35, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },

  // 3. Casement Window Profiles
  casementOuterFrame: {
    name: 'Casement Outer Frame Profile',
    faceWidth: 40, // mm
    edgeOverlap: 10, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  casementMullion: {
    name: 'Casement Mullion Profile (T-Bar)',
    faceWidth: 60, // mm
    edgeOverlap: 10, // mm
    stockLength: 5800,
  },
  casementDeCurveSash: {
    name: 'Casement Inner Frame (De Curve Sash)',
    faceWidth: 60, // mm
    edgeOverlap: 10, // mm
    pocketDepth: 10, // mm
    stockLength: 5800,
  },
  casementGlazingBead: {
    name: 'Casement Glazing Snap-in Bead',
    faceWidth: 15, // mm
    pocketDepth: 12, // mm
    stockLength: 5800,
  },

  // 4. Transom Window Profiles (Separated from Casement)
  transomOuterFrame: {
    name: 'Transom Window Outer Frame Profile',
    faceWidth: 45, // mm
    edgeOverlap: 10, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  transomMullion: {
    name: 'Transom Intermediate Mullion T-Bar',
    faceWidth: 55, // mm
    edgeOverlap: 10, // mm
    stockLength: 5800,
  },
  transomTopHungSash: {
    name: 'Transom Top-Hung Vent Sash Profile',
    faceWidth: 50, // mm
    edgeOverlap: 10, // mm
    pocketDepth: 10, // mm
    stockLength: 5800,
  },
  transomGlazingBead: {
    name: 'Transom Glazing Bead Profile',
    faceWidth: 15, // mm
    pocketDepth: 12, // mm
    stockLength: 5800,
  },

  // 5. Fixed Frame Profiles
  fixedFrame: {
    name: 'Fixed Window Outer Frame / Bead Profile',
    faceWidth: 40, // mm
    pocketDepth: 15, // mm
    glassBeadWidth: 15, // mm
    stockLength: 5800,
  },

  // 6. Door Profiles
  doorOuterFrame: {
    name: 'Heavy Duty Door Outer Frame',
    faceWidth: 45, // mm
    pocketDepth: 20, // mm
    stockLength: 5800,
  },
  doorStile: {
    name: 'Door Vertical Stile (Hinge/Lock)',
    faceWidth: 85, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  doorTopRail: {
    name: 'Door Top Rail',
    faceWidth: 85, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },
  doorBottomRail: {
    name: 'Door Bottom Rail (Kick Plate Profile)',
    faceWidth: 110, // mm
    pocketDepth: 15, // mm
    stockLength: 5800,
  },

  // Clearances
  glassClearance: 4, // mm allowance for rubber gasket / expansion
  sashClearance: 3, // mm running clearance between sash and tracks
};
