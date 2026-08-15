import {
  ConstantProfilesConfig,
  FabricationItemInput,
  ItemCalculationResult,
  CutPiece,
  GlassCutSize,
  AccessoryRequirement,
  CombinedProjectCalculation,
} from '../types';
import { optimizeProfileCuts } from './optimizer';

export function calculateSingleItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig
): ItemCalculationResult {
  const cuts: CutPiece[] = [];
  const glasses: GlassCutSize[] = [];
  const accessories: AccessoryRequirement[] = [];

  const { width: W, height: H, quantity: qty, tag, id: itemId, kind } = item;

  if (kind.startsWith('sliding_')) {
    calculateSlidingItem(item, constants, cuts, glasses, accessories);
  } else if (kind.startsWith('casement_window') || kind.startsWith('casement_')) {
    calculateCasementItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'fixed_window' || kind === 'transom_window') {
    calculateFixedItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'casement_door_single' || kind === 'casement_door_double') {
    calculateDoorItem(item, constants, cuts, glasses, accessories);
  } else {
    // Default fallback to sliding
    calculateSlidingItem(item, constants, cuts, glasses, accessories);
  }

  return {
    item,
    cuts,
    glasses,
    accessories,
  };
}

function calculateSlidingItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, kind } = item;
  const isDoor = kind.includes('door');

  const topTrack = constants.topBottomTrack;
  const sideJamb = constants.sideJambs;
  const bottomSash = constants.bottomSashRail;
  const topSash = constants.topSashRail;
  const lockStile = constants.lockFrameStile;
  const interlockStile = constants.interlockFrameStile;

  // 1. OUTSIDE FRAME PROFILES
  // Top & Bottom tracks equal to Width
  const topBottomTrackLength = Math.round(W);
  cuts.push({
    id: `${itemId}-top-track`,
    itemId,
    itemTag: tag,
    profileType: 'top_bottom_track',
    profileName: topTrack.name,
    length: topBottomTrackLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Top Track (Head Rail)',
    componentType: 'outer_frame',
  });

  cuts.push({
    id: `${itemId}-bottom-track`,
    itemId,
    itemTag: tag,
    profileType: 'top_bottom_track',
    profileName: topTrack.name,
    length: topBottomTrackLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Bottom Track (Threshold/Sill)',
    componentType: 'outer_frame',
  });

  // Side Tracks (Double/Side Jambs):
  // Formula: Height - 2 * (Top/Bottom Track Face Width - Top/Bottom Track Pocket Depth)
  const trackDiff = Math.max(0, topTrack.faceWidth - topTrack.pocketDepth);
  const sideJambLength = Math.round(H - 2 * trackDiff);

  cuts.push({
    id: `${itemId}-side-jambs`,
    itemId,
    itemTag: tag,
    profileType: 'side_jamb',
    profileName: sideJamb.name,
    length: sideJambLength,
    quantity: 2 * qty,
    cutAngle: '90°',
    purpose: 'Side Jambs (Left & Right)',
    componentType: 'outer_frame',
  });

  // 2. INNER FRAME (SASH PROFILES)
  let panelsCount = 2;
  if (kind === 'sliding_3_panel' || kind === 'sliding_door_3_panel') panelsCount = 3;
  if (kind === 'sliding_4_panel' || kind === 'sliding_door_4_panel') panelsCount = 4;

  // Sash Rails calculation:
  // For 2 panels: (Top/Bottom Track Length / 2) - 2 * sash stile face deduction - 2 * (side jamb faceWidth - side jamb pocketDepth) + overlap
  const jambDiff = Math.max(0, sideJamb.faceWidth - sideJamb.pocketDepth);
  const totalStileDeduction = lockStile.faceWidth + interlockStile.faceWidth;

  let sashRailLength = 0;
  if (panelsCount === 2) {
    // 2-panel formula as specified:
    // (W / 2) - face width of 2 sash stiles - 2 * (face width - pocket depth of side track) + standard 15mm interlock overlap
    const baseWidthHalf = W / 2;
    sashRailLength = Math.round(baseWidthHalf - totalStileDeduction / 2 - 2 * jambDiff + 12);
  } else if (panelsCount === 3) {
    // 3-panel formula: (W / 3) + overlap adjustment
    sashRailLength = Math.round((W / 3) - (totalStileDeduction / 3) - 2 * jambDiff + 16);
  } else {
    // 4-panel formula: (W / 4) + overlap adjustment
    sashRailLength = Math.round((W / 4) - (totalStileDeduction / 4) - 2 * jambDiff + 12);
  }

  sashRailLength = Math.max(100, sashRailLength);

  cuts.push({
    id: `${itemId}-top-sash-rails`,
    itemId,
    itemTag: tag,
    profileType: 'top_sash_rail',
    profileName: topSash.name,
    length: sashRailLength,
    quantity: panelsCount * qty,
    cutAngle: '90°',
    purpose: `Top Sash Rails (${panelsCount} Panels)`,
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-bottom-sash-rails`,
    itemId,
    itemTag: tag,
    profileType: 'bottom_sash_rail',
    profileName: bottomSash.name,
    length: sashRailLength,
    quantity: panelsCount * qty,
    cutAngle: '90°',
    purpose: `Bottom Sash Rails with Roller Cavity (${panelsCount} Panels)`,
    componentType: 'sash',
  });

  // Vertical Stiles (Lock Frame & Interlock):
  // Formula: Side Jamb length subtracted by face width of top track
  const verticalStileLength = Math.round(sideJambLength - topTrack.faceWidth - constants.sashClearance);

  const lockStilesCount = panelsCount === 4 ? 2 : (panelsCount === 3 ? 2 : 2);
  const interlockStilesCount = panelsCount === 4 ? 4 : (panelsCount === 3 ? 4 : 2);

  cuts.push({
    id: `${itemId}-lock-stiles`,
    itemId,
    itemTag: tag,
    profileType: 'lock_stile',
    profileName: lockStile.name,
    length: verticalStileLength,
    quantity: lockStilesCount * qty,
    cutAngle: '90°',
    purpose: `Lock Frame Stiles / Handle Stiles (${lockStilesCount} pcs)`,
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-interlock-stiles`,
    itemId,
    itemTag: tag,
    profileType: 'interlock_stile',
    profileName: interlockStile.name,
    length: verticalStileLength,
    quantity: interlockStilesCount * qty,
    cutAngle: '90°',
    purpose: `Interlock Hook Stiles (${interlockStilesCount} pcs)`,
    componentType: 'sash',
  });

  // 3. GLASS CUTTING MEASUREMENTS
  // Width of glass: Top/Bottom Sash Rail length + Pocket Depth of Lock Stile + Pocket Depth of Interlock Stile - Glass Clearance
  const glassW = Math.round(sashRailLength + lockStile.pocketDepth + interlockStile.pocketDepth - constants.glassClearance);

  // Height of glass: Lock Stile length - ((Top Sash Face Width - Pocket Depth) + (Bottom Sash Face Width - Pocket Depth)) - Glass Clearance
  const topSashAllowance = Math.max(0, topSash.faceWidth - topSash.pocketDepth);
  const bottomSashAllowance = Math.max(0, bottomSash.faceWidth - bottomSash.pocketDepth);
  const glassH = Math.round(verticalStileLength - (topSashAllowance + bottomSashAllowance) - constants.glassClearance);

  const paneAreaM2 = (glassW * glassH) / 1000000;

  for (let p = 1; p <= panelsCount; p++) {
    glasses.push({
      itemId,
      itemTag: tag,
      paneNumber: p,
      width: glassW,
      height: glassH,
      quantity: 1 * qty,
      areaM2: Number((paneAreaM2 * qty).toFixed(3)),
      paneDescription: `Panel #${p} Glass (${isDoor ? 'Door' : 'Window'} Slider)`,
    });
  }

  // 4. ACCESSORIES & HARDWARE
  const rollersCount = panelsCount * 2 * qty;
  accessories.push({
    name: isDoor ? 'Heavy-Duty Brass Tandem Sliding Rollers' : 'Sliding Sash Ball Bearing Rollers',
    category: 'hardware',
    quantity: rollersCount,
    unit: 'pcs',
    description: `2 rollers per operable panel (${panelsCount} panels)`,
  });

  const locksCount = (panelsCount === 4 ? 2 : 1) * qty;
  accessories.push({
    name: isDoor ? 'Sliding Door Hook Mortise Lock with Key' : 'Crescent Sash Lock / Flush Lock',
    category: 'hardware',
    quantity: locksCount,
    unit: 'pcs',
    description: `Center/Side locking mechanism`,
  });

  // Woolpile weatherstrip (all sash perimeters + interlocks)
  const woolpileMeters = Math.ceil(((verticalStileLength * 4 + sashRailLength * 4) * panelsCount * qty) / 1000);
  accessories.push({
    name: 'Woolpile Weatherstripping Seal (Brush Gasket)',
    category: 'seal',
    quantity: woolpileMeters,
    unit: 'meters',
    description: 'Draft, dust, and sound reduction seal for sash perimeter and hook tracks',
  });

  // Glass rubber gasket
  const rubberGasketMeters = Math.ceil(((glassW * 2 + glassH * 2) * panelsCount * qty) / 1000);
  accessories.push({
    name: 'U-Channel Rubber Glazing Gasket (EPDM)',
    category: 'seal',
    quantity: rubberGasketMeters,
    unit: 'meters',
    description: 'Shock-absorbing glass wrapper for sash channel installation',
  });

  // Screws & Fasteners
  const cornerScrews = (panelsCount * 8 + 8) * qty;
  accessories.push({
    name: 'Self-Tapping Assembly Screws (#8 x 1½")',
    category: 'fastener',
    quantity: cornerScrews,
    unit: 'pcs',
    description: 'Corner assembly for outer frame and sash rails',
  });

  // Silicone sealant
  const siliconeTubes = Math.max(1, Math.ceil((W * 2 + H * 2) * qty / 8000));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and perimeter framing joint seal',
  });
}

function calculateCasementItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, kind } = item;
  const outer = constants.casementOuterFrame;
  const mullion = constants.casementMullion;
  const deCurve = constants.casementDeCurveSash;

  let panelsCount = 1;
  if (kind === 'casement_2_panel' || kind === 'casement_door_double') panelsCount = 2;
  if (kind === 'casement_3_panel') panelsCount = 3;
  if (kind === 'casement_4_panel') panelsCount = 4;

  // Outer frame cuts (45° miter cuts on all corners)
  cuts.push({
    id: `${itemId}-outer-top-bottom`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer',
    profileName: outer.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Outer Frame Top & Bottom Rails',
    componentType: 'outer_frame',
  });

  cuts.push({
    id: `${itemId}-outer-sides`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer',
    profileName: outer.name,
    length: Math.round(H),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Outer Frame Side Jambs',
    componentType: 'outer_frame',
  });

  // Mullions if > 1 panel
  const mullionsCount = panelsCount - 1;
  const mullionLength = Math.round(H - 2 * (outer.faceWidth - outer.edgeOverlap));

  if (mullionsCount > 0) {
    cuts.push({
      id: `${itemId}-mullions`,
      itemId,
      itemTag: tag,
      profileType: 'casement_mullion',
      profileName: mullion.name,
      length: mullionLength,
      quantity: mullionsCount * qty,
      cutAngle: '90°',
      purpose: `Center Vertical Mullion T-Bars (${mullionsCount} pcs)`,
      componentType: 'mullion',
    });
  }

  // Inner sash (De Curve) for each panel:
  // Bay width = (W - 2 * outer.faceWidth - mullionsCount * mullion.faceWidth) / panelsCount
  const innerOpeningWidth = (W - 2 * (outer.faceWidth - outer.edgeOverlap) - mullionsCount * (mullion.faceWidth - 2 * mullion.edgeOverlap));
  const bayWidth = Math.max(150, innerOpeningWidth / panelsCount);
  const bayHeight = Math.max(150, H - 2 * (outer.faceWidth - outer.edgeOverlap));

  // De Curve sash cut sizes (45° miter):
  // Sash outer dimensions overlap the outer frame/mullion by edgeOverlap (10mm)
  const sashW = Math.round(bayWidth + 2 * deCurve.edgeOverlap - 4);
  const sashH = Math.round(bayHeight + 2 * deCurve.edgeOverlap - 4);

  cuts.push({
    id: `${itemId}-decurve-width`,
    itemId,
    itemTag: tag,
    profileType: 'casement_decurve',
    profileName: deCurve.name,
    length: sashW,
    quantity: panelsCount * 2 * qty,
    cutAngle: '45°',
    purpose: `De Curve Operable Sash Top & Bottom (${panelsCount} Panes)`,
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-decurve-height`,
    itemId,
    itemTag: tag,
    profileType: 'casement_decurve',
    profileName: deCurve.name,
    length: sashH,
    quantity: panelsCount * 2 * qty,
    cutAngle: '45°',
    purpose: `De Curve Operable Sash Left & Right (${panelsCount} Panes)`,
    componentType: 'sash',
  });

  // Glass cut size for casement:
  const glassW = Math.round(sashW - 2 * (deCurve.faceWidth - deCurve.pocketDepth) - constants.glassClearance);
  const glassH = Math.round(sashH - 2 * (deCurve.faceWidth - deCurve.pocketDepth) - constants.glassClearance);
  const paneAreaM2 = (glassW * glassH) / 1000000;

  for (let p = 1; p <= panelsCount; p++) {
    glasses.push({
      itemId,
      itemTag: tag,
      paneNumber: p,
      width: glassW,
      height: glassH,
      quantity: 1 * qty,
      areaM2: Number((paneAreaM2 * qty).toFixed(3)),
      paneDescription: `Casement Operable Pane #${p} Glass`,
    });
  }

  // Accessories:
  accessories.push({
    name: 'Heavy Duty Stainless Steel 304 Friction Stays (Hinges)',
    category: 'hardware',
    quantity: panelsCount * 2 * qty,
    unit: 'pcs (pairs)',
    description: 'Top & bottom or side hinges for projected sash opening',
  });

  accessories.push({
    name: 'Casement Cockspur / Espagnolette Multipoint Handle',
    category: 'hardware',
    quantity: panelsCount * qty,
    unit: 'pcs',
    description: 'Locking handles for operable sashes',
  });

  const gasketMeters = Math.ceil(((sashW * 2 + sashH * 2) * 2 * panelsCount * qty) / 1000);
  accessories.push({
    name: 'Casement Bubble / Wedge EPDM Weather Seal',
    category: 'seal',
    quantity: gasketMeters,
    unit: 'meters',
    description: 'Acoustic and airtight dual rebate seal',
  });

  const cornerCleats = panelsCount * 4 * qty;
  accessories.push({
    name: 'Cast Aluminum Corner Cleats (Miter Joints)',
    category: 'fastener',
    quantity: cornerCleats + 4 * qty,
    unit: 'pcs',
    description: 'Mechanical locking joints for 45-degree miter cuts',
  });
}

function calculateFixedItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, kind } = item;
  const frame = constants.fixedFrame;

  cuts.push({
    id: `${itemId}-fixed-top-bottom`,
    itemId,
    itemTag: tag,
    profileType: 'fixed_frame',
    profileName: frame.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Fixed Outer Frame Top & Bottom',
    componentType: 'outer_frame',
  });

  cuts.push({
    id: `${itemId}-fixed-sides`,
    itemId,
    itemTag: tag,
    profileType: 'fixed_frame',
    profileName: frame.name,
    length: Math.round(H),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Fixed Outer Frame Left & Right',
    componentType: 'outer_frame',
  });

  // Glass Beads (Bead snap-ins):
  const beadW = Math.round(W - 2 * frame.faceWidth);
  const beadH = Math.round(H - 2 * frame.faceWidth);

  cuts.push({
    id: `${itemId}-glass-bead-w`,
    itemId,
    itemTag: tag,
    profileType: 'fixed_bead',
    profileName: 'Snap-in Glass Bead Profile',
    length: beadW,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Glass Snap-in Glazing Beads (Top & Bottom)',
    componentType: 'bead',
  });

  cuts.push({
    id: `${itemId}-glass-bead-h`,
    itemId,
    itemTag: tag,
    profileType: 'fixed_bead',
    profileName: 'Snap-in Glass Bead Profile',
    length: beadH,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Glass Snap-in Glazing Beads (Sides)',
    componentType: 'bead',
  });

  // Glass Size:
  const glassW = Math.round(W - 2 * (frame.faceWidth - frame.pocketDepth) - constants.glassClearance);
  const glassH = Math.round(H - 2 * (frame.faceWidth - frame.pocketDepth) - constants.glassClearance);
  const paneAreaM2 = (glassW * glassH) / 1000000;

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: glassW,
    height: glassH,
    quantity: 1 * qty,
    areaM2: Number((paneAreaM2 * qty).toFixed(3)),
    paneDescription: `${kind === 'transom_window' ? 'Transom Highlight' : 'Fixed Picture Window'} 1-Pane Glass`,
  });

  // Accessories:
  const gasketMeters = Math.ceil(((glassW * 2 + glassH * 2) * qty) / 1000);
  accessories.push({
    name: 'Glazing Wedge Gasket & Setting Blocks',
    category: 'seal',
    quantity: gasketMeters,
    unit: 'meters',
    description: 'Neoprene setting blocks and wedge rubber for fixed frame glass',
  });

  accessories.push({
    name: 'Frame Anchor Screws with Plastic Plugs',
    category: 'fastener',
    quantity: 8 * qty,
    unit: 'pcs',
    description: 'Masonry wall fixing screws',
  });
}

function calculateDoorItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, kind } = item;
  const isDouble = kind === 'casement_door_double';
  const doorLeaves = isDouble ? 2 : 1;

  const frame = constants.doorOuterFrame;
  const stile = constants.doorStile;
  const topRail = constants.doorTopRail;
  const bottomRail = constants.doorBottomRail;

  // Door Outer Frame (Top + 2 Side Jambs)
  cuts.push({
    id: `${itemId}-door-frame-head`,
    itemId,
    itemTag: tag,
    profileType: 'door_frame',
    profileName: frame.name,
    length: Math.round(W),
    quantity: 1 * qty,
    cutAngle: '90° / 45°',
    purpose: 'Door Frame Header',
    componentType: 'door_frame',
  });

  cuts.push({
    id: `${itemId}-door-frame-jambs`,
    itemId,
    itemTag: tag,
    profileType: 'door_frame',
    profileName: frame.name,
    length: Math.round(H),
    quantity: 2 * qty,
    cutAngle: '90° / 45°',
    purpose: 'Door Frame Side Jambs',
    componentType: 'door_frame',
  });

  // Door Leaf Stiles (Hinge & Lock Stiles):
  const leafHeight = Math.round(H - frame.faceWidth - 10); // clearance at bottom
  cuts.push({
    id: `${itemId}-door-leaf-stiles`,
    itemId,
    itemTag: tag,
    profileType: 'door_stile',
    profileName: stile.name,
    length: leafHeight,
    quantity: doorLeaves * 2 * qty,
    cutAngle: '90°',
    purpose: `Door Leaf Stiles (${doorLeaves} Leaf - Hinge/Lock)`,
    componentType: 'sash',
  });

  // Door Rails:
  const leafWidth = Math.round((W - 2 * frame.faceWidth - (isDouble ? 6 : 0)) / doorLeaves);
  const railLength = Math.round(leafWidth - 2 * stile.faceWidth + 2 * stile.pocketDepth);

  cuts.push({
    id: `${itemId}-door-top-rail`,
    itemId,
    itemTag: tag,
    profileType: 'door_top_rail',
    profileName: topRail.name,
    length: railLength,
    quantity: doorLeaves * qty,
    cutAngle: '90°',
    purpose: `Door Leaf Top Rails (${doorLeaves} Leaf)`,
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-door-bottom-rail`,
    itemId,
    itemTag: tag,
    profileType: 'door_bottom_rail',
    profileName: bottomRail.name,
    length: railLength,
    quantity: doorLeaves * qty,
    cutAngle: '90°',
    purpose: `Door Leaf Bottom Kick Rails (${doorLeaves} Leaf)`,
    componentType: 'sash',
  });

  // Glass / Panel:
  const glassW = Math.round(railLength + 2 * stile.pocketDepth - constants.glassClearance);
  const glassH = Math.round(leafHeight - topRail.faceWidth - bottomRail.faceWidth + topRail.pocketDepth + bottomRail.pocketDepth - constants.glassClearance);
  const paneAreaM2 = (glassW * glassH) / 1000000;

  for (let l = 1; l <= doorLeaves; l++) {
    glasses.push({
      itemId,
      itemTag: tag,
      paneNumber: l,
      width: glassW,
      height: glassH,
      quantity: 1 * qty,
      areaM2: Number((paneAreaM2 * qty).toFixed(3)),
      paneDescription: `Door Leaf #${l} Tempered / Laminated Glass Panel`,
    });
  }

  // Accessories:
  accessories.push({
    name: 'Heavy Duty Butt Hinges / Bearing Pivot Hinges',
    category: 'hardware',
    quantity: doorLeaves * 3 * qty,
    unit: 'pcs',
    description: '3 hinges per door leaf for heavy aluminum doors',
  });

  accessories.push({
    name: 'Euro Profile Mortise Sashlock with Cylinder & Escutcheons',
    category: 'hardware',
    quantity: doorLeaves * qty,
    unit: 'sets',
    description: 'Keyed cylinder lock with lever handle set',
  });

  accessories.push({
    name: 'Overhead Hydraulic Door Closer (Heavy Duty)',
    category: 'hardware',
    quantity: doorLeaves * qty,
    unit: 'pcs',
    description: 'Adjustable speed automatic door closer',
  });
}

