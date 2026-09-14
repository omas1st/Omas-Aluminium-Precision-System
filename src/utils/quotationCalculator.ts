import {
  CombinedProjectCalculation,
  MaterialPricesConfig,
  QuotationBreakdown,
  QuotationLineItem,
} from '../types';
import { getMaterialDisplayName } from './materialNamesStorage';

export function calculateQuotationBreakdown(
  calc: CombinedProjectCalculation,
  prices: MaterialPricesConfig,
  customMargin?: number,
  customTax?: number
): QuotationBreakdown {
  const profileLines: QuotationLineItem[] = [];
  const glassLines: QuotationLineItem[] = [];
  const accessoryLines: QuotationLineItem[] = [];
  const laborLines: QuotationLineItem[] = [];
  const logisticsLines: QuotationLineItem[] = [];

  const currency = prices.currency || 'USD';
  const currencySymbol = prices.currencySymbol || '$';

  // 1. ALUMINUM PROFILE BARS CALCULATION
  let totalProfilesCost = 0;
  calc.profileOptimizations.forEach((prof, idx) => {
    const unitPrice = getProfilePrice(prof.profileName, prices);
    const totalPrice = Math.round(prof.barsNeeded * unitPrice * 100) / 100;
    totalProfilesCost += totalPrice;

    profileLines.push({
      id: `prof-quote-${idx}`,
      category: 'profile',
      name: getMaterialDisplayName(prof.profileName),
      description: `Optimized cut from 5800mm bars (${prof.totalPieces} pcs, ${prof.totalLengthRequired.toLocaleString()} mm net required)`,
      quantity: prof.barsNeeded,
      unit: 'bars (5800mm)',
      unitPrice,
      totalPrice,
    });
  });

  // 2. GLASS GLAZING CALCULATION
  let totalGlassCost = 0;
  const glassPricePerM2 = prices.glassPricePerM2 || 35.0;
  const totalGlassArea = calc.totalGlassAreaM2 || 0;
  const glassCost = Math.round(totalGlassArea * glassPricePerM2 * 100) / 100;
  totalGlassCost += glassCost;

  glassLines.push({
    id: 'glass-quote-main',
    category: 'glass',
    name: getMaterialDisplayName(prices.glassTypeName || '5mm Clear / Tinted Float Glass'),
    description: `Total glazed surface area across ${calc.allGlasses.length} individual glass cut panes`,
    quantity: Number(totalGlassArea.toFixed(3)),
    unit: 'm²',
    unitPrice: glassPricePerM2,
    totalPrice: glassCost,
  });

  // 3. HARDWARE & ACCESSORIES
  let totalAccessoriesCost = 0;
  calc.allAccessories.forEach((acc, idx) => {
    const unitPrice = getAccessoryPrice(acc.name, prices);
    const totalPrice = Math.round(acc.quantity * unitPrice * 100) / 100;
    totalAccessoriesCost += totalPrice;

    accessoryLines.push({
      id: `acc-quote-${idx}`,
      category: 'accessory',
      name: getMaterialDisplayName(acc.name),
      description: acc.description,
      quantity: acc.quantity,
      unit: acc.unit,
      unitPrice,
      totalPrice,
    });
  });

  const totalMaterialsCost = Math.round((totalProfilesCost + totalGlassCost + totalAccessoriesCost) * 100) / 100;

  // 4. LABOR & FABRICATION CHARGES
  let totalLaborCost = 0;
  const totalUnits = calc.items.reduce((sum, it) => sum + it.item.quantity, 0);

  // Total window area for sqm labor
  const totalWindowAreaSqm = calc.items.reduce(
    (sum, it) => sum + (it.item.width * it.item.height * it.item.quantity) / 1000000,
    0
  );

  if (prices.laborRateType === 'per_unit') {
    const unitRate = prices.laborRateValue || 25;
    const lCost = Math.round(totalUnits * unitRate * 100) / 100;
    totalLaborCost += lCost;
    laborLines.push({
      id: 'labor-quote-1',
      category: 'labor',
      name: 'Workshop Cutting, Machining & Assembly Labor',
      description: `Fabrication and assembly of ${totalUnits} window/door unit(s) @ ${currencySymbol}${unitRate}/unit`,
      quantity: totalUnits,
      unit: 'units',
      unitPrice: unitRate,
      totalPrice: lCost,
    });
  } else if (prices.laborRateType === 'per_sqm') {
    const sqmRate = prices.laborRateValue || 20;
    const lCost = Math.round(totalWindowAreaSqm * sqmRate * 100) / 100;
    totalLaborCost += lCost;
    laborLines.push({
      id: 'labor-quote-1',
      category: 'labor',
      name: 'Workshop Cutting & Fabrication Labor (Area-Based)',
      description: `Workshop labor based on ${totalWindowAreaSqm.toFixed(2)} m² total opening area @ ${currencySymbol}${sqmRate}/m²`,
      quantity: Number(totalWindowAreaSqm.toFixed(2)),
      unit: 'm²',
      unitPrice: sqmRate,
      totalPrice: lCost,
    });
  } else {
    // Percentage of materials
    const pct = prices.laborRateValue || 15;
    const lCost = Math.round(totalMaterialsCost * (pct / 100) * 100) / 100;
    totalLaborCost += lCost;
    laborLines.push({
      id: 'labor-quote-1',
      category: 'labor',
      name: 'Workshop Craftsmanship & Assembly Charge',
      description: `${pct}% fabrication charge calculated on total raw material expenses`,
      quantity: 1,
      unit: 'job',
      unitPrice: lCost,
      totalPrice: lCost,
    });
  }

  // 5. SITE INSTALLATION & LOGISTICS
  let totalLogisticsCost = 0;
  if (prices.installationRatePerUnit > 0) {
    const instRate = prices.installationRatePerUnit;
    const instCost = Math.round(totalUnits * instRate * 100) / 100;
    totalLogisticsCost += instCost;
    logisticsLines.push({
      id: 'logistics-quote-install',
      category: 'logistics',
      name: 'On-Site Frame Anchoring & Glazing Installation',
      description: `Site fitting, fixing, perimeter silicone sealing, and operational alignment for ${totalUnits} unit(s)`,
      quantity: totalUnits,
      unit: 'units',
      unitPrice: instRate,
      totalPrice: instCost,
    });
  }

  if (prices.transportationFlat > 0) {
    const transCost = prices.transportationFlat;
    totalLogisticsCost += transCost;
    logisticsLines.push({
      id: 'logistics-quote-transport',
      category: 'logistics',
      name: 'Logistics & Site Delivery Trucking',
      description: 'Safe transportation of fabricated frames and glass panels to project site',
      quantity: 1,
      unit: 'trip',
      unitPrice: transCost,
      totalPrice: transCost,
    });
  }

  // COMMERCIAL CALCULATION & MARGINS
  const directProjectCost = Math.round((totalMaterialsCost + totalLaborCost + totalLogisticsCost) * 100) / 100;

  const marginPct = customMargin !== undefined ? customMargin : (prices.profitMarginPercent ?? 15);
  const profitMarginAmount = Math.round(directProjectCost * (marginPct / 100) * 100) / 100;

  const netQuoteBeforeTax = Math.round((directProjectCost + profitMarginAmount) * 100) / 100;

  const taxPct = customTax !== undefined ? customTax : (prices.taxVatPercent ?? 7.5);
  const taxVatAmount = Math.round(netQuoteBeforeTax * (taxPct / 100) * 100) / 100;

  const grandTotalQuotation = Math.round((netQuoteBeforeTax + taxVatAmount) * 100) / 100;

  return {
    currency,
    currencySymbol,
    profileLines,
    glassLines,
    accessoryLines,
    laborLines,
    logisticsLines,
    totalProfilesCost,
    totalGlassCost,
    totalAccessoriesCost,
    totalMaterialsCost,
    totalLaborCost,
    totalLogisticsCost,
    directProjectCost,
    profitMarginPercent: marginPct,
    profitMarginAmount,
    netQuoteBeforeTax,
    taxVatPercent: taxPct,
    taxVatAmount,
    grandTotalQuotation,
  };
}

