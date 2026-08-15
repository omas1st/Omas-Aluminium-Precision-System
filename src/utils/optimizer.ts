import {
  CutPiece,
  ConstantProfilesConfig,
  ProfileOptimizationResult,
  OptimizedStockBar,
  StockBarCut,
} from '../types';

interface IndividualCut {
  length: number;
  itemTag: string;
  purpose: string;
  originalCutId: string;
}

export function optimizeProfileCuts(
  allCuts: CutPiece[],
  constants: ConstantProfilesConfig
): ProfileOptimizationResult[] {
  const stockLength = constants.stockProfileLength || 5800;
  const kerf = constants.bladeKerf || 4;

  // Group cuts by profile name
  const cutsByProfile = new Map<string, IndividualCut[]>();

  allCuts.forEach((cut) => {
    if (!cutsByProfile.has(cut.profileName)) {
      cutsByProfile.set(cut.profileName, []);
    }
    const list = cutsByProfile.get(cut.profileName)!;
    for (let i = 0; i < cut.quantity; i++) {
      list.push({
        length: cut.length,
        itemTag: cut.itemTag,
        purpose: cut.purpose,
        originalCutId: cut.id,
      });
    }
  });

  const results: ProfileOptimizationResult[] = [];

  cutsByProfile.forEach((cutsList, profileName) => {
    // 1. Sort cuts in descending order (Largest first - First Fit Decreasing as requested)
    const sortedCuts = [...cutsList].sort((a, b) => b.length - a.length);

    const bars: OptimizedStockBar[] = [];

    sortedCuts.forEach((cut) => {
      // Find the first bar where this cut fits (including saw blade kerf)
      let placed = false;

      for (let b = 0; b < bars.length; b++) {
        const bar = bars[b];
        const cutsCount = bar.cuts.length;
        const requiredSpace = cut.length + (cutsCount > 0 ? kerf : 0);

        if (bar.usedLength + requiredSpace <= stockLength) {
          bar.cuts.push({
            cutLength: cut.length,
            itemTag: cut.itemTag,
            purpose: cut.purpose,
          });
          bar.usedLength += requiredSpace;
          bar.wasteLength = stockLength - bar.usedLength;
          bar.wastePercentage = Number(((bar.wasteLength / stockLength) * 100).toFixed(1));
          placed = true;
          break;
        }
      }

      // If it doesn't fit in any existing bar, allocate a new bar
      if (!placed) {
        const newBar: OptimizedStockBar = {
          barNumber: bars.length + 1,
          profileName,
          stockLength,
          usedLength: cut.length,
          wasteLength: stockLength - cut.length,
          wastePercentage: Number((((stockLength - cut.length) / stockLength) * 100).toFixed(1)),
          cuts: [
            {
              cutLength: cut.length,
              itemTag: cut.itemTag,
              purpose: cut.purpose,
            },
          ],
        };
        bars.push(newBar);
      }
    });

    const totalLengthRequired = sortedCuts.reduce((sum, c) => sum + c.length, 0);
    const totalBarsLength = bars.length * stockLength;
    const totalWasteLength = bars.reduce((sum, b) => sum + b.wasteLength, 0);
    const wastePercentage =
      totalBarsLength > 0
        ? Number(((totalWasteLength / totalBarsLength) * 100).toFixed(1))
        : 0;

    results.push({
      profileName,
      totalLengthRequired,
      totalPieces: sortedCuts.length,
      barsNeeded: bars.length,
      stockLength,
      totalWasteLength,
      wastePercentage,
      bars,
    });
  });

  return results;
}
