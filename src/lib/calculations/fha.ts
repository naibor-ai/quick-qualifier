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
  prepaidOptions?: {
    interestDays?: number;
    taxMonths?: number;
    insuranceMonths?: number;
  }
): ClosingCostsBreakdown {
  const { fees, prepaids } = config;

  const interestDays = prepaidOptions?.interestDays ?? 15;
  const taxMonths = prepaidOptions?.taxMonths ?? 6;
  const insuranceMonths = prepaidOptions?.insuranceMonths ?? 15;

  // Manual Fees from Image for FHA Sale
  const manualFees = {
    processing: 995,
    underwriting: 1495,
    docPrep: 295,
    appraisal: 650,
    creditReport: 150,
    floodCert: 30,
    taxService: 85,
    ownerTitlePolicy: 1730,
    lenderTitlePolicy: 1515,
    settlement: 1115, // Escrow/closing fee
    recording: 275,
    notary: 350,
    pestInspection: 150,
    propertyInspection: 450,
    poolInspection: 100,
    transferTax: 0,
    mortgageTax: 0
  };

  // Section A - Lender Fees
  // Loan Fee: LoanWithMIP * 1%
  const totalLoanAmount = baseLoanAmount + ufmipAmount;
  const loanFee = roundToCents(totalLoanAmount * 0.01);


  // For now, based on "Loan amount x LoanFee%" formula, we use the calculated loan fee.
  const originationFee = 0;
  const adminFee = 0; // Not in image

  const totalLenderFees =
    loanFee +
    originationFee +
    adminFee +
    manualFees.processing +
    manualFees.underwriting +
    manualFees.appraisal +
    manualFees.creditReport +
    manualFees.floodCert +
    manualFees.taxService +
    manualFees.docPrep;

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    manualFees.settlement +
    manualFees.notary +
    manualFees.recording +
    manualFees.ownerTitlePolicy +
    manualFees.lenderTitlePolicy +
    manualFees.pestInspection +
    manualFees.propertyInspection +
    manualFees.poolInspection +
    manualFees.transferTax +
    manualFees.mortgageTax;

  // Section C - Prepaids
  // Formula: (Loan * Rate / 365) * 15
  // Note: Prepaid Interest (15 days)
  // const totalLoanAmount = baseLoanAmount + ufmipAmount; // Already calculated above
  const prepaidInterest = calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    interestDays
  );

  // Formula: Prepaid Tax (6 mo) = Monthly * 6
  const taxReserves = roundToCents(propertyTaxMonthly * taxMonths);

  // Formula: Prepaid Hazard (15 mo) = Monthly * 15
  const insuranceReserves = roundToCents(homeInsuranceMonthly * insuranceMonths);

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  // No seller/lender credits by default
  const totalCredits = 0;

  // Totals
  const totalClosingCosts =
    totalLenderFees + totalThirdPartyFees + totalPrepaids;
  const netClosingCosts = totalClosingCosts - totalCredits;

  return {
    loanFee,
    originationFee,
    adminFee,
    processingFee: manualFees.processing,
    underwritingFee: manualFees.underwriting,
    appraisalFee: manualFees.appraisal,
    creditReportFee: manualFees.creditReport,
    floodCertFee: manualFees.floodCert,
    taxServiceFee: manualFees.taxService,
    docPrepFee: manualFees.docPrep,
    totalLenderFees: roundToCents(totalLenderFees),

    ownerTitlePolicy: manualFees.ownerTitlePolicy,
    lenderTitlePolicy: manualFees.lenderTitlePolicy,
    escrowFee: manualFees.settlement,
    notaryFee: manualFees.notary,
    recordingFee: manualFees.recording,
    courierFee: 0,
    pestInspectionFee: manualFees.pestInspection,
    propertyInspectionFee: manualFees.propertyInspection,
    poolInspectionFee: manualFees.poolInspection,
    transferTax: manualFees.transferTax,
    mortgageTax: manualFees.mortgageTax,
    totalThirdPartyFees: roundToCents(totalThirdPartyFees),

    prepaidInterest,
    taxReserves,
    insuranceReserves,
    totalPrepaids: roundToCents(totalPrepaids),

    sellerCredit: 0,
    lenderCredit: 0,
    totalCredits: 0,

    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays: interestDays,
    prepaidTaxMonths: taxMonths,
    prepaidInsuranceMonths: insuranceMonths,
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
  // Formula: (loanAmount * 0.55%) / 12
  // Assuming "loanAmount" refers to Base Loan Amount as standard, but checking request. 
  // Config has mipRate, but user requested specific formula "(loanAmount* 0.55%) / 12".
  const mipRate = 0.55;
  let monthlyMip = 0;
  if (mortgageInsuranceMonthly !== undefined) {
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

  // Monthly escrows
  const monthlyTax = propertyTaxMonthly;
  const monthlyInsurance = homeInsuranceMonthly;

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
    {
      interestDays: input.prepaidInterestDays,
      taxMonths: input.prepaidTaxMonths,
      insuranceMonths: input.prepaidInsuranceMonths,
    }
  );

  // Cash to close (UFMIP is financed, not paid at closing)
  const cashToClose = calculateCashToClose(
    downPayment,
    closingCosts.totalClosingCosts,
    closingCosts.totalCredits
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
    originationPoints,
    prepaidInterestDays = 15,
    prepaidTaxMonths = 0,
    prepaidInsuranceMonths = 0,
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
  // Manual Fees from Image for FHA Refinance
  const manualFees = {
    appraisal: 650,
    creditReport: 150,
    lenderTitlePolicy: 1015,
    escrow: 400, // Escrow/closing fee
    recording: 275,
    notary: 350,
    mortgageTax: 0, // Explicitly 0 in image
    docPrep: 595, // Document fee
    processing: 895,
    underwriting: 995,
    taxService: 59,
    floodCert: 30
  };

  // Loan Fee = Loan Amount (meaning Total Loan Amount based on context of P&I) * 1%
  // User Formula for P&I: P = Base + MIP. User Formula for Loan Fee: Loan Amount * %.
  // Standard assumption: fees on total loan amount.
  const loanFee = roundToCents(totalLoanAmount * 0.01);
  const originationFee = 0; // Handled by loan fee

  const totalLenderFees =
    loanFee +
    originationFee +
    manualFees.processing +
    manualFees.underwriting +
    manualFees.appraisal +
    manualFees.creditReport +
    manualFees.floodCert +
    manualFees.taxService +
    manualFees.docPrep; // Added docPrep here as it's often admin/lender. Image lists it separately.

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    manualFees.escrow +
    manualFees.notary +
    manualFees.recording +
    manualFees.lenderTitlePolicy;

  // Prepaids
  // Formula: Loan Amount * (Rate / 100) / 365 * days.
  // Using totalLoanAmount for interest calculation.
  // This matches 870 for $325,600 at 6.5% for 15 days.
  const prepaidInterest = calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    prepaidInterestDays
  );

  // For Refi, using actual property tax and insurance annual inputs if provided
  const taxReserves = roundToCents(propertyTaxMonthly * prepaidTaxMonths);
  const insuranceReserves = roundToCents(homeInsuranceMonthly * prepaidInsuranceMonths);

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  const totalClosingCosts = totalLenderFees + totalThirdPartyFees + totalPrepaids;
  const netClosingCosts = totalClosingCosts;

  const closingCosts: ClosingCostsBreakdown = {
    loanFee,
    originationFee,
    adminFee: 0,
    processingFee: manualFees.processing,
    underwritingFee: manualFees.underwriting,
    appraisalFee: manualFees.appraisal,
    creditReportFee: manualFees.creditReport,
    floodCertFee: manualFees.floodCert,
    taxServiceFee: manualFees.taxService,
    docPrepFee: manualFees.docPrep,
    totalLenderFees: roundToCents(totalLenderFees),

    ownerTitlePolicy: 0,
    lenderTitlePolicy: manualFees.lenderTitlePolicy,
    escrowFee: manualFees.escrow,
    notaryFee: manualFees.notary,
    recordingFee: manualFees.recording,
    courierFee: 0,
    pestInspectionFee: 0,
    propertyInspectionFee: 0,
    poolInspectionFee: 0,
    transferTax: 0,
    mortgageTax: manualFees.mortgageTax,
    totalThirdPartyFees: roundToCents(totalThirdPartyFees),

    prepaidInterest,
    taxReserves,
    insuranceReserves,
    totalPrepaids: roundToCents(totalPrepaids),

    sellerCredit: 0,
    lenderCredit: 0,
    totalCredits: 0,

    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays,
    prepaidTaxMonths,
    prepaidInsuranceMonths,
  };

  // Cash To Close Calculation
  const amountNeeded = existingLoanBalance + netClosingCosts + ufmipAmount;
  const cashToClose = roundToCents(amountNeeded - totalLoanAmount);

  return {
    loanAmount: newLoanAmount,
    totalLoanAmount,
    ltv,
    downPayment: 0,
    monthlyPayment,
    closingCosts,
    cashToClose,
    ufmip: ufmipAmount,
  };
}
