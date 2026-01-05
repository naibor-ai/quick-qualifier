/**
 * Conventional Loan Calculator
 * Handles both Purchase and Refinance scenarios.
 */

import type {
  ConventionalPurchaseInput,
  ConventionalRefinanceInput,
  LoanCalculationResult,
  MonthlyPaymentBreakdown,
  ClosingCostsBreakdown,
  GhlConfig,
  CreditScoreTier,
  PmiType,
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
  calculateOriginationFee,
  calculateSellerCredit,
  getLtvTier,
  isHighBalanceLoan,
  roundToCents,
} from './common';

/**
 * Look up PMI rate from config based on LTV, credit score, and loan balance.
 */
export function lookupPmiRate(
  ltv: number,
  creditTier: CreditScoreTier,
  loanAmount: number,
  pmiType: PmiType,
  config: GhlConfig,
  downPaymentPercent: number
): number {
  // Use user-defined threshold (LTV > 80% requires PMI)
  // Fix: 19% down is 81% LTV, which must show PMI
  if (downPaymentPercent >= 20 || ltv <= 80) return 0;

  const conformingLimit = config.limits.conforming || 766550;
  const isJumbo = loanAmount > conformingLimit;

  if (isJumbo) {
    // JUMBO RATES
    if (ltv >= 95) return 0.75;
    if (ltv >= 90) return 0.55;
    if (ltv > 80) return 0.39;
  } else {
    // CONFORMING RATES
    if (ltv >= 95) {
      // New secondary threshold for high-LTV conforming loans
      return loanAmount > 500000 ? 0.41 : 0.55;
    } else if (ltv >= 90) {
      return 0.52;
    } else if (ltv > 80) {
      return 0.19;
    }
  }

  return 0;
}

/**
 * Calculate monthly PMI amount.
 */
export function calculateMonthlyPmi(
  loanAmount: number,
  pmiRateAnnual: number
): number {
  if (pmiRateAnnual <= 0) return 0;
  // Proper formula derived from user examples:
  // 1. Monthly rate is annual rate / 1200
  // 2. Truncate monthly rate to 8 decimal places
  // 3. Final monthly payment is floored to 2 decimal places
  const monthlyRateRaw = pmiRateAnnual / 1200;
  const monthlyRateTruncated = Math.floor(monthlyRateRaw * 100000000) / 100000000;
  return Math.floor(loanAmount * monthlyRateTruncated * 100) / 100;
}

/**
 * Calculate single premium PMI (upfront payment).
 */
export function calculateSinglePremiumPmi(
  loanAmount: number,
  pmiRatePercent: number
): number {
  if (pmiRatePercent <= 0) return 0;
  return roundToCents(loanAmount * (pmiRatePercent / 100));
}

/**
 * Calculate closing costs breakdown for conventional purchase.
 */
