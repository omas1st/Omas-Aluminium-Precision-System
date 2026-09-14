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

  if (kind === 'sliding_fixed_window') {
    calculateSlidingFixedItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'sliding_1_fixed_1_sliding') {
    calculateSlidingOneFixedOneSlidingItem(item, constants, cuts, glasses, accessories);
  } else if (kind.startsWith('sliding_')) {
    calculateSlidingItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'transom_2_panel') {
    calculateTransomTwoPanelItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'transom_window') {
    calculateTransomSinglePanelItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'casement_fixed_window') {
    calculateCasementFixedItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'casement_1_fixed_1_open') {
    calculateCasementOneFixedOneOpenItem(item, constants, cuts, glasses, accessories);
  } else if (kind.startsWith('casement_window') || kind.startsWith('casement_')) {
    calculateCasementItem(item, constants, cuts, glasses, accessories);
  } else if (kind === 'fixed_window') {
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
    profileType: 'top_bottom_sash_rail',
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
    profileType: 'top_bottom_sash_rail',
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

  // Sliding Features & Add-ons: 11:32 Slidable Mosquito Net Screen & Glazing Dividers (No burglary)
  addSlidingAddons(item, constants, cuts, accessories, panelsCount, glassW);
}

function calculateSlidingFixedItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId } = item;
  const topTrack = constants.topBottomTrack;
  const sideJamb = constants.sideJambs;

  const topBottomTrackLength = Math.round(W);
  cuts.push({
    id: `${itemId}-fixed-top-track`,
    itemId,
    itemTag: tag,
    profileType: 'top_bottom_track',
    profileName: topTrack.name,
    length: topBottomTrackLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Fixed Sliding Frame Head Track',
    componentType: 'outer_frame',
  });

  cuts.push({
    id: `${itemId}-fixed-bottom-track`,
    itemId,
    itemTag: tag,
    profileType: 'top_bottom_track',
    profileName: topTrack.name,
    length: topBottomTrackLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Fixed Sliding Frame Sill Track',
    componentType: 'outer_frame',
  });

  const trackDiff = Math.max(0, topTrack.faceWidth - topTrack.pocketDepth);
  const sideJambLength = Math.round(H - 2 * trackDiff);

  cuts.push({
    id: `${itemId}-fixed-side-jambs`,
    itemId,
    itemTag: tag,
    profileType: 'side_jamb',
    profileName: sideJamb.name,
    length: sideJambLength,
    quantity: 2 * qty,
    cutAngle: '90°',
    purpose: 'Fixed Sliding Frame Side Jambs (Left & Right)',
    componentType: 'outer_frame',
  });

  // Glass Size for Fixed Sliding Frame:
  const jambDiff = Math.max(0, sideJamb.faceWidth - sideJamb.pocketDepth);
  const glassW = Math.round(W - 2 * jambDiff - constants.glassClearance);
  const glassH = Math.round(sideJambLength - constants.glassClearance);
  const paneAreaM2 = (glassW * glassH) / 1000000;

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: glassW,
    height: glassH,
    quantity: 1 * qty,
    areaM2: Number((paneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Fixed Sliding Picture Window 1-Pane Glass',
  });

  const gasketMeters = Math.ceil(((glassW * 2 + glassH * 2) * qty) / 1000);
  accessories.push({
    name: 'Glazing Wedge EPDM Rubber Gasket & Setting Blocks',
    category: 'seal',
    quantity: gasketMeters,
    unit: 'meters',
    description: 'Neoprene setting blocks and wedge rubber for fixed frame glass',
  });

  accessories.push({
    name: 'Self-Tapping Assembly Screws (#8 x 1½")',
    category: 'fastener',
    quantity: 12 * qty,
    unit: 'pcs',
    description: 'Corner assembly for outer sliding track frame',
  });

  const siliconeTubes = Math.max(1, Math.ceil(((W * 2 + H * 2) * qty) / 8000));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and perimeter framing joint seal',
  });

  // Sliding Features & Add-ons
  addSlidingAddons(item, constants, cuts, accessories, 1, glassW);
}

function calculateSlidingOneFixedOneSlidingItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId } = item;
  const topTrack = constants.topBottomTrack;
  const sideJamb = constants.sideJambs;
  const bottomSash = constants.bottomSashRail;
  const topSash = constants.topSashRail;
  const lockStile = constants.lockFrameStile;
  const interlockStile = constants.interlockFrameStile;

  // Outer frame
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

  // 1 Operable Sash (Sliding Panel)
  const jambDiff = Math.max(0, sideJamb.faceWidth - sideJamb.pocketDepth);
  const totalStileDeduction = lockStile.faceWidth + interlockStile.faceWidth;
  const sashRailLength = Math.max(100, Math.round(W / 2 - totalStileDeduction / 2 - 2 * jambDiff + 12));
  const verticalStileLength = Math.round(sideJambLength - topTrack.faceWidth - constants.sashClearance);

  cuts.push({
    id: `${itemId}-top-sash-rail`,
    itemId,
    itemTag: tag,
    profileType: 'top_bottom_sash_rail',
    profileName: topSash.name,
    length: sashRailLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Top Sash Rail (1 Operable Sliding Panel)',
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-bottom-sash-rail`,
    itemId,
    itemTag: tag,
    profileType: 'top_bottom_sash_rail',
    profileName: bottomSash.name,
    length: sashRailLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Bottom Sash Rail with Roller Cavity (1 Operable Sliding Panel)',
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-lock-stile`,
    itemId,
    itemTag: tag,
    profileType: 'lock_stile',
    profileName: lockStile.name,
    length: verticalStileLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Lock Frame Stile (Handle Side)',
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-interlock-stile`,
    itemId,
    itemTag: tag,
    profileType: 'interlock_stile',
    profileName: interlockStile.name,
    length: verticalStileLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Interlock Meeting Hook Stile (Center Joint)',
    componentType: 'sash',
  });

  // Glass: 1 Fixed Pane + 1 Operable Sash Glass Pane
  // Operable Glass:
  const topSashAllowance = Math.max(0, topSash.faceWidth - topSash.pocketDepth);
  const bottomSashAllowance = Math.max(0, bottomSash.faceWidth - bottomSash.pocketDepth);
  const sashGlassW = Math.round(sashRailLength + lockStile.pocketDepth + interlockStile.pocketDepth - constants.glassClearance);
  const sashGlassH = Math.round(verticalStileLength - (topSashAllowance + bottomSashAllowance) - constants.glassClearance);
  const sashPaneAreaM2 = (sashGlassW * sashGlassH) / 1000000;

  // Fixed Glass:
  const fixedGlassW = Math.round(W / 2 + 10 - jambDiff - constants.glassClearance);
  const fixedGlassH = Math.round(sideJambLength - constants.glassClearance);
  const fixedPaneAreaM2 = (fixedGlassW * fixedGlassH) / 1000000;

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: fixedGlassW,
    height: fixedGlassH,
    quantity: 1 * qty,
    areaM2: Number((fixedPaneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Fixed Bay Glass Pane (Panel #1)',
  });

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 2,
    width: sashGlassW,
    height: sashGlassH,
    quantity: 1 * qty,
    areaM2: Number((sashPaneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Sliding Operable Sash Glass (Panel #2)',
  });

  // Accessories: 2 rollers, 1 lock, seals, screws, silicone
  accessories.push({
    name: 'Sliding Sash Ball Bearing Rollers',
    category: 'hardware',
    quantity: 2 * qty,
    unit: 'pcs',
    description: '2 rollers for 1 operable sliding panel',
  });

  accessories.push({
    name: 'Crescent Sash Lock / Flush Lock',
    category: 'hardware',
    quantity: 1 * qty,
    unit: 'pcs',
    description: 'Locking mechanism for sliding sash',
  });

  const woolpileMeters = Math.ceil(((verticalStileLength * 4 + sashRailLength * 4) * qty) / 1000);
  accessories.push({
    name: 'Woolpile Weatherstripping Seal (Brush Gasket)',
    category: 'seal',
    quantity: woolpileMeters,
    unit: 'meters',
    description: 'Draft seal for operable sash and meeting interlock',
  });

  const rubberGasketMeters = Math.ceil(((sashGlassW * 2 + sashGlassH * 2 + fixedGlassW * 2 + fixedGlassH * 2) * qty) / 1000);
  accessories.push({
    name: 'U-Channel Rubber Glazing Gasket & Wedge',
    category: 'seal',
    quantity: rubberGasketMeters,
    unit: 'meters',
    description: 'Shock-absorbing glass wrapper for sliding and fixed pane',
  });

  accessories.push({
    name: 'Self-Tapping Assembly Screws (#8 x 1½")',
    category: 'fastener',
    quantity: 16 * qty,
    unit: 'pcs',
    description: 'Assembly screws for frame and sash joints',
  });

  const siliconeTubes = Math.max(1, Math.ceil(((W * 2 + H * 2) * qty) / 8000));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and perimeter framing joint seal',
  });

  // Sliding Features & Add-ons: 11:32 Slidable Mosquito Net Screen & Glazing Dividers (No burglary)
  addSlidingAddons(item, constants, cuts, accessories, 2, sashGlassW);
}

/**
 * Sliding Window & Door Add-ons:
 * Exclusively provides:
 * 1. 11:32 Slidable Mosquito Net Screen (2 Slidable Panels: normal width divided by 2 with 4 Rails & 4 Stiles)
 * 2. Glazing Divider Bars (Colonial / Georgian)
 * NOTE: Burglary proofing is strictly removed for sliding systems (burglary is for casement & transom).
 */
function addSlidingAddons(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  accessories: AccessoryRequirement[],
  panelsCount: number,
  glassW: number
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, hasNet, dividerCount } = item;

  // 1. 11:32 Slidable Window Mosquito Net Screen (2 Slidable Panels)
  if (hasNet !== false) {
    const net1132 = constants.netFrame1132 || { name: '11:32 Mosquito Net Frame Profile (5.8m)', faceWidth: 32 };
    // Divide normal width by 2 so it separates and is slidable:
    const net1132W = Math.round(Math.max(50, (W - 20) / 2));
    const net1132H = Math.round(Math.max(100, H - 20));

    // 4 Horizontal Rails (2 Top rails + 2 Bottom rails across the 2 slidable panels)
    cuts.push({
      id: `${itemId}-net-1132-slidable-rails`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1132',
      profileName: net1132.name,
      length: net1132W,
      quantity: 4 * qty,
      cutAngle: '45°',
      purpose: '11:32 Slidable Net Frame Top & Bottom Rails (2 Sliding Panels - 4 pcs)',
      componentType: 'net',
    });

    // 4 Vertical Stiles (2 Left/Right outer stiles + 2 new 11:32 height stiles at the separation meeting sides)
    cuts.push({
      id: `${itemId}-net-1132-slidable-stiles`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1132',
      profileName: net1132.name,
      length: net1132H,
      quantity: 4 * qty,
      cutAngle: '45°',
      purpose: '11:32 Slidable Net Frame Side Stiles (2 Sliding Panels - 4 pcs, includes 2 separation meeting stiles)',
      componentType: 'net',
    });

    // Net Fabric & Spline Rubber for 2 Slidable Panels:
    const netMeshW = net1132W + 60;
    const netMeshH = net1132H + 60;
    const netMeshAreaM2 = ((netMeshW * netMeshH * 2) / 1000000) * qty;

    accessories.push({
      name: `Fiberglass Insect / Mosquito Net Mesh (2 Slidable Panels: ${netMeshW}mm x ${netMeshH}mm cut)`,
      category: 'seal',
      quantity: Number(netMeshAreaM2.toFixed(2)),
      unit: 'm²',
      description: 'Insect proofing screen mesh insert for 2 slidable 11:32 panels',
    });

    const netRubberMeters = Math.ceil(((net1132W * 4 + net1132H * 4) * qty) / 1000);
    accessories.push({
      name: '11:32 Net Rubber Spline Gasket (Spline Cord)',
      category: 'seal',
      quantity: netRubberMeters,
      unit: 'meters',
      description: 'Spline cord to secure mesh tightly into 11:32 slidable frame channels',
    });

    accessories.push({
      name: '11:32 Slidable Net Screen Bottom Rollers / Guide Sliders',
      category: 'hardware',
      quantity: 4 * qty,
      unit: 'pcs',
      description: 'Smooth-gliding net screen roller runners (2 per slidable panel)',
    });
  }

  // 2. Glazing Divider Bars (Colonial / Georgian)
  const effDividers = dividerCount !== undefined ? dividerCount : 0;
  if (effDividers > 0 && constants.glazingDivider) {
    cuts.push({
      id: `${itemId}-glazing-dividers`,
      itemId,
      itemTag: tag,
      profileType: 'glazing_divider',
      profileName: constants.glazingDivider.name,
      length: Math.round(glassW),
      quantity: panelsCount * effDividers * qty,
      cutAngle: '90°',
      purpose: `Glazing Divider Bar Profile (${effDividers} bar${effDividers > 1 ? 's' : ''} per panel across ${panelsCount} sliding panels)`,
      componentType: 'divider',
    });
  }
}

function addBurglaryAndNetCuts(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, hasBurglary, hasNet } = item;

  if (hasBurglary) {
    // 1. Burglary Frame (for Casement & Transom)
    // Top & Sides use casementBurglaryTopSideFrame, Bottom uses casementBurglaryBottomFrame
    const topSideFrame = constants.casementBurglaryTopSideFrame;
    const bottomFrame = constants.casementBurglaryBottomFrame;

    // Top frame (1 pc per unit, length W, 45° miter)
    cuts.push({
      id: `${itemId}-burglary-top-frame`,
      itemId,
      itemTag: tag,
      profileType: 'burglary_frame',
      profileName: topSideFrame.name,
      length: Math.round(W),
      quantity: 1 * qty,
      cutAngle: '45°',
      purpose: 'Burglary Proofing Top Frame Profile',
      componentType: 'burglary',
    });

    // Bottom frame (1 pc per unit, length W, 45° miter)
    cuts.push({
      id: `${itemId}-burglary-bottom-frame`,
      itemId,
      itemTag: tag,
      profileType: 'burglary_frame',
      profileName: bottomFrame.name,
      length: Math.round(W),
      quantity: 1 * qty,
      cutAngle: '45°',
      purpose: 'Burglary Proofing Bottom Frame Profile',
      componentType: 'burglary',
    });

    // Side frames (2 pcs per unit, length H, 45° miter)
    cuts.push({
      id: `${itemId}-burglary-side-frames`,
      itemId,
      itemTag: tag,
      profileType: 'burglary_frame',
      profileName: topSideFrame.name,
      length: Math.round(H),
      quantity: 2 * qty,
      cutAngle: '45°',
      purpose: 'Burglary Proofing Left & Right Side Frame Profiles',
      componentType: 'burglary',
    });

    // 2. Burglary Iron Rod / Ballo Straight (Length = W + 100mm, with 50mm pressed end tabs)
    // Distance between iron pipes strictly in the range of 100mm - 150mm:
    const rodConfig = constants.burglaryIronRod || {
      name: 'Burglary Iron Rod / Ballo Straight (5.8m)',
      stockLength: 5800,
      spacingMin: 100,
      spacingMax: 150,
      extraLength: 100,
    };
    const targetSpacing = 125; // 100mm-150mm range center
    const numDivisions = Math.max(2, Math.round(H / targetSpacing));
    const rodSpacing = Math.round(H / numDivisions);
    const numRods = Math.max(1, numDivisions - 1);
    const rodLength = Math.round(W + (rodConfig.extraLength || 100));

    cuts.push({
      id: `${itemId}-burglary-iron-rods`,
      itemId,
      itemTag: tag,
      profileType: 'burglary_rod',
      profileName: rodConfig.name,
      length: rodLength,
      quantity: numRods * qty,
      cutAngle: '90°',
      purpose: `Burglary Iron Rod / Ballo Straight (${numRods} rods @ ~${rodSpacing}mm c/c with 50mm end tabs)`,
      componentType: 'burglary',
    });

    // 3. 11:32 Slidable Net Frame (Width divided by 2 for slidable panels, with 4 rails and 4 stiles)
    const net1132 = constants.netFrame1132;
    const net1132W = Math.round(Math.max(50, (W - 20) / 2));
    const net1132H = Math.round(Math.max(100, H - 20));

    cuts.push({
      id: `${itemId}-net-1132-slidable-rails`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1132',
      profileName: net1132.name,
      length: net1132W,
      quantity: 4 * qty,
      cutAngle: '45°',
      purpose: '11:32 Slidable Net Frame Top & Bottom Rails (2 Sliding Panels - 4 pcs)',
      componentType: 'net',
    });

    cuts.push({
      id: `${itemId}-net-1132-slidable-stiles`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1132',
      profileName: net1132.name,
      length: net1132H,
      quantity: 4 * qty,
      cutAngle: '45°',
      purpose: '11:32 Slidable Net Frame Side Stiles (2 Sliding Panels - 4 pcs, includes 2 separation meeting stiles)',
      componentType: 'net',
    });

    // 4. Net Fabric & Spline Rubber
    const netMeshW = net1132W + 60;
    const netMeshH = net1132H + 60;
    const netMeshAreaM2 = ((netMeshW * netMeshH * 2) / 1000000) * qty;

    accessories.push({
      name: `Fiberglass Insect / Mosquito Net Mesh (2 Slidable Panels: ${netMeshW}mm x ${netMeshH}mm cut)`,
      category: 'seal',
      quantity: Number(netMeshAreaM2.toFixed(2)),
      unit: 'm²',
      description: 'Insect proofing screen mesh insert for 2 slidable 11:32 panels',
    });

    const netRubberMeters = Math.ceil(((net1132W * 4 + net1132H * 4) * qty) / 1000);
    accessories.push({
      name: '11:32 Net Rubber Spline Gasket (Spline Cord)',
      category: 'seal',
      quantity: netRubberMeters,
      unit: 'meters',
      description: 'Spline cord to secure mesh tightly into 11:32 channels',
    });

  } else if (hasNet) {
    // Ordinary Casement Net (when no burglary proofing)
    // 11:26 Top Frame (1 pc length W)
    const net1126 = constants.netFrame1126;
    cuts.push({
      id: `${itemId}-net-1126-top`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1126',
      profileName: net1126.name,
      length: Math.round(W),
      quantity: 1 * qty,
      cutAngle: '90° / 45°',
      purpose: '11:26 Casement Net Guide Frame (Top Rail)',
      componentType: 'net',
    });

    // 11:25 Sides & Bottom Frame (2 pcs length H, 1 pc length W)
    const net1125 = constants.netFrame1125;
    cuts.push({
      id: `${itemId}-net-1125-bottom`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1125',
      profileName: net1125.name,
      length: Math.round(W),
      quantity: 1 * qty,
      cutAngle: '90° / 45°',
      purpose: '11:25 Casement Net Guide Frame (Bottom Sill)',
      componentType: 'net',
    });

    cuts.push({
      id: `${itemId}-net-1125-sides`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1125',
      profileName: net1125.name,
      length: Math.round(H),
      quantity: 2 * qty,
      cutAngle: '90° / 45°',
      purpose: '11:25 Casement Net Guide Frame (Side Jambs)',
      componentType: 'net',
    });

    // 11:32 Slidable Net Frame (2 Panels: width divided by 2, 4 rails, 4 stiles)
    const net1132 = constants.netFrame1132;
    const net1132W = Math.round(Math.max(50, (W - 20) / 2));
    const net1132H = Math.round(Math.max(100, H - 20));

    cuts.push({
      id: `${itemId}-net-1132-slidable-rails`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1132',
      profileName: net1132.name,
      length: net1132W,
      quantity: 4 * qty,
      cutAngle: '45°',
      purpose: '11:32 Slidable Net Frame Screen Top & Bottom Rails (2 Panels)',
      componentType: 'net',
    });

    cuts.push({
      id: `${itemId}-net-1132-slidable-stiles`,
      itemId,
      itemTag: tag,
      profileType: 'net_frame_1132',
      profileName: net1132.name,
      length: net1132H,
      quantity: 4 * qty,
      cutAngle: '45°',
      purpose: '11:32 Slidable Net Frame Screen Side Stiles (2 Panels, includes separation meeting stiles)',
      componentType: 'net',
    });

    // Net Fabric & Spline Rubber
    const netMeshW = net1132W + 60;
    const netMeshH = net1132H + 60;
    const netMeshAreaM2 = ((netMeshW * netMeshH * 2) / 1000000) * qty;

    accessories.push({
      name: `Fiberglass Insect / Mosquito Net Mesh (2 Slidable Panels: ${netMeshW}mm x ${netMeshH}mm cut)`,
      category: 'seal',
      quantity: Number(netMeshAreaM2.toFixed(2)),
      unit: 'm²',
      description: 'Insect proofing screen mesh insert for 2 slidable 11:32 panels',
    });

    const netRubberMeters = Math.ceil(((net1132W * 4 + net1132H * 4) * qty) / 1000);
    accessories.push({
      name: '11:32 Net Rubber Spline Gasket (Spline Cord)',
      category: 'seal',
      quantity: netRubberMeters,
      unit: 'meters',
      description: 'Spline cord to secure mesh tightly into 11:32 channels',
    });
  }
}

function calculateCasementFixedItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId } = item;
  const outerWidthProfile = constants.casementOuterWidth || constants.casementOuterFrame;
  const outerHeightProfile = constants.casementOuterHeight || constants.casementOuterFrame;
  const bead = constants.casementGlazingBead || { name: 'Casement Glazing Snap-in Bead', faceWidth: 15, pocketDepth: 12 };
  const ironAngle = constants.casementIronAngle || { name: 'Casement Inner Corner Iron Angle Cleat (5.0m Stock)', stockLength: 5000, cutLength: 35 };

  // 1. Separate Casement Outer Width (Top & Bottom rails) - 45° miter cuts
  cuts.push({
    id: `${itemId}-casement-outer-width`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer_width',
    profileName: outerWidthProfile.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Outer Width Profile (Top & Bottom Rails)',
    componentType: 'outer_frame',
  });

  // 2. Separate Casement Outer Height (Side jambs) - 45° miter cuts
  cuts.push({
    id: `${itemId}-casement-outer-height`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer_height',
    profileName: outerHeightProfile.name,
    length: Math.round(H),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Outer Height Profile (Side Jambs)',
    componentType: 'outer_frame',
  });

  // 3. Inner Corner Iron Angle Cleats (35mm cut per connector, 4 corners)
  cuts.push({
    id: `${itemId}-casement-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'casement_iron_angle',
    profileName: ironAngle.name,
    length: ironAngle.cutLength || 35,
    quantity: 4 * qty,
    cutAngle: '90°',
    purpose: 'Casement Inner Corner Iron Angle Joint Cleats (35mm)',
    componentType: 'outer_frame',
  });

  // Glazing Beads (45° miter cuts):
  const beadW = Math.round(W - 2 * outerWidthProfile.faceWidth);
  const beadH = Math.round(H - 2 * outerHeightProfile.faceWidth);

  cuts.push({
    id: `${itemId}-casement-fixed-bead-w`,
    itemId,
    itemTag: tag,
    profileType: 'casement_bead',
    profileName: bead.name,
    length: beadW,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Fixed Snap-in Glazing Beads (Top & Bottom)',
    componentType: 'bead',
  });

  cuts.push({
    id: `${itemId}-casement-fixed-bead-h`,
    itemId,
    itemTag: tag,
    profileType: 'casement_bead',
    profileName: bead.name,
    length: beadH,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Fixed Snap-in Glazing Beads (Sides)',
    componentType: 'bead',
  });

  // Glazing Dividers (Default: 1 per panel, or user selected 0-5)
  const dividerCount = item.dividerCount !== undefined ? item.dividerCount : 1;
  const glassW = Math.round(W - 2 * (outerWidthProfile.faceWidth - outerWidthProfile.pocketDepth) - constants.glassClearance);
  const glassH = Math.round(H - 2 * (outerHeightProfile.faceWidth - outerHeightProfile.pocketDepth) - constants.glassClearance);

  if (dividerCount > 0 && constants.glazingDivider) {
    cuts.push({
      id: `${itemId}-glazing-dividers`,
      itemId,
      itemTag: tag,
      profileType: 'glazing_divider',
      profileName: constants.glazingDivider.name,
      length: glassW,
      quantity: dividerCount * qty,
      cutAngle: '90°',
      purpose: `Glazing Divider Bar Profile (${dividerCount} bar${dividerCount > 1 ? 's' : ''} per panel)`,
      componentType: 'divider',
    });
  }

  // Glass Size for Casement Fixed Light:
  const paneAreaM2 = (glassW * glassH) / 1000000;

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: glassW,
    height: glassH,
    quantity: 1 * qty,
    areaM2: Number((paneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Casement Fixed Window 1-Pane Glass',
  });

  const gasketMeters = Math.ceil(((glassW * 2 + glassH * 2) * qty) / 1000);
  accessories.push({
    name: 'Glazing Wedge EPDM Rubber Gasket & Setting Blocks',
    category: 'seal',
    quantity: gasketMeters,
    unit: 'meters',
    description: 'Rubber wedge gasket and neoprene glass setting blocks',
  });

  accessories.push({
    name: 'Casement Corner Iron Angle Cleats (35mm Cut)',
    category: 'fastener',
    quantity: 4 * qty,
    unit: 'pcs',
    description: 'Inner 35mm iron angle structural corner reinforcement',
  });

  const siliconeTubes = Math.max(1, Math.ceil(((W * 2 + H * 2) * qty) / 8000));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and perimeter framing joint seal',
  });

  // Burglary Proofing & Net Options
  addBurglaryAndNetCuts(item, constants, cuts, accessories);
}

function calculateCasementOneFixedOneOpenItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId } = item;
  const outerWidthProfile = constants.casementOuterWidth || constants.casementOuterFrame;
  const outerHeightProfile = constants.casementOuterHeight || constants.casementOuterFrame;
  const mullion = constants.casement2Mullion || constants.casementMullion;
  const deCurve = constants.casementDeCurveSash;
  const bead = constants.casementGlazingBead || { name: 'Casement Glazing Snap-in Bead', faceWidth: 15, pocketDepth: 12 };
  const ironAngle = constants.casementIronAngle || { name: 'Casement Inner Corner Iron Angle Cleat (5.0m Stock)', stockLength: 5000, cutLength: 35 };

  // 1. Separate Casement Outer Width (Top & Bottom)
  cuts.push({
    id: `${itemId}-casement-outer-width`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer_width',
    profileName: outerWidthProfile.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Outer Width Profile (Top & Bottom Rails)',
    componentType: 'outer_frame',
  });

  // 2. Separate Casement Outer Height (Side Jambs)
  cuts.push({
    id: `${itemId}-casement-outer-height`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer_height',
    profileName: outerHeightProfile.name,
    length: Math.round(H),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Outer Height Profile (Side Jambs)',
    componentType: 'outer_frame',
  });

  // 3. Inner Corner Iron Angle Cleats (4 for outer frame + 4 for operable sash)
  cuts.push({
    id: `${itemId}-casement-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'casement_iron_angle',
    profileName: ironAngle.name,
    length: ironAngle.cutLength || 35,
    quantity: (4 + 4) * qty,
    cutAngle: '90°',
    purpose: 'Casement Inner Corner Iron Angle Joint Cleats (35mm - Frame & Sash)',
    componentType: 'outer_frame',
  });

  // Center Vertical Mullion T-Bar (2-Mullion Profile)
  const mullionLength = Math.round(H - 2 * (outerHeightProfile.faceWidth - outerHeightProfile.edgeOverlap));
  cuts.push({
    id: `${itemId}-casement-mullion`,
    itemId,
    itemTag: tag,
    profileType: 'casement_2_mullion',
    profileName: mullion.name,
    length: mullionLength,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Casement 2-Mullion Profile (Center Dividing T-Bar)',
    componentType: 'mullion',
  });

  // Bay dimensions:
  const innerOpeningWidth = W - 2 * (outerWidthProfile.faceWidth - outerWidthProfile.edgeOverlap) - (mullion.faceWidth - 2 * mullion.edgeOverlap);
  const bayWidth = Math.max(150, innerOpeningWidth / 2);
  const bayHeight = Math.max(150, H - 2 * (outerHeightProfile.faceWidth - outerHeightProfile.edgeOverlap));

  // 1 Operable Sash (De-Curve):
  const sashW = Math.round(bayWidth + 2 * deCurve.edgeOverlap - 4);
  const sashH = Math.round(bayHeight + 2 * deCurve.edgeOverlap - 4);

  cuts.push({
    id: `${itemId}-decurve-width`,
    itemId,
    itemTag: tag,
    profileType: 'casement_decurve',
    profileName: deCurve.name,
    length: sashW,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'De Curve Operable Sash Top & Bottom (1 Openable Sash)',
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-decurve-height`,
    itemId,
    itemTag: tag,
    profileType: 'casement_decurve',
    profileName: deCurve.name,
    length: sashH,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'De Curve Operable Sash Left & Right (1 Openable Sash)',
    componentType: 'sash',
  });

  // Glazing beads for the 1 Fixed Bay:
  const fixedBeadW = Math.round(bayWidth);
  const fixedBeadH = Math.round(bayHeight);

  cuts.push({
    id: `${itemId}-fixed-bead-w`,
    itemId,
    itemTag: tag,
    profileType: 'casement_bead',
    profileName: bead.name,
    length: fixedBeadW,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Snap-in Glazing Beads for Fixed Bay (Top & Bottom)',
    componentType: 'bead',
  });

  cuts.push({
    id: `${itemId}-fixed-bead-h`,
    itemId,
    itemTag: tag,
    profileType: 'casement_bead',
    profileName: bead.name,
    length: fixedBeadH,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Snap-in Glazing Beads for Fixed Bay (Sides)',
    componentType: 'bead',
  });

  // Glass: 1 Fixed Glass Pane + 1 Operable Sash Glass Pane
  const fixedGlassW = Math.round(bayWidth + 2 * outerWidthProfile.pocketDepth - constants.glassClearance);
  const fixedGlassH = Math.round(bayHeight + 2 * outerHeightProfile.pocketDepth - constants.glassClearance);
  const fixedPaneAreaM2 = (fixedGlassW * fixedGlassH) / 1000000;

  const openGlassW = Math.round(sashW - 2 * (deCurve.faceWidth - deCurve.pocketDepth) - constants.glassClearance);
  const openGlassH = Math.round(sashH - 2 * (deCurve.faceWidth - deCurve.pocketDepth) - constants.glassClearance);
  const openPaneAreaM2 = (openGlassW * openGlassH) / 1000000;

  // Glazing Dividers (Default 1 per panel, 2 panels total)
  const dividerCount = item.dividerCount !== undefined ? item.dividerCount : 1;
  if (dividerCount > 0 && constants.glazingDivider) {
    cuts.push({
      id: `${itemId}-glazing-dividers-fixed`,
      itemId,
      itemTag: tag,
      profileType: 'glazing_divider',
      profileName: constants.glazingDivider.name,
      length: fixedGlassW,
      quantity: dividerCount * qty,
      cutAngle: '90°',
      purpose: `Glazing Divider Bar Profile for Fixed Bay (${dividerCount} bar${dividerCount > 1 ? 's' : ''})`,
      componentType: 'divider',
    });
    cuts.push({
      id: `${itemId}-glazing-dividers-open`,
      itemId,
      itemTag: tag,
      profileType: 'glazing_divider',
      profileName: constants.glazingDivider.name,
      length: openGlassW,
      quantity: dividerCount * qty,
      cutAngle: '90°',
      purpose: `Glazing Divider Bar Profile for Operable Sash (${dividerCount} bar${dividerCount > 1 ? 's' : ''})`,
      componentType: 'divider',
    });
  }

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: fixedGlassW,
    height: fixedGlassH,
    quantity: 1 * qty,
    areaM2: Number((fixedPaneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Fixed Light Bay Glass (Pane #1)',
  });

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 2,
    width: openGlassW,
    height: openGlassH,
    quantity: 1 * qty,
    areaM2: Number((openPaneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Operable Casement Sash Glass (Pane #2)',
  });

  // Hardware: Steel Stopper (1 pc), Hinges (2 pcs), Cockspur Handle (1 pc)
  accessories.push({
    name: 'Stainless Steel Window Stopper Restrictor',
    category: 'hardware',
    quantity: 1 * qty,
    unit: 'pcs',
    description: 'Wind-resistant steel stopper for operable sash',
  });

  accessories.push({
    name: 'Heavy Duty Stainless Steel Butt / Friction Hinges',
    category: 'hardware',
    quantity: 2 * qty,
    unit: 'pcs',
    description: '2 hinges for operable casement side-hung sash',
  });

  accessories.push({
    name: 'Casement Cockspur / Espagnolette Multipoint Handle',
    category: 'hardware',
    quantity: 1 * qty,
    unit: 'pcs',
    description: 'Locking handle for operable sash',
  });

  const gasketMeters = Math.ceil(((sashW * 2 + sashH * 2 + fixedGlassW * 2 + fixedGlassH * 2) * qty) / 1000);
  accessories.push({
    name: 'Casement Bubble & Glazing Wedge EPDM Rubber Gasket',
    category: 'seal',
    quantity: gasketMeters,
    unit: 'meters',
    description: 'Acoustic rebate seal and glass wrapper gasket',
  });

  accessories.push({
    name: 'Casement Corner Iron Angle Cleats (35mm Cut)',
    category: 'fastener',
    quantity: (4 + 4) * qty,
    unit: 'pcs',
    description: 'Inner 35mm iron angle structural corner reinforcement for frame & sash',
  });

  accessories.push({
    name: 'Self-Tapping Stainless Assembly Screws (#8 x 1½")',
    category: 'fastener',
    quantity: 16 * qty,
    unit: 'pcs',
    description: 'Mullion bracket and hinge fixing screws',
  });

  const siliconeTubes = Math.max(1, Math.ceil(((W * 2 + H * 2) * qty) / 8000));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and perimeter framing joint seal',
  });

  // Burglary Proofing & Net Options
  addBurglaryAndNetCuts(item, constants, cuts, accessories);
}

function calculateTransomSinglePanelItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, hasBurglary, hasNet } = item;
  // Outer frame profile: "Outer Transom Profile" (same profile used for both width and height, 60mm)
  const outer = constants.transomOuterFrame || {
    name: 'Outer Transom Profile',
    faceWidth: 60,
    edgeOverlap: 25,
    stockLength: 5800,
  };
  // Inner frame profile: "Inner Structural Transom Profile" (same profile used for both width and height)
  const structural = constants.transomTopHungSash || {
    name: 'Inner Structural Transom Profile',
    faceWidth: 60,
    edgeOverlap: 25,
    stockLength: 5800,
  };
  // Unified Iron Angle Cleat Profile: The inner transom iron angle is the SAME profile as the outer transom iron angle profile
  const ironAngleProfile =
    constants.transomIronAngle?.name ||
    constants.transomOuterAngle?.name ||
    'Transom Corner Iron Angle Cleat Profile (5.0m Stock)';
  const outerCleatLength = constants.transomIronAngle?.outerCutLength || constants.transomOuterAngle?.cutLength || 55;
  const innerCleatLength = constants.transomIronAngle?.innerCutLength || constants.transomInnerAngle?.cutLength || 45;

  // 1. Outer Frame Cuts (90° square butt joints)
  // The outer frame of the transom is designed so the height sits on the bottom width, and the top width sits on the height.
  // Top width & bottom width = measurement width (W)
  cuts.push({
    id: `${itemId}-transom-outer-width`,
    itemId,
    itemTag: tag,
    profileType: 'transom_outer',
    profileName: outer.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '90°',
    purpose: 'Outer Transom Profile (Top & Bottom Rails - Sits Over Jambs)',
    componentType: 'outer_frame',
  });

  // Height of outer frame = H - (top width 60mm + bottom width 60mm) = H - 120mm
  const outerHeight = Math.max(100, Math.round(H - 120));
  cuts.push({
    id: `${itemId}-transom-outer-height`,
    itemId,
    itemTag: tag,
    profileType: 'transom_outer',
    profileName: outer.name,
    length: outerHeight,
    quantity: 2 * qty,
    cutAngle: '90°',
    purpose: 'Outer Transom Profile (Side Jambs - Sits on Bottom Rail)',
    componentType: 'outer_frame',
  });

  // 2. Outer Profile Iron Angles (55mm cut from the Transom Iron Angle Profile)
  // Tied to the 4 ends of top & bottom width, entering height jambs, screwed to height
  cuts.push({
    id: `${itemId}-transom-outer-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'transom_iron_angle',
    profileName: ironAngleProfile,
    length: outerCleatLength,
    quantity: 4 * qty,
    cutAngle: '90°',
    purpose: `Transom Corner Iron Angle Cleat Profile - Outer Frame Cleats (${outerCleatLength}mm)`,
    componentType: 'outer_frame',
  });

  // 3. Inner Structural Frame (45° miter cuts at 135° edge, connecting like casement)
  // Inner frame height = outer frame height = H - 120mm (no overlap added for height so stopper screws to it)
  // Inner frame width = outer clear opening (W - 120mm) + 50mm overlap (25mm on each height jamb) = W - 70mm
  const innerH = outerHeight; // H - 120mm
  const innerW = Math.max(100, Math.round(W - 70)); // W - 120 + 50 = W - 70mm

  cuts.push({
    id: `${itemId}-transom-inner-width`,
    itemId,
    itemTag: tag,
    profileType: 'transom_sash',
    profileName: structural.name,
    length: innerW,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Inner Structural Transom Profile - Top & Bottom Rails (W - 70mm)',
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-transom-inner-height`,
    itemId,
    itemTag: tag,
    profileType: 'transom_sash',
    profileName: structural.name,
    length: innerH,
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Inner Structural Transom Profile - Left & Right Stiles (H - 120mm)',
    componentType: 'sash',
  });

  // 4. Inner Profile Iron Angles (45mm cut from the SAME Transom Iron Angle Profile)
  // 4 pieces for 45° mitered structural frame corners
  cuts.push({
    id: `${itemId}-transom-inner-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'transom_iron_angle',
    profileName: ironAngleProfile,
    length: innerCleatLength,
    quantity: 4 * qty,
    cutAngle: '90°',
    purpose: `Transom Corner Iron Angle Cleat Profile - Inner Structural Sash Cleats (${innerCleatLength}mm)`,
    componentType: 'sash',
  });

  // 5. Glass Cut Size:
  // "for the glass, the height of the glass is the height of the inner frame, and the width of the glass is the width of the inner frame."
  const glassW = innerW;
  const glassH = innerH;
  const paneAreaM2 = (glassW * glassH) / 1000000;

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: glassW,
    height: glassH,
    quantity: 1 * qty,
    areaM2: Number((paneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Transom Window 1-Panel Glass (Matches Inner Frame)',
  });

  // 6. Accessories & Hardware:
  // - 2 Transom Stoppers (one at top, one at bottom per panel, connecting structural panel to outer transom profile for opening)
  accessories.push({
    name: 'Transom Stoppers',
    category: 'hardware',
    quantity: 2 * qty,
    unit: 'pcs',
    description: 'Transom stoppers (one at top and one at bottom) connecting structural panel to outer transom profile for opening and closing',
  });

  // - 1 Transom Pressing Handle (locks window panel to outer frame)
  accessories.push({
    name: 'Transom Pressing Handle',
    category: 'hardware',
    quantity: 1 * qty,
    unit: 'pcs',
    description: 'Transom pressing handle locking window panel to outer frame',
  });

  // - Transom Iron Angle Cleats (Same profile for outer 55mm and inner 45mm: 8 pcs total)
  accessories.push({
    name: 'Transom Corner Iron Angle Cleats (55mm Outer & 45mm Inner - Same Profile)',
    category: 'fastener',
    quantity: 8 * qty,
    unit: 'pcs',
    description: `8 pcs total cut from ${ironAngleProfile}: 4 pcs @ 55mm (outer frame corners) + 4 pcs @ 45mm (inner structural sash corners)`,
  });

  // Weatherseal & Gasket & Screws & Sealant
  const totalPerimeterMeters = Math.ceil(((innerW * 2 + innerH * 2) * qty) / 1000);
  accessories.push({
    name: 'Weatherseal Woolpile (Silicone-Treated Strip)',
    category: 'seal',
    quantity: totalPerimeterMeters,
    unit: 'meters',
    description: 'Draft excluder weatherseal strip around inner structural transom frame',
  });

  accessories.push({
    name: 'Glazing Wedge EPDM Rubber Gasket',
    category: 'seal',
    quantity: totalPerimeterMeters,
    unit: 'meters',
    description: 'Rubber gasket around glass panel in structural frame',
  });

  accessories.push({
    name: 'Self-Tapping Stainless Assembly Screws (#8 x 1½")',
    category: 'fastener',
    quantity: 16 * qty,
    unit: 'pcs',
    description: 'Fasteners for securing iron angles, transom stoppers, and pressing handle',
  });

  const siliconeTubes = Math.max(1, Math.ceil(((W * 2 + H * 2) * qty) / 8000));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and outer frame glass/angle joint sealant',
  });

  // 7. Burglary Iron Bars (if selected):
  // Length of iron burglary = width of measurement (W), entered into both heights
  if (hasBurglary) {
    const targetSpacing = 125;
    const numDivisions = Math.max(2, Math.round(H / targetSpacing));
    const numRods = Math.max(1, numDivisions - 1);
    const rodLength = Math.round(W);

    cuts.push({
      id: `${itemId}-transom-burglary-rods`,
      itemId,
      itemTag: tag,
      profileType: 'burglary_rod',
      profileName: constants.burglaryIronRod?.name || 'Burglary Iron Rod / Ballo Straight (5.8m)',
      length: rodLength,
      quantity: numRods * qty,
      cutAngle: '90°',
      purpose: `Burglary Iron Rod (${numRods} rods - length = width of measurement, enters both height stiles)`,
      componentType: 'burglary',
    });
  }

  // 8. Netting (if selected):
  if (hasNet) {
    const netW = Math.max(50, innerW - 10);
    const netH = Math.max(50, innerH - 10);
    const netPerimeter = Math.ceil(((netW * 2 + netH * 2) * qty) / 1000);
    accessories.push({
      name: 'Insect / Mosquito Net Mesh Roll',
      category: 'hardware',
      quantity: Number(((netW * netH * qty) / 1000000).toFixed(2)),
      unit: 'm²',
      description: 'Fiberglass insect net screen for operable transom panel',
    });
    accessories.push({
      name: 'Net Rubber Spline Gasket Roll',
      category: 'seal',
      quantity: netPerimeter,
      unit: 'meters',
      description: 'Spline cord to secure insect netting mesh',
    });
  }
}

function calculateCasementItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, kind } = item;
  const outerWidthProfile = constants.casementOuterWidth || constants.casementOuterFrame;
  const outerHeightProfile = constants.casementOuterHeight || constants.casementOuterFrame;
  const deCurve = constants.casementDeCurveSash;
  const ironAngle = constants.casementIronAngle || { name: 'Casement Inner Corner Iron Angle Cleat (5.0m Stock)', stockLength: 5000, cutLength: 35 };

  let panelsCount = 1;
  if (kind === 'casement_2_panel' || kind === 'casement_door_double') panelsCount = 2;
  if (kind === 'casement_3_panel') panelsCount = 3;
  if (kind === 'casement_4_panel') panelsCount = 4;

  // 1. Separate Casement Outer Width (Top & Bottom Rails) - 45° miter cuts
  cuts.push({
    id: `${itemId}-casement-outer-width`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer_width',
    profileName: outerWidthProfile.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Outer Width Profile (Top & Bottom Rails)',
    componentType: 'outer_frame',
  });

  // 2. Separate Casement Outer Height (Side Jambs) - 45° miter cuts
  cuts.push({
    id: `${itemId}-casement-outer-height`,
    itemId,
    itemTag: tag,
    profileType: 'casement_outer_height',
    profileName: outerHeightProfile.name,
    length: Math.round(H),
    quantity: 2 * qty,
    cutAngle: '45°',
    purpose: 'Casement Outer Height Profile (Side Jambs)',
    componentType: 'outer_frame',
  });

  // 3. Inner Corner Iron Angle Cleats (35mm cut per connector: 4 for outer frame + 4 per operable sash)
  const totalIronAnglesCount = (4 + panelsCount * 4) * qty;
  cuts.push({
    id: `${itemId}-casement-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'casement_iron_angle',
    profileName: ironAngle.name,
    length: ironAngle.cutLength || 35,
    quantity: totalIronAnglesCount,
    cutAngle: '90°',
    purpose: `Casement Inner Corner Iron Angle Joint Cleats (35mm - Frame & ${panelsCount} Sashes)`,
    componentType: 'outer_frame',
  });

  // 4. Mullions if > 1 panel
  // 3-panel operable casement requires 3-mullion profile (+6mm space used); 2-panel/4-panel uses 2-mullion profile
  const mullionsCount = panelsCount - 1;
  const is3PanelWindow = panelsCount === 3 || kind === 'casement_3_panel';
  const mullionProfile = is3PanelWindow ? (constants.casement3Mullion || constants.casementMullion) : (constants.casement2Mullion || constants.casementMullion);
  const mullionLength = Math.round(H - 2 * (outerHeightProfile.faceWidth - outerHeightProfile.edgeOverlap));

  if (mullionsCount > 0) {
    cuts.push({
      id: `${itemId}-mullions`,
      itemId,
      itemTag: tag,
      profileType: is3PanelWindow ? 'casement_3_mullion' : 'casement_2_mullion',
      profileName: mullionProfile.name,
      length: mullionLength,
      quantity: mullionsCount * qty,
      cutAngle: '90°',
      purpose: `${is3PanelWindow ? '3-Mullion Heavy Hinge-Receiver Profile' : '2-Mullion Standard Profile'} (${mullionsCount} Center T-Bar${mullionsCount > 1 ? 's' : ''})`,
      componentType: 'mullion',
    });
  }

  // Inner sash (De Curve) for each panel:
  const innerOpeningWidth = (W - 2 * (outerWidthProfile.faceWidth - outerWidthProfile.edgeOverlap) - mullionsCount * (mullionProfile.faceWidth - 2 * mullionProfile.edgeOverlap));
  const bayWidth = Math.max(150, innerOpeningWidth / panelsCount);
  const bayHeight = Math.max(150, H - 2 * (outerHeightProfile.faceWidth - outerHeightProfile.edgeOverlap));

  // De Curve sash cut sizes (45° miter):
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

  // Glazing Dividers (Default: 1 per panel, user selectable 0 to 5)
  const dividerCount = item.dividerCount !== undefined ? item.dividerCount : 1;
  if (dividerCount > 0 && constants.glazingDivider) {
    cuts.push({
      id: `${itemId}-glazing-dividers`,
      itemId,
      itemTag: tag,
      profileType: 'glazing_divider',
      profileName: constants.glazingDivider.name,
      length: glassW,
      quantity: panelsCount * dividerCount * qty,
      cutAngle: '90°',
      purpose: `Glazing Divider Bar Profile (${dividerCount} bar${dividerCount > 1 ? 's' : ''} per panel across ${panelsCount} panels)`,
      componentType: 'divider',
    });
  }

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
  // 1 Steel Stopper per panel
  accessories.push({
    name: 'Stainless Steel Window Stopper Restrictor',
    category: 'hardware',
    quantity: panelsCount * qty,
    unit: 'pcs',
    description: '1 steel stopper per operable panel to restrict wind opening',
  });

  // 2 Hinges per panel
  accessories.push({
    name: 'Heavy Duty Stainless Steel Butt / Friction Hinges',
    category: 'hardware',
    quantity: panelsCount * 2 * qty,
    unit: 'pcs',
    description: '2 hinges per operable panel for structural sash support',
  });

  // 1 Cockspur handle per panel
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

  accessories.push({
    name: 'Casement Corner Iron Angle Cleats (35mm Cut)',
    category: 'fastener',
    quantity: totalIronAnglesCount,
    unit: 'pcs',
    description: 'Inner 35mm iron angle structural corner reinforcement for frame & sashes',
  });

  // Burglary Proofing & Net Options
  addBurglaryAndNetCuts(item, constants, cuts, accessories);
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

