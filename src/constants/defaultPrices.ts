import { MaterialPricesConfig } from '../types';

export const DEFAULT_MATERIAL_PRICES: MaterialPricesConfig = {
  currency: 'USD',
  currencySymbol: '$',

  // Profile bar prices (per 5.8m standard extrusion bar)
  profileBarPrices: {
    // Sliding Profiles
    topBottomTrack: 42.0,
    sideJambs: 36.0,
    bottomSashRail: 38.0,
    topSashRail: 38.0,
    lockFrameStile: 40.0,
    interlockFrameStile: 32.0,

    // Casement Profiles
    casementOuterFrame: 44.0,
    casementMullion: 48.0,
    casementDeCurveSash: 42.0,
    casementGlazingBead: 18.0,

    // Transom Window Profiles (Separated)
    transomOuterFrame: 45.0,
    transomMullion: 46.0,
    transomTopHungSash: 41.0,
    transomGlazingBead: 18.0,

    // Fixed & Door Profiles
    fixedFrame: 35.0,
    snapInGlassBead: 18.0,
    doorOuterFrame: 65.0,
    doorStile: 58.0,
    doorTopRail: 55.0,
    doorBottomRail: 68.0,
  },

  // Glass Price per m²
  glassPricePerM2: 35.0,
  glassTypeName: '5mm Clear / Tinted Float Glass',

  // Hardware & Accessories unit prices
  accessoryPrices: {
    slidingRollerPair: 4.5,
    crescentHookLock: 6.0,
    woolpilePerMeter: 0.45,
    rubberGasketPerMeter: 0.55,
    cornerCleatPiece: 0.8,
    frictionStayPair: 8.5,
    casementCamHandle: 4.0,
    assemblyScrewPiece: 0.05,
    siliconeSealantTube: 4.5,
    wallAnchorPlug: 0.2,
    doorHingePair: 7.5,
    doorMortiseLockset: 24.0,
    flushBoltPiece: 5.0,
  },

  // Labor & Fabrication Charges
  laborRateType: 'per_unit',
  laborRateValue: 25.0, // $25 per fabricated window/door unit

  // Installation & Logistics
  installationRatePerUnit: 15.0, // $15 per unit installation
  transportationFlat: 50.0, // $50 flat transport

  // Commercial margins
  profitMarginPercent: 15.0, // 15% default profit margin
  taxVatPercent: 7.5, // 7.5% VAT/sales tax
};

export const POPULAR_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira (₦)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling (KSh)' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi (GH₵)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar (AU$)' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
];