export function calculateConventionalClosingCosts(
  loanAmount: number,
  salesPrice: number,
  interestRate: number,
  propertyTaxMonthly: number,
  homeInsuranceMonthly: number,
  sellerCreditAmount: number,
  sellerCreditPercent: number | undefined,
  lenderCreditAmount: number,
  loanFee: number,
  config: GhlConfig,
  prepaidOptions?: {
    interestDays?: number;
    taxMonths?: number;
    insuranceMonths?: number;
    interestAmount?: number;
    taxAmount?: number;
    insuranceAmount?: number;
  },
  closingCostsTotalOverride?: number
): ClosingCostsBreakdown {
  const { fees, prepaids } = config;

  const interestDays = prepaidOptions?.interestDays ?? 15;
  const taxMonths = prepaidOptions?.taxMonths ?? 6;
  const insuranceMonths = prepaidOptions?.insuranceMonths ?? 15;

  // Section A - Lender Fees

  // Fixed values from image
  const manualFees = {
    docPrep: 295,
    processing: 995,
    underwriting: 1495,
    appraisal: 650,
    creditReport: 150,
    floodCert: 30,
    taxService: 85,
    ownerTitlePolicy: 1730,
    lenderTitlePolicy: 1225,
    settlement: 1115, // Escrow/closing fee
    pestInspection: 150,
    propertyInspection: 450,
    poolInspection: 100,
    notary: 350,
    recording: 275,
    transferTax: 0,
    mortgageTax: 0
  };

  // Section A - Lender Fees
  // Origination fee removed as per user request (Origination Fee and Loan Fee are considered same)
  const originationFee = 0;

  // Admin fee removed as per request
  const adminFee = 0;
  const processingFee = manualFees.processing;
  const underwritingFee = manualFees.underwriting;
  const appraisalFee = manualFees.appraisal;
  const creditReportFee = manualFees.creditReport;
  const floodCertFee = manualFees.floodCert;
  const taxServiceFee = manualFees.taxService;
  const docPrepFee = manualFees.docPrep;

  const totalLenderFees =
    loanFee +
    originationFee +
    adminFee +
    processingFee +
    underwritingFee +
    appraisalFee +
    creditReportFee +
    floodCertFee +
    taxServiceFee +
    docPrepFee;

  // Section B - Third Party Fees
  const settlementFee = manualFees.settlement;
  const notaryFee = manualFees.notary;
  const recordingFee = manualFees.recording;
  const courierFee = 0; // Image did not have courier fee
  const ownerTitlePolicy = manualFees.ownerTitlePolicy;
  const lenderTitlePolicy = manualFees.lenderTitlePolicy;
  const pestInspectionFee = manualFees.pestInspection;
  const propertyInspectionFee = manualFees.propertyInspection;
  const poolInspectionFee = manualFees.poolInspection;
  const transferTax = manualFees.transferTax;
  const mortgageTax = manualFees.mortgageTax;

  const totalThirdPartyFees =
    settlementFee +
    notaryFee +
    recordingFee +
    courierFee +
    ownerTitlePolicy +
    lenderTitlePolicy +
    pestInspectionFee +
    propertyInspectionFee +
    poolInspectionFee +
    transferTax +
    mortgageTax;

  // Section C - Prepaids
  // Formula: (loan amount * interestRate / 365 * days)
  const prepaidInterest = prepaidOptions?.interestAmount || calculatePrepaidInterest(
    loanAmount || 0,
    interestRate || 0,
    interestDays
  );

  const calculatedTaxReserves = roundToCents(((salesPrice || 0) * 0.0125 / 12) * taxMonths);
  const taxReserves = prepaidOptions?.taxAmount || calculatedTaxReserves;

  const calculatedInsuranceReserves = roundToCents(((salesPrice || 0) * 0.0035 / 12) * insuranceMonths);
  const insuranceReserves = prepaidOptions?.insuranceAmount || calculatedInsuranceReserves;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  // Section D - Credits
  const sellerCredit = sellerCreditPercent
    ? calculateSellerCredit(salesPrice || 0, sellerCreditPercent)
    : (sellerCreditAmount || 0);
  const totalCredits = sellerCredit + (lenderCreditAmount || 0);

  // Totals
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
    // Section A
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

    // Section B
    ownerTitlePolicy,
    lenderTitlePolicy,
    escrowFee: settlementFee,
    notaryFee,
    recordingFee,
    courierFee,
    pestInspectionFee,
    propertyInspectionFee,
    poolInspectionFee,
    transferTax,
    mortgageTax,
    totalThirdPartyFees: roundToCents(totalThirdPartyFees),

    // Section C
    prepaidInterest,
    taxReserves,
    insuranceReserves,
    totalPrepaids: roundToCents(totalPrepaids),

    // Section D
    sellerCredit,
    lenderCredit: lenderCreditAmount || 0,
    totalCredits: roundToCents(totalCredits),

    // Totals
    totalClosingCosts: roundToCents(totalClosingCosts),
    netClosingCosts: roundToCents(netClosingCosts),

    prepaidInterestDays: interestDays,
    prepaidTaxMonths: taxMonths,
    prepaidInsuranceMonths: insuranceMonths,
    adjustment: roundToCents(adjustment),
  };
}

/**
 * Calculate conventional purchase loan.
 */
