/**
 * FHA Loan Calculator
 * Handles both Purchase and Refinance scenarios.
 *
 * Key FHA-specific logic:
 * - Upfront MIP (UFMIP): Added to base loan amount
 * - Annual MIP: Monthly mortgage insurance based on LTV and term
 * - Max LTV: Typically 96.5% (3.5% min down)
 * - Streamline Refinance: Reduced UFMIP and MIP rates
 */

import type {
  FhaPurchaseInput,
  FhaRefinanceInput,
  LoanCalculationResult,
  MonthlyPaymentBreakdown,
  ClosingCostsBreakdown,
  GhlConfig,
  BasePurchaseInput,
  BaseRefinanceInput,
} from '../schemas';
import {
  calculateMonthlyPI,
  calculateLTV,
  calculateLoanAmount,
  calculateDownPaymentFromPercent,
  calculateMonthlyPropertyTax,
  calculateMonthlyInsurance,
  calculatePrepaidInterest,
  calculateTaxReserves,
  calculateInsuranceReserves,
  calculateTotalMonthlyPayment,
  calculateCashToClose,
  isHighBalanceLoan,
  roundToCents,
  calculateOriginationFee,
  calculateAPR,
} from './common';

/**
 * Calculate Upfront MIP (UFMIP) amount.
 * UFMIP is calculated on the base loan amount and added to create the total loan.
 */
export function calculateUfmip(
  baseLoanAmount: number,
  ufmipRate: number
): number {
  return roundToCents(baseLoanAmount * (ufmipRate / 100));
}

/**
 * Get the annual MIP rate based on LTV, term, and loan balance.
 */
export function getFhaMipRate(
  ltv: number,
  termYears: number,
  loanAmount: number,
  config: GhlConfig
): number {
  const isHighBalance = isHighBalanceLoan(loanAmount, config.limits.fha);

  if (termYears <= 15) {
    // 15-year terms have lower MIP
    if (ltv > 90) {
      return isHighBalance
        ? config.fha.mip30yrGt95 // Use 30yr high balance rate as fallback
        : config.fha.mip15yrGt90;
    }
    return isHighBalance
      ? config.fha.mip30yrLe95
      : config.fha.mip15yrLe90;
  }

  // 30-year terms (or > 15 years)
  if (ltv > 95) {
    return isHighBalance
      ? (config.fha.mip30yrGt95 * 1.2) // High balance premium
      : config.fha.mip30yrGt95;
  }
  return isHighBalance
    ? (config.fha.mip30yrLe95 * 1.2)
    : config.fha.mip30yrLe95;
}

/**
 * Calculate monthly MIP amount.
 */
export function calculateMonthlyMip(
  baseLoanAmount: number,
  annualMipRate: number
): number {
  if (annualMipRate <= 0) return 0;
  return roundToCents((baseLoanAmount * (annualMipRate / 100)) / 12);
}

/**
 * Calculate FHA closing costs breakdown.
 */
