/**
 * Common calculation utilities shared across all loan calculators.
 * These are pure functions with no side effects.
 */

/**
 * Calculate monthly Principal & Interest payment using standard amortization formula.
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate as percentage (e.g., 6.5 for 6.5%)
 * @param termYears - Loan term in years
 * @returns Monthly P&I payment
 */
export function calculateMonthlyPI(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) {
    // 0% interest - simple division
    return principal / (termYears * 12);
  }

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const compoundFactor = Math.pow(1 + monthlyRate, numPayments);
  const monthlyPayment =
    principal * ((monthlyRate * compoundFactor) / (compoundFactor - 1));

  return roundToCents(monthlyPayment);
}

/**
 * Calculate Loan-to-Value ratio.
 * @param loanAmount - Loan amount
 * @param propertyValue - Property value / sales price
 * @returns LTV as percentage (e.g., 80 for 80%)
 */
export function calculateLTV(loanAmount: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return roundToDecimals((loanAmount / propertyValue) * 100, 2);
}

/**
 * Calculate down payment from percentage.
 * @param salesPrice - Sales price
 * @param downPaymentPercent - Down payment as percentage
 * @returns Down payment amount
 */
export function calculateDownPaymentFromPercent(
  salesPrice: number,
  downPaymentPercent: number
): number {
  return roundToCents(salesPrice * (downPaymentPercent / 100));
}

/**
 * Calculate down payment percentage from amount.
 * @param salesPrice - Sales price
 * @param downPaymentAmount - Down payment amount
 * @returns Down payment as percentage
 */
export function calculateDownPaymentPercent(
  salesPrice: number,
  downPaymentAmount: number
): number {
  if (salesPrice <= 0) return 0;
  return roundToDecimals((downPaymentAmount / salesPrice) * 100, 2);
}

/**
 * Calculate loan amount from sales price and down payment.
 */
export function calculateLoanAmount(
  salesPrice: number,
  downPayment: number
): number {
  return Math.max(0, salesPrice - downPayment);
}

/**
 * Calculate monthly property tax from annual amount.
 */
export function calculateMonthlyPropertyTax(annualAmount: number): number {
  return roundToCents(annualAmount / 12);
}

/**
 * Calculate monthly insurance from annual amount.
 */
export function calculateMonthlyInsurance(annualAmount: number): number {
  return roundToCents(annualAmount / 12);
}

/**
 * Calculate prepaid interest for closing.
 * @param loanAmount - Loan amount
 * @param annualRate - Annual interest rate as percentage
 * @param days - Number of days of prepaid interest
 * @returns Prepaid interest amount
 */
export function calculatePrepaidInterest(
  loanAmount: number,
  annualRate: number,
  days: number
): number {
  const dailyRate = annualRate / 100 / 365;
  return roundToCents(loanAmount * dailyRate * days);
}

/**
 * Calculate tax reserves for closing.
 * @param annualTax - Annual property tax amount
 * @param months - Number of months to collect
 * @returns Tax reserve amount
 */
export function calculateTaxReserves(
  annualTax: number,
  months: number
): number {
  return roundToCents((annualTax / 12) * months);
}

/**
 * Calculate insurance reserves for closing.
 * @param annualInsurance - Annual insurance amount
 * @param months - Number of months to collect (typically includes 12 months upfront + escrow)
 * @returns Insurance reserve amount
 */
export function calculateInsuranceReserves(
  annualInsurance: number,
  months: number
): number {
  return roundToCents((annualInsurance / 12) * months);
}

/**
 * Get the LTV tier for MI lookup based on actual LTV.
 * Returns the appropriate tier (97, 95, 90, 85) or null if no MI needed.
 */
export function getLtvTier(ltv: number): '97' | '95' | '90' | '85' | null {
  if (ltv <= 80) return null; // No MI needed
  if (ltv <= 85) return '85';
  if (ltv <= 90) return '90';
  if (ltv <= 95) return '95';
  return '97';
}

/**
 * Determine if a loan is high balance based on loan limits.
 */
export function isHighBalanceLoan(
  loanAmount: number,
  conformingLimit: number
): boolean {
  return loanAmount > conformingLimit;
}

/**
 * Calculate APR (Annual Percentage Rate) using an iterative approach.
 * APR is the rate where the present value of monthly payments equals (Loan Amount - Prepaid Finance Charges).
 */
export function calculateAPR(
  loanAmount: number,
  lenderFees: number,
  monthlyPI: number,
  termYears: number
): number {
  const financeAmount = loanAmount - lenderFees;
  const n = termYears * 12;
  const P = monthlyPI;

  if (financeAmount <= 0 || n <= 0 || P <= 0) return 0;

  // Initial guess for monthly rate
  let r = (P * n / financeAmount - 1) / n;

  // Newton's method to find the root of: f(r) = P * (1 - (1+r)^-n) / r - financeAmount
  for (let i = 0; i < 20; i++) {
    const compound = Math.pow(1 + r, -n);
    const f = P * (1 - compound) / r - financeAmount;
    const df = P * (n * compound / (r * (1 + r)) - (1 - compound) / (r * r));
    const nextR = r - f / df;
    if (Math.abs(nextR - r) < 0.000001) {
      r = nextR;
      break;
    }
    r = nextR;
  }

  return roundToDecimals(r * 12 * 100, 3);
}

/**
 * Round to specified number of decimal places.
 */
export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Round to cents (2 decimal places).
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate total monthly payment from all components.
 */
export function calculateTotalMonthlyPayment(components: {
  principalAndInterest: number;
  mortgageInsurance: number;
  propertyTax: number;
  homeInsurance: number;
  hoaDues: number;
  floodInsurance?: number;
}): number {
  return roundToCents(
    components.principalAndInterest +
    components.mortgageInsurance +
    components.propertyTax +
    components.homeInsurance +
    components.hoaDues +
    (components.floodInsurance || 0)
  );
}

/**
 * Calculate cash to close.
 * @param downPayment - Down payment amount
 * @param totalClosingCosts - Total closing costs before credits
 * @param totalCredits - Total credits (seller + lender)
 * @param earnestDeposit - Earnest money deposit already paid (optional)
 * @returns Cash required at closing
 */
export function calculateCashToClose(
  downPayment: number,
  totalClosingCosts: number,
  totalCredits: number,
  earnestDeposit: number = 0
): number {
  return roundToCents(
    downPayment + totalClosingCosts - totalCredits - earnestDeposit
  );
}

/**
 * Calculate origination fee from loan amount and points.
 * @param loanAmount - Loan amount
 * @param points - Origination points as percentage
 * @returns Origination fee amount
 */
export function calculateOriginationFee(
  loanAmount: number,
  points: number
): number {
  return roundToCents(loanAmount * (points / 100));
}

/**
 * Calculate seller credit amount from percentage.
 * @param salesPrice - Sales price
 * @param percent - Credit as percentage of sales price
 * @returns Credit amount
 */
export function calculateSellerCredit(
  salesPrice: number,
  percent: number
): number {
  return roundToCents(salesPrice * (percent / 100));
}
