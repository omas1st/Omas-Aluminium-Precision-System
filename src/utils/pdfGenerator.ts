import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  QuotationBreakdown,
  ClientQuotationInfo,
} from '../types';
import { getMaterialDisplayName } from './materialNamesStorage';

// Safe Currency helper for jsPDF standard fonts
// Standard jsPDF Helvetica / Times fonts only support WinAnsi (Latin-1).
// Characters like the Naira symbol (₦ - U+20A6) get mangled to ¦ or garbage bytes.
// Using standard ISO currency abbreviations (e.g. NGN) produces clean, professional output.
export function getPdfCurrencySymbol(symbol: string, code: string): string {
  const c = (code || '').toUpperCase().trim();
  const s = (symbol || '').trim();
  if (c === 'NGN' || s === '₦' || s.includes('₦')) {
    return 'NGN ';
  }
  if (c === 'EUR' || s === '€') {
    return 'EUR ';
  }
  if (c === 'GBP' || s === '£') {
    return 'GBP ';
  }
  if (c === 'GHS' || s === 'GH₵') {
    return 'GHS ';
  }
  if (c === 'INR' || s === '₹') {
    return 'INR ';
  }
  if (s === '$') {
    return '$';
  }
  // Check if contains non-ASCII characters
  if (/[^\x20-\x7E]/.test(s)) {
    return c ? `${c} ` : '';
  }
  return s ? `${s} ` : '';
}

// Format commercial terms cleanly into separated numbered items
export function formatTermsForPdf(rawTerms?: string): string[] {
  if (!rawTerms || !rawTerms.trim()) {
    return [
      '1. 70% advance payment required upon order confirmation to procure materials.',
      '2. 30% balance payable upon completion of workshop assembly prior to site delivery.',
      '3. Custom architectural sizes fabricated strictly according to confirmed schedule.',
      '4. Workmanship and fitting warranty according to standard manufacturer terms.',
    ];
  }
  // If terms are concatenated without newlines (e.g. "confirmation.2. 30% balance"), insert newlines
  const normalized = rawTerms.replace(/([.!?])\s*(?=\d+\.\s*)/g, '$1\n');
  const items = normalized
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : [rawTerms];
}

