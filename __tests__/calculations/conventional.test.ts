import { describe, it, expect } from 'vitest';
import {
  calculateConventionalPurchase,
  lookupPmiRate,
  calculateMonthlyPmi,
  calculateSinglePremiumPmi,
} from '@/lib/calculations/conventional';
import type { ConventionalPurchaseInput, GhlConfig } from '@/lib/schemas';

// Mock GHL config for testing
const mockConfig: GhlConfig = {
  rates: {
    conv30: 7.0,
    conv15: 6.5,
    fha30: 6.5,
    va30: 6.5,
    jumbo: 7.5,
  },
  fees: {
    originationPoints: 0,
    admin: 995,
    processing: 595,
    underwriting: 995,
    appraisal: 550,
    creditReport: 65,
    floodCert: 15,
    taxService: 85,
    docPrep: 150,
    settlement: 750,
    notary: 150,
    recording: 150,
    courier: 35,
  },
  prepaids: {
    taxMonths: 4,
    insuranceMonths: 14,
    interestDays: 15,
    taxRateAnnual: 1.25,
  },
  limits: {
    conforming: 766550,
    highBalance: 1149825,
    fha: 498257,
  },
  fha: {
    minDownPct: 3.5,
    maxLtvCashout: 80,
    ufmipPurchase: 1.75,
    ufmipRefi: 1.75,
    ufmipStreamline: 0.55,
    mip30yrGt95: 0.55,
    mip30yrLe95: 0.50,
    mip15yrGt90: 0.40,
    mip15yrLe90: 0.15,
  },
  va: {
    maxGuarantee: 0,
    maxLtvCashout: 100,
    maxLtvIrrrl: 100,
    ffFirstLe90: 1.25,
    ffFirst90to95: 1.50,
    ffFirstGt95: 2.15,
    ffSubseqLe90: 1.25,
    ffSubseq90to95: 1.50,
    ffSubseqGt95: 3.30,
    ffIrrrl: 0.50,
    ffCashoutFirst: 2.15,
    ffCashoutSubseq: 3.30,
  },
  miFactors: {
    standard: {
      monthly: {
        '97': { '760': 0.58, '740': 0.70, '720': 0.87, '700': 1.07, '680': 1.28, '660': 1.55, '640': 1.80, '620': 2.10 },
        '95': { '760': 0.38, '740': 0.50, '720': 0.62, '700': 0.78, '680': 0.99, '660': 1.19, '640': 1.45, '620': 1.68 },
        '90': { '760': 0.19, '740': 0.25, '720': 0.34, '700': 0.46, '680': 0.65, '660': 0.79, '640': 1.05, '620': 1.25 },
        '85': { '760': 0.15, '740': 0.17, '720': 0.21, '700': 0.28, '680': 0.40, '660': 0.55, '640': 0.70, '620': 0.85 },
      },
      single: {
        '97': { '760': 1.85, '740': 2.25, '720': 2.75, '700': 3.40, '680': 4.05, '660': 4.90, '640': 5.70, '620': 6.65 },
        '95': { '760': 1.20, '740': 1.55, '720': 1.95, '700': 2.45, '680': 3.15, '660': 3.75, '640': 4.60, '620': 5.30 },
        '90': { '760': 0.60, '740': 0.80, '720': 1.08, '700': 1.45, '680': 2.05, '660': 2.50, '640': 3.30, '620': 3.95 },
        '85': { '760': 0.47, '740': 0.55, '720': 0.65, '700': 0.90, '680': 1.25, '660': 1.75, '640': 2.20, '620': 2.70 },
      },
    },
    highBalance: {
      monthly: {
        '97': { '760': 0.70, '740': 0.85, '720': 1.05, '700': 1.30, '680': 1.55, '660': 1.88, '640': 2.18, '620': 2.55 },
        '95': { '760': 0.46, '740': 0.61, '720': 0.75, '700': 0.95, '680': 1.20, '660': 1.44, '640': 1.76, '620': 2.04 },
        '90': { '760': 0.23, '740': 0.30, '720': 0.41, '700': 0.56, '680': 0.79, '660': 0.96, '640': 1.27, '620': 1.52 },
        '85': { '760': 0.18, '740': 0.21, '720': 0.25, '700': 0.34, '680': 0.49, '660': 0.67, '640': 0.85, '620': 1.03 },
      },
      single: {
        '97': { '760': 2.24, '740': 2.73, '720': 3.33, '700': 4.12, '680': 4.90, '660': 5.93, '640': 6.90, '620': 8.05 },
        '95': { '760': 1.45, '740': 1.88, '720': 2.36, '700': 2.97, '680': 3.81, '660': 4.54, '640': 5.57, '620': 6.41 },
        '90': { '760': 0.73, '740': 0.97, '720': 1.31, '700': 1.76, '680': 2.48, '660': 3.03, '640': 3.99, '620': 4.78 },
        '85': { '760': 0.57, '740': 0.67, '720': 0.79, '700': 1.09, '680': 1.51, '660': 2.12, '640': 2.66, '620': 3.27 },
      },
    },
  },
  company: {
    name: 'Test Mortgage Company',
    nmlsId: '123456',
    loName: 'John Doe',
    loEmail: 'john@test.com',
    loPhone: '555-1234',
    address: '123 Main St',
  },
};

