import React, { useState, useMemo, useEffect } from 'react';
import {
  CombinedProjectCalculation,
  MaterialPricesConfig,
  ClientQuotationInfo,
  FabricationItemInput,
} from '../types';
import { calculateQuotationBreakdown } from '../utils/quotationCalculator';
import { downloadQuotationPdf, downloadClientBillPdf, ClientBillItemForPdf } from '../utils/pdfGenerator';
import {
  getStoredPricingRules,
  getStoredCompanyProfile,
  calculateItemClientPrice,
  detectUserCountryCurrency,
  saveUserSelectedCurrency,
  CompanyProfileConfig,
  ClientWorkPricingRule,
} from '../utils/workPricingCalculator';
import {
  DollarSign,
  Download,
  FileText,
  Copy,
  Check,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  Percent,
  Layers,
  Sparkles,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Tag,
  Hammer,
  Truck,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Globe,
  HelpCircle,
  Receipt,
  Boxes,
  Maximize,
  Info,
  Trash2,
  X,
} from 'lucide-react';
import './QuotationOutput.css';

interface QuotationOutputProps {
  calc: CombinedProjectCalculation;
  prices: MaterialPricesConfig;
  onOpenAdminPrices?: () => void;
}

const POPULAR_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (NGN)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi (GHS)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KES)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (ZAR)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)' },
];

