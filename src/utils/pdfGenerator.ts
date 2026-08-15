import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CombinedProjectCalculation, ConstantProfilesConfig } from '../types';

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
  doc.text('ALUMINUM FABRICATION SYSTEM', 14, 12);

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
      `Aluminum Fabrication System - Generated for ${calc.projectName} - Page ${i} of ${totalPages}`,
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
  doc.text('ALUMINUM FABRICATION SYSTEM', 14, 12);

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
      `Aluminum Fabrication System - Frame & Glass Schedule - ${calc.projectName} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${calc.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Frame_Cut_and_Glass_Sizes.pdf`);
}
