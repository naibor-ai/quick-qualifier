/**
 * VA Loan Calculator
 * Handles both Purchase and Refinance scenarios.
 *
 * Key VA-specific logic:
 * - VA Funding Fee: Added to base loan amount (waived for disabled veterans)
 * - No monthly mortgage insurance (unlike Conv/FHA)
 * - 100% financing allowed (0% down)
 * - Funding fee varies by usage (first/subsequent), down payment tier, and loan type
 */

import type {
  VaPurchaseInput,
  VaRefinanceInput,
  LoanCalculationResult,
  MonthlyPaymentBreakdown,
  ClosingCostsBreakdown,
  GhlConfig,
  VaUsage,
} from '../schemas';
import {
  calculateMonthlyPI,
  calculateLTV,
  calculateLoanAmount,
  calculateDownPaymentFromPercent,
  calculateDownPaymentPercent,
  calculateMonthlyPropertyTax,
  calculateMonthlyInsurance,
  calculatePrepaidInterest,
  calculateTaxReserves,
  calculateInsuranceReserves,
  calculateTotalMonthlyPayment,
  calculateCashToClose,
  roundToCents,
} from './common';

/**
 * Get VA Funding Fee rate based on usage, down payment, and loan type.
 * Returns the rate as a percentage (e.g., 2.15 for 2.15%).
 */
export function getVaFundingFeeRate(
  usage: VaUsage,
  downPaymentPercent: number,
  isIrrrl: boolean,
  isCashOut: boolean,
  config: GhlConfig
): number {
  // IRRRL (streamline) has a fixed low rate
  if (isIrrrl) {
    return config.va.ffIrrrl;
  }

  // Cash-out refinance
  if (isCashOut) {
    return usage === 'first'
      ? config.va.ffCashoutFirst
      : config.va.ffCashoutSubseq;
  }

  // Purchase or rate/term refinance - based on down payment tier
  if (usage === 'first') {
    if (downPaymentPercent >= 10) {
      return config.va.ffFirstLe90;
    } else if (downPaymentPercent >= 5) {
      return config.va.ffFirst90to95;
    }
    return config.va.ffFirstGt95;
  } else {
    // Subsequent use
    if (downPaymentPercent >= 10) {
      return config.va.ffSubseqLe90;
    } else if (downPaymentPercent >= 5) {
      return config.va.ffSubseq90to95;
    }
    return config.va.ffSubseqGt95;
  }
}

/**
 * Calculate VA Funding Fee amount.
 */
export function calculateVaFundingFee(
  baseLoanAmount: number,
  fundingFeeRate: number,
  isDisabledVeteran: boolean
): number {
  // Funding fee is waived for disabled veterans
  if (isDisabledVeteran) return 0;
  return roundToCents(baseLoanAmount * (fundingFeeRate / 100));
}

/**
 * Calculate VA closing costs breakdown.
 */
export function calculateVaClosingCosts(
  baseLoanAmount: number,
  propertyValue: number,
  interestRate: number,
  propertyTaxAnnual: number,
  homeInsuranceAnnual: number,
  fundingFeeAmount: number,
  config: GhlConfig
): ClosingCostsBreakdown {
  const { fees, prepaids } = config;

  // Section A - Lender Fees
  // VA loans have restrictions on what fees can be charged
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
    fees.courier +
    fees.ownerTitlePolicy +
    fees.lenderTitlePolicy +
    fees.pestInspection +
    fees.propertyInspection +
    fees.poolInspection;

  // Section C - Prepaids
  const totalLoanAmount = baseLoanAmount + fundingFeeAmount;
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

  const totalCredits = 0;
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

    ownerTitlePolicy: fees.ownerTitlePolicy,
    lenderTitlePolicy: fees.lenderTitlePolicy,
    escrowFee: fees.settlement,
    notaryFee: fees.notary,
    recordingFee: fees.recording,
    courierFee: fees.courier,
    pestInspectionFee: fees.pestInspection,
    propertyInspectionFee: fees.propertyInspection,
    poolInspectionFee: fees.poolInspection,
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
 * Calculate VA purchase loan.
 */
export function calculateVaPurchase(
  input: VaPurchaseInput,
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
    vaUsage,
    isDisabledVeteran,
  } = input;

  // Calculate down payment (VA allows 0% down)
  const downPayment = downPaymentAmount
    ? downPaymentAmount
    : calculateDownPaymentFromPercent(salesPrice, downPaymentPercent || 0);

  const baseLoanAmount = calculateLoanAmount(salesPrice, downPayment);
  const ltv = calculateLTV(baseLoanAmount, salesPrice);
  const dpPercent = calculateDownPaymentPercent(salesPrice, downPayment);

  // Calculate VA Funding Fee
  const fundingFeeRate = getVaFundingFeeRate(
    vaUsage,
    dpPercent,
    false, // not IRRRL
    false, // not cash-out
    config
  );
  const fundingFeeAmount = calculateVaFundingFee(
    baseLoanAmount,
    fundingFeeRate,
    isDisabledVeteran
  );

  // Total loan includes financed funding fee
  const totalLoanAmount = baseLoanAmount + fundingFeeAmount;

  // Calculate monthly P&I
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  // VA has NO monthly mortgage insurance!
  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual);

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: 0, // VA has no monthly MI
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly,
    floodInsurance: floodInsuranceMonthly,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: 0,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly,
      floodInsurance: floodInsuranceMonthly,
    }),
  };

  const closingCosts = calculateVaClosingCosts(
    baseLoanAmount,
    salesPrice,
    interestRate,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    fundingFeeAmount,
    config
  );

  // Cash to close (funding fee is financed)
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
    vaFundingFee: fundingFeeAmount,
  };
}

/**
 * Calculate VA refinance loan.
 */
export function calculateVaRefinance(
  input: VaRefinanceInput,
  config: GhlConfig
): LoanCalculationResult {
  const {
    propertyValue,
    existingLoanBalance,
    newLoanAmount,
    interestRate,
    termYears,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaDuesMonthly,
    isIrrrl,
    vaUsage,
    isDisabledVeteran,
    cashOutAmount,
  } = input;

  const ltv = calculateLTV(newLoanAmount, propertyValue);
  const isCashOut = (cashOutAmount || 0) > 0;

  // Calculate VA Funding Fee
  const fundingFeeRate = getVaFundingFeeRate(
    vaUsage,
    0, // No down payment on refi
    isIrrrl,
    isCashOut,
    config
  );
  const fundingFeeAmount = calculateVaFundingFee(
    newLoanAmount,
    fundingFeeRate,
    isDisabledVeteran
  );

  const totalLoanAmount = newLoanAmount + fundingFeeAmount;

  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual);

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: 0,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly,
    floodInsurance: 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: 0,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly,
    }),
  };

  const closingCosts = calculateVaClosingCosts(
    newLoanAmount,
    propertyValue,
    interestRate,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    fundingFeeAmount,
    config
  );

  // Calculate cash to close
  // Cash needed = Existing Loan + Closing Costs - New Loan
  // Negative value means cash back to borrower (proceeds)
  const cashToClose = roundToCents(
    existingLoanBalance + closingCosts.netClosingCosts - newLoanAmount
  );

  return {
    loanAmount: newLoanAmount,
    totalLoanAmount,
    ltv,
    downPayment: 0,
    monthlyPayment,
    closingCosts,
    cashToClose,
    vaFundingFee: fundingFeeAmount,
  };
}