export function downloadProfilesMaterialsPdf(
  calc: CombinedProjectCalculation,
  constants: ConstantProfilesConfig
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OMAS ALUMINIUM PRECISION SYSTEM', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PROFILES & MATERIALS PURCHASE SPECIFICATION`, 14, 20);
  doc.text(`Date: ${new Date(calc.dateCalculated).toLocaleDateString()}`, pageWidth - 14, 20, {
    align: 'right',
  });

  // Project Info Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Project Name: ${calc.projectName}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Total Windows/Doors: ${calc.items.length} units | Standard Stock Length: ${constants.stockProfileLength} mm | Total Stock Bars: ${calc.totalBarsCount} bars`,
    14,
    44
  );

  // Table 1: Profiles Summary (Bar Counts)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Aluminum Profile Extrusion Bars Required (5.8m Stock Length)', 14, 54);

  const profileRows = calc.profileOptimizations.map((p, idx) => [
    (idx + 1).toString(),
    getMaterialDisplayName(p.profileName),
    p.totalPieces.toString(),
    `${(p.totalLengthRequired / 1000).toFixed(2)} m (${p.totalLengthRequired} mm)`,
    `${p.barsNeeded} bars (${(p.barsNeeded * constants.stockProfileLength) / 1000} m)`,
    `${(p.totalWasteLength / 1000).toFixed(2)} m (${p.wastePercentage}%)`,
  ]);

  autoTable(doc, {
    startY: 58,
    head: [['#', 'Profile Name / Extrusion Section', 'Cut Pcs', 'Net Length', 'Full Bars (5.8m)', 'Total Offcut/Waste']],
    body: profileRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 12;

  // Table 2: Linear Cutting Stock Plan (Bar-by-Bar Breakdown)
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Optimized Linear Cutting Schedule (Saw Cut Sequence & Offcuts)', 14, currentY);

  const cutPlanRows: string[][] = [];
  calc.profileOptimizations.forEach((p) => {
    p.bars.forEach((b) => {
      const cutsStr = b.cuts.map((c) => `${c.cutLength}mm [${c.itemTag}]`).join(' + ');
      cutPlanRows.push([
        getMaterialDisplayName(p.profileName),
        `Bar #${b.barNumber}`,
        `${b.usedLength} mm`,
        cutsStr,
        `${b.wasteLength} mm (${b.wastePercentage}%)`,
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Profile Section', 'Bar #', 'Used Length', 'Cut Pieces Sequence', 'Remaining Offcut']],
    body: cutPlanRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Table 3: Accessories & Hardware Requirements
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Hardware, Gaskets, Fasteners & Accessories Bill of Quantities', 14, currentY);

  const accRows = calc.allAccessories.map((a, idx) => [
    (idx + 1).toString(),
    a.name,
    a.category.toUpperCase(),
    `${a.quantity} ${a.unit}`,
    a.description,
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['#', 'Material / Accessory Item', 'Category', 'Quantity', 'Application Purpose']],
    body: accRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `OMAS Aluminium Precision System - Generated for ${calc.projectName} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Profiles_and_Materials.pdf`);
}

export function downloadFrameMeasurementsPdf(
  calc: CombinedProjectCalculation,
  constants: ConstantProfilesConfig
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OMAS ALUMINIUM PRECISION SYSTEM', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('WORKSHOP FRAME & GLASS CUTTING SCHEDULE', 14, 20);
  doc.text(`Date: ${new Date(calc.dateCalculated).toLocaleDateString()}`, pageWidth - 14, 20, {
    align: 'right',
  });

  // Project Info Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Project Name: ${calc.projectName}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Total Frame Cut Pieces: ${calc.totalCutPiecesCount} pcs | Total Glass Area: ${calc.totalGlassAreaM2} m² (${calc.allGlasses.length} panes)`,
    14,
    44
  );

  // Table 1: Workshop Profile Frame Cut List
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Workshop Aluminum Profile Cut List (Exact Cutting Sizes)', 14, 54);

  const cutRows = calc.allCuts.map((c, idx) => [
    (idx + 1).toString(),
    c.itemTag,
    c.purpose,
    getMaterialDisplayName(c.profileName),
    `${c.length} mm`,
    c.cutAngle,
    `${c.quantity} pcs`,
  ]);

  autoTable(doc, {
    startY: 58,
    head: [['#', 'Tag / Unit', 'Frame Component', 'Profile Type', 'Cut Length (mm)', 'Miter/Angle', 'Qty']],
    body: cutRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 12;

  // Table 2: Glass Cutting Sizes
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Workshop 1-Pane Glass Cutting Sizes (Width × Height mm)', 14, currentY);

  const glassRows = calc.allGlasses.map((g, idx) => [
    (idx + 1).toString(),
    g.itemTag,
    g.paneDescription,
    `${g.width} mm`,
    `${g.height} mm`,
    `${g.width} × ${g.height} mm`,
    `${g.quantity} pcs`,
    `${g.areaM2} m²`,
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['#', 'Unit Tag', 'Glass Pane Description', 'Cut Width', 'Cut Height', 'Cut Size (W×H mm)', 'Qty', 'Total Area']],
    body: glassRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `OMAS Aluminium Precision System - Frame & Glass Schedule - ${calc.projectName} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Frame_Cut_and_Glass_Sizes.pdf`);
}

export function downloadQuotationPdf(
  calc: CombinedProjectCalculation,
  quote: QuotationBreakdown,
  clientInfo?: ClientQuotationInfo
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const symSafe = getPdfCurrencySymbol(quote.currencySymbol, quote.currency);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OMAS ALUMINIUM PRECISION SYSTEM', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('INTERNAL MATERIALS BILL & WORKSHOP PROCUREMENT SPECIFICATION', 14, 21);
  doc.text('Automated Profile Extrusion Cutting, Glass & Hardware BOM', 14, 27);

  const quoteRef = clientInfo?.quoteRefNumber || `BOM-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`REF: ${quoteRef}`, pageWidth - 14, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${new Date(calc.dateCalculated).toLocaleDateString()}`, pageWidth - 14, 21, {
    align: 'right',
  });
  doc.text(`Currency: ${quote.currency || 'USD'}`, pageWidth - 14, 27, { align: 'right' });

  // Client & Project Information Box with dynamic address wrapping
  const siteAddrText = clientInfo?.projectSiteAddress ? `Site: ${clientInfo.projectSiteAddress}` : '';
  const addrLines = siteAddrText ? doc.splitTextToSize(siteAddrText, 95) : [];
  const cardHeight = Math.max(28, 22 + (addrLines.length > 1 ? (addrLines.length - 1) * 4.5 : 0));

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 36, pageWidth - 28, cardHeight, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT & PROCUREMENT PARAMETERS:', 18, 43);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Project: ${calc.projectName}`, 18, 50);
  doc.text(`Client: ${clientInfo?.clientName || 'Workshop Production'}`, 18, 56);
  if (addrLines.length > 0) {
    doc.text(addrLines, 18, 62);
  }

  doc.text(`Total Units: ${calc.items.length} works`, pageWidth - 20, 50, { align: 'right' });
  doc.text(`Total Stock Bars: ${calc.totalBarsCount} bars (5.8m)`, pageWidth - 20, 56, { align: 'right' });
  doc.text(`Total Glass Area: ${calc.totalGlassAreaM2} m²`, pageWidth - 20, 62, { align: 'right' });

  let startTableY = 36 + cardHeight + 5;

  // 1. Aluminum Profiles Table (width = 182mm)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Aluminum Profile Extrusions (5.8m Standard Extrusion Bars)', 14, startTableY);

  const profileRows = quote.profileLines.map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${symSafe}${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${symSafe}${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: startTableY + 3,
    head: [['#', 'Profile Section / Extrusion Specification', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: profileRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, cellPadding: 2.2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 82 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 22 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // 2. Glass Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. Glass Supply & Precision Glazing Panes', 14, currentY);

  const glassRows = quote.glassLines.map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${symSafe}${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${symSafe}${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Glass Specification & Glazing Area', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: glassRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, cellPadding: 2.2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 82 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 22 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 3. Accessories Table
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('3. Hardware, Gaskets, Fasteners & Accessories Bill', 14, currentY);

  const accRows = quote.accessoryLines.map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${symSafe}${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${symSafe}${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Item / Hardware Accessory Name', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: accRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, cellPadding: 2.2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 82 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 22 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Labor & Services Table
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('4. Workshop Machining, Assembly & Site Fitting Services', 14, currentY);

  const serviceRows = [...quote.laborLines, ...quote.logisticsLines].map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${symSafe}${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${symSafe}${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Service / Scope of Work', 'Qty', 'Unit', 'Unit Rate', 'Amount']],
    body: serviceRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, cellPadding: 2.2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.2, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 82 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 22 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Financial Grand Summary Block & Terms (Side by Side)
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  const summaryWidth = 84;
  const summaryX = pageWidth - 14 - summaryWidth; // Exactly 112mm
  const summaryHeight = 48;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, currentY, summaryWidth, summaryHeight, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Materials Subtotal:', summaryX + 4, currentY + 6.5);
  doc.text(`${symSafe}${quote.totalMaterialsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 6.5, { align: 'right' });

  doc.text('Labor & Installation:', summaryX + 4, currentY + 13.5);
  doc.text(`${symSafe}${(quote.totalLaborCost + quote.totalLogisticsCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 13.5, { align: 'right' });

  doc.text(`Profit Margin (${quote.profitMarginPercent}%):`, summaryX + 4, currentY + 20.5);
  doc.text(`${symSafe}${quote.profitMarginAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 20.5, { align: 'right' });

  doc.text(`VAT / Tax (${quote.taxVatPercent}%):`, summaryX + 4, currentY + 27.5);
  doc.text(`${symSafe}${quote.taxVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 27.5, { align: 'right' });

  // Grand Total Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(summaryX, currentY + 33, summaryWidth, 15, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', summaryX + 4, currentY + 42.5);
  doc.text(`${symSafe}${quote.grandTotalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 42.5, { align: 'right' });

  // Terms & Conditions (Left side box)
  const termsX = 14;
  const termsWidth = summaryX - 14 - 6; // 92mm
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(termsX, currentY, termsWidth, summaryHeight, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TERMS & PROCUREMENT NOTES:', termsX + 4, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const rawTerms = clientInfo?.notesOrTerms || '1. 70% advance payment required upon order confirmation to procure materials.\n2. 30% balance payable upon completion of workshop assembly prior to site delivery.\n3. Custom architectural sizes fabricated strictly according to confirmed schedule.';
  const termsList = formatTermsForPdf(rawTerms);

  let termY = currentY + 13;
  termsList.forEach((t) => {
    if (termY < currentY + summaryHeight - 3) {
      const split = doc.splitTextToSize(t, termsWidth - 8);
      doc.text(split, termsX + 4, termY);
      termY += split.length * 3.8 + 1.5;
    }
  });

  // Signatures
  const sigY = currentY + summaryHeight + 10;
  if (sigY <= 275) {
    doc.setDrawColor(148, 163, 184);
    doc.line(14, sigY, 75, sigY);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Prepared By (Workshop Fabricator)', 14, sigY + 5);

    doc.line(pageWidth - 75, sigY, pageWidth - 14, sigY);
    doc.text('Authorized Project Approval', pageWidth - 75, sigY + 5);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `OMAS Aluminium Precision System - Procurement BOM - ${calc.projectName} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Quotation_Bill_of_Expenses.pdf`);
}

export interface ClientBillItemForPdf {
  category: string;
  label: string;
  widthMm: number;
  heightMm: number;
  extraOptionLabel: string;
  hasExtra: boolean;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export function downloadClientBillPdf(
  projectName: string,
  dateCalculated: string,
  clientInfo: ClientQuotationInfo,
  companyName: string,
  companyPhone: string,
  companyEmail: string,
  companyAddress: string,
  items: ClientBillItemForPdf[],
  financials: {
    currencySymbol: string;
    currencyCode: string;
    worksSubtotal: number;
    laborAmount: number;
    transportAmount: number;
    taxPercent: number;
    taxAmount: number;
    grandTotal: number;
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const symSafe = getPdfCurrencySymbol(financials.currencySymbol, financials.currencyCode);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  const orgName = (companyName || 'OMAS ALUMINIUM SYSTEMS').toUpperCase();
  doc.text(orgName, 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('CLIENT BILL & FABRICATION QUOTATION', 14, 19);

  const contactParts = [companyPhone, companyEmail, companyAddress].filter(Boolean);
  const contactLine = contactParts.length > 0 ? contactParts.join(' | ') : '+234 803 000 0000 | info@omasaluminium.com';
  doc.setFontSize(7.5);
  doc.text(contactLine, 14, 26);

  // Header Right Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`REF: ${clientInfo.quoteRefNumber || 'QT-BILL'}`, pageWidth - 14, 12, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${new Date(dateCalculated).toLocaleDateString()}`, pageWidth - 14, 19, { align: 'right' });
  doc.text(`Currency: ${financials.currencyCode}`, pageWidth - 14, 26, { align: 'right' });

  // Client Details & Project Site Card (with dynamic text wrapping for address)
  const cardY = 36;
  const col1X = 20;
  const col2X = pageWidth / 2 + 2; // ~107mm
  const col2Width = pageWidth - 14 - col2X - 4; // ~85mm

  const rawSiteAddr = clientInfo.projectSiteAddress || 'Site Location / As Agreed';
  const siteAddrLines = doc.splitTextToSize(`Site Address: ${rawSiteAddr}`, col2Width);
  const cardHeight = Math.max(30, 22 + siteAddrLines.length * 4.2);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, cardY, pageWidth - 28, cardHeight, 2, 2, 'FD');

  // Left Column: Client Details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO CLIENT:', col1X, cardY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Client Name: ${clientInfo.clientName || 'Valued Client'}`, col1X, cardY + 13.5);
  doc.text(`Phone: ${clientInfo.clientPhone || 'N/A'}`, col1X, cardY + 19.5);
  doc.text(`Email: ${clientInfo.clientEmail || 'N/A'}`, col1X, cardY + 25.5);

  // Right Column: Project Site
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT SITE / LOCATION:', col2X, cardY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Project: ${projectName}`, col2X, cardY + 13.5);
  doc.text(siteAddrLines, col2X, cardY + 19.5);
  const validityY = cardY + 19.5 + siteAddrLines.length * 4.2;
  doc.text(`Validity: ${clientInfo.validityDays || 30} Days`, col2X, validityY);

  // Per-Work Client Schedule Table (total width = 182mm)
  const tableData = items.map((item, idx) => [
    idx + 1,
    item.category,
    item.label,
    `${item.widthMm} × ${item.heightMm} mm`,
    item.hasExtra ? `With ${item.extraOptionLabel}` : 'Standard Spec',
    `${symSafe}${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    item.quantity,
    `${symSafe}${item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  const tableStartY = cardY + cardHeight + 4;

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Fabrication Category', 'Label / Unit Tag', 'Dimensions (W×H)', 'Specification', 'Unit Price', 'Qty', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 24 },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 30 },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 11, halign: 'center' },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 6;

  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  // Financial Summary Card (Client-facing)
  const summaryWidth = 84;
  const summaryX = pageWidth - 14 - summaryWidth; // Exactly 112mm
  const summaryHeight = 46;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, currentY, summaryWidth, summaryHeight, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');

  doc.text('Works Subtotal:', summaryX + 4, currentY + 6.5);
  doc.text(`${symSafe}${financials.worksSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 6.5, { align: 'right' });

  doc.text('Labor & Site Fitting:', summaryX + 4, currentY + 13);
  doc.text(`${symSafe}${financials.laborAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 13, { align: 'right' });

  doc.text('Transportation:', summaryX + 4, currentY + 19.5);
  doc.text(`${symSafe}${financials.transportAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 19.5, { align: 'right' });

  doc.text(`VAT / Tax (${financials.taxPercent}%):`, summaryX + 4, currentY + 26);
  doc.text(`${symSafe}${financials.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 26, { align: 'right' });

  // Grand Total Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(summaryX, currentY + 31, summaryWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('GRAND TOTAL:', summaryX + 4, currentY + 40.5);
  doc.text(`${symSafe}${financials.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 4, currentY + 40.5, { align: 'right' });

  // Terms and notes box (Left side)
  const termsX = 14;
  const termsWidth = summaryX - 14 - 6; // 92mm
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(termsX, currentY, termsWidth, summaryHeight, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('COMMERCIAL TERMS & WARRANTY:', termsX + 4, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const rawClientTerms = clientInfo.notesOrTerms || '1. 70% advance payment required upon order confirmation.\n2. 30% balance payable upon completion of workshop assembly prior to site delivery.\n3. Custom sizes fabricated according to signed architectural survey.';
  const termsArray = formatTermsForPdf(rawClientTerms);

  let termLineY = currentY + 13;
  termsArray.forEach((termItem) => {
    if (termLineY < currentY + summaryHeight - 3) {
      const splitItem = doc.splitTextToSize(termItem, termsWidth - 8);
      doc.text(splitItem, termsX + 4, termLineY);
      termLineY += splitItem.length * 3.8 + 1.5;
    }
  });

  // Signatures
  const sigY = currentY + summaryHeight + 10;
  if (sigY <= 275) {
    doc.setDrawColor(148, 163, 184);
    doc.line(14, sigY, 75, sigY);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Authorized Fabricator Sign & Stamp', 14, sigY + 5);

    doc.line(pageWidth - 75, sigY, pageWidth - 14, sigY);
    doc.text('Client Acceptance Signature', pageWidth - 75, sigY + 5);
  }

  // Page Numbers
  const totalPages2 = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages2; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${orgName} - Client Quotation - ${projectName} - Page ${i} of ${totalPages2}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Client_Quotation_Bill.pdf`);
}


