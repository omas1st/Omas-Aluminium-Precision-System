import {
  CombinedProjectCalculation,
  MaterialPricesConfig,
  QuotationBreakdown,
  QuotationLineItem,
} from '../types';
import { getMaterialDisplayName } from './materialNamesStorage';
import { convertPricesConfig } from '../constants/defaultPrices';

export function calculateQuotationBreakdown(
  calc: CombinedProjectCalculation,
  rawPrices: MaterialPricesConfig,
  customMargin?: number,
  customTax?: number
): QuotationBreakdown {
  const currency = rawPrices.currency || 'NGN';
  const currencySymbol = rawPrices.currencySymbol || '₦';

  // If quotation currency is USD, but stored prices are in Naira (or exchange rate is requested),
  // convert using the formula: dollar price = Nigerian price / 1400!
  const isUSD = currency === 'USD' || currencySymbol === '$';
  const prices = (isUSD && (rawPrices.profileBarPrices?.sideJambs >= 500 || rawPrices.currency === 'USD'))
    ? convertPricesConfig(rawPrices, 'USD', rawPrices.exchangeRateToUSD || 1400)
    : rawPrices;

  const profileLines: QuotationLineItem[] = [];
  const glassLines: QuotationLineItem[] = [];
  const accessoryLines: QuotationLineItem[] = [];
  const laborLines: QuotationLineItem[] = [];
  const logisticsLines: QuotationLineItem[] = [];

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

  // 1. Sliding Profiles
  // Double Jam profile is 10000
  if (name.includes('double jam') || name.includes('double jamb') || name.includes('side jamb')) {
    return p.sideJambs || 10000;
  }
  // Lock and Interlock profiles are 10000
  if (name.includes('lock frame') || name.includes('lock profile') || name.includes('handle side')) {
    return p.lockFrameStile || 10000;
  }
  if (name.includes('interlock') || name.includes('meeting')) {
    return p.interlockFrameStile || 10000;
  }
  // Top and bottom profile is 10000
  if (
    name.includes('top / bottom track') ||
    name.includes('two track') ||
    name.includes('two-track') ||
    name.includes('2 track') ||
    name.includes('top track') ||
    name.includes('bottom track') ||
    name.includes('top and buttom') ||
    name.includes('top & bottom')
  ) {
    return p.topBottomTrack || 10000;
  }
  if (
    name.includes('top / bottom sash rail') ||
    name.includes('sash rail') ||
    name.includes('bottom sash') ||
    name.includes('top sash')
  ) {
    return p.bottomSashRail || p.topSashRail || 10000;
  }

  // 2. Net Profiles
  // 11:32 profile is 3500
  if (name.includes('11:32') || name.includes('1132')) {
    return p.netFrame1132 || 3500;
  }
  // 11:26 and 11:25 is 5000
  if (name.includes('11:25') || name.includes('1125')) {
    return p.netFrame1125 || 5000;
  }
  if (name.includes('11:26') || name.includes('1126')) {
    return p.netFrame1126 || 5000;
  }
  // Net profile/bomper is 20000
  if (name.includes('net profile') || name.includes('bomper') || name.includes('bumper') || name.includes('sliding net frame')) {
    return p.netProfileBumper || 20000;
  }

  // 3. Casement & Transom Mullions
  // 3 panel mullion is 25000
  if (name.includes('3-mullion') || name.includes('3 mullion') || name.includes('3 panel mullion') || name.includes('mullion 3 panel')) {
    return p.casement3Mullion || 25000;
  }
  // Mullion 2 panel is 20000
  if (name.includes('2-mullion') || name.includes('2 mullion') || name.includes('mullion 2 panel') || name.includes('2 panel mullion') || name.includes('casement 2-mullion')) {
    return p.casement2Mullion || p.casementMullion || 20000;
  }
  if (name.includes('transom mullion') || name.includes('transom dividing') || name.includes('transom intermediate')) {
    return p.transomMullion || 20000;
  }

  // 4. D Curve Profile is 20000
  if (name.includes('d curve') || name.includes('de curve') || name.includes('d-curve') || name.includes('de-curve') || name.includes('casement inner') || name.includes('casement sash')) {
    return p.casementDeCurveSash || 20000;
  }

  // 5. Width and Height Profiles are 15000
  if (name.includes('casement outer width') || name.includes('outer width') || name.includes('width profile')) {
    return p.casementOuterWidth || p.casementOuterFrame || 15000;
  }
  if (name.includes('casement outer height') || name.includes('outer height') || name.includes('height profile')) {
    return p.casementOuterHeight || p.casementOuterFrame || 15000;
  }
  if (name.includes('casement outer') || name.includes('casement frame')) {
    return p.casementOuterFrame || 15000;
  }

  // 6. Dividers: divider small 8000, big 15000
  if (name.includes('divider big') || name.includes('big divider') || name.includes('heavy divider')) {
    return p.glazingDividerBig || 15000;
  }
  if (name.includes('divider small') || name.includes('small divider') || name.includes('glazing divider') || name.includes('divider bar') || name.includes('georgian') || name.includes('colonial')) {
    return p.glazingDividerSmall || p.glazingDivider || 8000;
  }

  // 7. Iron Rod is 7000
  if (name.includes('burglary iron rod') || name.includes('ballo straight') || name.includes('iron rod')) {
    return p.burglaryIronRod || 7000;
  }
  if (name.includes('burglary top & side') || name.includes('burglary top') || name.includes('burglary side')) {
    return p.casementBurglaryTopSideFrame || 15000;
  }
  if (name.includes('burglary bottom')) {
    return p.casementBurglaryBottomFrame || 15000;
  }
  if (name.includes('iron angle') || name.includes('angle cleat')) {
    return p.casementIronAngle || 3500;
  }

  // 8. Transom Profiles
  if (name.includes('transom outer') || name.includes('transom window outer')) {
    return p.transomOuterFrame || 15000;
  }
  if (name.includes('transom top-hung') || name.includes('transom vent') || name.includes('top-hung sash')) {
    return p.transomTopHungSash || 20000;
  }
  if (name.includes('transom glazing bead') || name.includes('transom bead')) {
    return p.transomGlazingBead || 4000;
  }
  if (name.includes('transom iron angle') || name.includes('transom angle')) {
    return p.transomIronAngle || 3500;
  }

  // 9. Beads & Fixed
  if (name.includes('casement glazing bead') || name.includes('casement bead') || name.includes('snap-in') || name.includes('bead')) {
    return p.casementGlazingBead || p.snapInGlassBead || 4000;
  }
  if (name.includes('fixed')) {
    return p.fixedFrame || 15000;
  }

  // 10. Doors
  if (name.includes('door outer')) {
    return p.doorOuterFrame || 22000;
  }
  if (name.includes('door stile') || name.includes('door vertical')) {
    return p.doorStile || 20000;
  }
  if (name.includes('door top')) {
    return p.doorTopRail || 18000;
  }
  if (name.includes('door bottom')) {
    return p.doorBottomRail || 22000;
  }

  // Fallback average extrusion price
  return 15000;
}

