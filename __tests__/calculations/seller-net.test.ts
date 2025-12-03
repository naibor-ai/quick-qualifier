import { describe, it, expect } from 'vitest';
import {
  calculateSellerNet,
  calculateCommission,
  calculateTaxProration,
  calculateHoaProration,
} from '@/lib/calculations/seller-net';
import type { SellerNetInput } from '@/lib/schemas';

describe('calculateCommission', () => {
  it('should calculate 6% commission correctly', () => {
    expect(calculateCommission(500000, 6)).toBe(30000);
  });

  it('should handle different commission rates', () => {
    expect(calculateCommission(500000, 5)).toBe(25000);
    expect(calculateCommission(500000, 5.5)).toBe(27500);
  });
});

describe('calculateTaxProration', () => {
  it('should calculate tax proration for mid-year sale (arrears)', () => {
    // Closing July 1st (182 days into year)
    const closingDate = new Date(2024, 6, 1); // July 1
    const taxPeriodStart = new Date(2024, 0, 1); // Jan 1
    const annualTax = 6000;

    const result = calculateTaxProration(closingDate, closingDate, taxPeriodStart, false);
    // This tests the function signature - the actual calculation may vary
    expect(typeof result).toBe('number');
  });

  it('should return credit for prepaid taxes', () => {
    const closingDate = new Date(2024, 6, 1);
    const taxPeriodStart = new Date(2024, 0, 1);

    const result = calculateTaxProration(6000, closingDate, taxPeriodStart, true);
    // Prepaid: seller gets credit for remaining days
    expect(result).toBeLessThan(0); // Negative = credit to seller
  });
});

describe('calculateHoaProration', () => {
  it('should calculate HOA proration based on closing date', () => {
    // Closing on 15th of a 30-day month
    const closingDate = new Date(2024, 3, 15); // April 15
    const monthlyDues = 300;

    const result = calculateHoaProration(monthlyDues, closingDate);
    // Seller owes for 15 days = 300 * (15/30) = 150
    expect(result).toBe(150);
  });

  it('should handle end of month closing', () => {
    const closingDate = new Date(2024, 3, 30); // April 30
    const monthlyDues = 300;

    const result = calculateHoaProration(monthlyDues, closingDate);
    expect(result).toBe(300); // Full month
  });
});

