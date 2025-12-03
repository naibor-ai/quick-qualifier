import { describe, it, expect } from 'vitest';
import {
  calculateVaPurchase,
  calculateVaFundingFee,
  getVaFundingFeeRate,
} from '@/lib/calculations/va';
import type { VaPurchaseInput, GhlConfig } from '@/lib/schemas';

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

describe('getVaFundingFeeRate', () => {
  it('should return first use rate for 0% down', () => {
    const rate = getVaFundingFeeRate('first', 0, false, false, mockConfig);
    expect(rate).toBe(2.15); // ffFirstGt95
  });

  it('should return lower rate for 5% down', () => {
    const rate = getVaFundingFeeRate('first', 5, false, false, mockConfig);
    expect(rate).toBe(1.50); // ffFirst90to95
  });

  it('should return lowest rate for 10%+ down', () => {
    const rate = getVaFundingFeeRate('first', 10, false, false, mockConfig);
    expect(rate).toBe(1.25); // ffFirstLe90
  });

  it('should return higher rate for subsequent use', () => {
    const rate = getVaFundingFeeRate('subsequent', 0, false, false, mockConfig);
    expect(rate).toBe(3.30); // ffSubseqGt95
  });

  it('should return IRRRL rate for streamline refi', () => {
    const rate = getVaFundingFeeRate('first', 0, true, false, mockConfig);
    expect(rate).toBe(0.50); // ffIrrrl
  });

  it('should return cash-out rate for cash-out refi', () => {
    const rate = getVaFundingFeeRate('first', 0, false, true, mockConfig);
    expect(rate).toBe(2.15); // ffCashoutFirst
  });
});

describe('calculateVaFundingFee', () => {
  it('should calculate funding fee correctly', () => {
    // $400,000 loan, 2.15% funding fee = $8,600
    const result = calculateVaFundingFee(400000, 2.15, false);
    expect(result).toBe(8600);
  });

  it('should waive funding fee for disabled veterans', () => {
    const result = calculateVaFundingFee(400000, 2.15, true);
    expect(result).toBe(0);
  });
});

describe('calculateVaPurchase', () => {
  it('should calculate VA 0% down purchase correctly', () => {
    const input: VaPurchaseInput = {
      salesPrice: 400000,
      downPaymentPercent: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      vaUsage: 'first',
      isDisabledVeteran: false,
      isReservist: false,
    };

    const result = calculateVaPurchase(input, mockConfig);

    // 100% financing
    expect(result.loanAmount).toBe(400000);
    expect(result.ltv).toBe(100);
    expect(result.downPayment).toBe(0);

    // VA Funding Fee = 400000 * 2.15% = $8,600
    expect(result.vaFundingFee).toBe(8600);

    // Total loan includes funding fee
    expect(result.totalLoanAmount).toBe(408600);

    // NO monthly mortgage insurance (VA benefit)
    expect(result.monthlyPayment.mortgageInsurance).toBe(0);
  });

  it('should waive funding fee for disabled veteran', () => {
    const input: VaPurchaseInput = {
      salesPrice: 400000,
      downPaymentPercent: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      vaUsage: 'first',
      isDisabledVeteran: true,
      isReservist: false,
    };

    const result = calculateVaPurchase(input, mockConfig);

    expect(result.vaFundingFee).toBe(0);
    expect(result.totalLoanAmount).toBe(400000); // No funding fee added
  });

  it('should use lower funding fee rate with down payment', () => {
    const input: VaPurchaseInput = {
      salesPrice: 400000,
      downPaymentPercent: 10,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      vaUsage: 'first',
      isDisabledVeteran: false,
      isReservist: false,
    };

    const result = calculateVaPurchase(input, mockConfig);

    expect(result.downPayment).toBe(40000);
    expect(result.loanAmount).toBe(360000);

    // Lower funding fee rate (1.25% for 10%+ down)
    expect(result.vaFundingFee).toBe(4500); // 360000 * 1.25%
  });

  it('should use higher rate for subsequent VA use', () => {
    const input: VaPurchaseInput = {
      salesPrice: 400000,
      downPaymentPercent: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 5000,
      homeInsuranceAnnual: 1500,
      hoaDuesMonthly: 0,
      floodInsuranceMonthly: 0,
      vaUsage: 'subsequent',
      isDisabledVeteran: false,
      isReservist: false,
    };

    const result = calculateVaPurchase(input, mockConfig);

    // Higher rate for subsequent use (3.30%)
    expect(result.vaFundingFee).toBe(13200); // 400000 * 3.30%
  });

  it('should have no monthly MI regardless of LTV', () => {
    const input: VaPurchaseInput = {
      salesPrice: 500000,
      downPaymentPercent: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 6000,
      homeInsuranceAnnual: 1800,
      hoaDuesMonthly: 100,
      floodInsuranceMonthly: 50,
      vaUsage: 'first',
      isDisabledVeteran: false,
      isReservist: false,
    };

    const result = calculateVaPurchase(input, mockConfig);

    // 100% LTV but still no monthly MI
    expect(result.ltv).toBe(100);
    expect(result.monthlyPayment.mortgageInsurance).toBe(0);

    // Total monthly should only be P&I + Tax + Insurance + HOA + Flood
    expect(result.monthlyPayment.totalMonthly).toBe(
      result.monthlyPayment.principalAndInterest +
        result.monthlyPayment.propertyTax +
        result.monthlyPayment.homeInsurance +
        result.monthlyPayment.hoaDues +
        result.monthlyPayment.floodInsurance
    );
  });
});
