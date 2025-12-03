import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPI,
  calculateLTV,
  calculateDownPaymentFromPercent,
  calculateDownPaymentPercent,
  calculateLoanAmount,
  calculatePrepaidInterest,
  calculateTaxReserves,
  calculateInsuranceReserves,
  calculateTotalMonthlyPayment,
  calculateCashToClose,
  calculateOriginationFee,
  getLtvTier,
  isHighBalanceLoan,
  roundToCents,
} from '@/lib/calculations/common';

describe('calculateMonthlyPI', () => {
  it('should calculate correct P&I for standard 30-year loan', () => {
    // $400,000 loan at 7% for 30 years
    // Expected: ~$2,661.21
    const result = calculateMonthlyPI(400000, 7, 30);
    expect(result).toBeCloseTo(2661.21, 0);
  });

  it('should calculate correct P&I for 15-year loan', () => {
    // $300,000 loan at 6.5% for 15 years
    // Expected: ~$2,613.32
    const result = calculateMonthlyPI(300000, 6.5, 15);
    expect(result).toBeCloseTo(2613.32, 0);
  });

  it('should return 0 for zero principal', () => {
    const result = calculateMonthlyPI(0, 7, 30);
    expect(result).toBe(0);
  });

  it('should handle 0% interest rate', () => {
    // $300,000 at 0% for 30 years = $833.33/month
    const result = calculateMonthlyPI(300000, 0, 30);
    expect(result).toBeCloseTo(833.33, 0);
  });

  it('should handle very low interest rates', () => {
    const result = calculateMonthlyPI(400000, 0.5, 30);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1500); // Much less than principal/12
  });
});

describe('calculateLTV', () => {
  it('should calculate correct LTV', () => {
    expect(calculateLTV(400000, 500000)).toBe(80);
    expect(calculateLTV(475000, 500000)).toBe(95);
    expect(calculateLTV(485000, 500000)).toBe(97);
  });

  it('should handle 100% LTV', () => {
    expect(calculateLTV(500000, 500000)).toBe(100);
  });

  it('should return 0 for zero property value', () => {
    expect(calculateLTV(400000, 0)).toBe(0);
  });
});

describe('calculateDownPaymentFromPercent', () => {
  it('should calculate correct down payment', () => {
    expect(calculateDownPaymentFromPercent(500000, 20)).toBe(100000);
    expect(calculateDownPaymentFromPercent(500000, 3.5)).toBe(17500);
    expect(calculateDownPaymentFromPercent(500000, 5)).toBe(25000);
  });
});

describe('calculateDownPaymentPercent', () => {
  it('should calculate correct percentage', () => {
    expect(calculateDownPaymentPercent(500000, 100000)).toBe(20);
    expect(calculateDownPaymentPercent(500000, 17500)).toBe(3.5);
  });

  it('should return 0 for zero sales price', () => {
    expect(calculateDownPaymentPercent(0, 100000)).toBe(0);
  });
});

describe('calculateLoanAmount', () => {
  it('should calculate correct loan amount', () => {
    expect(calculateLoanAmount(500000, 100000)).toBe(400000);
    expect(calculateLoanAmount(500000, 17500)).toBe(482500);
  });

  it('should not return negative', () => {
    expect(calculateLoanAmount(100000, 150000)).toBe(0);
  });
});

describe('calculatePrepaidInterest', () => {
  it('should calculate correct prepaid interest', () => {
    // $400,000 at 7% for 15 days
    // Daily interest = 400000 * 0.07 / 365 = $76.71
    // 15 days = $1,150.68
    const result = calculatePrepaidInterest(400000, 7, 15);
    expect(result).toBeCloseTo(1150.68, 0);
  });

  it('should return 0 for 0 days', () => {
    expect(calculatePrepaidInterest(400000, 7, 0)).toBe(0);
  });
});

describe('calculateTaxReserves', () => {
  it('should calculate correct tax reserves', () => {
    // $6,000 annual tax, 4 months = $2,000
    expect(calculateTaxReserves(6000, 4)).toBe(2000);
  });
});

describe('calculateInsuranceReserves', () => {
  it('should calculate correct insurance reserves', () => {
    // $1,800 annual insurance, 14 months = $2,100
    expect(calculateInsuranceReserves(1800, 14)).toBe(2100);
  });
});

describe('calculateTotalMonthlyPayment', () => {
  it('should sum all components', () => {
    const result = calculateTotalMonthlyPayment({
      principalAndInterest: 2000,
      mortgageInsurance: 150,
      propertyTax: 500,
      homeInsurance: 150,
      hoaDues: 100,
      floodInsurance: 50,
    });
    expect(result).toBe(2950);
  });

  it('should handle missing flood insurance', () => {
    const result = calculateTotalMonthlyPayment({
      principalAndInterest: 2000,
      mortgageInsurance: 0,
      propertyTax: 500,
      homeInsurance: 150,
      hoaDues: 0,
    });
    expect(result).toBe(2650);
  });
});

describe('calculateCashToClose', () => {
  it('should calculate correct cash to close', () => {
    const result = calculateCashToClose(100000, 15000, 5000, 0);
    expect(result).toBe(110000);
  });

  it('should subtract earnest deposit', () => {
    const result = calculateCashToClose(100000, 15000, 5000, 3000);
    expect(result).toBe(107000);
  });
});

describe('calculateOriginationFee', () => {
  it('should calculate correct origination fee', () => {
    expect(calculateOriginationFee(400000, 1)).toBe(4000);
    expect(calculateOriginationFee(400000, 0.5)).toBe(2000);
    expect(calculateOriginationFee(400000, 0)).toBe(0);
  });
});

describe('getLtvTier', () => {
  it('should return null for LTV <= 80', () => {
    expect(getLtvTier(80)).toBeNull();
    expect(getLtvTier(75)).toBeNull();
  });

  it('should return correct tier', () => {
    expect(getLtvTier(81)).toBe('85');
    expect(getLtvTier(85)).toBe('85');
    expect(getLtvTier(86)).toBe('90');
    expect(getLtvTier(90)).toBe('90');
    expect(getLtvTier(91)).toBe('95');
    expect(getLtvTier(95)).toBe('95');
    expect(getLtvTier(96)).toBe('97');
    expect(getLtvTier(97)).toBe('97');
  });
});

describe('isHighBalanceLoan', () => {
  it('should identify high balance loans', () => {
    expect(isHighBalanceLoan(800000, 766550)).toBe(true);
    expect(isHighBalanceLoan(766550, 766550)).toBe(false);
    expect(isHighBalanceLoan(500000, 766550)).toBe(false);
  });
});

describe('roundToCents', () => {
  it('should round to 2 decimal places', () => {
    expect(roundToCents(100.126)).toBe(100.13);
    expect(roundToCents(100.124)).toBe(100.12);
    expect(roundToCents(100.125)).toBe(100.13); // Banker's rounding
  });
});