function calculateTransomTwoPanelItem(
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  cuts: CutPiece[],
  glasses: GlassCutSize[],
  accessories: AccessoryRequirement[]
) {
  const { width: W, height: H, quantity: qty, tag, id: itemId, hasBurglary, hasNet } = item;
  // Outer frame profile: "Outer Transom Profile" (same profile used for width, height, and mullion, 60mm size)
  const outer = constants.transomOuterFrame || {
    name: 'Outer Transom Profile',
    faceWidth: 60,
    edgeOverlap: 25,
    stockLength: 5800,
  };
  // Inner frame profile: "Inner Structural Transom Profile"
  const structural = constants.transomTopHungSash || {
    name: 'Inner Structural Transom Profile',
    faceWidth: 60,
    edgeOverlap: 25,
    stockLength: 5800,
  };
  // Unified Iron Angle Cleat Profile: The inner transom iron angle is the SAME profile as the outer transom iron angle profile
  const ironAngleProfile =
    constants.transomIronAngle?.name ||
    constants.transomOuterAngle?.name ||
    'Transom Corner Iron Angle Cleat Profile (5.0m Stock)';
  const outerCleatLength = constants.transomIronAngle?.outerCutLength || constants.transomOuterAngle?.cutLength || 55;
  const innerCleatLength = constants.transomIronAngle?.innerCutLength || constants.transomInnerAngle?.cutLength || 45;

  // 1. Outer Frame Cuts (90° square butt joints)
  // The outer frame of the transom is designed so the height sits on the bottom width, and the top width sits on the height.
  // Top width & bottom width = measurement width (W)
  cuts.push({
    id: `${itemId}-transom-outer-width`,
    itemId,
    itemTag: tag,
    profileType: 'transom_outer',
    profileName: outer.name,
    length: Math.round(W),
    quantity: 2 * qty,
    cutAngle: '90°',
    purpose: 'Outer Transom Profile (Top & Bottom Rails - Sits Over Jambs)',
    componentType: 'outer_frame',
  });

  // Height of outer frame = H - (top width 60mm + bottom width 60mm) = H - 120mm
  const outerHeight = Math.max(100, Math.round(H - 120));
  cuts.push({
    id: `${itemId}-transom-outer-height`,
    itemId,
    itemTag: tag,
    profileType: 'transom_outer',
    profileName: outer.name,
    length: outerHeight,
    quantity: 2 * qty,
    cutAngle: '90°',
    purpose: 'Outer Transom Profile (Side Jambs - Sits on Bottom Rail)',
    componentType: 'outer_frame',
  });

  // 2. Central Vertical Transom Mullion:
  // "the outer transom profile, is also used as the mullion, the size of the mullion is 60mm, because the size of the outer frame is 60mm."
  cuts.push({
    id: `${itemId}-transom-mullion`,
    itemId,
    itemTag: tag,
    profileType: 'transom_outer', // Grouped with outer profile in stock optimization
    profileName: outer.name,
    length: outerHeight,
    quantity: 1 * qty,
    cutAngle: '90°',
    purpose: 'Outer Transom Profile (Center Mullion - 60mm, H - 120mm)',
    componentType: 'mullion',
  });

  // 3. Outer Profile Iron Angles (55mm cut from Transom Iron Angle Profile):
  // 4 pieces for frame corners + 2 pieces for center dividing mullion = 6 pcs
  cuts.push({
    id: `${itemId}-transom-outer-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'transom_iron_angle',
    profileName: ironAngleProfile,
    length: outerCleatLength,
    quantity: 6 * qty,
    cutAngle: '90°',
    purpose: `Transom Corner Iron Angle Cleat Profile - Frame & Mullion Cleats (${outerCleatLength}mm, 6 pcs)`,
    componentType: 'outer_frame',
  });

  // 4. Inner Structural Transom Sashes (2 Panels, side-opening like casement):
  // "the inner frame is cut like the casement inner frame, it cuts 135 degree miter away at its edge..."
  // Inner frame height = outer frame height = H - 120mm
  // Width: Outer frame width minus 2 side jambs (60mm each) and center mullion (60mm) = W - 180mm.
  // Each panel has 25mm overlap on jamb and 25mm overlap on mullion = 50mm overlap.
  // Inner width per panel = Math.round((W - 180) / 2 + 50)
  const innerH = outerHeight; // H - 120mm
  const innerW = Math.max(100, Math.round((W - 180) / 2 + 50));

  cuts.push({
    id: `${itemId}-transom-inner-width`,
    itemId,
    itemTag: tag,
    profileType: 'transom_sash',
    profileName: structural.name,
    length: innerW,
    quantity: 4 * qty, // 2 panels * 2 rails
    cutAngle: '45°',
    purpose: 'Inner Structural Transom Profile - Top & Bottom Rails (2 Panels, 4 pcs)',
    componentType: 'sash',
  });

  cuts.push({
    id: `${itemId}-transom-inner-height`,
    itemId,
    itemTag: tag,
    profileType: 'transom_sash',
    profileName: structural.name,
    length: innerH,
    quantity: 4 * qty, // 2 panels * 2 stiles
    cutAngle: '45°',
    purpose: 'Inner Structural Transom Profile - Left & Right Stiles (2 Panels, 4 pcs)',
    componentType: 'sash',
  });

  // 5. Inner Profile Iron Angles (45mm cut from the SAME Transom Iron Angle Profile):
  // 4 corners per panel * 2 panels = 8 pcs
  cuts.push({
    id: `${itemId}-transom-inner-iron-angle`,
    itemId,
    itemTag: tag,
    profileType: 'transom_iron_angle',
    profileName: ironAngleProfile,
    length: innerCleatLength,
    quantity: 8 * qty,
    cutAngle: '90°',
    purpose: `Transom Corner Iron Angle Cleat Profile - Inner Structural Sash Cleats (${innerCleatLength}mm, 8 pcs)`,
    componentType: 'sash',
  });

  // 6. Glass Cut Sizes (2 panes):
  // "for the glass, the height of the glass is the height of the inner frame, and the width of the glass is the width of the inner frame."
  const glassW = innerW;
  const glassH = innerH;
  const paneAreaM2 = (glassW * glassH) / 1000000;

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 1,
    width: glassW,
    height: glassH,
    quantity: 1 * qty,
    areaM2: Number((paneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Transom Window Left Panel Glass (Matches Inner Frame)',
  });

  glasses.push({
    itemId,
    itemTag: tag,
    paneNumber: 2,
    width: glassW,
    height: glassH,
    quantity: 1 * qty,
    areaM2: Number((paneAreaM2 * qty).toFixed(3)),
    paneDescription: 'Transom Window Right Panel Glass (Matches Inner Frame)',
  });

  // 7. Accessories:
  // - Transom Stoppers: 2 per panel * 2 panels = 4 stoppers
  // "each window panel used 2 transom stoppers, one at the top, and one at the bottom, it connects the structural panel, to the outer transom profile, its allows it to open and close."
  accessories.push({
    name: 'Transom Stoppers',
    category: 'hardware',
    quantity: 4 * qty,
    unit: 'pcs',
    description: 'Transom stoppers (one at top and one at bottom per panel) connecting structural panels to outer frame for side opening',
  });

  // - Transom Pressing Handle: 1 per panel * 2 panels = 2 handles
  // "one transom pressing handle is also needed for each window panel, it is used to lock to window panel to the outer frame."
  accessories.push({
    name: 'Transom Pressing Handle',
    category: 'hardware',
    quantity: 2 * qty,
    unit: 'pcs',
    description: 'Transom pressing handles locking window panels to outer transom frame',
  });

  // - Transom Iron Angle Cleats (Same profile for outer 55mm and inner 45mm: 14 pcs total)
  accessories.push({
    name: 'Transom Corner Iron Angle Cleats (55mm Outer & 45mm Inner - Same Profile)',
    category: 'fastener',
    quantity: 14 * qty,
    unit: 'pcs',
    description: `14 pcs total cut from ${ironAngleProfile}: 6 pcs @ 55mm (outer frame & mullion) + 8 pcs @ 45mm (2 inner structural sashes)`,
  });

  // Weatherseal & Gasket & Screws & Sealant
  const totalPerimeterMeters = Math.ceil(((innerW * 2 + innerH * 2) * 2 * qty) / 1000);
  accessories.push({
    name: 'Weatherseal Woolpile (Silicone-Treated Strip)',
    category: 'seal',
    quantity: totalPerimeterMeters,
    unit: 'meters',
    description: 'Draft excluder weatherseal strip around inner structural transom frames',
  });

  accessories.push({
    name: 'Glazing Wedge EPDM Rubber Gasket',
    category: 'seal',
    quantity: totalPerimeterMeters,
    unit: 'meters',
    description: 'Rubber gasket around glass panels in structural frames',
  });

  accessories.push({
    name: 'Self-Tapping Stainless Assembly Screws (#8 x 1½")',
    category: 'fastener',
    quantity: 28 * qty,
    unit: 'pcs',
    description: 'Fasteners for securing iron angles, center mullion, transom stoppers, and pressing handles',
  });

  const siliconeTubes = Math.max(1, Math.ceil(((W * 2 + H * 2) * qty) / 7500));
  accessories.push({
    name: 'Neutral Cure Weatherproof Silicone Sealant',
    category: 'chemical',
    quantity: siliconeTubes,
    unit: 'tubes (300ml)',
    description: 'Perimeter waterproofing and outer frame glass/angle joint sealant',
  });

  // 8. Burglary Iron Bars (if selected):
  // Length of iron burglary = width of measurement (W), enters both height stiles
  if (hasBurglary) {
    const targetSpacing = 125;
    const numDivisions = Math.max(2, Math.round(H / targetSpacing));
    const numRods = Math.max(1, numDivisions - 1);
    const rodLength = Math.round(W);

    cuts.push({
      id: `${itemId}-transom-burglary-rods`,
      itemId,
      itemTag: tag,
      profileType: 'burglary_rod',
      profileName: constants.burglaryIronRod?.name || 'Burglary Iron Rod / Ballo Straight (5.8m)',
      length: rodLength,
      quantity: numRods * qty,
      cutAngle: '90°',
      purpose: `Burglary Iron Rod (${numRods} rods - length = width of measurement, enters both height stiles)`,
      componentType: 'burglary',
    });
  }

  // 9. Netting (if selected):
  if (hasNet) {
    const netW = Math.max(50, innerW - 10);
    const netH = Math.max(50, innerH - 10);
    const netPerimeter = Math.ceil(((netW * 2 + netH * 2) * 2 * qty) / 1000);
    accessories.push({
      name: 'Insect / Mosquito Net Mesh Roll',
      category: 'hardware',
      quantity: Number(((netW * netH * 2 * qty) / 1000000).toFixed(2)),
      unit: 'm²',
      description: 'Fiberglass insect net screen for 2 operable transom panels',
    });
    accessories.push({
      name: 'Net Rubber Spline Gasket Roll',
      category: 'seal',
      quantity: netPerimeter,
      unit: 'meters',
      description: 'Spline cord to secure insect netting mesh',
    });
  }
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
