import { MaterialPricesConfig } from '../types';

export const NGN_TO_USD_RATE = 1400; // 1 USD = 1,400 NGN (dollar price = Nigerian price / 1400)

export const DEFAULT_MATERIAL_PRICES: MaterialPricesConfig = {
  currency: 'NGN',
  currencySymbol: '₦',
  exchangeRateToUSD: 1400,

  // Profile bar prices (per 5.8m standard extrusion bar) in Nigerian Naira (₦)
  profileBarPrices: {
    // Sliding Profiles
    topBottomTrack: 10000,       // Top & Bottom profile: ₦10,000 ($7.14)
    sideJambs: 10000,            // Double Jam profile: ₦10,000 ($7.14)
    bottomSashRail: 10000,       // Bottom Sash Rail (Roller Carrier): ₦10,000 ($7.14)
    topSashRail: 10000,          // Top Sash Rail: ₦10,000 ($7.14)
    lockFrameStile: 10000,       // Lock profile: ₦10,000 ($7.14)
    interlockFrameStile: 10000,  // Interlock profile: ₦10,000 ($7.14)

    // Casement Profiles
    casementOuterWidth: 15000,   // Width profile: ₦15,000 ($10.71)
    casementOuterHeight: 15000,  // Height profile: ₦15,000 ($10.71)
    casementOuterFrame: 15000,   // Casement Outer Frame: ₦15,000 ($10.71)
    casement2Mullion: 20000,     // Mullion 2 panel: ₦20,000 ($14.29)
    casement3Mullion: 25000,     // 3 panel mullion: ₦25,000 ($17.86)
    casementMullion: 20000,      // Center mullion (2-panel standard): ₦20,000 ($14.29)
    casementDeCurveSash: 20000,  // D curve profile: ₦20,000 ($14.29)
    casementGlazingBead: 4000,   // Glazing bead profile: ₦4,000 ($2.86)

    // Casement Burglary & Net Profiles
    casementBurglaryTopSideFrame: 15000, // Burglary top/side frame: ₦15,000 ($10.71)
    casementBurglaryBottomFrame: 15000,  // Burglary bottom frame: ₦15,000 ($10.71)
    netFrame1125: 5000,                  // 11:25 net frame: ₦5,000 ($3.57)
    netFrame1126: 5000,                  // 11:26 net frame: ₦5,000 ($3.57)
    netFrame1132: 3500,                  // 11:32 profile: ₦3,500 ($2.50)
    burglaryIronRod: 7000,               // Iron Rod (5.8m): ₦7,000 ($5.00)
    casementIronAngle: 3500,             // Corner angle iron: ₦3,500 ($2.50)
    glazingDivider: 8000,                // Divider small: ₦8,000 ($5.71)
    glazingDividerSmall: 8000,           // Divider small: ₦8,000 ($5.71)
    glazingDividerBig: 15000,            // Divider big: ₦15,000 ($10.71)
    netProfileBumper: 20000,             // Net profile/bomper: ₦20,000 ($14.29)

    // Transom Window Profiles (Separated)
    transomOuterFrame: 15000,            // Transom Outer Frame: ₦15,000 ($10.71)
    transomMullion: 20000,               // Transom Mullion: ₦20,000 ($14.29)
    transomTopHungSash: 20000,           // Transom Sash: ₦20,000 ($14.29)
    transomGlazingBead: 4000,            // Transom Bead: ₦4,000 ($2.86)
    transomIronAngle: 3500,              // Transom Iron Angle (5.0m Stock Bar): ₦3,500 ($2.50)

    // Fixed & Door Profiles
    fixedFrame: 15000,                   // Fixed Frame: ₦15,000 ($10.71)
    snapInGlassBead: 4000,               // Snap-in Bead: ₦4,000 ($2.86)
    doorOuterFrame: 22000,               // Door Outer Frame: ₦22,000 ($15.71)
    doorStile: 20000,                    // Door Stile: ₦20,000 ($14.29)
    doorTopRail: 18000,                  // Door Top Rail: ₦18,000 ($12.86)
    doorBottomRail: 22000,               // Door Bottom Rail: ₦22,000 ($15.71)
  },

  // Glass Price per m² derived from 1 sheet (3300 × 2140 = 7.062 m²)
  // 5mm glass: 1 sheet (3300 by 2140) = ₦140,000 -> ₦19,825/m² ($14.16/m²)
  // 4mm glass: 1 sheet (3300 by 2140) = ₦110,000 -> ₦15,576/m² ($11.13/m²)
  glassPricePerM2: 19825,
  glassTypeName: '5mm Clear / Tinted Float Glass (₦140,000/sheet 3300×2140)',
  glassSheetPrice4mm: 110000,
  glassSheetPrice5mm: 140000,
  glassSheetWidth: 3300,
  glassSheetHeight: 2140,

  // Hardware & Accessories unit prices in Nigerian Naira (₦)
  accessoryPrices: {
    slidingRollerPair: 1000,             // Roller: ₦1,000 ($0.71)
    crescentHookLock: 2000,              // Crescent Lock: ₦2,000 ($1.43)
    woolpilePerMeter: 200,               // Woolpile: ₦200 ($0.14)
    rubberGasketPerMeter: 70,            // Glasing rubber per meter (approx 15m/roll = ₦70/m)
    glazingRubberRollPrice: 1000,        // Glasing rubber: ₦1,000 ($0.71)
    cornerCleatPiece: 500,               // Corner Cleat: ₦500 ($0.36)
    frictionStayPair: 3500,              // Friction Stays: ₦3,500 ($2.50)
    casementCamHandle: 2000,             // Cam / Cockspur Handle: ₦2,000 ($1.43)
    assemblyScrewPiece: 5,               // Screw: ₦5/piece (₦5,000 per 1,000 pack)
    assemblyScrewPackPrice: 5000,        // Screw: ₦5,000 ($3.57) per 1000-pack
    siliconeSealantTube: 2500,           // Silicone Sealant: ₦2,500 ($1.79)
    wallAnchorPlug: 100,                 // Wall Plug: ₦100 ($0.07)
    doorHingePair: 3500,                 // Door Hinges: ₦3,500 ($2.50)
    doorMortiseLockset: 12000,           // Mortise Lockset: ₦12,000 ($8.57)
    flushBoltPiece: 2500,                // Flush Bolt: ₦2,500 ($1.79)
    netRollPrice: 13000,                 // Net: ₦13,000 per roll ($9.29)
    netRubberRollPrice: 700,             // Net rubber: ₦700 ($0.50)
    steelStopperPiece: 1500,             // Steel Stopper: ₦1,500 ($1.07)
    casementHingePiece: 1500,            // Casement Hinge: ₦1,500 ($1.07)
  },

  // Labor & Fabrication Charges in Naira
  laborRateType: 'per_unit',
  laborRateValue: 10000,                 // ₦10,000 per fabricated window/door unit ($7.14)

  // Installation & Logistics in Naira
  installationRatePerUnit: 5000,         // ₦5,000 per unit installation ($3.57)
  transportationFlat: 15000,             // ₦15,000 flat transport ($10.71)

  // Commercial margins
  profitMarginPercent: 15.0,             // 15% default profit margin
  taxVatPercent: 7.5,                    // 7.5% VAT/sales tax
};