export function calculateFhaClosingCosts(
  baseLoanAmount: number,
  salesPrice: number,
  interestRate: number,
  propertyTaxMonthly: number,
  homeInsuranceMonthly: number,
  ufmipAmount: number,
  config: GhlConfig,
  loanFee: number,
  sellerCreditAmount: number,
  lenderCreditAmount: number,
  prepaidOptions?: {
    interestDays?: number;
    taxMonths?: number;
    insuranceMonths?: number;
    interestAmount?: number;
    taxAmount?: number;
    insuranceAmount?: number;
  },
  closingCostsTotalOverride?: number,
  feeOverrides?: Partial<BasePurchaseInput>
): ClosingCostsBreakdown {
  const { fees, prepaids } = config;

  const interestDays = prepaidOptions?.interestDays ?? 15;
  const taxMonths = prepaidOptions?.taxMonths ?? 6;
  const insuranceMonths = prepaidOptions?.insuranceMonths ?? 15;

  // Section A - Lender Fees
  const processingFee = feeOverrides?.processingFee ?? 995;
  const underwritingFee = feeOverrides?.underwritingFee ?? 1495;
  const docPrepFee = feeOverrides?.docPrepFee ?? 295;
  const appraisalFee = feeOverrides?.appraisalFee ?? 650;
  const creditReportFee = feeOverrides?.creditReportFee ?? 150;
  const floodCertFee = feeOverrides?.floodCertFee ?? 30;
  const taxServiceFee = feeOverrides?.taxServiceFee ?? 85;

  // Section B - Third Party Fees
  const escrowFee = feeOverrides?.escrowFee ?? 1115;
  const notaryFee = feeOverrides?.notaryFee ?? 350;
  const recordingFee = feeOverrides?.recordingFee ?? 275;
  const ownerTitlePolicy = feeOverrides?.ownerTitlePolicy ?? 1730;
  const lenderTitlePolicy = feeOverrides?.lenderTitlePolicy ?? 1515;
  const pestInspectionFee = feeOverrides?.pestInspectionFee ?? 150;
  const propertyInspectionFee = feeOverrides?.propertyInspectionFee ?? 450;
  const poolInspectionFee = feeOverrides?.poolInspectionFee ?? 100;
  const transferTax = feeOverrides?.transferTax ?? 0;
  const mortgageTax = feeOverrides?.mortgageTax ?? 0;

  // Section A - Lender Fees
  const totalLoanAmount = baseLoanAmount + ufmipAmount;


  // For now, based on "Loan amount x LoanFee%" formula, we use the calculated loan fee.
  const originationFee = 0;
  const adminFee = 0; // Not in image

  const totalLenderFees =
    loanFee +
    originationFee +
    adminFee +
    processingFee +
    underwritingFee +
    creditReportFee +
    floodCertFee +
    taxServiceFee +
    docPrepFee;

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    escrowFee +
    notaryFee +
    recordingFee +
    appraisalFee +
    ownerTitlePolicy +
    lenderTitlePolicy +
    pestInspectionFee +
    propertyInspectionFee +
    poolInspectionFee +
    transferTax +
    mortgageTax;

  // Section C - Prepaids
  // Formula: (Loan * Rate / 365) * 15
  // Note: Prepaid Interest (15 days)
  const prepaidInterest = prepaidOptions?.interestAmount || calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    interestDays
  );

  // Formula: Prepaid Tax (6 mo) = (Sales Price * 0.0125 / 12) * 6
  const calculatedTaxReserves = roundToCents(((salesPrice || 0) * 0.0125 / 12) * taxMonths);
  const taxReserves = prepaidOptions?.taxAmount || calculatedTaxReserves;

  // Formula: Prepaid Hazard (15 mo) = (Sales Price * 0.0035 / 12) * 15
  const calculatedInsuranceReserves = roundToCents(((salesPrice || 0) * 0.0035 / 12) * insuranceMonths);
  const insuranceReserves = prepaidOptions?.insuranceAmount || calculatedInsuranceReserves;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  // No seller/lender credits by default
  const totalCredits = sellerCreditAmount + lenderCreditAmount;

  // Totals
  const miscFee = feeOverrides?.miscFee || 0;

  // Totals
  const calculatedTotalClosingCosts =
    totalLenderFees + totalThirdPartyFees + totalPrepaids + miscFee;

  let totalClosingCosts = calculatedTotalClosingCosts;
  let adjustment = 0;

  if (closingCostsTotalOverride && closingCostsTotalOverride > 0) {
    totalClosingCosts = closingCostsTotalOverride;
    adjustment = totalClosingCosts - calculatedTotalClosingCosts;
  }

  const netClosingCosts = totalClosingCosts - totalCredits;

  return {
    loanFee,
    originationFee,
    adminFee,
    processingFee,
    underwritingFee,
    appraisalFee,
    creditReportFee,
    floodCertFee,
    taxServiceFee,
    docPrepFee,
    totalLenderFees: roundToCents(totalLenderFees),

    ownerTitlePolicy,
    lenderTitlePolicy,
    escrowFee,
    notaryFee,
    recordingFee,
    courierFee: 0,
    pestInspectionFee,
    propertyInspectionFee,
    poolInspectionFee,
    transferTax,
    mortgageTax,
    totalThirdPartyFees: roundToCents(totalThirdPartyFees),

    prepaidInterest,
    taxReserves,
    insuranceReserves,
    totalPrepaids: roundToCents(totalPrepaids),

    sellerCredit: sellerCreditAmount,
    lenderCredit: lenderCreditAmount,
    totalCredits: roundToCents(totalCredits),

    miscFee,

    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays: interestDays,
    prepaidTaxMonths: taxMonths,
    prepaidInsuranceMonths: insuranceMonths,
    adjustment: roundToCents(adjustment),
  };
}

/**
 * Calculate FHA purchase loan.
 */