export function calculateConventionalPurchase(
  input: ConventionalPurchaseInput,
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
    creditScoreTier,
    pmiType,
    sellerCreditAmount,
    sellerCreditPercent,
    lenderCreditAmount,
    depositAmount,
  } = input;

  // Calculate down payment and loan amount
  const downPayment = downPaymentAmount
    ? downPaymentAmount
    : calculateDownPaymentFromPercent(salesPrice || 0, downPaymentPercent || 0);

  const loanAmount = calculateLoanAmount(salesPrice || 0, downPayment);
  const ltv = calculateLTV(loanAmount, salesPrice || 0);

  // Calculate PMI
  const pmiRate = lookupPmiRate(
    ltv,
    creditScoreTier,
    loanAmount,
    pmiType,
    config,
    downPaymentPercent ?? 0
  );

  let monthlyPmi = 0;
  let totalLoanAmount = loanAmount;

  if (pmiType === 'monthly') {
    monthlyPmi = calculateMonthlyPmi(loanAmount, pmiRate);
  } else if (pmiType === 'single_financed') {
    // Single premium financed into loan
    const singlePremium = calculateSinglePremiumPmi(loanAmount, pmiRate);
    totalLoanAmount = loanAmount + singlePremium;
  }
  // For single_cash, premium is added to closing costs (handled below)

  // Calculate monthly P&I
  const principalAndInterest = calculateMonthlyPI(
    totalLoanAmount,
    interestRate || 0,
    termYears
  );

  // Calculate monthly escrows - use user input values instead of automatic calculations
  const monthlyTax = propertyTaxMonthly || roundToCents(((salesPrice || 0) * 0.0125) / 12);
  const monthlyInsurance = homeInsuranceMonthly || roundToCents(((salesPrice || 0) * 0.0035) / 12);

  // Build monthly payment breakdown
  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyPmi,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly || 0,
    floodInsurance: floodInsuranceMonthly || 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyPmi,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly || 0,
      floodInsurance: floodInsuranceMonthly || 0,
    }),
  };

  // Calculate closing costs
  const closingCosts = calculateConventionalClosingCosts(
    loanAmount,
    salesPrice || 0,
    interestRate || 0,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    sellerCreditAmount || 0,
    sellerCreditPercent,
    lenderCreditAmount || 0,
    input.loanFee || 0,
    config,
    {
      interestDays: input.prepaidInterestDays,
      taxMonths: input.prepaidTaxMonths,
      insuranceMonths: input.prepaidInsuranceMonths,
      interestAmount: input.prepaidInterestAmount,
      taxAmount: input.prepaidTaxAmount,
      insuranceAmount: input.prepaidInsuranceAmount,
    },
    input.closingCostsTotal
  );

  // Add single premium PMI to closing costs if paid in cash
  let adjustedClosingCosts = closingCosts;
  if (pmiType === 'single_cash') {
    const singlePremium = calculateSinglePremiumPmi(loanAmount, pmiRate);
    adjustedClosingCosts = {
      ...closingCosts,
      totalClosingCosts: roundToCents(
        closingCosts.totalClosingCosts + singlePremium
      ),
      netClosingCosts: roundToCents(closingCosts.netClosingCosts + singlePremium),
    };
  }

  // Calculate cash to close
  const initialCashToClose = calculateCashToClose(
    downPayment,
    adjustedClosingCosts.totalClosingCosts,
    adjustedClosingCosts.totalCredits
  );

  const cashToClose = roundToCents(initialCashToClose - (depositAmount || 0));

  return {
    loanAmount,
    totalLoanAmount,
    ltv,
    downPayment,
    monthlyPayment,
    closingCosts: adjustedClosingCosts,
    cashToClose,
    pmiRate,
  };
}

/**
 * Calculate conventional refinance loan.
 */
