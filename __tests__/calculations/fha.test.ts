import { describe, it, expect } from 'vitest';
import {
  calculateFhaPurchase,
  calculateUfmip,
  calculateMonthlyMip,
  getFhaMipRate,
} from '@/lib/calculations/fha';
import type { FhaPurchaseInput, GhlConfig } from '@/lib/schemas';

// Mock GHL config
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
    standard: { monthly: {}, single: {} },
    highBalance: { monthly: {}, single: {} },
  },
  company: {
    name: 'Test Company',
    nmlsId: '123456',
    loName: 'John Doe',
    loEmail: 'john@test.com',
    loPhone: '555-1234',
    address: '123 Main St',
  },
};

describe('calculateUfmip', () => {
  it('should calculate UFMIP correctly', () => {
    // $400,000 base loan, 1.75% UFMIP = $7,000
    const result = calculateUfmip(400000, 1.75);
    expect(result).toBe(7000);
  });

  it('should handle streamline UFMIP rate', () => {
    // $400,000 base loan, 0.55% UFMIP = $2,200
    const result = calculateUfmip(400000, 0.55);
    expect(result).toBe(2200);
  });
});

describe('getFhaMipRate', () => {
  it('should return higher MIP for LTV > 95%', () => {
    const rate = getFhaMipRate(96.5, 30, 400000, mockConfig);
    expect(rate).toBe(0.55); // mip30yrGt95
  });

  it('should return lower MIP for LTV <= 95%', () => {
    const rate = getFhaMipRate(95, 30, 400000, mockConfig);
    expect(rate).toBe(0.50); // mip30yrLe95
  });

  it('should return 15-year rates for shorter terms', () => {
    const rate = getFhaMipRate(85, 15, 400000, mockConfig);
    expect(rate).toBe(0.15); // mip15yrLe90
  });
});

describe('calculateMonthlyMip', () => {
  it('should calculate monthly MIP correctly', () => {
    // $400,000 loan, 0.55% annual MIP
    // Monthly = (400000 * 0.0055) / 12 = $183.33
    const result = calculateMonthlyMip(400000, 0.55);
    expect(result).toBeCloseTo(183.33, 0);
  });
});

describe('calculateFhaPurchase', () => {
  it('should calculate FHA 3.5% down purchase correctly', () => {
    const input: FhaPurchaseInput = {
      salesPrice: 400000,
      downPaymentPercent: 3.5,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      is203k: false,
    };

    const result = calculateFhaPurchase(input, mockConfig);

    // Base loan = 400000 - 14000 = 386000
    expect(result.loanAmount).toBe(386000);

    // LTV = 386000 / 400000 = 96.5%
    expect(result.ltv).toBe(96.5);

    // UFMIP = 386000 * 1.75% = 6755
    expect(result.ufmip).toBe(6755);

    // Total loan = 386000 + 6755 = 392755
    expect(result.totalLoanAmount).toBe(392755);

    // Monthly MIP present (LTV > 95% = 0.55%)
    expect(result.monthlyPayment.mortgageInsurance).toBeGreaterThan(0);
    expect(result.monthlyPayment.mortgageInsurance).toBeCloseTo(
      (386000 * 0.55) / 100 / 12,
      0
    );
  });

  it('should calculate down payment from amount', () => {
    const input: FhaPurchaseInput = {
      salesPrice: 400000,
      downPaymentAmount: 20000, // 5% down
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      is203k: false,
    };

    const result = calculateFhaPurchase(input, mockConfig);

    expect(result.loanAmount).toBe(380000);
    expect(result.downPayment).toBe(20000);
    expect(result.ltv).toBe(95);
  });

  it('should include UFMIP in total loan for P&I calculation', () => {
    const input: FhaPurchaseInput = {
      salesPrice: 400000,
      downPaymentPercent: 3.5,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 100,
      floodInsuranceMonthly: 0,
      is203k: false,
    };

    const result = calculateFhaPurchase(input, mockConfig);

    // P&I should be calculated on total loan (base + UFMIP)
    expect(result.totalLoanAmount).toBeGreaterThan(result.loanAmount);
    expect(result.monthlyPayment.principalAndInterest).toBeGreaterThan(0);

    // Total monthly should include P&I + MIP + Tax + Insurance + HOA
    expect(result.monthlyPayment.totalMonthly).toBe(
      result.monthlyPayment.principalAndInterest +
        result.monthlyPayment.mortgageInsurance +
        result.monthlyPayment.propertyTax +
        result.monthlyPayment.homeInsurance +
        result.monthlyPayment.hoaDues +
        result.monthlyPayment.floodInsurance
    );
  });
});