function getProfilePrice(profileName: string, prices: MaterialPricesConfig): number {
  const p = prices.profileBarPrices;
  const name = profileName.toLowerCase();

  // 1. Casement Outer Width & Height
  if (name.includes('casement outer width') || name.includes('outer width')) {
    return p.casementOuterWidth || p.casementOuterFrame || 44.0;
  }
  if (name.includes('casement outer height') || name.includes('outer height')) {
    return p.casementOuterHeight || p.casementOuterFrame || 44.0;
  }

  // 2. Casement 2-Mullion and 3-Mullion
  if (name.includes('3-mullion') || name.includes('3 mullion')) {
    return p.casement3Mullion || 54.0;
  }
  if (name.includes('2-mullion') || name.includes('2 mullion') || name.includes('casement 2-mullion')) {
    return p.casement2Mullion || p.casementMullion || 48.0;
  }

  // 3. Burglary Profiles & Iron Rods
  if (name.includes('burglary top & side') || name.includes('burglary top') || name.includes('burglary side')) {
    return p.casementBurglaryTopSideFrame || 38.0;
  }
  if (name.includes('burglary bottom')) {
    return p.casementBurglaryBottomFrame || 38.0;
  }
  if (name.includes('burglary iron rod') || name.includes('ballo straight') || name.includes('iron rod')) {
    return p.burglaryIronRod || 18.0;
  }

  // 4. Netting Frame Profiles
  if (name.includes('11:25') || name.includes('1125')) {
    return p.netFrame1125 || 32.0;
  }
  if (name.includes('11:26') || name.includes('1126')) {
    return p.netFrame1126 || 32.0;
  }
  if (name.includes('11:32') || name.includes('1132')) {
    return p.netFrame1132 || 28.0;
  }

  // 5. Glazing Dividers & Iron Angles
  if (name.includes('glazing divider') || name.includes('divider bar') || name.includes('georgian') || name.includes('colonial')) {
    return p.glazingDivider || 24.0;
  }
  if (name.includes('iron angle') || name.includes('angle cleat')) {
    return p.casementIronAngle || 12.0;
  }

  // 6. Sliding Profiles
  if (
    name.includes('top / bottom track') ||
    name.includes('two track') ||
    name.includes('two-track') ||
    name.includes('2 track') ||
    name.includes('top track') ||
    name.includes('bottom track')
  ) {
    return p.topBottomTrack || 42.0;
  }
  if (name.includes('side jamb') || name.includes('double jamb')) {
    return p.sideJambs || 36.0;
  }
  if (
    name.includes('top / bottom sash rail') ||
    name.includes('sash rail') ||
    name.includes('bottom sash') ||
    name.includes('top sash') ||
    name.includes('roller')
  ) {
    return p.bottomSashRail || p.topSashRail || 38.0;
  }
  if (name.includes('lock frame') || name.includes('handle side')) {
    return p.lockFrameStile || 40.0;
  }
  if (name.includes('interlock') || name.includes('meeting')) {
    return p.interlockFrameStile || 32.0;
  }

  // 7. Transom Window Profiles
  if (name.includes('transom outer') || name.includes('transom window outer')) {
    return p.transomOuterFrame || 45.0;
  }
  if (name.includes('transom mullion') || name.includes('transom dividing') || name.includes('transom intermediate')) {
    return p.transomMullion || 46.0;
  }
  if (name.includes('transom top-hung') || name.includes('transom vent') || name.includes('top-hung sash')) {
    return p.transomTopHungSash || 41.0;
  }
  if (name.includes('transom glazing bead') || name.includes('transom bead')) {
    return p.transomGlazingBead || 18.0;
  }

  // 8. Casement De-Curve & Beads
  if (name.includes('casement outer')) {
    return p.casementOuterFrame || 44.0;
  }
  if (name.includes('casement mullion') || name.includes('mullion')) {
    return p.casementMullion || 48.0;
  }
  if (name.includes('de curve') || name.includes('casement inner') || name.includes('casement sash')) {
    return p.casementDeCurveSash || 42.0;
  }
  if (name.includes('casement glazing bead') || name.includes('casement bead')) {
    return p.casementGlazingBead || 18.0;
  }
  if (name.includes('snap-in') || name.includes('bead')) {
    return p.snapInGlassBead || 18.0;
  }
  if (name.includes('fixed')) {
    return p.fixedFrame || 35.0;
  }

  // 9. Doors
  if (name.includes('door outer')) {
    return p.doorOuterFrame || 65.0;
  }
  if (name.includes('door stile') || name.includes('door vertical')) {
    return p.doorStile || 58.0;
  }
  if (name.includes('door top')) {
    return p.doorTopRail || 55.0;
  }
  if (name.includes('door bottom')) {
    return p.doorBottomRail || 68.0;
  }

  // Fallback average extrusion price
  return 40.0;
}

