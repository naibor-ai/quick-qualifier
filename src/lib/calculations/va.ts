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
  BasePurchaseInput,
  BaseRefinanceInput,
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
  calculateOriginationFee,
  calculateAPR,
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
/**
 * Calculate VA closing costs breakdown.
 */
export function calculateVaClosingCosts(
  baseLoanAmount: number,
  propertyValue: number,
  interestRate: number,
  propertyTaxMonthly: number,
  homeInsuranceMonthly: number,
  fundingFeeAmount: number,
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
  const poolInspectionFee = feeOverrides?.poolInspectionFee ?? 0;
  const transferTax = feeOverrides?.transferTax ?? 0;
  const mortgageTax = feeOverrides?.mortgageTax ?? 0;

  // Section A - Lender Fees
  const totalLenderFees =
    loanFee +
    docPrepFee +
    processingFee +
    underwritingFee +
    appraisalFee +
    creditReportFee +
    floodCertFee +
    taxServiceFee;

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    escrowFee +
    notaryFee +
    recordingFee +
    ownerTitlePolicy +
    lenderTitlePolicy +
    pestInspectionFee +
    propertyInspectionFee +
    transferTax +
    mortgageTax;

  // Section C - Prepaids
  const totalLoanAmount = baseLoanAmount + fundingFeeAmount;

  // 1. Prepaid Interest (15 days dynamic)
  const prepaidInterest = prepaidOptions?.interestAmount || calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    interestDays
  );

  // 2. Prepaid Property Tax (6 months)
  const calculatedTaxReserves = roundToCents(((propertyValue || 0) * 0.0125 / 12) * taxMonths);
  const taxReserves = prepaidOptions?.taxAmount || calculatedTaxReserves;

  // 3. Prepaid Insurance (15 months)
  const calculatedInsuranceReserves = roundToCents(((propertyValue || 0) * 0.0035 / 12) * insuranceMonths);
  const insuranceReserves = prepaidOptions?.insuranceAmount || calculatedInsuranceReserves;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  const totalCredits = sellerCreditAmount + lenderCreditAmount;
  const calculatedTotalClosingCosts =
    totalLenderFees + totalThirdPartyFees + totalPrepaids;

  let totalClosingCosts = calculatedTotalClosingCosts;
  let adjustment = 0;

  if (closingCostsTotalOverride && closingCostsTotalOverride > 0) {
    totalClosingCosts = closingCostsTotalOverride;
    adjustment = totalClosingCosts - calculatedTotalClosingCosts;
  }

  const netClosingCosts = totalClosingCosts - totalCredits;

  return {
    originationFee: 0,
    loanFee,
    adminFee: 0,
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

    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays: interestDays,
    prepaidTaxMonths: taxMonths,
    prepaidInsuranceMonths: insuranceMonths,
    adjustment: roundToCents(adjustment),
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
    propertyTaxMonthly,
    homeInsuranceMonthly,
    hoaDuesMonthly,
    floodInsuranceMonthly,
    vaUsage,
    isDisabledVeteran,
    prepaidInterestDays = 15,
    prepaidTaxMonths = 6,
    prepaidInsuranceMonths = 15,
  } = input;

  // Calculate down payment (VA allows 0% down)
  const downPayment = downPaymentAmount
    ? downPaymentAmount
    : calculateDownPaymentFromPercent(salesPrice || 0, downPaymentPercent || 0);

  const baseLoanAmount = calculateLoanAmount(salesPrice || 0, downPayment);
  const ltv = calculateLTV(baseLoanAmount, salesPrice || 0);
  const dpPercent = calculateDownPaymentPercent(salesPrice || 0, downPayment);

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
  // Formula: P * R * (1 + R)^N / ((1 + R)^N - 1)
  // P = Total Loan Amount (Base + FF)
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate || 0,
    termYears
  );

  // VA has NO monthly mortgage insurance!

  // Use user-provided monthly values, fallback to dynamic calculation based on sales price
  const monthlyTax = propertyTaxMonthly || roundToCents(((salesPrice || 0) * 0.0125) / 12);
  const monthlyInsurance = homeInsuranceMonthly || roundToCents(((salesPrice || 0) * 0.0035) / 12);

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: 0, // VA has no monthly MI
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly || 0,
    floodInsurance: floodInsuranceMonthly || 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: 0,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly || 0,
      floodInsurance: floodInsuranceMonthly || 0,
    }),
  };

  const closingCosts = calculateVaClosingCosts(
    baseLoanAmount,
    salesPrice || 0,
    interestRate || 0,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    fundingFeeAmount,
    config,
    input.loanFee || 0,
    input.sellerCreditAmount || 0,
    input.lenderCreditAmount || 0,
    {
      interestDays: prepaidInterestDays,
      taxMonths: prepaidTaxMonths,
      insuranceMonths: prepaidInsuranceMonths,
      interestAmount: input.prepaidInterestAmount,
      taxAmount: input.prepaidTaxAmount,
      insuranceAmount: input.prepaidInsuranceAmount,
    },
    input.closingCostsTotal,
    input
  );

  // Cash to close (funding fee is financed)
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
    vaFundingFee: fundingFeeAmount,
    // Reporting fields
    propertyValue: salesPrice || 0,
    interestRate: interestRate || 0,
    apr,
    term: termYears,
    downPaymentPercent: dpPercent,
    monthlyMiRate: 0,
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
    propertyTaxMonthly,
    homeInsuranceMonthly,
    hoaDuesMonthly,
    isIrrrl,
    vaUsage,
    isDisabledVeteran,
    cashOutAmount,
    prepaidInterestDays = 15,
    prepaidTaxMonths = 0,
    prepaidInsuranceMonths = 0,
  } = input;

  const { feesRefi, prepaids } = config;
  const fees = feesRefi || config.fees;

  const ltv = calculateLTV(newLoanAmount, propertyValue);
  const isCashOut = (cashOutAmount || 0) > 0;

  // VA FF
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
  const lenderTitlePolicy = input.lenderTitlePolicy ?? 1115;
  const mortgageTax = input.mortgageTax ?? 0;

  // Loan Fee
  const loanFee = input.loanFee || 0;
  const originationFee = 0;

  const totalLenderFees =
    loanFee +
    originationFee +
    processingFee +
    underwritingFee +
    appraisalFee +
    creditReportFee +
    floodCertFee +
    taxServiceFee +
    docPrepFee;

  // Section B - Third Party Fees
  const totalThirdPartyFees =
    escrowFee +
    notaryFee +
    recordingFee +
    lenderTitlePolicy;

  // Prepaids
  const calculatedPrepaidInterest = calculatePrepaidInterest(
    totalLoanAmount,
    interestRate,
    prepaidInterestDays
  );
  const prepaidInterest = input.prepaidInterestAmount || calculatedPrepaidInterest;

  // Use actual property tax and insurance inputs if provided
  const calculatedTaxReserves = roundToCents(propertyTaxMonthly * prepaidTaxMonths);
  const taxReserves = input.prepaidTaxAmount || calculatedTaxReserves;

  const calculatedInsuranceReserves = roundToCents(homeInsuranceMonthly * prepaidInsuranceMonths);
  const insuranceReserves = input.prepaidInsuranceAmount || calculatedInsuranceReserves;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  const calculatedTotalClosingCosts = totalLenderFees + totalThirdPartyFees + totalPrepaids;

  let totalClosingCosts = calculatedTotalClosingCosts;
  let adjustment = 0;

  if (input.closingCostsTotal && input.closingCostsTotal > 0) {
    totalClosingCosts = input.closingCostsTotal;
    adjustment = totalClosingCosts - calculatedTotalClosingCosts;
  }

  const netClosingCosts = totalClosingCosts;

  // Monthly Payment
  // Request: Breakdown show ONLY P&I. Image shows "Total Payment" = P&I.
  // So we zero out others for the total calculation.
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate,
    termYears
  );

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: 0,
    propertyTax: 0, // Zeroed for Image Match
    homeInsurance: 0, // Zeroed for Image Match
    hoaDues: 0, // Zeroed for Image Match
    floodInsurance: 0,
    totalMonthly: principalAndInterest, // Total matches P&I
  };

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

    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays,
    prepaidTaxMonths,
    prepaidInsuranceMonths,
    adjustment: roundToCents(adjustment),
  };

  // Cash To Close
  const amountNeeded = existingLoanBalance + netClosingCosts + fundingFeeAmount;
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
    vaFundingFee: fundingFeeAmount,
    // Reporting fields
    propertyValue: propertyValue || 0,
    interestRate: interestRate || 0,
    apr,
    term: termYears,
    downPaymentPercent: 0,
    monthlyMiRate: 0,
  };
}