export function calculateEntireProject(
  projectName: string,
  items: FabricationItemInput[],
  constants: ConstantProfilesConfig
): CombinedProjectCalculation {
  const calculatedItems: ItemCalculationResult[] = items.map((it) =>
    calculateSingleItem(it, constants)
  );

  const allCuts: CutPiece[] = [];
  const allGlasses: GlassCutSize[] = [];
  const accessoryMap = new Map<string, AccessoryRequirement>();

  calculatedItems.forEach((calc) => {
    allCuts.push(...calc.cuts);
    allGlasses.push(...calc.glasses);
    calc.accessories.forEach((acc) => {
      if (accessoryMap.has(acc.name)) {
        const existing = accessoryMap.get(acc.name)!;
        existing.quantity += acc.quantity;
      } else {
        accessoryMap.set(acc.name, { ...acc });
      }
    });
  });

  const allAccessories = Array.from(accessoryMap.values());

  // Optimize profiles cutting stock (1D bin packing / cut plan):
  const profileOptimizations = optimizeProfileCuts(allCuts, constants);

  const totalBarsCount = profileOptimizations.reduce((sum, p) => sum + p.barsNeeded, 0);
  const totalGlassAreaM2 = Number(
    allGlasses.reduce((sum, g) => sum + g.areaM2, 0).toFixed(2)
  );
  const totalCutPiecesCount = allCuts.reduce((sum, c) => sum + c.quantity, 0);

  return {
    projectName,
    dateCalculated: new Date().toISOString(),
    items: calculatedItems,
    allCuts,
    allGlasses,
    profileOptimizations,
    allAccessories,
    totalBarsCount,
    totalGlassAreaM2,
    totalCutPiecesCount,
  };
}