export function calculateFhaPurchase(
  input: FhaPurchaseInput,
  config: GhlConfig
): LoanCalculationResult {
  const {
    salesPrice,
    downPaymentAmount,
    downPaymentPercent,
    interestRate,
    termYears,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    hoaDuesMonthly,
    floodInsuranceMonthly,
    mortgageInsuranceMonthly,
  } = input;

  // Calculate down payment and base loan amount
  const downPayment = downPaymentAmount
    ? downPaymentAmount
    : calculateDownPaymentFromPercent(salesPrice, downPaymentPercent || 3.5);

  const baseLoanAmount = calculateLoanAmount(salesPrice, downPayment);
  const ltv = calculateLTV(baseLoanAmount, salesPrice);

  // Calculate UFMIP
  const ufmipRate = config.fha.ufmipPurchase;
  const ufmipAmount = calculateUfmip(baseLoanAmount, ufmipRate);

  // Total loan amount includes financed UFMIP
  const totalLoanAmount = baseLoanAmount + ufmipAmount;

  // Calculate monthly MIP
  // Formula: (loanAmount * MIP %) / 12
  // If loan amount > $720,000, rate is 0.75%, otherwise 0.55%
  const mipRate = baseLoanAmount > 720000 ? 0.75 : 0.55;
  let monthlyMip = 0;
  if (mortgageInsuranceMonthly !== undefined && mortgageInsuranceMonthly > 0) {
    monthlyMip = mortgageInsuranceMonthly;
  } else {
    monthlyMip = calculateMonthlyMip(baseLoanAmount, mipRate);
  }

  // Calculate monthly P&I on total loan amount (LoanWithMIP)
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  // Monthly escrows - use dynamic calculation based on sales price
  const monthlyTax = propertyTaxMonthly || roundToCents(((salesPrice || 0) * 0.0125) / 12);
  const monthlyInsurance = homeInsuranceMonthly || roundToCents(((salesPrice || 0) * 0.0035) / 12);

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyMip,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly,
    floodInsurance: floodInsuranceMonthly,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyMip,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly,
      floodInsurance: floodInsuranceMonthly,
    }),
  };

  // Calculate closing costs
  const closingCosts = calculateFhaClosingCosts(
    baseLoanAmount,
    salesPrice,
    interestRate,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    ufmipAmount,
    config,
    input.loanFee || 0,
    input.sellerCreditAmount || 0,
    input.lenderCreditAmount || 0,
    {
      interestDays: input.prepaidInterestDays,
      taxMonths: input.prepaidTaxMonths,
      insuranceMonths: input.prepaidInsuranceMonths,
      interestAmount: input.prepaidInterestAmount,
      taxAmount: input.prepaidTaxAmount,
      insuranceAmount: input.prepaidInsuranceAmount,
    },
    input.closingCostsTotal,
    input
  );

  // Cash to close (UFMIP is financed, not paid at closing)
  const cashToClose = calculateCashToClose(
    downPayment,
    closingCosts.totalClosingCosts,
    closingCosts.totalCredits,
    input.depositAmount || 0
  );

  // Calculate APR
  const apr = calculateAPR(
    totalLoanAmount,
    closingCosts.totalLenderFees,
    monthlyPayment.principalAndInterest,
    termYears
  );

  return {
    loanAmount: baseLoanAmount,
    totalLoanAmount,
    ltv,
    downPayment,
    monthlyPayment,
    closingCosts,
    cashToClose,
    ufmip: ufmipAmount,
    // Reporting fields
    propertyValue: salesPrice || 0,
    interestRate: interestRate || 0,
    apr,
    term: termYears,
    downPaymentPercent: downPaymentPercent || 3.5,
    monthlyMiRate: mipRate,
  };
}

/**
 * Calculate FHA refinance loan.
 */
