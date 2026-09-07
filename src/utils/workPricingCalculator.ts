import { FabricationItemInput } from '../types';

export interface ClientWorkPricingRule {
  id: string;
  category: 'sliding' | 'casement' | 'door' | 'transom' | 'fixed';
  label: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  priceWithoutExtra: number; // e.g. without net or without burglary
  priceWithExtra: number;    // e.g. with net or with burglary
  extraDescription: string;  // e.g. "Net Screen" or "Burglary Proofing / Net"
  notes?: string;
}

export interface CompanyProfileConfig {
  companyName: string;
  tagline?: string;
  phoneNumber: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  rcNumber?: string;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  defaultLaborPerWork: number; // default 10,000 NGN
  defaultTransport: number;    // default 0 NGN
  defaultVatPercent: number;   // default 0.0%
  defaultProfitMargin: number; // default 15.0%
  termsAndConditions: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfileConfig = {
  companyName: 'OMAS ALUMINIUM PRECISION SYSTEMS',
  tagline: 'Architectural Windows, Doors & Precision Glazing',
  phoneNumber: '+234 803 000 0000',
  secondaryPhone: '',
  email: 'omas7th@gmail.com',
  address: 'Suite 4, Fabrication Industrial Avenue, Lagos, Nigeria',
  rcNumber: 'RC-2948102',
  defaultCurrency: 'NGN',
  defaultCurrencySymbol: '₦',
  defaultLaborPerWork: 10000,
  defaultTransport: 0,
  defaultVatPercent: 0.0,
  defaultProfitMargin: 15.0,
  termsAndConditions:
    '1. 70% advance payment required upon order confirmation to commence fabrication.\n2. 30% balance payable upon completion of workshop assembly prior to site delivery.\n3. Quotation valid for 30 days from date of issuance.\n4. Custom sizes are fabricated to exact architectural survey dimensions.',
};

export const DEFAULT_CLIENT_PRICING_RULES: ClientWorkPricingRule[] = [
  // 1. SLIDING WINDOWS
  {
    id: 'rule-sliding-1',
    category: 'sliding',
    label: 'Standard Large Slider (950–1200 x 950–1200)',
    minWidth: 950,
    maxWidth: 1200,
    minHeight: 950,
    maxHeight: 1200,
    priceWithoutExtra: 60000,
    priceWithExtra: 65000,
    extraDescription: 'Insect Net Screen',
    notes: '950-1200 by 950-1200 range',
  },
  {
    id: 'rule-sliding-2',
    category: 'sliding',
    label: 'Medium/Narrow Slider (750–950 x 950–1200 or 950–1200 x 750–950)',
    minWidth: 750,
    maxWidth: 1200,
    minHeight: 750,
    maxHeight: 1200,
    priceWithoutExtra: 50000,
    priceWithExtra: 55000,
    extraDescription: 'Insect Net Screen',
    notes: 'One or both dimensions below 950 down to 750',
  },
  {
    id: 'rule-sliding-3',
    category: 'sliding',
    label: 'Compact Small Slider (below 750 x below 750)',
    minWidth: 300,
    maxWidth: 749,
    minHeight: 300,
    maxHeight: 749,
    priceWithoutExtra: 50000,
    priceWithExtra: 55000,
    extraDescription: 'Insect Net Screen',
    notes: 'Below 750 by below 750',
  },

  // 2. CASEMENT WINDOWS
  {
    id: 'rule-casement-1',
    category: 'casement',
    label: 'Standard Large Casement (750–1400 x 750–1400)',
    minWidth: 750,
    maxWidth: 1400,
    minHeight: 750,
    maxHeight: 1400,
    priceWithoutExtra: 100000,
    priceWithExtra: 120000,
    extraDescription: 'Burglary Proofing / Net',
    notes: '750-1400 by 750-1400 range',
  },
  {
    id: 'rule-casement-2',
    category: 'casement',
    label: 'Medium Casement (600–750 x 600–750)',
    minWidth: 600,
    maxWidth: 749,
    minHeight: 600,
    maxHeight: 749,
    priceWithoutExtra: 70000,
    priceWithExtra: 80000,
    extraDescription: 'Burglary Proofing / Net',
    notes: 'Below 750 (600-750) by below 750',
  },
  {
    id: 'rule-casement-3',
    category: 'casement',
    label: 'Compact Small Casement (below 600 x below 600)',
    minWidth: 300,
    maxWidth: 599,
    minHeight: 300,
    maxHeight: 599,
    priceWithoutExtra: 50000,
    priceWithExtra: 60000,
    extraDescription: 'Burglary Proofing / Net',
    notes: 'Below 600 by below 600',
  },

  // 3. TRANSOM WINDOWS (Casement logic + ₦80,000 offset)
  {
    id: 'rule-transom-1',
    category: 'transom',
    label: 'Standard Transom Window (750–1400 x 750–1400)',
    minWidth: 750,
    maxWidth: 1400,
    minHeight: 750,
    maxHeight: 1400,
    priceWithoutExtra: 180000, // 100,000 + 80,000
    priceWithExtra: 200000,    // 120,000 + 80,000
    extraDescription: 'Burglary Proofing / Net',
    notes: 'Casement + ₦80,000 transom structure',
  },
  {
    id: 'rule-transom-2',
    category: 'transom',
    label: 'Medium Transom Window (600–750 x 600–750)',
    minWidth: 600,
    maxWidth: 749,
    minHeight: 600,
    maxHeight: 749,
    priceWithoutExtra: 150000, // 70,000 + 80,000
    priceWithExtra: 160000,    // 80,000 + 80,000
    extraDescription: 'Burglary Proofing / Net',
    notes: 'Medium casement + ₦80,000',
  },
  {
    id: 'rule-transom-3',
    category: 'transom',
    label: 'Compact Transom Window (below 600 x below 600)',
    minWidth: 300,
    maxWidth: 599,
    minHeight: 300,
    maxHeight: 599,
    priceWithoutExtra: 130000, // 50,000 + 80,000
    priceWithExtra: 140000,    // 60,000 + 80,000
    extraDescription: 'Burglary Proofing / Net',
    notes: 'Compact casement + ₦80,000',
  },

  // 4. DOORS
  {
    id: 'rule-door-1',
    category: 'door',
    label: 'Standard Aluminum Door (500–1400 x 500–1400)',
    minWidth: 500,
    maxWidth: 1400,
    minHeight: 500,
    maxHeight: 1400,
    priceWithoutExtra: 80000,
    priceWithExtra: 80000,
    extraDescription: 'Heavy-Duty Door Lockset',
    notes: '500-1400 by 500-1400 range',
  },
  {
    id: 'rule-door-2',
    category: 'door',
    label: 'Full-Height Entrance / Terrace Door (700–1200 x 1800–2400)',
    minWidth: 700,
    maxWidth: 1400,
    minHeight: 1401,
    maxHeight: 2400,
    priceWithoutExtra: 120000,
    priceWithExtra: 135000,
    extraDescription: 'Security Multipoint Lock & Glass',
    notes: 'Full height architectural doors',
  },

  // 5. FIXED WINDOWS
  {
    id: 'rule-fixed-1',
    category: 'fixed',
    label: 'Fixed Glazed Window (500–1400 x 500–1400)',
    minWidth: 300,
    maxWidth: 1400,
    minHeight: 300,
    maxHeight: 1400,
    priceWithoutExtra: 45000,
    priceWithExtra: 50000,
    extraDescription: 'Laminated / Tinted Glass Spec',
    notes: 'Direct frame fixed glazing',
  },
];

const STORAGE_KEYS = {
  PRICING_RULES: 'omas_client_pricing_rules_v2',
  COMPANY_PROFILE: 'omas_company_profile_v2',
  USER_CURRENCY: 'omas_user_selected_currency_v2',
};

export function getStoredPricingRules(): ClientWorkPricingRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICING_RULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(DEFAULT_CLIENT_PRICING_RULES));
      return DEFAULT_CLIENT_PRICING_RULES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load pricing rules:', e);
    return DEFAULT_CLIENT_PRICING_RULES;
  }
}

