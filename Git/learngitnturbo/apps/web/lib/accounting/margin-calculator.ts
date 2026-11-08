/**
 * Statutory Indian GST Margin Scheme & Unit Economics Engine
 * 
 * In accordance with Rule 32(5) of the CGST Rules, 2017 &
 * Notification No. 8/2018-Central Tax (Rate), GST on pre-owned motor vehicles
 * is charged strictly on the MARGIN (selling price - purchase price).
 * If margin is negative or zero, GST is nil (exempt).
 */

export interface GstMarginResult {
  isExempt: boolean;
  marginAmount: number;
  taxableMarginBase: number;
  gstRatePercent: 12 | 18;
  cgstAmount: number;
  sgstAmount: number;
  totalGstAmount: number;
  netVehicleRealization: number;
}

export interface UnitEconomicsParams {
  purchaseCost: number;
  reconditioningCost: number;
  agreedSellingPrice: number;
  rtoTransferCharges?: number;
  insuranceCharges?: number;
  extendedWarrantyFee?: number;
  accessoriesCharges?: number;
  discountAmount?: number;
  salesCommissionAmount?: number;
  fuelType?: string;
  engineCapacityCc?: number;
  lengthMm?: number;
}

export interface UnitEconomicsResult {
  totalLandedCost: number;
  totalDealAmount: number;
  gstMargin: GstMarginResult;
  netGrossProfit: number;
  grossMarginPercent: number;
  salesCommissionAmount: number;
}

/**
 * Calculates statutory GST on the profit margin of a pre-owned vehicle
 */
export function computeGstMarginScheme({
  sellingPrice,
  purchasePrice,
  fuelType = "petrol",
  engineCapacityCc = 2000,
  lengthMm = 4500,
}: {
  sellingPrice: number;
  purchasePrice: number;
  fuelType?: string;
  engineCapacityCc?: number;
  lengthMm?: number;
}): GstMarginResult {
  const marginAmount = Math.max(0, sellingPrice - purchasePrice);

  // Sub-4m compact cars (<1200cc petrol, <1500cc diesel, CNG) are 12%
  const isSub4MeterSmallCar =
    lengthMm < 4000 &&
    ((fuelType === "petrol" && engineCapacityCc < 1200) ||
      (fuelType === "diesel" && engineCapacityCc < 1500) ||
      fuelType === "cng");

  const gstRatePercent: 12 | 18 = isSub4MeterSmallCar ? 12 : 18;

  if (marginAmount <= 0) {
    return {
      isExempt: true,
      marginAmount: 0,
      taxableMarginBase: 0,
      gstRatePercent,
      cgstAmount: 0,
      sgstAmount: 0,
      totalGstAmount: 0,
      netVehicleRealization: sellingPrice,
    };
  }

  // Margin is considered inclusive of GST on retail sales
  // Base = Margin / (1 + Rate / 100)
  const taxableMarginBase = Math.round(marginAmount / (1 + gstRatePercent / 100));
  const totalGstAmount = marginAmount - taxableMarginBase;
  const cgstAmount = Math.round(totalGstAmount / 2);
  const sgstAmount = totalGstAmount - cgstAmount;

  return {
    isExempt: false,
    marginAmount,
    taxableMarginBase,
    gstRatePercent,
    cgstAmount,
    sgstAmount,
    totalGstAmount,
    netVehicleRealization: sellingPrice - totalGstAmount,
  };
}

/**
 * Computes complete dealership unit economics, gross margins, and customer deal total
 */
export function calculateUnitEconomics({
  purchaseCost,
  reconditioningCost,
  agreedSellingPrice,
  rtoTransferCharges = 0,
  insuranceCharges = 0,
  extendedWarrantyFee = 0,
  accessoriesCharges = 0,
  discountAmount = 0,
  salesCommissionAmount = 0,
  fuelType = "petrol",
  engineCapacityCc = 2000,
  lengthMm = 4500,
}: UnitEconomicsParams): UnitEconomicsResult {
  const totalLandedCost = purchaseCost + reconditioningCost;

  const totalDealAmount = Math.max(
    0,
    agreedSellingPrice +
      rtoTransferCharges +
      insuranceCharges +
      extendedWarrantyFee +
      accessoriesCharges -
      discountAmount
  );

  const gstMargin = computeGstMarginScheme({
    sellingPrice: agreedSellingPrice,
    purchasePrice: purchaseCost,
    fuelType,
    engineCapacityCc,
    lengthMm,
  });

  // Net Gross Profit = Selling Price - Total Landed Cost - GST on Margin - Sales Commission
  const netGrossProfit =
    agreedSellingPrice -
    totalLandedCost -
    gstMargin.totalGstAmount -
    salesCommissionAmount;

  const grossMarginPercent =
    agreedSellingPrice > 0
      ? Number(((netGrossProfit / agreedSellingPrice) * 100).toFixed(1))
      : 0;

  return {
    totalLandedCost,
    totalDealAmount,
    gstMargin,
    netGrossProfit,
    grossMarginPercent,
    salesCommissionAmount,
  };
}