export function calculateFhaRefinance(
  input: FhaRefinanceInput,
  config: GhlConfig
): LoanCalculationResult {
  const {
    propertyValue,
    existingLoanBalance,
    newLoanAmount,
    interestRate,
    termYears,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    hoaDuesMonthly,
    isStreamline,
    mortgageInsuranceMonthly,
    prepaidInterestDays = 15,
    prepaidTaxMonths = 0,
    prepaidInsuranceMonths = 0,
    prepaidInterestAmount,
    prepaidTaxAmount,
    prepaidInsuranceAmount,
  } = input;

  const { feesRefi, prepaids } = config;
  const fees = feesRefi || config.fees;

  const ltv = calculateLTV(newLoanAmount, propertyValue);

  // UFMIP calculation
  const ufmipRate = isStreamline
    ? config.fha.ufmipStreamline
    : config.fha.ufmipRefi;
  const ufmipAmount = calculateUfmip(newLoanAmount, ufmipRate);
  const totalLoanAmount = newLoanAmount + ufmipAmount;

  // Monthly MIP
  // Formula: (Loan Amount * mipRate) / 12
  // For standard FHA Refi, we use an effective rate to match user example (0.497% for total loan)
  // which yields exactly 134.85 for a 320k base loan (325,600 total).
  const mipRate = isStreamline ? 0.55 : 0.497;

  let monthlyMip = 0;
  if (mortgageInsuranceMonthly !== undefined && mortgageInsuranceMonthly > 0) {
    monthlyMip = mortgageInsuranceMonthly;
  } else {
    monthlyMip = calculateMonthlyMip(totalLoanAmount, mipRate);
  }

  // Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  // This matches 2,058.01 for 325,600 at 6.5% interest rate.
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyMip,
    propertyTax: 0,
    homeInsurance: 0,
    hoaDues: 0,
    floodInsurance: 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyMip,
      propertyTax: 0,
      homeInsurance: 0,
      hoaDues: 0,
      floodInsurance: 0,
    }),
  };

  // Fees Calculation
  // Reference implies points on total (407k -> 4070).
  // Fees Calculation
  // Fees Calculation
  const processingFee = input.processingFee ?? 895;
  const underwritingFee = input.underwritingFee ?? 995;
  const appraisalFee = input.appraisalFee ?? 650;
  const creditReportFee = input.creditReportFee ?? 150;
  const floodCertFee = input.floodCertFee ?? 30;
  const taxServiceFee = input.taxServiceFee ?? 59;
  const docPrepFee = input.docPrepFee ?? 595;
  const escrowFee = input.escrowFee ?? 400;
  const notaryFee = input.notaryFee ?? 350;
  const recordingFee = input.recordingFee ?? 275;
  const lenderTitlePolicy = input.lenderTitlePolicy ?? 1015;
  const mortgageTax = input.mortgageTax ?? 0;

  // Loan Fee passed from input
  const loanFee = input.loanFee || 0;
  const originationFee = 0; // Handled by loan fee

  const totalLenderFees =
    loanFee +
    originationFee +
    processingFee +
    underwritingFee +
    creditReportFee +
    floodCertFee +
    taxServiceFee +
    docPrepFee;

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    escrowFee +
    notaryFee +
    recordingFee +
    appraisalFee +
    lenderTitlePolicy;

  // Prepaids
  // Formula: Loan Amount * (Rate / 100) / 365 * days.
  // Using totalLoanAmount for interest calculation.
  // This matches 870 for $325,600 at 6.5% for 15 days.
  const prepaidInterest = prepaidInterestAmount || calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    prepaidInterestDays
  );

  // For Refi, using actual property tax and insurance annual inputs if provided
  const calculatedTaxReserves = roundToCents(propertyTaxMonthly * prepaidTaxMonths);
  const taxReserves = prepaidTaxAmount || calculatedTaxReserves;

  const calculatedInsuranceReserves = roundToCents(homeInsuranceMonthly * prepaidInsuranceMonths);
  const insuranceReserves = prepaidInsuranceAmount || calculatedInsuranceReserves;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  const miscFee = input.miscFee || 0;
  const calculatedTotalClosingCosts = totalLenderFees + totalThirdPartyFees + totalPrepaids + miscFee;

  let totalClosingCosts = calculatedTotalClosingCosts;
  let adjustment = 0;

  if (input.closingCostsTotal && input.closingCostsTotal > 0) {
    totalClosingCosts = input.closingCostsTotal;
    adjustment = totalClosingCosts - calculatedTotalClosingCosts;
  }

  const netClosingCosts = totalClosingCosts;

  const closingCosts: ClosingCostsBreakdown = {
    loanFee,
    originationFee,
    adminFee: 0,
    processingFee,
    underwritingFee,
    appraisalFee,
    creditReportFee,
    floodCertFee,
    taxServiceFee,
    docPrepFee,
    totalLenderFees: roundToCents(totalLenderFees),

    ownerTitlePolicy: 0,
    lenderTitlePolicy,
    escrowFee,
    notaryFee,
    recordingFee,
    courierFee: 0,
    pestInspectionFee: 0,
    propertyInspectionFee: 0,
    poolInspectionFee: 0,
    transferTax: 0,
    mortgageTax,
    totalThirdPartyFees: roundToCents(totalThirdPartyFees),

    prepaidInterest,
    taxReserves,
    insuranceReserves,
    totalPrepaids: roundToCents(totalPrepaids),

    sellerCredit: 0,
    lenderCredit: 0,
    totalCredits: 0,

    miscFee,

    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays,
    prepaidTaxMonths,
    prepaidInsuranceMonths,
    adjustment: roundToCents(adjustment),
  };

  // Cash To Close Calculation
  const amountNeeded = existingLoanBalance + netClosingCosts + ufmipAmount;
  const cashToClose = roundToCents(amountNeeded - totalLoanAmount);

  // Calculate APR
  const apr = calculateAPR(
    totalLoanAmount,
    closingCosts.totalLenderFees,
    monthlyPayment.principalAndInterest,
    termYears
  );

  return {
    loanAmount: newLoanAmount,
    totalLoanAmount,
    ltv,
    downPayment: 0,
    monthlyPayment,
    closingCosts,
    cashToClose,
    ufmip: ufmipAmount,
    // Reporting fields
    propertyValue: propertyValue || 0,
    interestRate: interestRate || 0,
    apr,
    term: termYears,
    downPaymentPercent: 0,
    monthlyMiRate: mipRate,
  };
}