export const QuotationOutput: React.FC<QuotationOutputProps> = ({
  calc,
  prices,
  onOpenAdminPrices,
}) => {
  // Main Tab State: "client_bills" (Default per user request) vs "company_expenses"
  const [activeTab, setActiveTab] = useState<'client_bills' | 'company_expenses'>('client_bills');

  // Currency Selection (Auto-detected without location prompt, user can change anytime)
  const [selectedCurrency, setSelectedCurrency] = useState<{
    code: string;
    symbol: string;
    name: string;
  }>(() => {
    return detectUserCountryCurrency();
  });

  // Client Information State (Always visible for easy editing)
  const [clientInfo, setClientInfo] = useState<ClientQuotationInfo>({
    clientName: 'Valued Client',
    clientCompany: '',
    clientPhone: '',
    clientEmail: '',
    projectSiteAddress: '',
    quoteRefNumber: `QT-${Math.floor(100000 + Math.random() * 900000)}`,
    validityDays: 30,
    notesOrTerms:
      '1. 70% Advance payment required upon order confirmation.\n2. 30% balance payable upon completion of workshop assembly prior to site delivery.\n3. Custom sizes fabricated according to signed architectural survey.',
  });

  // Company Profile & Rules configuration
  const [companyProfile] = useState<CompanyProfileConfig>(() => getStoredCompanyProfile());
  const [pricingRules] = useState<ClientWorkPricingRule[]>(() => getStoredPricingRules());

  // Manual Price Overrides per item id
  const [manualPriceOverrides, setManualPriceOverrides] = useState<Record<string, number>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPriceInput, setTempPriceInput] = useState<string>('');

  // Client Tab Editable Financials:
  // 1. Labor: Defaults to ₦10,000 per work (items count * 10,000)
  const totalWorksQuantity = useMemo(() => {
    if (!calc?.items) return 0;
    return calc.items.reduce((acc, it) => {
      const act = (it as any)?.item || it;
      return acc + (Number(act?.quantity) || 1);
    }, 0);
  }, [calc?.items]);

  const [laborManuallyEdited, setLaborManuallyEdited] = useState(false);
  const [clientLaborAmount, setClientLaborAmount] = useState<number>(() => {
    return totalWorksQuantity * (companyProfile.defaultLaborPerWork || 10000);
  });

  // Keep labor amount synced when totalWorksQuantity changes unless manually edited
  useEffect(() => {
    if (!laborManuallyEdited) {
      setClientLaborAmount(totalWorksQuantity * (companyProfile.defaultLaborPerWork || 10000));
    }
  }, [totalWorksQuantity, companyProfile.defaultLaborPerWork, laborManuallyEdited]);

  // 2. Transportation: Defaults to 0
  const [clientTransportAmount, setClientTransportAmount] = useState<number>(() => {
    return companyProfile.defaultTransport || 0;
  });

  // 3. VAT/Tax: Defaults to 0.0%
  const [clientVatPercent, setClientVatPercent] = useState<number>(() => {
    return companyProfile.defaultVatPercent !== undefined ? companyProfile.defaultVatPercent : 0.0;
  });

  // Company Tab Financial Parameters:
  const [companyProfitMargin, setCompanyProfitMargin] = useState<number>(
    prices?.profitMarginPercent ?? companyProfile.defaultProfitMargin ?? 15
  );
  const [companyTaxPercent, setCompanyTaxPercent] = useState<number>(
    companyProfile.defaultVatPercent !== undefined ? companyProfile.defaultVatPercent : 0.0
  );

  const [copied, setCopied] = useState(false);

  // Currency change handler
  const handleCurrencyChange = (currCode: string) => {
    const found = POPULAR_CURRENCIES.find((c) => c.code === currCode);
    if (found) {
      setSelectedCurrency(found);
      saveUserSelectedCurrency(found);
    }
  };

  const sym = selectedCurrency.symbol;

  // Calculate Client Works Items
  // Note: calc.items is ItemCalculationResult[], where each element has { item: FabricationItemInput, ... }
  const clientWorkItems = useMemo(() => {
    if (!calc?.items) return [];
    return calc.items.map((itemResult, idx) => {
      const actualItem: FabricationItemInput = (itemResult as any)?.item || itemResult;
      const itemId = actualItem?.id || `item-${idx}`;
      const manualVal = manualPriceOverrides[itemId];
      const calcResult = calculateItemClientPrice(actualItem, pricingRules, manualVal);
      return {
        item: actualItem,
        itemId,
        ...calcResult,
      };
    });
  }, [calc?.items, pricingRules, manualPriceOverrides]);

  // Check if any work requires manual pricing
  const unpricedWorksCount = useMemo(() => {
    return clientWorkItems.filter((w) => w.isManualRequired && (!w.unitPrice || w.unitPrice <= 0)).length;
  }, [clientWorkItems]);

  // Client Tab Totals
  const worksSubtotal = useMemo(() => {
    return clientWorkItems.reduce((acc, w) => acc + w.totalPrice, 0);
  }, [clientWorkItems]);

  const clientNetBeforeTax = worksSubtotal + clientLaborAmount + clientTransportAmount;
  const clientVatAmount = (clientNetBeforeTax * clientVatPercent) / 100;
  const clientGrandTotal = clientNetBeforeTax + clientVatAmount;

  // Materials Bills Tab Interactive Overrides & Removals (Requirement 10)
  const [materialPriceOverrides, setMaterialPriceOverrides] = useState<Record<string, number>>({});
  const [removedMaterialIds, setRemovedMaterialIds] = useState<string[]>([]);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [tempMaterialPriceInput, setTempMaterialPriceInput] = useState<string>('');
  const [materialToDelete, setMaterialToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleStartEditMaterialPrice = (id: string, currentPrice: number) => {
    setEditingMaterialId(id);
    setTempMaterialPriceInput(currentPrice.toString());
  };

  const handleSaveMaterialPrice = (id: string) => {
    const parsed = parseFloat(tempMaterialPriceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setMaterialPriceOverrides((prev) => ({
        ...prev,
        [id]: parsed,
      }));
    }
    setEditingMaterialId(null);
    setTempMaterialPriceInput('');
  };

  const handleCancelMaterialPrice = () => {
    setEditingMaterialId(null);
    setTempMaterialPriceInput('');
  };

  const handleResetMaterialPrice = (id: string) => {
    setMaterialPriceOverrides((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setEditingMaterialId(null);
  };

  const handleConfirmRemoveMaterial = () => {
    if (!materialToDelete) return;
    setRemovedMaterialIds((prev) => [...prev, materialToDelete.id]);
    setMaterialToDelete(null);
  };

  const handleRestoreMaterial = (id: string) => {
    setRemovedMaterialIds((prev) => prev.filter((item) => item !== id));
  };

  const handleRestoreAllMaterials = () => {
    setRemovedMaterialIds([]);
  };

  // Base raw quotation before user materials edits
  const baseCompanyQuote = useMemo(() => {
    if (!calc) return null;
    return calculateQuotationBreakdown(
      calc,
      { ...prices, currencySymbol: sym, currency: selectedCurrency.code },
      companyProfitMargin,
      companyTaxPercent
    );
  }, [calc, prices, sym, selectedCurrency.code, companyProfitMargin, companyTaxPercent]);

  // Active Company Tab Procurement Breakdown with user-edited unit prices & removed materials
  const companyQuote = useMemo(() => {
    if (!baseCompanyQuote) {
      return {
        profileLines: [],
        glassLines: [],
        accessoryLines: [],
        laborLines: [],
        logisticsLines: [],
        totalProfilesCost: 0,
        totalGlassCost: 0,
        totalAccessoriesCost: 0,
        totalMaterialsCost: 0,
        totalLaborCost: 0,
        totalLogisticsCost: 0,
        directProjectCost: 0,
        profitMarginPercent: 15,
        profitMarginAmount: 0,
        netQuoteBeforeTax: 0,
        taxVatPercent: 0,
        taxVatAmount: 0,
        grandTotalQuotation: 0,
        currency: selectedCurrency.code,
        currencySymbol: sym,
      };
    }

    const applyMaterialChanges = (lines: typeof baseCompanyQuote.profileLines) => {
      return lines
        .filter((line) => !removedMaterialIds.includes(line.id))
        .map((line) => {
          const overriddenPrice = materialPriceOverrides[line.id];
          if (overriddenPrice !== undefined) {
            const unitPrice = overriddenPrice;
            const totalPrice = Math.round(line.quantity * unitPrice * 100) / 100;
            return {
              ...line,
              unitPrice,
              totalPrice,
            };
          }
          return line;
        });
    };

    const profileLines = applyMaterialChanges(baseCompanyQuote.profileLines);
    const glassLines = applyMaterialChanges(baseCompanyQuote.glassLines);
    const accessoryLines = applyMaterialChanges(baseCompanyQuote.accessoryLines);
    const laborLines = baseCompanyQuote.laborLines;
    const logisticsLines = baseCompanyQuote.logisticsLines;

    const totalProfilesCost = profileLines.reduce((sum, l) => sum + l.totalPrice, 0);
    const totalGlassCost = glassLines.reduce((sum, l) => sum + l.totalPrice, 0);
    const totalAccessoriesCost = accessoryLines.reduce((sum, l) => sum + l.totalPrice, 0);
    const totalMaterialsCost = totalProfilesCost + totalGlassCost + totalAccessoriesCost;

    const totalLaborCost = laborLines.reduce((sum, l) => sum + l.totalPrice, 0);
    const totalLogisticsCost = logisticsLines.reduce((sum, l) => sum + l.totalPrice, 0);

    const directProjectCost = totalMaterialsCost + totalLaborCost + totalLogisticsCost;
    const profitMarginAmount = Math.round(((directProjectCost * companyProfitMargin) / 100) * 100) / 100;
    const netQuoteBeforeTax = directProjectCost + profitMarginAmount;
    const taxVatAmount = Math.round(((netQuoteBeforeTax * companyTaxPercent) / 100) * 100) / 100;
    const grandTotalQuotation = netQuoteBeforeTax + taxVatAmount;

    return {
      currency: selectedCurrency.code,
      currencySymbol: sym,
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
      profitMarginPercent: companyProfitMargin,
      profitMarginAmount,
      netQuoteBeforeTax,
      taxVatPercent: companyTaxPercent,
      taxVatAmount,
      grandTotalQuotation,
    };
  }, [
    baseCompanyQuote,
    removedMaterialIds,
    materialPriceOverrides,
    selectedCurrency.code,
    sym,
    companyProfitMargin,
    companyTaxPercent,
  ]);

  // Handle Manual Unit Price Edit for an Item
  const handleSaveItemPrice = (itemId: string) => {
    const parsed = parseFloat(tempPriceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setManualPriceOverrides((prev) => ({
        ...prev,
        [itemId]: parsed,
      }));
    }
    setEditingItemId(null);
    setTempPriceInput('');
  };

  const handleResetItemPrice = (itemId: string) => {
    setManualPriceOverrides((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    setEditingItemId(null);
  };

  // Copy Client Bill Summary to Clipboard
  const handleCopyClientSummary = () => {
    const lines = [
      `=== ${companyProfile.companyName.toUpperCase()} ===`,
      `CLIENT FABRICATION QUOTATION`,
      `Project: ${calc.projectName}`,
      `Ref: ${clientInfo.quoteRefNumber || 'QT-BILL'}`,
      `Client: ${clientInfo.clientName || 'Valued Client'}`,
      `Date: ${new Date(calc.dateCalculated).toLocaleDateString()}`,
      `Currency: ${selectedCurrency.code} (${sym})`,
      `-----------------------------------------`,
      ...clientWorkItems.map((w, idx) => {
        const extraText = w.hasExtraOption ? ` (incl. ${w.extraOptionLabel})` : '';
        const itemTag = w.item?.tag || (w.item as any)?.label || `Unit #${idx + 1}`;
        const itemW = w.item?.width || 0;
        const itemH = w.item?.height || 0;
        const itemQty = w.item?.quantity || 1;
        return `${idx + 1}. [${itemTag}] ${w.categoryName} (${itemW}x${itemH}mm)${extraText}: ${sym} ${w.unitPrice.toLocaleString()} x ${itemQty} = ${sym} ${w.totalPrice.toLocaleString()}`;
      }),
      `-----------------------------------------`,
      `Works Subtotal: ${sym} ${worksSubtotal.toLocaleString()}`,
      `Labor & Site Fitting: ${sym} ${clientLaborAmount.toLocaleString()}`,
      `Transportation: ${sym} ${clientTransportAmount.toLocaleString()}`,
      `VAT / Tax (${clientVatPercent}%): ${sym} ${clientVatAmount.toLocaleString()}`,
      `=========================================`,
      `GRAND TOTAL QUOTE: ${sym} ${clientGrandTotal.toLocaleString()}`,
      `=========================================`,
      `Validity: ${clientInfo.validityDays} Days`,
      `Contact: ${companyProfile.phoneNumber} | ${companyProfile.email}`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download Client Bill PDF
  const handleDownloadClientPdf = () => {
    const itemsForPdf: ClientBillItemForPdf[] = clientWorkItems.map((w, idx) => ({
      category: w.categoryName,
      label: w.item?.tag || (w.item as any)?.label || `Unit #${idx + 1}`,
      widthMm: w.item?.width || 0,
      heightMm: w.item?.height || 0,
      extraOptionLabel: w.extraOptionLabel,
      hasExtra: w.hasExtraOption,
      unitPrice: w.unitPrice,
      quantity: w.item?.quantity || 1,
      totalPrice: w.totalPrice,
    }));

    downloadClientBillPdf(
      calc.projectName,
      calc.dateCalculated,
      clientInfo,
      companyProfile.companyName,
      companyProfile.phoneNumber,
      companyProfile.email,
      companyProfile.address,
      itemsForPdf,
      {
        currencySymbol: sym,
        currencyCode: selectedCurrency.code,
        worksSubtotal,
        laborAmount: clientLaborAmount,
        transportAmount: clientTransportAmount,
        taxPercent: clientVatPercent,
        taxAmount: clientVatAmount,
        grandTotal: clientGrandTotal,
      }
    );
  };

  // Export Client CSV
  const handleDownloadClientCsv = () => {
    const rows = [
      ['Item #', 'Category', 'Label / Unit Tag', 'Width (mm)', 'Height (mm)', 'Specification', `Unit Price (${sym})`, 'Quantity', `Total Amount (${sym})`],
      ...clientWorkItems.map((w, idx) => [
        idx + 1,
        w.categoryName,
        w.item?.tag || (w.item as any)?.label || `Unit #${idx + 1}`,
        w.item?.width || 0,
        w.item?.height || 0,
        w.hasExtraOption ? `With ${w.extraOptionLabel}` : 'Standard',
        w.unitPrice,
        w.item?.quantity || 1,
        w.totalPrice,
      ]),
      [],
      ['SUMMARY', '', '', '', '', '', 'Works Subtotal', '', worksSubtotal],
      ['SUMMARY', '', '', '', '', '', 'Labor & Site Fitting', '', clientLaborAmount],
      ['SUMMARY', '', '', '', '', '', 'Transportation', '', clientTransportAmount],
      ['SUMMARY', '', '', '', '', '', `VAT / Tax (${clientVatPercent}%)`, '', clientVatAmount],
      ['SUMMARY', '', '', '', '', '', 'GRAND TOTAL QUOTATION', '', clientGrandTotal],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Client_Quotation_Bill.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Company Materials Procurement CSV
  const handleDownloadCompanyCsv = () => {
    const rows = [
      ['Category', 'Material Description', 'Quantity / Units', `Unit Price (${sym})`, `Total Cost (${sym})`],
      ...companyQuote.profileLines.map((l) => ['Extrusion Profiles (5.8m)', l.name, `${l.quantity} ${l.unit}`, l.unitPrice, l.totalPrice]),
      ...companyQuote.glassLines.map((l) => ['Glass & Glazing', l.name, `${l.quantity} ${l.unit}`, l.unitPrice, l.totalPrice]),
      ...companyQuote.accessoryLines.map((l) => ['Hardware & Accessories', l.name, `${l.quantity} ${l.unit}`, l.unitPrice, l.totalPrice]),
      ...companyQuote.laborLines.map((l) => ['Workshop Labor', l.name, `${l.quantity} ${l.unit}`, l.unitPrice, l.totalPrice]),
      ...companyQuote.logisticsLines.map((l) => ['Logistics & Site Delivery', l.name, `${l.quantity} ${l.unit}`, l.unitPrice, l.totalPrice]),
      [],
      ['SUMMARY', 'Total Materials Cost', '', '', companyQuote.totalMaterialsCost],
      ['SUMMARY', 'Total Labor & Assembly', '', '', companyQuote.totalLaborCost],
      ['SUMMARY', 'Logistics & Transport', '', '', companyQuote.totalLogisticsCost],
      ['SUMMARY', 'Direct Project Cost', '', '', companyQuote.directProjectCost],
      ['SUMMARY', `Profit Markup (${companyQuote.profitMarginPercent}%)`, '', '', companyQuote.profitMarginAmount],
      ['SUMMARY', `Tax / VAT (${companyQuote.taxVatPercent}%)`, '', '', companyQuote.taxVatAmount],
      ['SUMMARY', 'GRAND TOTAL PROCUREMENT', '', '', companyQuote.grandTotalQuotation],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Materials_Procurement_Bill.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP CURRENCY SELECTOR & BANNER */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono border border-blue-100">
                Bill Currency
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Default: <strong className="text-slate-900">₦ Nigerian Naira</strong> (or $ USD abroad)
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>Active Billing Currency:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-black border border-emerald-200">
                {selectedCurrency.code} ({sym})
              </span>
            </div>
          </div>
        </div>

        {/* Currency Dropdown Selection */}
        <div className="flex items-center gap-2">
          <label htmlFor="currency-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Select Currency:
          </label>
          <select
            id="currency-select"
            value={selectedCurrency.code}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all shadow-2xs"
          >
            {POPULAR_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} - {curr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIMARY TAB SELECTOR: "CLIENT BILLS" VS "MATERIAL EXPENSES" */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 shadow-xs">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('client_bills')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'client_bills'
                ? 'border-blue-600 text-blue-700 bg-blue-50/60 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>1. Client Bills (Per-Work Quotation)</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-100 text-blue-800">
              {totalWorksQuantity} works
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company_expenses')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'company_expenses'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>2. Material Expenses (Company Procurement)</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-700">
              {calc.totalBarsCount} bars
            </span>
          </button>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center gap-2 pb-2">
          <button
            type="button"
            onClick={activeTab === 'client_bills' ? handleCopyClientSummary : () => {}}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Copy summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={activeTab === 'client_bills' ? handleDownloadClientCsv : handleDownloadCompanyCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={activeTab === 'client_bills' ? handleDownloadClientPdf : () => downloadQuotationPdf(calc, companyQuote, clientInfo)}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{activeTab === 'client_bills' ? 'Download Client PDF' : 'Download Procurement PDF'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLIENT BILLS (PER-WORK BILLING - MAIN TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'client_bills' && (
        <div className="space-y-6">
          {/* Unpriced Oversized Item Alert */}
          {unpricedWorksCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-amber-950">
                    Oversized Item Alert ({unpricedWorksCount} Item{unpricedWorksCount > 1 ? 's' : ''})
                  </div>
                  <div className="text-amber-800 mt-0.5">
                    Certain windows or doors exceed the automatic size range rules. Please input the unit price manually in the table below to complete the client bill.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Financial Summary Metric Cards (Requirement 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Project Works Subtotal */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Works Subtotal</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                {sym} {worksSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {totalWorksQuantity} fabricated unit{totalWorksQuantity > 1 ? 's' : ''}
              </div>
            </div>

            {/* Card 2: Labor & Site Fitting (Editable, default ₦10,000 per work) */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs ring-1 ring-blue-100">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  <Hammer className="w-3.5 h-3.5" />
                  <span>Labor & Site Fitting</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Editable
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="font-mono text-sm font-bold text-slate-400">{sym}</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={clientLaborAmount}
                  onChange={(e) => {
                    setLaborManuallyEdited(true);
                    setClientLaborAmount(parseFloat(e.target.value) || 0);
                  }}
                  className="w-full px-2 py-1 bg-blue-50/50 border border-blue-300 rounded font-mono font-bold text-lg text-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div className="text-[10px] text-blue-600/80 mt-1">
                Default: {sym}10,000 / work
              </div>
            </div>

            {/* Card 3: Transportation (Editable, default ₦0) */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs ring-1 ring-emerald-100">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Transportation</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Editable
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="font-mono text-sm font-bold text-slate-400">{sym}</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={clientTransportAmount}
                  onChange={(e) => setClientTransportAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-emerald-50/50 border border-emerald-300 rounded font-mono font-bold text-lg text-emerald-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div className="text-[10px] text-emerald-600/80 mt-1">
                Default: {sym}0
              </div>
            </div>

            {/* Card 4: VAT / Tax (%) (Editable, default 0.0%) */}
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs ring-1 ring-purple-100">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  <span>VAT / Tax</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                  Editable
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={clientVatPercent}
                  onChange={(e) => setClientVatPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-purple-50/50 border border-purple-300 rounded font-mono font-bold text-lg text-purple-900 focus:bg-white focus:ring-1 focus:ring-purple-500 outline-hidden"
                />
                <span className="font-bold text-slate-500 text-xs">%</span>
                <span className="text-xs font-mono font-bold text-slate-700 ml-auto">
                  = {sym}{clientVatAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-purple-600/80 mt-1">
                Default: 0.0%
              </div>
            </div>

            {/* Card 5: Grand Total Quote */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl text-white shadow-sm border border-slate-700 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grand Total Quote</span>
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1 tracking-tight">
                {sym} {clientGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Currency: <span className="text-white font-bold">{selectedCurrency.code} ({sym})</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CLIENT DETAILS & PROJECT PARAMETERS (ALWAYS VISIBLE - REQUIREMENT 4) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Client & Project Site Information (Directly Visible for Easy Editing)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Ref: <strong className="text-slate-800 font-mono">{clientInfo.quoteRefNumber}</strong>
              </span>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Client / Customer Name
                </label>
                <input
                  type="text"
                  value={clientInfo.clientName}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                  placeholder="e.g. Chief Adeyemi / Alh. Musa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Client Phone Number
                </label>
                <input
                  type="text"
                  value={clientInfo.clientPhone || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientPhone: e.target.value })}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={clientInfo.clientEmail || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientEmail: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Project Site Location / Address
                </label>
                <input
                  type="text"
                  value={clientInfo.projectSiteAddress || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, projectSiteAddress: e.target.value })}
                  placeholder="e.g. Plot 14 Lekki Phase 1, Lagos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quotation Reference #
                </label>
                <input
                  type="text"
                  value={clientInfo.quoteRefNumber}
                  onChange={(e) => setClientInfo({ ...clientInfo, quoteRefNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quotation Validity (Days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={clientInfo.validityDays}
                    onChange={(e) => setClientInfo({ ...clientInfo, validityDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  <span className="text-xs font-semibold text-slate-500">Days</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Terms & Conditions
                </label>
                <input
                  type="text"
                  value={clientInfo.notesOrTerms}
                  onChange={(e) => setClientInfo({ ...clientInfo, notesOrTerms: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CLIENT WORKS TABLE: PER-WORK BILLING (REQUIREMENTS 6, 7 & 8) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>Fabrication Schedule & Client Bills (Per Work)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clean quotation per work item. You can manually adjust the unit price for any window or door below.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Total Works:{' '}
                <strong className="text-slate-900 font-mono">{totalWorksQuantity} units</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Fabrication Category</th>
                    <th className="py-3 px-3">Label / Tag</th>
                    <th className="py-3 px-3 text-center">Width × Height (mm)</th>
                    <th className="py-3 px-3">Options</th>
                    <th className="py-3 px-3 text-right">Unit Price ({sym})</th>
                    <th className="py-3 px-3 text-center w-14">Qty</th>
                    <th className="py-3 px-3 text-right">Total ({sym})</th>
                    <th className="py-3 px-3 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientWorkItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                        No fabrication items found in this project.
                      </td>
                    </tr>
                  ) : (
                    clientWorkItems.map((w, idx) => {
                      const itemKey = w.itemId || w.item?.id || `item-${idx}`;
                      const isEditing = editingItemId === itemKey;
                      const isOverridden = !!manualPriceOverrides[itemKey];
                      const isManualRequired = w.isManualRequired && (!w.unitPrice || w.unitPrice <= 0);
                      const typeLabel = String(w.item?.type || 'window').toUpperCase();
                      const kindLabel = String(w.item?.kind || 'Standard').replace(/_/g, ' ');
                      const itemTag = w.item?.tag || (w.item as any)?.label || `Unit #${idx + 1}`;
                      const itemW = w.item?.width || 0;
                      const itemH = w.item?.height || 0;
                      const itemQty = w.item?.quantity || 1;

                      return (
                        <tr
                          key={itemKey}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isManualRequired ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{w.categoryName}</div>
                            <div className="text-[10px] text-slate-400">
                              {typeLabel} • {kindLabel}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                              {itemTag}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                            {itemW} × {itemH} mm
                          </td>

                          <td className="py-3 px-3">
                            {w.hasExtraOption ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check className="w-2.5 h-2.5" />
                                <span>{w.extraOptionLabel}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Standard</span>
                            )}
                          </td>

                          {/* Unit Price Column with inline edit support */}
                          <td className="py-3 px-3 text-right font-mono">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs font-bold text-slate-400">{sym}</span>
                                <input
                                  type="number"
                                  autoFocus
                                  min="0"
                                  step="500"
                                  value={tempPriceInput}
                                  onChange={(e) => setTempPriceInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveItemPrice(itemKey);
                                    if (e.key === 'Escape') setEditingItemId(null);
                                  }}
                                  className="w-28 px-2 py-1 bg-white border-2 border-blue-500 rounded text-xs font-mono font-bold text-slate-900 outline-hidden"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-slate-900">
                                  {w.unitPrice > 0 ? (
                                    `${sym} ${w.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  ) : (
                                    <span className="text-amber-600 font-bold text-[11px] animate-pulse">
                                      ⚠️ Price Required
                                    </span>
                                  )}
                                </div>
                                {isOverridden && (
                                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tight">
                                    Custom Edited
                                  </span>
                                )}
                                {isManualRequired && !isOverridden && (
                                  <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">
                                    Oversized Size
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                            {itemQty}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                            {sym} {w.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Action buttons */}
                          <td className="py-3 px-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveItemPrice(itemKey)}
                                  className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="p-1 px-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItemId(itemKey);
                                    setTempPriceInput(w.unitPrice > 0 ? w.unitPrice.toString() : '');
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] font-bold border border-slate-200 transition-colors"
                                  title="Edit Unit Price manually"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>{isManualRequired ? 'Set Price' : 'Edit'}</span>
                                </button>

                                {isOverridden && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetItemPrice(itemKey)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Reset to rule formula price"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300 text-xs">
                    <td colSpan={5} className="py-3 px-3 text-right">
                      Works Subtotal ({totalWorksQuantity} Units):
                    </td>
                    <td colSpan={3} className="py-3 px-3 text-right font-mono text-sm font-black">
                      {sym} {worksSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY EXPENSES (RAW MATERIALS & PROCUREMENT TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'company_expenses' && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-100">
                  Internal Workshop Procurement
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">Company Bill of Materials (BOM)</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Raw Materials Expense & Workshop Cost Estimation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate the exact purchase budget for 5.8m aluminum profile bars, glass sheets, hardware, and machining.
              </p>
            </div>

            {onOpenAdminPrices && (
              <button
                type="button"
                onClick={onOpenAdminPrices}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Adjust Raw Material Purchase Prices</span>
              </button>
            )}
          </div>

          {/* Company Financial Metrics (Requirement 5) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Raw Materials</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                {sym} {companyQuote.totalMaterialsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {calc.totalBarsCount} bars + {calc.totalGlassAreaM2}m² glass
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Labor & Site Fitting</div>
              <div className="text-xl font-bold text-blue-700 font-mono mt-1">
                {sym} {(companyQuote.totalLaborCost + companyQuote.totalLogisticsCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-blue-600/80 mt-1">
                {calc.items.length} units assembly & fixing
              </div>
            </div>

            {/* Profit Margin Container in Company Tab (Requirement 5) */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs ring-1 ring-amber-100">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Profit Margin</div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Editable
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={companyProfitMargin}
                  onChange={(e) => setCompanyProfitMargin(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-sm text-amber-900 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
                />
                <span className="font-bold text-slate-500 text-xs">%</span>
                <span className="font-mono font-bold text-amber-900 text-xs ml-auto">
                  = {sym}{companyQuote.profitMarginAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-amber-600/80 mt-1">
                Direct Cost: {sym} {companyQuote.directProjectCost.toFixed(2)}
              </div>
            </div>

            {/* VAT Container in Company Tab (Requirement 5) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">VAT / Tax</div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  Editable
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={companyTaxPercent}
                  onChange={(e) => setCompanyTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
                <span className="font-bold text-slate-500 text-xs">%</span>
                <span className="font-mono font-bold text-slate-700 text-xs ml-auto">
                  = {sym}{companyQuote.taxVatAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Default: 0.0%
              </div>
            </div>

            <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-950 to-slate-900 p-4 rounded-xl text-white shadow-sm border border-emerald-800 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Total Procurement</span>
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1 tracking-tight">
                {sym} {companyQuote.grandTotalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Includes Margin & Tax
              </div>
            </div>
          </div>

          {/* Excluded Materials Alert Banner */}
          {removedMaterialIds.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-bold">{removedMaterialIds.length}</strong> material item(s) have been excluded from this procurement bill.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRestoreAllMaterials}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All Excluded Materials</span>
              </button>
            </div>
          )}

          {/* Detailed Materials Breakdown (Profiles, Glass, Accessories) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Aluminum Profiles 5.8m Bars Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Extrusion Profile Bars (5.8m)
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {companyQuote.totalProfilesCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} {sym}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Profile Name</th>
                      <th className="py-2.5 px-3 text-center">Stock Bars</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companyQuote.profileLines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                          All extrusion profile bars have been excluded from this bill.
                        </td>
                      </tr>
                    ) : (
                      companyQuote.profileLines.map((line, idx) => (
                        <tr key={line.id || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{line.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                            {line.quantity} {line.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {editingMaterialId === line.id ? (
                              <div className="inline-flex items-center gap-1 justify-end">
                                <span className="text-slate-400 font-bold text-xs">{sym}</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  autoFocus
                                  value={tempMaterialPriceInput}
                                  onChange={(e) => setTempMaterialPriceInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveMaterialPrice(line.id);
                                    if (e.key === 'Escape') handleCancelMaterialPrice();
                                  }}
                                  className="w-20 px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-blue-500 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveMaterialPrice(line.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                  title="Save price"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelMaterialPrice}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-slate-600 font-semibold">
                                  {sym} {line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                                {materialPriceOverrides[line.id] !== undefined && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800" title="Custom user price">
                                    Custom
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {sym} {line.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditMaterialPrice(line.id, line.unitPrice)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit unit price"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {materialPriceOverrides[line.id] !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => handleResetMaterialPrice(line.id)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Reset to default catalog price"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setMaterialToDelete({ id: line.id, name: line.name })}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove material from bill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Glass & Glazing Procurement Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Glass Glazing Sheets (m²)
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {companyQuote.totalGlassCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} {sym}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Glass Spec</th>
                      <th className="py-2.5 px-3 text-center">Area (m²)</th>
                      <th className="py-2.5 px-3 text-right">Rate / m²</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companyQuote.glassLines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                          All glass sheets have been excluded from this bill.
                        </td>
                      </tr>
                    ) : (
                      companyQuote.glassLines.map((line, idx) => (
                        <tr key={line.id || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{line.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                            {line.quantity} {line.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {editingMaterialId === line.id ? (
                              <div className="inline-flex items-center gap-1 justify-end">
                                <span className="text-slate-400 font-bold text-xs">{sym}</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  autoFocus
                                  value={tempMaterialPriceInput}
                                  onChange={(e) => setTempMaterialPriceInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveMaterialPrice(line.id);
                                    if (e.key === 'Escape') handleCancelMaterialPrice();
                                  }}
                                  className="w-20 px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-blue-500 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveMaterialPrice(line.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                  title="Save price"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelMaterialPrice}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-slate-600 font-semibold">
                                  {sym} {line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                                {materialPriceOverrides[line.id] !== undefined && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800" title="Custom user price">
                                    Custom
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {sym} {line.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditMaterialPrice(line.id, line.unitPrice)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit unit price"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {materialPriceOverrides[line.id] !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => handleResetMaterialPrice(line.id)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Reset to default catalog price"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setMaterialToDelete({ id: line.id, name: line.name })}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove material from bill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Hardware & Accessories Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Hardware, Locks, Rollers & Accessories
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700">
                {companyQuote.totalAccessoriesCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} {sym}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Hardware Item</th>
                    <th className="py-2.5 px-3 text-center">Required Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Price</th>
                    <th className="py-2.5 px-3 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companyQuote.accessoryLines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                        All hardware & accessory items have been excluded from this bill.
                      </td>
                    </tr>
                  ) : (
                    companyQuote.accessoryLines.map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{line.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700">
                          {line.quantity} {line.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {editingMaterialId === line.id ? (
                            <div className="inline-flex items-center gap-1 justify-end">
                              <span className="text-slate-400 font-bold text-xs">{sym}</span>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                autoFocus
                                value={tempMaterialPriceInput}
                                onChange={(e) => setTempMaterialPriceInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveMaterialPrice(line.id);
                                  if (e.key === 'Escape') handleCancelMaterialPrice();
                                }}
                                className="w-20 px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-blue-500 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveMaterialPrice(line.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                title="Save price"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelMaterialPrice}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-slate-600 font-semibold">
                                {sym} {line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                              {materialPriceOverrides[line.id] !== undefined && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800" title="Custom user price">
                                  Custom
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {sym} {line.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditMaterialPrice(line.id, line.unitPrice)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit unit price"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {materialPriceOverrides[line.id] !== undefined && (
                              <button
                                type="button"
                                onClick={() => handleResetMaterialPrice(line.id)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Reset to default catalog price"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setMaterialToDelete({ id: line.id, name: line.name })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove material from bill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remove Material Confirmation Modal */}
          {materialToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Remove Material from Bill?</h3>
                    <p className="text-xs text-slate-500">Requires your confirmation</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-slate-900">"{materialToDelete.name}"</span> from this quotation's materials bill?
                  Its quantity and procurement cost will be excluded from the project total and PDF exports.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMaterialToDelete(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRemoveMaterial}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove Material</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
