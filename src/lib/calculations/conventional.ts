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
  config: GhlConfig
): number {
  const ltvTier = getLtvTier(ltv);

  // No PMI needed if LTV <= 80%
  if (!ltvTier) return 0;

  const isHighBalance = isHighBalanceLoan(loanAmount, config.limits.conforming);
  const factorTable = isHighBalance
    ? config.miFactors.highBalance
    : config.miFactors.standard;

  const rateTable =
    pmiType === 'monthly' ? factorTable.monthly : factorTable.single;

  // Get rate from lookup table
  const ltvRates = rateTable[ltvTier];
  if (!ltvRates) return 0;

  const rate = ltvRates[creditTier];
  return rate || 0;
}

/**
 * Calculate monthly PMI amount.
 */
export function calculateMonthlyPmi(
  loanAmount: number,
  pmiRateAnnual: number
): number {
  if (pmiRateAnnual <= 0) return 0;
  return roundToCents((loanAmount * (pmiRateAnnual / 100)) / 12);
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
  propertyTaxAnnual: number,
  homeInsuranceAnnual: number,
  originationPoints: number,
  sellerCreditAmount: number,
  sellerCreditPercent: number | undefined,
  lenderCreditAmount: number,
  config: GhlConfig
): ClosingCostsBreakdown {
  const { fees, prepaids } = config;

  // Fee overrides based on user request (Conventional Sale specific)
  // Loan fee is dynamic 1% of LOAN AMOUNT
  const loanFee = roundToCents((loanAmount || 0) * 0.01);

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
  // Origination fee comes dynamically from the form input (points)
  const originationFee = calculateOriginationFee(loanAmount || 0, originationPoints || 0);

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
  // Formula: (loan amount * interestRate / 365 * 15)
  const prepaidInterest = calculatePrepaidInterest(
    loanAmount || 0,
    interestRate || 0,
    15 // Fixed 15 days as per request
  );

  // Formula: (Sales Price * 1.25% / 2) which is 6 months of 1.25% annual
  const taxReserves = roundToCents(((salesPrice || 0) * 0.0125) / 2);

  // Formula: (sales price * 0.4375%)
  const insuranceReserves = roundToCents((salesPrice || 0) * 0.004375);

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  // Section D - Credits
  const sellerCredit = sellerCreditPercent
    ? calculateSellerCredit(salesPrice || 0, sellerCreditPercent)
    : (sellerCreditAmount || 0);
  const totalCredits = sellerCredit + (lenderCreditAmount || 0);

  // Totals
  const totalClosingCosts =
    totalLenderFees + totalThirdPartyFees + totalPrepaids;
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
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaDuesMonthly,
    floodInsuranceMonthly,
    creditScoreTier,
    pmiType,
    sellerCreditAmount,
    sellerCreditPercent,
    lenderCreditAmount,
    originationPoints,
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
    config
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

  // Calculate monthly escrows
  const monthlyTax = roundToCents(((salesPrice || 0) * 0.0125) / 12);
  const monthlyInsurance = roundToCents(((salesPrice || 0) * 0.0035) / 12);

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
    propertyTaxAnnual || 0,
    homeInsuranceAnnual || 0,
    originationPoints || 0,
    sellerCreditAmount || 0,
    sellerCreditPercent,
    lenderCreditAmount || 0,
    config
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
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaDuesMonthly,
    creditScoreTier,
    refinanceType,
    originationPoints,
  } = input;

  // Use manual fees as per request (matching Second Image)
  // Loan fee = 1% of newLoanAmount
  const loanFee = roundToCents((newLoanAmount || 0) * 0.01);

  const manualFees = {
    docPrep: 595,
    processing: 895,
    underwriting: 995,
    taxService: 59,
    floodCert: 30,
    appraisal: 650,
    creditReport: 150,
    lenderTitlePolicy: 1050,
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
    config
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
  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual || 0);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual || 0);

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
  const originationFee = calculateOriginationFee(newLoanAmount || 0, originationPoints || 0);
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
  // Prepaid Interest (30 days)
  // Formula: Loan Amount * (APR / 100 / 365) * Days
  const dailyRate = (interestRate || 0) / 100 / 365;
  const prepaidInterest = roundToCents((newLoanAmount || 0) * dailyRate * 30);

  // Remove Prepaid Tax & Insurance for Conv Refi as requested
  const taxReserves = 0;
  const insuranceReserves = 0;

  const totalPrepaids = prepaidInterest + taxReserves + insuranceReserves;

  const totalCredits = 0;
  const totalClosingCosts = totalLenderFees + totalThirdPartyFees + totalPrepaids;
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
