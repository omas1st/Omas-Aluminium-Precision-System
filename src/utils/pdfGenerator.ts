import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  QuotationBreakdown,
  ClientQuotationInfo,
} from '../types';

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
    p.profileName,
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
        p.profileName,
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
    c.profileName,
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
  const sym = quote.currencySymbol;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OMAS ALUMINIUM PRECISION SYSTEM', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL BILL OF QUANTITIES & PROJECT EXPENSE QUOTATION', 14, 22);

  const quoteRef = clientInfo?.quoteRefNumber || `QT-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFont('helvetica', 'bold');
  doc.text(`REF: ${quoteRef}`, pageWidth - 14, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(calc.dateCalculated).toLocaleDateString()}`, pageWidth - 14, 22, {
    align: 'right',
  });

  // Client & Project Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT & PROJECT DETAILS:', 18, 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${calc.projectName}`, 18, 52);
  doc.text(`Client: ${clientInfo?.clientName || 'Valued Customer'}`, 18, 58);
  if (clientInfo?.clientPhone || clientInfo?.projectSiteAddress) {
    doc.text(`Contact / Site: ${clientInfo.clientPhone || ''} ${clientInfo.projectSiteAddress ? `| ${clientInfo.projectSiteAddress}` : ''}`, 18, 63);
  }

  doc.text(`Total Openings: ${calc.items.length} units`, pageWidth - 20, 52, { align: 'right' });
  doc.text(`Total Glass Area: ${calc.totalGlassAreaM2} m²`, pageWidth - 20, 58, { align: 'right' });
  doc.text(`Quote Validity: ${clientInfo?.validityDays || 30} Days`, pageWidth - 20, 63, { align: 'right' });

  // 1. Aluminum Profiles Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Aluminum Profile Extrusions (5.8m Standard Bars)', 14, 73);

  const profileRows = quote.profileLines.map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${sym} ${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${sym} ${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 76,
    head: [['#', 'Profile Section', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: profileRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 85 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 24 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // 2. Glass Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Glass Supply & Precision Glazing', 14, currentY);

  const glassRows = quote.glassLines.map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${sym} ${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${sym} ${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Glass Specification & Panes', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: glassRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 85 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 24 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 3. Accessories Table
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Hardware, Gaskets, Fasteners & Consumables', 14, currentY);

  const accRows = quote.accessoryLines.map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${sym} ${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${sym} ${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Item / Accessory Name', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: accRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 85 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 24 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Labor & Services Table
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Workshop Labor, Machining & Site Installation', 14, currentY);

  const serviceRows = [...quote.laborLines, ...quote.logisticsLines].map((l, i) => [
    (i + 1).toString(),
    l.name,
    l.quantity.toString(),
    l.unit,
    `${sym} ${l.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${sym} ${l.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['#', 'Service / Scope of Work', 'Qty', 'Unit', 'Unit Rate', 'Amount']],
    body: serviceRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 85 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 24 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Financial Grand Summary Block
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  const summaryX = pageWidth - 90;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(summaryX - 5, currentY, 80, 52, 2, 2, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Materials Subtotal:', summaryX, currentY + 7);
  doc.text(`${sym} ${quote.totalMaterialsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 7, { align: 'right' });

  doc.text('Labor & Installation:', summaryX, currentY + 14);
  doc.text(`${sym} ${(quote.totalLaborCost + quote.totalLogisticsCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 14, { align: 'right' });

  doc.text(`Profit / Margin (${quote.profitMarginPercent}%):`, summaryX, currentY + 21);
  doc.text(`${sym} ${quote.profitMarginAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 21, { align: 'right' });

  doc.text(`Net Before Tax:`, summaryX, currentY + 28);
  doc.text(`${sym} ${quote.netQuoteBeforeTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 28, { align: 'right' });

  doc.text(`VAT / Tax (${quote.taxVatPercent}%):`, summaryX, currentY + 35);
  doc.text(`${sym} ${quote.taxVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 35, { align: 'right' });

  doc.setFillColor(30, 41, 59);
  doc.rect(summaryX - 5, currentY + 40, 80, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', summaryX, currentY + 48);
  doc.text(`${sym} ${quote.grandTotalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY + 48, { align: 'right' });

  // Terms & Signatures
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TERMS & CONDITIONS:', 14, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('1. 70% advance payment required upon order confirmation to procure profiles & glass.', 14, currentY + 18);
  doc.text('2. 30% balance payable upon completion of workshop assembly prior to site installation.', 14, currentY + 24);
  doc.text(`3. This quotation is valid for ${clientInfo?.validityDays || 30} days from the date of issue.`, 14, currentY + 30);
  doc.text('4. Aluminum profiles and glass are fabricated to custom dimensions specified in the schedule.', 14, currentY + 36);

  // Signature lines
  const sigY = currentY + 58;
  if (sigY <= 275) {
    doc.line(14, sigY, 70, sigY);
    doc.text('Prepared By (Fabricator)', 14, sigY + 5);

    doc.line(pageWidth - 70, sigY, pageWidth - 14, sigY);
    doc.text('Client Acceptance Signature', pageWidth - 70, sigY + 5);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `OMAS Aluminium Precision System - Official Quotation - ${calc.projectName} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Quotation_Bill_of_Expenses.pdf`);
}

