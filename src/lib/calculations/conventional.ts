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

  // Section A - Lender Fees
  const originationFee = calculateOriginationFee(loanAmount, originationPoints);
  const totalLenderFees =
    originationFee +
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
  const prepaidInterest = calculatePrepaidInterest(
    loanAmount,
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

  // Section D - Credits
  const sellerCredit = sellerCreditPercent
    ? calculateSellerCredit(salesPrice, sellerCreditPercent)
    : sellerCreditAmount;
  const totalCredits = sellerCredit + lenderCreditAmount;

  // Totals
  const totalClosingCosts =
    totalLenderFees + totalThirdPartyFees + totalPrepaids;
  const netClosingCosts = totalClosingCosts - totalCredits;

  return {
    // Section A
    originationFee,
    adminFee: fees.admin,
    processingFee: fees.processing,
    underwritingFee: fees.underwriting,
    appraisalFee: fees.appraisal,
    creditReportFee: fees.creditReport,
    floodCertFee: fees.floodCert,
    taxServiceFee: fees.taxService,
    totalLenderFees: roundToCents(totalLenderFees),

    // Section B
    titleInsurance: fees.docPrep, // Simplified - typically based on loan amount
    escrowFee: fees.settlement,
    notaryFee: fees.notary,
    recordingFee: fees.recording,
    courierFee: fees.courier,
    totalThirdPartyFees: roundToCents(totalThirdPartyFees),

    // Section C
    prepaidInterest,
    taxReserves,
    insuranceReserves,
    totalPrepaids: roundToCents(totalPrepaids),

    // Section D
    sellerCredit,
    lenderCredit: lenderCreditAmount,
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
  } = input;

  // Calculate down payment and loan amount
  const downPayment = downPaymentAmount
    ? downPaymentAmount
    : calculateDownPaymentFromPercent(salesPrice, downPaymentPercent || 0);

  const loanAmount = calculateLoanAmount(salesPrice, downPayment);
  const ltv = calculateLTV(loanAmount, salesPrice);

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
    interestRate,
    termYears
  );

  // Calculate monthly escrows
  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual);

  // Build monthly payment breakdown
  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyPmi,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly,
    floodInsurance: floodInsuranceMonthly,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyPmi,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly,
      floodInsurance: floodInsuranceMonthly,
    }),
  };

  // Calculate closing costs
  const closingCosts = calculateConventionalClosingCosts(
    loanAmount,
    salesPrice,
    interestRate,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    originationPoints,
    sellerCreditAmount,
    sellerCreditPercent,
    lenderCreditAmount,
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
  const cashToClose = calculateCashToClose(
    downPayment,
    adjustedClosingCosts.totalClosingCosts,
    adjustedClosingCosts.totalCredits
  );

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
  } = input;

  const ltv = calculateLTV(newLoanAmount, propertyValue);

  // Calculate PMI (only for rate/term or cash-out if LTV > 80%)
  const pmiRate = lookupPmiRate(
    ltv,
    creditScoreTier,
    newLoanAmount,
    'monthly',
    config
  );
  const monthlyPmi = calculateMonthlyPmi(newLoanAmount, pmiRate);

  // Calculate monthly P&I
  const principalAndInterest = calculateMonthlyPI(
    newLoanAmount,
    interestRate,
    termYears
  );

  // Monthly escrows
  const monthlyTax = calculateMonthlyPropertyTax(propertyTaxAnnual);
  const monthlyInsurance = calculateMonthlyInsurance(homeInsuranceAnnual);

  const monthlyPayment: MonthlyPaymentBreakdown = {
    principalAndInterest,
    mortgageInsurance: monthlyPmi,
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    hoaDues: hoaDuesMonthly,
    floodInsurance: 0,
    totalMonthly: calculateTotalMonthlyPayment({
      principalAndInterest,
      mortgageInsurance: monthlyPmi,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      hoaDues: hoaDuesMonthly,
    }),
  };

  // Simplified closing costs for refinance
  const closingCosts = calculateConventionalClosingCosts(
    newLoanAmount,
    propertyValue,
    interestRate,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    0, // No origination points by default for refi
    0, // No seller credit on refi
    undefined,
    0, // No lender credit by default
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
    totalLoanAmount: newLoanAmount,
    ltv,
    downPayment: 0, // No down payment on refinance
    monthlyPayment,
    closingCosts,
    cashToClose,
    pmiRate,
  };
}