function getAccessoryPrice(accName: string, prices: MaterialPricesConfig): number {
  const a = prices.accessoryPrices;
  const name = accName.toLowerCase();

  if (name.includes('stopper') || name.includes('restrictor')) return a.steelStopperPiece || 3.5;
  if (name.includes('butt') || name.includes('friction hinge') || name.includes('casement hinge')) return a.casementHingePiece || 4.0;
  if (name.includes('insect') || name.includes('mosquito') || name.includes('net mesh')) return a.netRollPrice ? a.netRollPrice / 5.8 : 3.8;
  if (name.includes('spline') || name.includes('net rubber')) return a.netRubberRollPrice ? a.netRubberRollPrice / 5.0 : 1.0;
  if (name.includes('roller')) return a.slidingRollerPair || 4.5;
  if (name.includes('crescent') || name.includes('hook lock') || name.includes('flush lock')) return a.crescentHookLock || 6.0;
  if (name.includes('woolpile')) return a.woolpilePerMeter || 0.45;
  if (name.includes('rubber') || name.includes('gasket') || name.includes('wedge')) return a.rubberGasketPerMeter || 0.55;
  if (name.includes('iron angle') || name.includes('cleat') || name.includes('miter joint')) return a.cornerCleatPiece || 0.8;
  if (name.includes('friction stay') || name.includes('stay')) return a.frictionStayPair || 8.5;
  if (name.includes('cam handle') || name.includes('cockspur') || name.includes('fastener') || name.includes('espagnolette')) return a.casementCamHandle || 4.0;
  if (name.includes('screw') || name.includes('self-tapping')) return a.assemblyScrewPiece || 0.05;
  if (name.includes('silicone') || name.includes('sealant')) return a.siliconeSealantTube || 4.5;
  if (name.includes('anchor') || name.includes('plug')) return a.wallAnchorPlug || 0.2;
  if (name.includes('hinge')) return a.doorHingePair || 7.5;
  if (name.includes('mortise') || name.includes('lockset')) return a.doorMortiseLockset || 24.0;
  if (name.includes('flush bolt')) return a.flushBoltPiece || 5.0;

  return 2.0;
}
