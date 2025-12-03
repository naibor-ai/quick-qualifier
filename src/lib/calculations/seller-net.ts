/**
 * Seller Net Sheet Calculator
 *
 * Calculates the estimated net proceeds a seller will receive after:
 * - Paying off existing mortgages/liens
 * - Real estate commissions
 * - Closing costs (title, escrow, recording)
 * - Transfer taxes
 * - Prorations (taxes, HOA dues)
 * - Repairs/credits
 */

import type { SellerNetInput } from '../schemas';
import { roundToCents } from './common';

export interface SellerNetResult {
  salesPrice: number;

  // Payoffs
  firstMortgagePayoff: number;
  secondLienPayoff: number;
  totalPayoffs: number;

  // Costs
  realEstateCommission: number;
  titleInsurance: number;
  escrowFee: number;
  transferTax: number;
  recordingFees: number;
  repairCredits: number;
  hoaPayoff: number;
  otherDebits: number;
  totalCosts: number;

  // Prorations & Credits
  propertyTaxProration: number;
  otherCredits: number;
  totalCredits: number;

  // Result
  estimatedNetProceeds: number;
}

/**
 * Calculate real estate commission from sales price.
 */
export function calculateCommission(
  salesPrice: number,
  commissionPercent: number
): number {
  return roundToCents(salesPrice * (commissionPercent / 100));
}

/**
 * Calculate seller net proceeds.
 */
export function calculateSellerNet(input: SellerNetInput): SellerNetResult {
  const {
    salesPrice,
    existingLoanPayoff,
    secondLienPayoff,
    commissionPercent,
    titleInsurance,
    escrowFee,
    transferTax,
    recordingFees,
    repairCredits,
    hoaPayoff,
    propertyTaxProration,
    otherCredits,
    otherDebits,
  } = input;

  // Payoffs
  const totalPayoffs = existingLoanPayoff + secondLienPayoff;

  // Commission
  const realEstateCommission = calculateCommission(salesPrice, commissionPercent);

  // Total costs (debits from seller)
  const totalCosts =
    realEstateCommission +
    titleInsurance +
    escrowFee +
    transferTax +
    recordingFees +
    repairCredits +
    hoaPayoff +
    otherDebits;

  // Credits to seller (prorations can be positive or negative)
  // Positive propertyTaxProration = seller owes buyer
  // Negative propertyTaxProration = buyer owes seller
  const totalCredits = otherCredits + Math.max(0, -propertyTaxProration);
  const totalDebitsFromProration = Math.max(0, propertyTaxProration);

  // Net proceeds calculation
  const estimatedNetProceeds = roundToCents(
    salesPrice -
      totalPayoffs -
      totalCosts -
      totalDebitsFromProration +
      totalCredits
  );

  return {
    salesPrice,

    firstMortgagePayoff: existingLoanPayoff,
    secondLienPayoff,
    totalPayoffs: roundToCents(totalPayoffs),

    realEstateCommission,
    titleInsurance,
    escrowFee,
    transferTax,
    recordingFees,
    repairCredits,
    hoaPayoff,
    otherDebits,
    totalCosts: roundToCents(totalCosts),

    propertyTaxProration,
    otherCredits,
    totalCredits: roundToCents(totalCredits),

    estimatedNetProceeds,
  };
}

/**
 * Calculate property tax proration based on closing date.
 *
 * @param annualTax - Annual property tax amount
 * @param closingDate - Closing date
 * @param taxPeriodStart - Start of tax period (defaults to Jan 1 for calendar year)
 * @param isPrepaid - Whether taxes are prepaid or paid in arrears
 * @returns Proration amount (positive = seller owes, negative = seller receives credit)
 */
export function calculateTaxProration(
  annualTax: number,
  closingDate: Date,
  taxPeriodStart: Date = new Date(closingDate.getFullYear(), 0, 1),
  isPrepaid: boolean = false
): number {
  const dailyRate = annualTax / 365;

  // Days from period start to closing
  const daysElapsed = Math.floor(
    (closingDate.getTime() - taxPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (isPrepaid) {
    // Seller prepaid for the year, buyer owes seller for remaining days
    const daysRemaining = 365 - daysElapsed;
    return roundToCents(-daysRemaining * dailyRate); // Negative = credit to seller
  } else {
    // Taxes paid in arrears, seller owes buyer for days lived there
    return roundToCents(daysElapsed * dailyRate); // Positive = seller owes
  }
}

/**
 * Calculate HOA proration based on closing date.
 */
export function calculateHoaProration(
  monthlyDues: number,
  closingDate: Date
): number {
  const dayOfMonth = closingDate.getDate();
  const daysInMonth = new Date(
    closingDate.getFullYear(),
    closingDate.getMonth() + 1,
    0
  ).getDate();

  const dailyRate = monthlyDues / daysInMonth;

  // Seller owes for days they owned the property
  return roundToCents(dayOfMonth * dailyRate);
}