describe('lookupPmiRate', () => {
  it('should return 0 for LTV <= 80%', () => {
    expect(lookupPmiRate(80, '760', 400000, 'monthly', mockConfig)).toBe(0);
    expect(lookupPmiRate(75, '760', 400000, 'monthly', mockConfig)).toBe(0);
  });

  it('should return correct monthly PMI rate for standard balance', () => {
    // 95% LTV, 760+ credit, standard balance
    expect(lookupPmiRate(95, '760', 400000, 'monthly', mockConfig)).toBe(0.38);
    // 95% LTV, 700-719 credit, standard balance
    expect(lookupPmiRate(95, '700', 400000, 'monthly', mockConfig)).toBe(0.78);
  });

  it('should return correct single premium rate', () => {
    // 95% LTV, 760+ credit, single premium
    expect(lookupPmiRate(95, '760', 400000, 'single_financed', mockConfig)).toBe(1.20);
  });

  it('should use high balance table for jumbo loans', () => {
    // 95% LTV, 760+ credit, high balance (over conforming limit)
    expect(lookupPmiRate(95, '760', 800000, 'monthly', mockConfig)).toBe(0.46);
  });
});

describe('calculateMonthlyPmi', () => {
  it('should calculate correct monthly PMI', () => {
    // $400,000 loan, 0.38% annual PMI rate
    // Monthly = (400000 * 0.0038) / 12 = $126.67
    const result = calculateMonthlyPmi(400000, 0.38);
    expect(result).toBeCloseTo(126.67, 0);
  });

  it('should return 0 for 0 rate', () => {
    expect(calculateMonthlyPmi(400000, 0)).toBe(0);
  });
});

describe('calculateSinglePremiumPmi', () => {
  it('should calculate correct single premium', () => {
    // $400,000 loan, 1.20% single premium
    // Premium = 400000 * 0.012 = $4,800
    const result = calculateSinglePremiumPmi(400000, 1.20);
    expect(result).toBe(4800);
  });
});