function getAccessoryPrice(accName: string, prices: MaterialPricesConfig): number {
  const a = prices.accessoryPrices;
  const name = accName.toLowerCase();

  // Roller is 1000
  if (name.includes('roller')) {
    return a.slidingRollerPair || 1000;
  }

  // Net rubber is 700
  if (name.includes('net rubber') || name.includes('spline')) {
    return a.netRubberRollPrice ? Math.round(a.netRubberRollPrice / 5.0) : 140;
  }

  // Glasing rubber is 1000
  if (
    name.includes('glasing rubber') ||
    name.includes('glazing rubber') ||
    name.includes('rubber gasket') ||
    name.includes('wedge rubber') ||
    name.includes('u-channel rubber') ||
    (name.includes('rubber') && !name.includes('net'))
  ) {
    return a.rubberGasketPerMeter || 70;
  }

  // Net is 13000 (per roll, or approx ₦850/m² fabricated)
  if (name.includes('insect') || name.includes('mosquito') || name.includes('net mesh') || (name.includes('net') && !name.includes('rubber') && !name.includes('frame') && !name.includes('spline'))) {
    return a.netRollPrice ? Math.round(a.netRollPrice / 15.0) : 850;
  }

  // Screw is 5000 (pack of 1,000 screws = ₦5/piece)
  if (name.includes('screw') || name.includes('self-tapping') || name.includes('fastener')) {
    return a.assemblyScrewPiece || 5;
  }

  // Hardware & Stays
  if (name.includes('stopper') || name.includes('restrictor')) return a.steelStopperPiece || 1500;
  if (name.includes('butt') || name.includes('friction hinge') || name.includes('casement hinge')) return a.casementHingePiece || 1500;
  if (name.includes('crescent') || name.includes('hook lock') || name.includes('flush lock')) return a.crescentHookLock || 2000;
  if (name.includes('woolpile')) return a.woolpilePerMeter || 200;
  if (name.includes('iron angle') || name.includes('cleat') || name.includes('miter joint')) return a.cornerCleatPiece || 500;
  if (name.includes('friction stay') || name.includes('stay')) return a.frictionStayPair || 3500;
  if (name.includes('cam handle') || name.includes('cockspur')) return a.casementCamHandle || 2000;
  if (name.includes('silicone') || name.includes('sealant')) return a.siliconeSealantTube || 2500;
  if (name.includes('anchor') || name.includes('plug')) return a.wallAnchorPlug || 100;
  if (name.includes('hinge')) return a.doorHingePair || 3500;
  if (name.includes('mortise') || name.includes('lockset')) return a.doorMortiseLockset || 12000;
  if (name.includes('flush bolt')) return a.flushBoltPiece || 2500;

  return 500;
}
