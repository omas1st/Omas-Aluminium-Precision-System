import React, { useState, useMemo } from 'react';
import {
  CombinedProjectCalculation,
  MaterialPricesConfig,
  ClientQuotationInfo,
} from '../types';
import { calculateQuotationBreakdown } from '../utils/quotationCalculator';
import { downloadQuotationPdf } from '../utils/pdfGenerator';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuotationOutputProps {
  calc: CombinedProjectCalculation;
  prices: MaterialPricesConfig;
  onOpenAdminPrices?: () => void;
}

export const QuotationOutput: React.FC<QuotationOutputProps> = ({
  calc,
  prices,
  onOpenAdminPrices,
}) => {
  const [profitMargin, setProfitMargin] = useState<number>(prices.profitMarginPercent ?? 15);
  const [taxPercent, setTaxPercent] = useState<number>(prices.taxVatPercent ?? 7.5);
  const [copied, setCopied] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);

  const [clientInfo, setClientInfo] = useState<ClientQuotationInfo>({
    clientName: 'Valued Client',
    clientCompany: '',
    clientPhone: '',
    clientEmail: '',
    projectSiteAddress: '',
    quoteRefNumber: `QT-${Math.floor(100000 + Math.random() * 900000)}`,
    validityDays: 30,
    notesOrTerms: '70% Advance upon order confirmation, 30% balance prior to installation.',
  });

  const quote = useMemo(() => {
    return calculateQuotationBreakdown(calc, prices, profitMargin, taxPercent);
  }, [calc, prices, profitMargin, taxPercent]);

  const sym = quote.currencySymbol;

  const handleCopySummary = () => {
    const lines = [
      `=== PROJECT EXPENSE QUOTATION ===`,
      `Project: ${calc.projectName}`,
      `Ref: ${clientInfo.quoteRefNumber}`,
      `Client: ${clientInfo.clientName}`,
      `Date: ${new Date(calc.dateCalculated).toLocaleDateString()}`,
      `Total Windows/Doors: ${calc.items.length} units`,
      `Total Glass Area: ${calc.totalGlassAreaM2} m²`,
      `---------------------------------`,
      `1. Aluminum Profiles: ${sym} ${quote.totalProfilesCost.toFixed(2)} (${calc.totalBarsCount} bars)`,
      `2. Glass Glazing: ${sym} ${quote.totalGlassCost.toFixed(2)} (${calc.totalGlassAreaM2} m²)`,
      `3. Hardware & Accessories: ${sym} ${quote.totalAccessoriesCost.toFixed(2)}`,
      `   Total Materials: ${sym} ${quote.totalMaterialsCost.toFixed(2)}`,
      `4. Labor & Machining: ${sym} ${quote.totalLaborCost.toFixed(2)}`,
      `5. Logistics & Installation: ${sym} ${quote.totalLogisticsCost.toFixed(2)}`,
      `---------------------------------`,
      `Direct Project Cost: ${sym} ${quote.directProjectCost.toFixed(2)}`,
      `Profit Margin (${quote.profitMarginPercent}%): ${sym} ${quote.profitMarginAmount.toFixed(2)}`,
      `Net Subtotal: ${sym} ${quote.netQuoteBeforeTax.toFixed(2)}`,
      `VAT / Tax (${quote.taxVatPercent}%): ${sym} ${quote.taxVatAmount.toFixed(2)}`,
      `GRAND TOTAL QUOTE: ${sym} ${quote.grandTotalQuotation.toFixed(2)}`,
      `---------------------------------`,
      `Validity: ${clientInfo.validityDays} Days`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ['Category', 'Item Description', 'Quantity', 'Unit', `Unit Price (${sym})`, `Total Amount (${sym})`],
      ...quote.profileLines.map((l) => ['Aluminum Profile', l.name, l.quantity, l.unit, l.unitPrice, l.totalPrice]),
      ...quote.glassLines.map((l) => ['Glass Glazing', l.name, l.quantity, l.unit, l.unitPrice, l.totalPrice]),
      ...quote.accessoryLines.map((l) => ['Hardware & Consumables', l.name, l.quantity, l.unit, l.unitPrice, l.totalPrice]),
      ...quote.laborLines.map((l) => ['Workshop Labor', l.name, l.quantity, l.unit, l.unitPrice, l.totalPrice]),
      ...quote.logisticsLines.map((l) => ['Installation & Logistics', l.name, l.quantity, l.unit, l.unitPrice, l.totalPrice]),
      [],
      ['SUMMARY', '', '', '', 'Direct Project Cost', quote.directProjectCost],
      ['SUMMARY', '', '', '', `Profit Margin (${quote.profitMarginPercent}%)`, quote.profitMarginAmount],
      ['SUMMARY', '', '', '', 'Net Subtotal', quote.netQuoteBeforeTax],
      ['SUMMARY', '', '', '', `VAT / Tax (${quote.taxVatPercent}%)`, quote.taxVatAmount],
      ['SUMMARY', '', '', '', 'GRAND TOTAL QUOTATION', quote.grandTotalQuotation],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Quotation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-100">
              Bill of Quantities & Expenses
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Ref: <span className="font-mono text-slate-900 font-bold">{clientInfo.quoteRefNumber}</span>
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Project Expense Quotation & Pricing Summary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Itemized cost estimation covering aluminum profile stock bars, glass glazing, hardware, workshop labor, and installation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => downloadQuotationPdf(calc, quote, clientInfo)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Quotation PDF</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Raw Materials</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {sym} {quote.totalMaterialsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {calc.totalBarsCount} bars + {calc.totalGlassAreaM2}m² glass
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Labor & Site Fitting</div>
          <div className="text-xl font-bold text-blue-700 font-mono mt-1">
            {sym} {(quote.totalLaborCost + quote.totalLogisticsCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-blue-600/80 mt-1">
            {calc.items.length} units assembly & fixing
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Profit Margin ({quote.profitMarginPercent}%)
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1">
            {sym} {quote.profitMarginAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-600/80 mt-1">
            Direct cost: {sym} {quote.directProjectCost.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            VAT / Tax ({quote.taxVatPercent}%)
          </div>
          <div className="text-xl font-bold text-slate-700 font-mono mt-1">
            {sym} {quote.taxVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Net: {sym} {quote.netQuoteBeforeTax.toFixed(2)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl text-white shadow-sm border border-slate-700 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Grand Total Quote</span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1 tracking-tight">
            {sym} {quote.grandTotalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Currency: <span className="text-white font-bold">{quote.currency} ({sym})</span>
          </div>
        </div>
      </div>

      {/* Commercial Parameters Adjuster & Client Details Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Quotation Margins & Parameters
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenAdminPrices && (
              <button
                type="button"
                onClick={onOpenAdminPrices}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>Edit Base Unit Prices in Admin</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowClientForm(!showClientForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{showClientForm ? 'Hide Client Details' : 'Edit Client / Project Info'}</span>
              {showClientForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Profit / Markup Margin (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Yields {sym} {quote.profitMarginAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              VAT / Sales Tax (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Tax amount: {sym} {quote.taxVatAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quotation Reference #
            </label>
            <input
              type="text"
              value={clientInfo.quoteRefNumber}
              onChange={(e) => setClientInfo({ ...clientInfo, quoteRefNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Validity Period (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={clientInfo.validityDays}
                onChange={(e) => setClientInfo({ ...clientInfo, validityDays: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
              <span className="text-xs text-slate-500">Days</span>
            </div>
          </div>
        </div>

        {/* Expandable Client Information Drawer */}
        {showClientForm && (
          <div className="p-4 sm:p-5 bg-sky-50/50 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-3 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-700" />
              <span>Client Header & Project Information for Official PDF</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Client / Customer Name</label>
                <input
                  type="text"
                  value={clientInfo.clientName}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                  placeholder="e.g. John Doe / Engr. Smith"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={clientInfo.clientCompany || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientCompany: e.target.value })}
                  placeholder="e.g. Acme Properties Ltd"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={clientInfo.clientPhone || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, clientPhone: e.target.value })}
                  placeholder="e.g. +1 555-0199 / +234 803..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Site / Delivery Address</label>
                <input
                  type="text"
                  value={clientInfo.projectSiteAddress || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, projectSiteAddress: e.target.value })}
                  placeholder="e.g. Plot 45, Golden Estate, Phase 2"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment / Quotation Terms</label>
                <input
                  type="text"
                  value={clientInfo.notesOrTerms || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, notesOrTerms: e.target.value })}
                  placeholder="e.g. 70% deposit, 30% on completion"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXPENSE TABLES SECTION */}
      
      {/* 1. Aluminum Profiles Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Aluminum Extrusion Profiles (5.8m Stock Length Bars)
            </h4>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800">
            Subtotal: {sym} {quote.totalProfilesCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Profile Section Name</th>
                <th className="py-2.5 px-4 text-center">Bars Needed (5.8m)</th>
                <th className="py-2.5 px-4 text-right">Unit Price / Bar</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.profileLines.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-800">{line.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{line.description}</div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{line.quantity} bars</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {sym} {line.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {sym} {line.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Glass Glazing Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950">
              Glass Supply & Precision Glazing
            </h4>
          </div>
          <span className="font-mono text-xs font-bold text-sky-950">
            Subtotal: {sym} {quote.totalGlassCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Glass Specification</th>
                <th className="py-2.5 px-4 text-center">Total Area</th>
                <th className="py-2.5 px-4 text-right">Price per m²</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.glassLines.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-800">{line.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{line.description}</div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-sky-800">
                    <span className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {line.quantity} m²
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {sym} {line.unitPrice.toFixed(2)} / m²
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {sym} {line.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Hardware, Gaskets & Consumables Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Hardware, Gaskets, Fasteners & Consumables
            </h4>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800">
            Subtotal: {sym} {quote.totalAccessoriesCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Accessory / Item</th>
                <th className="py-2.5 px-4 text-center">Required Qty</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.accessoryLines.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-800">{line.name}</div>
                    <div className="text-[10px] text-slate-500">{line.description}</div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-700">
                    {line.quantity} {line.unit}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {sym} {line.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {sym} {line.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Labor, Machining & Installation Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Workshop Fabrication Labor, Site Fitting & Logistics
            </h4>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800">
            Subtotal: {sym} {(quote.totalLaborCost + quote.totalLogisticsCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Service Description</th>
                <th className="py-2.5 px-4 text-center">Scope</th>
                <th className="py-2.5 px-4 text-right">Unit Rate</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...quote.laborLines, ...quote.logisticsLines].map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-800">{line.name}</div>
                    <div className="text-[10px] text-slate-500">{line.description}</div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-700">
                    {line.quantity} {line.unit}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {sym} {line.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {sym} {line.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINAL COMMERCIAL RECAP BLOCK */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-base">Comprehensive Quote Validated</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            All prices reflect exact market profile extrusion lengths (5800mm bars) with saw cut loss optimization and precision square meter glass calculations.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">Total Turnkey Project Quotation:</div>
            <div className="text-3xl font-black text-emerald-400">
              {sym} {quote.grandTotalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={() => downloadQuotationPdf(calc, quote, clientInfo)}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Generate Official PDF Quotation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