describe('calculateConventionalPurchase', () => {
  it('should calculate 20% down purchase correctly (no PMI)', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 20,
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      creditScoreTier: '760',
      pmiType: 'monthly',
      sellerCreditAmount: 0,
      lenderCreditAmount: 0,
      originationPoints: 0,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    expect(result.loanAmount).toBe(400000);
    expect(result.ltv).toBe(80);
    expect(result.downPayment).toBe(100000);
    expect(result.monthlyPayment.mortgageInsurance).toBe(0); // No PMI at 80% LTV
    expect(result.monthlyPayment.principalAndInterest).toBeCloseTo(2661, 0);
    expect(result.monthlyPayment.propertyTax).toBe(500);
    expect(result.monthlyPayment.homeInsurance).toBe(150);
  });

  it('should calculate 5% down purchase with PMI', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 5,
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 100,
      floodInsuranceMonthly: 0,
      creditScoreTier: '740',
      pmiType: 'monthly',
      sellerCreditAmount: 0,
      lenderCreditAmount: 0,
      originationPoints: 0,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    expect(result.loanAmount).toBe(475000);
    expect(result.ltv).toBe(95);
    expect(result.downPayment).toBe(25000);
    expect(result.pmiRate).toBe(0.50); // 95% LTV, 740-759 credit
    // Monthly PMI = (475000 * 0.005) / 12 = $197.92
    expect(result.monthlyPayment.mortgageInsurance).toBeCloseTo(197.92, 0);
  });

  it('should calculate down payment from amount', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentAmount: 50000, // 10% down
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      creditScoreTier: '760',
      pmiType: 'monthly',
      sellerCreditAmount: 0,
      lenderCreditAmount: 0,
      originationPoints: 0,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    expect(result.loanAmount).toBe(450000);
    expect(result.ltv).toBe(90);
    expect(result.downPayment).toBe(50000);
  });

  it('should apply seller credit to closing costs', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 20,
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      creditScoreTier: '760',
      pmiType: 'monthly',
      sellerCreditAmount: 5000,
      lenderCreditAmount: 0,
      originationPoints: 0,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    expect(result.closingCosts.sellerCredit).toBe(5000);
    expect(result.closingCosts.totalCredits).toBe(5000);
    expect(result.closingCosts.netClosingCosts).toBe(
      result.closingCosts.totalClosingCosts - 5000
    );
  });

  it('should include closing costs breakdown', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 20,
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      creditScoreTier: '760',
      pmiType: 'monthly',
      sellerCreditAmount: 0,
      lenderCreditAmount: 0,
      originationPoints: 1,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    // Check lender fees
    expect(result.closingCosts.originationFee).toBe(4000); // 1% of 400,000
    expect(result.closingCosts.adminFee).toBe(995);
    expect(result.closingCosts.processingFee).toBe(595);

    // Check prepaids
    expect(result.closingCosts.taxReserves).toBe(2000); // 4 months of $500
    expect(result.closingCosts.insuranceReserves).toBe(2100); // 14 months of $150

    // Check totals
    expect(result.closingCosts.totalLenderFees).toBeGreaterThan(0);
    expect(result.closingCosts.totalThirdPartyFees).toBeGreaterThan(0);
    expect(result.closingCosts.totalPrepaids).toBeGreaterThan(0);
  });

  it('should calculate cash to close correctly', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 20,
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      creditScoreTier: '760',
      pmiType: 'monthly',
      sellerCreditAmount: 0,
      lenderCreditAmount: 0,
      originationPoints: 0,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    // Cash to close = down payment + closing costs - credits
    const expectedCashToClose =
      result.downPayment +
      result.closingCosts.totalClosingCosts -
      result.closingCosts.totalCredits;

    expect(result.cashToClose).toBeCloseTo(expectedCashToClose, 2);
  });

  it('should handle single premium PMI financed into loan', () => {
    const input: ConventionalPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 5,
      interestRate: 7.0,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      creditScoreTier: '760',
      pmiType: 'single_financed',
      sellerCreditAmount: 0,
      lenderCreditAmount: 0,
      originationPoints: 0,
    };

    const result = calculateConventionalPurchase(input, mockConfig);

    // Single premium at 95% LTV, 760+ = 1.20%
    // Base loan = 475,000, single premium = 5,700
    // Total loan = 480,700
    expect(result.loanAmount).toBe(475000);
    expect(result.totalLoanAmount).toBe(475000 + 5700);
    expect(result.monthlyPayment.mortgageInsurance).toBe(0); // No monthly PMI
  });
});