export function calculateConventionalRefinance(
  input: ConventionalRefinanceInput,
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
    mortgageInsuranceMonthly,
    creditScoreTier,
    refinanceType,
    prepaidInterestDays = 15,
    prepaidTaxMonths = 0,
    prepaidInsuranceMonths = 0,
  } = input;

  // Use manual fees as per request (matching Second Image)
  // Loan fee passed from input
  const loanFee = input.loanFee || 0;

  const manualFees = {
    docPrep: 595,
    processing: 895,
    underwriting: 995,
    taxService: 59,
    floodCert: 30,
    appraisal: 650,
    creditReport: 150,
    lenderTitlePolicy: 1015,
    settlement: 400, // Escrow Fee
    notary: 350,
    recording: 275,
    // All others are 0
    pestInspection: 0,
    propertyInspection: 0,
    poolInspection: 0,
    transferTax: 0,
    mortgageTax: 0,
    ownerTitlePolicy: 0
  };

  const ltv = calculateLTV(newLoanAmount || 0, propertyValue || 0);

  // Calculate PMI
  const pmiRate = lookupPmiRate(
    ltv,
    creditScoreTier,
    newLoanAmount || 0,
    'monthly',
    config,
    100 - ltv
  );
  const monthlyPmi = calculateMonthlyPmi(newLoanAmount || 0, pmiRate);

  // Calculate monthly P&I
  // Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = (interestRate || 0) / 100 / 12;
  const n = termYears * 12;
  const principalAndInterest =
    monthlyRate === 0
      ? (newLoanAmount || 0) / n
      : ((newLoanAmount || 0) * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);

  // Monthly escrows
  const monthlyTax = propertyTaxMonthly;
  const monthlyInsurance = homeInsuranceMonthly;

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyPmi,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly || 0,
    floodInsurance: 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyPmi,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly || 0,
      floodInsurance: 0,
    }),
  };

  // Refinance Closing Costs
  // Section A - Lender Fees
  // Origination fee removed as per user request (Origination Fee and Loan Fee are considered same)
  const originationFee = 0;
  const adminFee = 0;
  const processingFee = manualFees.processing;
  const underwritingFee = manualFees.underwriting;
  const appraisalFee = manualFees.appraisal;
  const creditReportFee = manualFees.creditReport;
  const floodCertFee = manualFees.floodCert;
  const taxServiceFee = manualFees.taxService;
  const docPrepFee = manualFees.docPrep;

  const totalLenderFees =
    loanFee +
    originationFee +
    adminFee +
    processingFee +
    underwritingFee +
    appraisalFee +
    creditReportFee +
    floodCertFee +
    taxServiceFee +
    docPrepFee;

  // Section B - Third Party Fees
  const settlementFee = manualFees.settlement;
  const notaryFee = manualFees.notary;
  const recordingFee = manualFees.recording;
  const courierFee = 0;
  const lenderTitlePolicy = manualFees.lenderTitlePolicy;

  // Excluded fees for Refi
  const ownerTitlePolicy = 0;
  const pestInspectionFee = 0;
  const propertyInspectionFee = 0;
  const poolInspectionFee = 0;
  const transferTax = 0;
  const mortgageTax = 0;

  const totalThirdPartyFees =
    settlementFee +
    notaryFee +
    recordingFee +
    courierFee +
    lenderTitlePolicy +
    ownerTitlePolicy +
    pestInspectionFee +
    propertyInspectionFee +
    poolInspectionFee +
    transferTax +
    mortgageTax;

  // Section C - Prepaids
  // Prepaid Interest
  // Formula: Loan Amount * (APR / 100 / 365) * Days
  const dailyRate = (interestRate || 0) / 100 / 365;
  const calculatedPrepaidInterest = roundToCents((newLoanAmount || 0) * dailyRate * prepaidInterestDays);
  const prepaidInterest = input.prepaidInterestAmount || calculatedPrepaidInterest;

  // Use actual property tax and insurance inputs if provided (default input is 0 for Refi but form might send overrides)
  const monthlyTaxAmt = propertyTaxMonthly;
  const monthlyInsAmt = homeInsuranceMonthly;

  const calculatedTaxReserves = roundToCents(monthlyTaxAmt * prepaidTaxMonths);
  const taxReserves = input.prepaidTaxAmount || calculatedTaxReserves;

  const calculatedInsuranceReserves = roundToCents(monthlyInsAmt * prepaidInsuranceMonths);
  const insuranceReserves = input.prepaidInsuranceAmount || calculatedInsuranceReserves;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  const totalCredits = 0;
  const calculatedTotalClosingCosts = totalLenderFees + totalThirdPartyFees + totalPrepaids;

  let totalClosingCosts = calculatedTotalClosingCosts;
  let adjustment = 0;

  if (input.closingCostsTotal && input.closingCostsTotal > 0) {
    totalClosingCosts = input.closingCostsTotal;
    adjustment = totalClosingCosts - calculatedTotalClosingCosts;
  }

  const netClosingCosts = totalClosingCosts - totalCredits;

  const closingCosts: ClosingCostsBreakdown = {
    loanFee, // Added to Refi result
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
    escrowFee: settlementFee,
    notaryFee,
    recordingFee,
    courierFee,
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

  // Calculate cash to close
  // Cash To Close = Amount Needed - New Loan
  // Amount Needed = Payoff + Costs + Prepaids
  const amountNeeded = (existingLoanBalance || 0) + closingCosts.netClosingCosts;
  const cashToClose = roundToCents(amountNeeded - (newLoanAmount || 0));

  return {
    loanAmount: newLoanAmount,
    totalLoanAmount: newLoanAmount,
    ltv,
    downPayment: 0, // No down payment on refinance
    monthlyPayment,
    closingCosts,
    cashToClose,
    pmiRate,
  };
}
