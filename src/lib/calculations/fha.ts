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
  propertyTaxAnnual: number,
  homeInsuranceAnnual: number,
  ufmipAmount: number,
  config: GhlConfig
): ClosingCostsBreakdown {
  const { fees, prepaids } = config;

  // Section A - Lender Fees (no origination points typically for FHA)
  const totalLenderFees =
    fees.admin +
    fees.processing +
    fees.underwriting +
    fees.appraisal +
    fees.creditReport +
    fees.floodCert +
    fees.taxService;

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    fees.docPrep +
    fees.settlement +
    fees.notary +
    fees.recording +
    fees.courier;

  // Section C - Prepaids
  // Note: For FHA, prepaid interest is on the total loan (including UFMIP)
  const totalLoanAmount = baseLoanAmount + ufmipAmount;
  const prepaidInterest = calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    prepaids.interestDays
  );
  const taxReserves = calculateTaxReserves(
    propertyTaxAnnual,
    prepaids.taxMonths
  );
  const insuranceReserves = calculateInsuranceReserves(
    homeInsuranceAnnual,
    prepaids.insuranceMonths
  );
  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  // No seller/lender credits by default (can be added as params if needed)
  const totalCredits = 0;

  // Totals
  const totalClosingCosts =
    totalLenderFees + totalThirdPartyFees + totalPrepaids;
  const netClosingCosts = totalClosingCosts - totalCredits;

  return {
    originationFee: 0,
    adminFee: fees.admin,
    processingFee: fees.processing,
    underwritingFee: fees.underwriting,
    appraisalFee: fees.appraisal,
    creditReportFee: fees.creditReport,
    floodCertFee: fees.floodCert,
    taxServiceFee: fees.taxService,
    totalLenderFees: roundToCents(totalLenderFees),

    titleInsurance: fees.docPrep,
    escrowFee: fees.settlement,
    notaryFee: fees.notary,
    recordingFee: fees.recording,
    courierFee: fees.courier,
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
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaDuesMonthly,
    floodInsuranceMonthly,
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
  const mipRate = getFhaMipRate(ltv, termYears, baseLoanAmount, config);
  const monthlyMip = calculateMonthlyMip(baseLoanAmount, mipRate);

  // Calculate monthly P&I on total loan amount
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  // Monthly escrows
  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual);

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
    propertyTaxAnnual,
    homeInsuranceAnnual,
    ufmipAmount,
    config
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
    newLoanAmount,
    interestRate,
    termYears,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaDuesMonthly,
    isStreamline,
  } = input;

  const ltv = calculateLTV(newLoanAmount, propertyValue);

  // UFMIP rate depends on streamline vs standard
  const ufmipRate = isStreamline
    ? config.fha.ufmipStreamline
    : config.fha.ufmipRefi;
  const ufmipAmount = calculateUfmip(newLoanAmount, ufmipRate);

  const totalLoanAmount = newLoanAmount + ufmipAmount;

  // MIP rate - streamline typically has lower rates
  const mipRate = isStreamline
    ? Math.min(config.fha.mip30yrLe95, 0.55) // Streamline cap
    : getFhaMipRate(ltv, termYears, newLoanAmount, config);
  const monthlyMip = calculateMonthlyMip(newLoanAmount, mipRate);

  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual);

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyMip,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly,
    floodInsurance: 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyMip,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly,
    }),
  };

  const closingCosts = calculateFhaClosingCosts(
    newLoanAmount,
    propertyValue,
    interestRate,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    ufmipAmount,
    config
  );

  return {
    loanAmount: newLoanAmount,
    totalLoanAmount,
    ltv,
    downPayment: 0,
    monthlyPayment,
    closingCosts,
    cashToClose: closingCosts.netClosingCosts,
    ufmip: ufmipAmount,
  };
}