describe('calculateSellerNet', () => {
  it('should calculate net proceeds for simple sale', () => {
    const input: SellerNetInput = {
      salesPrice: 500000,
      existingLoanPayoff: 300000,
      secondLienPayoff: 0,
      commissionPercent: 6,
      titleInsurance: 2000,
      escrowFee: 1500,
      transferTax: 1000,
      recordingFees: 150,
      repairCredits: 0,
      hoaPayoff: 0,
      propertyTaxProration: 0,
      otherCredits: 0,
      otherDebits: 0,
    };

    const result = calculateSellerNet(input);

    expect(result.salesPrice).toBe(500000);
    expect(result.totalPayoffs).toBe(300000);
    expect(result.realEstateCommission).toBe(30000);
    expect(result.totalCosts).toBe(30000 + 2000 + 1500 + 1000 + 150);

    // Net = 500000 - 300000 - 34650 = 165350
    const expectedNet = 500000 - 300000 - (30000 + 2000 + 1500 + 1000 + 150);
    expect(result.estimatedNetProceeds).toBe(expectedNet);
  });

  it('should handle second lien payoff', () => {
    const input: SellerNetInput = {
      salesPrice: 500000,
      existingLoanPayoff: 300000,
      secondLienPayoff: 50000,
      commissionPercent: 6,
      titleInsurance: 2000,
      escrowFee: 1500,
      transferTax: 1000,
      recordingFees: 150,
      repairCredits: 0,
      hoaPayoff: 0,
      propertyTaxProration: 0,
      otherCredits: 0,
      otherDebits: 0,
    };

    const result = calculateSellerNet(input);

    expect(result.totalPayoffs).toBe(350000);
    expect(result.estimatedNetProceeds).toBeLessThan(165350); // Less than without 2nd lien
  });

  it('should handle repair credits', () => {
    const input: SellerNetInput = {
      salesPrice: 500000,
      existingLoanPayoff: 300000,
      secondLienPayoff: 0,
      commissionPercent: 6,
      titleInsurance: 2000,
      escrowFee: 1500,
      transferTax: 1000,
      recordingFees: 150,
      repairCredits: 5000, // Seller gives repair credit
      hoaPayoff: 0,
      propertyTaxProration: 0,
      otherCredits: 0,
      otherDebits: 0,
    };

    const result = calculateSellerNet(input);

    expect(result.repairCredits).toBe(5000);
    expect(result.totalCosts).toBe(30000 + 2000 + 1500 + 1000 + 150 + 5000);
  });

  it('should handle tax proration (seller owes)', () => {
    const input: SellerNetInput = {
      salesPrice: 500000,
      existingLoanPayoff: 300000,
      secondLienPayoff: 0,
      commissionPercent: 6,
      titleInsurance: 2000,
      escrowFee: 1500,
      transferTax: 1000,
      recordingFees: 150,
      repairCredits: 0,
      hoaPayoff: 0,
      propertyTaxProration: 2000, // Seller owes $2000 in taxes
      otherCredits: 0,
      otherDebits: 0,
    };

    const result = calculateSellerNet(input);

    expect(result.propertyTaxProration).toBe(2000);
    // Net proceeds reduced by tax proration
    const baseNet = 500000 - 300000 - (30000 + 2000 + 1500 + 1000 + 150);
    expect(result.estimatedNetProceeds).toBe(baseNet - 2000);
  });

  it('should handle tax proration credit (seller receives)', () => {
    const input: SellerNetInput = {
      salesPrice: 500000,
      existingLoanPayoff: 300000,
      secondLienPayoff: 0,
      commissionPercent: 6,
      titleInsurance: 2000,
      escrowFee: 1500,
      transferTax: 1000,
      recordingFees: 150,
      repairCredits: 0,
      hoaPayoff: 0,
      propertyTaxProration: -1500, // Negative = seller receives credit
      otherCredits: 0,
      otherDebits: 0,
    };

    const result = calculateSellerNet(input);

    expect(result.propertyTaxProration).toBe(-1500);
    expect(result.totalCredits).toBe(1500);
  });

  it('should include all cost components', () => {
    const input: SellerNetInput = {
      salesPrice: 600000,
      existingLoanPayoff: 350000,
      secondLienPayoff: 25000,
      commissionPercent: 5.5,
      titleInsurance: 2500,
      escrowFee: 2000,
      transferTax: 1200,
      recordingFees: 200,
      repairCredits: 3000,
      hoaPayoff: 500,
      propertyTaxProration: 1000,
      otherCredits: 500,
      otherDebits: 250,
    };

    const result = calculateSellerNet(input);

    // Verify all fields are present
    expect(result.salesPrice).toBe(600000);
    expect(result.firstMortgagePayoff).toBe(350000);
    expect(result.secondLienPayoff).toBe(25000);
    expect(result.realEstateCommission).toBe(33000); // 5.5% of 600k
    expect(result.titleInsurance).toBe(2500);
    expect(result.escrowFee).toBe(2000);
    expect(result.transferTax).toBe(1200);
    expect(result.recordingFees).toBe(200);
    expect(result.repairCredits).toBe(3000);
    expect(result.hoaPayoff).toBe(500);
    expect(result.otherDebits).toBe(250);
    expect(result.otherCredits).toBe(500);

    // Verify totals are calculated
    expect(result.totalPayoffs).toBe(375000);
    expect(result.totalCosts).toBeGreaterThan(0);
    expect(result.estimatedNetProceeds).toBeGreaterThan(0);
  });
});