export const POPULAR_CURRENCIES = [
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira (₦)', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', name: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)', name: 'British Pound' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling (KSh)', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi (GH₵)', name: 'Ghanaian Cedi' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar (AU$)', name: 'Australian Dollar' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)', name: 'South African Rand' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)', name: 'UAE Dirham' },
];

/**
 * Converts a base Nigerian Naira (NGN) price configuration into another currency (e.g. USD).
 * When target is USD, price = NGN_price / 1400.
 */
export function convertPricesConfig(
  prices: MaterialPricesConfig,
  targetCurrency: string,
  rate: number = NGN_TO_USD_RATE
): MaterialPricesConfig {
  if (targetCurrency !== 'USD') {
    return prices;
  }

  const factor = 1 / rate;
  const roundDollar = (val: number) => Math.round(val * factor * 100) / 100;

  const convertedProfiles: any = {};
  for (const [k, v] of Object.entries(prices.profileBarPrices)) {
    convertedProfiles[k] = roundDollar(Number(v) || 0);
  }

  const convertedAccessories: any = {};
  for (const [k, v] of Object.entries(prices.accessoryPrices)) {
    convertedAccessories[k] = roundDollar(Number(v) || 0);
  }

  return {
    ...prices,
    currency: 'USD',
    currencySymbol: '$',
    exchangeRateToUSD: rate,
    profileBarPrices: convertedProfiles,
    accessoryPrices: convertedAccessories,
    glassPricePerM2: roundDollar(prices.glassPricePerM2),
    glassSheetPrice4mm: prices.glassSheetPrice4mm ? roundDollar(prices.glassSheetPrice4mm) : undefined,
    glassSheetPrice5mm: prices.glassSheetPrice5mm ? roundDollar(prices.glassSheetPrice5mm) : undefined,
    laborRateValue: roundDollar(prices.laborRateValue),
    installationRatePerUnit: roundDollar(prices.installationRatePerUnit),
    transportationFlat: roundDollar(prices.transportationFlat),
  };
}