export function saveStoredPricingRules(rules: ClientWorkPricingRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save pricing rules:', e);
  }
}

export function resetStoredPricingRules(): ClientWorkPricingRule[] {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(DEFAULT_CLIENT_PRICING_RULES));
  } catch (e) {}
  return DEFAULT_CLIENT_PRICING_RULES;
}

export function getStoredCompanyProfile(): CompanyProfileConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(DEFAULT_COMPANY_PROFILE));
      return DEFAULT_COMPANY_PROFILE;
    }
    return { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load company profile:', e);
    return DEFAULT_COMPANY_PROFILE;
  }
}

export function saveStoredCompanyProfile(profile: CompanyProfileConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save company profile:', e);
  }
}

/**
 * Detect country/currency without asking for browser geolocation permissions.
 * Checks timezone and navigator language. If Nigeria -> NGN (₦), otherwise USD ($).
 */
export function detectUserCountryCurrency(): { code: string; symbol: string; name: string } {
  try {
    // Check if user previously saved a manual preference
    const saved = localStorage.getItem(STORAGE_KEYS.USER_CURRENCY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.code && parsed?.symbol) return parsed;
      } catch {}
    }

    const timeZone = (Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || '').toLowerCase();
    const languages = navigator.languages || [navigator.language || ''];
    const isNigeria =
      timeZone.includes('lagos') ||
      timeZone.includes('nigeria') ||
      languages.some((l) => l.toUpperCase().includes('-NG'));

    if (isNigeria) {
      return { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' };
    }
    return { code: 'USD', symbol: '$', name: 'US Dollar' };
  } catch {
    return { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' };
  }
}

export function saveUserSelectedCurrency(currency: { code: string; symbol: string; name: string }) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_CURRENCY, JSON.stringify(currency));
  } catch {}
}

export interface ClientWorkCalculationResult {
  unitPrice: number;
  totalPrice: number;
  isManualRequired: boolean;
  isOverridden: boolean;
  ruleMatched?: ClientWorkPricingRule;
  categoryName: string;
  hasExtraOption: boolean;
  extraOptionLabel: string;
}

/**
 * Calculates work price for a single fabrication item using the user's defined logic.
 */
export function calculateItemClientPrice(
  item: FabricationItemInput,
  rules: ClientWorkPricingRule[],
  manualPriceOverride?: number
): ClientWorkCalculationResult {
  if (!item) {
    return {
      unitPrice: 0,
      totalPrice: 0,
      isManualRequired: true,
      isOverridden: false,
      categoryName: 'Standard Unit',
      hasExtraOption: false,
      extraOptionLabel: 'Standard',
    };
  }

  const w = Number(item.width) || 0;
  const h = Number(item.height) || 0;
  const qty = Number(item.quantity) || 1;

  // Determine category
  let category: 'sliding' | 'casement' | 'door' | 'transom' | 'fixed' = 'sliding';
  let categoryName = 'Sliding Window';
  let hasExtra = false;
  let extraLabel = 'Net Screen';

  const kindStr = String(item.kind || '');
  const typeStr = String(item.type || '');

  if (typeStr === 'door') {
    category = 'door';
    categoryName = kindStr.includes('sliding') ? 'Sliding Door' : 'Casement Door';
    hasExtra = !!item.hasBurglary;
    extraLabel = 'Burglary / Security';
  } else if (kindStr.includes('transom')) {
    category = 'transom';
    categoryName = 'Transom Window';
    hasExtra = !!(item.hasBurglary || item.hasNet);
    extraLabel = 'Burglary / Net';
  } else if (kindStr.includes('casement')) {
    category = 'casement';
    categoryName = 'Casement Window';
    hasExtra = !!(item.hasBurglary || item.hasNet);
    extraLabel = 'Burglary / Net';
  } else if (kindStr.includes('fixed')) {
    category = 'fixed';
    categoryName = 'Fixed Window';
    hasExtra = !!item.hasNet;
    extraLabel = 'Tinted / Net';
  } else {
    // Sliding window
    category = 'sliding';
    categoryName = 'Sliding Window';
    hasExtra = !!item.hasNet;
    extraLabel = 'Insect Net';
  }

  // Check manual price override first (Requirement 8)
  if (manualPriceOverride !== undefined && manualPriceOverride !== null && manualPriceOverride > 0) {
    return {
      unitPrice: manualPriceOverride,
      totalPrice: manualPriceOverride * qty,
      isManualRequired: false,
      isOverridden: true,
      categoryName,
      hasExtraOption: hasExtra,
      extraOptionLabel: extraLabel,
    };
  }

  // Filter rules for this category
  const catRules = rules.filter((r) => r.category === category);

  // 1. Check exact size range match
  let matchedRule = catRules.find(
    (r) => w >= r.minWidth && w <= r.maxWidth && h >= r.minHeight && h <= r.maxHeight
  );

  // 2. Nearest higher logic rule if not matched:
  // "if one of the width and height hit the higher range, use the higher range price"
  // "incase if any of the width by height range system i use is not on the calculation,
  // assuming we have below 750 by range 1200, you are to use the nearest higher logic price for it"
  if (!matchedRule) {
    if (category === 'sliding') {
      // Sliding window logic boundary is 1200mm
      if (w > 1200 || h > 1200) {
        // Beyond window logic size -> require user manual price!
        return {
          unitPrice: 0,
          totalPrice: 0,
          isManualRequired: true,
          isOverridden: false,
          categoryName,
          hasExtraOption: hasExtra,
          extraOptionLabel: extraLabel,
        };
      }

      // Check higher range
      if (w >= 950 && h >= 950) {
        matchedRule = catRules.find((r) => r.id === 'rule-sliding-1');
      } else {
        // At least one dimension is below 950
        matchedRule = catRules.find((r) => r.id === 'rule-sliding-2') || catRules.find((r) => r.id === 'rule-sliding-3');
      }
    } else if (category === 'casement' || category === 'transom') {
      // Casement/Transom logic boundary is 1400mm
      if (w > 1400 || h > 1400) {
        // Beyond logic size -> manual price required
        return {
          unitPrice: 0,
          totalPrice: 0,
          isManualRequired: true,
          isOverridden: false,
          categoryName,
          hasExtraOption: hasExtra,
          extraOptionLabel: extraLabel,
        };
      }

      // "if one of the width and height hit the higher range, use the higher range price calculation logic"
      if (w >= 750 || h >= 750) {
        // Higher range (750-1400)
        matchedRule = catRules.find((r) => r.label.includes('750–1400') || r.label.includes('Standard'));
      } else if (w >= 600 || h >= 600) {
        // Medium range (600-750)
        matchedRule = catRules.find((r) => r.label.includes('600–750') || r.label.includes('Medium'));
      } else {
        // Compact range (<600)
        matchedRule = catRules.find((r) => r.label.includes('below 600') || r.label.includes('Compact'));
      }
    } else if (category === 'door') {
      // Door logic boundary check
      if (w >= 500 && w <= 1400 && h >= 500 && h <= 1400) {
        matchedRule = catRules.find((r) => r.id === 'rule-door-1');
      } else if (h > 1400 && h <= 2400) {
        matchedRule = catRules.find((r) => r.id === 'rule-door-2');
      }
      if (!matchedRule) {
        return {
          unitPrice: 0,
          totalPrice: 0,
          isManualRequired: true,
          isOverridden: false,
          categoryName,
          hasExtraOption: hasExtra,
          extraOptionLabel: extraLabel,
        };
      }
    } else if (category === 'fixed') {
      if (w <= 1400 && h <= 1400) {
        matchedRule = catRules[0];
      } else {
        return {
          unitPrice: 0,
          totalPrice: 0,
          isManualRequired: true,
          isOverridden: false,
          categoryName,
          hasExtraOption: hasExtra,
          extraOptionLabel: extraLabel,
        };
      }
    }
  }

  if (!matchedRule) {
    return {
      unitPrice: 0,
      totalPrice: 0,
      isManualRequired: true,
      isOverridden: false,
      categoryName,
      hasExtraOption: hasExtra,
      extraOptionLabel: extraLabel,
    };
  }

  const unitPrice = hasExtra ? matchedRule.priceWithExtra : matchedRule.priceWithoutExtra;
  return {
    unitPrice,
    totalPrice: unitPrice * qty,
    isManualRequired: false,
    isOverridden: false,
    ruleMatched: matchedRule,
    categoryName,
    hasExtraOption: hasExtra,
    extraOptionLabel: extraLabel,
  };
}
