/**
 * Loan Comparison Calculator
 *
 * Compares up to 3 loan scenarios side-by-side.
 * Shows differences in monthly payment and cash to close relative to first scenario.
 */

import type {
  ComparisonInput,
  ComparisonScenario,
  LoanProgram,
  GhlConfig,
  LoanCalculationResult,
} from '../schemas';
import { calculateConventionalPurchase } from './conventional';
import { calculateFhaPurchase } from './fha';
import { calculateVaPurchase } from './va';
import {
  calculateDownPaymentFromPercent,
  roundToCents,
} from './common';

export interface ComparisonResult {
  scenarios: ScenarioResult[];
  differences: ScenarioDifference[];
}

export interface ScenarioResult {
  name: string;
  program: LoanProgram;
  loanAmount: number;
  totalLoanAmount: number;
  downPayment: number;
  ltv: number;
  monthlyPayment: number;
  principalAndInterest: number;
  mortgageInsurance: number;
  cashToClose: number;
}

export interface ScenarioDifference {
  name: string;
  monthlyPaymentDiff: number;
  cashToCloseDiff: number;
  isBaseline: boolean;
}

/**
 * Calculate a single scenario based on program type.
 */
function calculateScenario(
  scenario: ComparisonScenario,
  sharedInputs: {
    propertyTaxMonthly: number;
    homeInsuranceMonthly: number;
    hoaDuesMonthly: number;
  },
  config: GhlConfig
): LoanCalculationResult {
  const { salesPrice, downPaymentPercent, interestRate, termYears, program } =
    scenario;

  const downPayment = calculateDownPaymentFromPercent(
    salesPrice,
    downPaymentPercent
  );

  switch (program) {
    case 'conventional':
      return calculateConventionalPurchase(
        {
          salesPrice,
          downPaymentAmount: downPayment,
          interestRate,
          termYears,
          propertyTaxMonthly: sharedInputs.propertyTaxMonthly,
          homeInsuranceMonthly: sharedInputs.homeInsuranceMonthly,
          hoaDuesMonthly: sharedInputs.hoaDuesMonthly,
          floodInsuranceMonthly: 0,
          creditScoreTier: '740', // Default for comparison
          pmiType: 'monthly',
          sellerCreditAmount: 0,
          lenderCreditAmount: 0,
          originationPoints: 0,
          depositAmount: 0,
          prepaidInterestDays: 15,
          prepaidTaxMonths: 6,
          prepaidInsuranceMonths: 15,
        },
        config
      );

    case 'fha':
      return calculateFhaPurchase(
        {
          salesPrice,
          downPaymentAmount: downPayment,
          interestRate,
          termYears,
          propertyTaxMonthly: sharedInputs.propertyTaxMonthly,
          homeInsuranceMonthly: sharedInputs.homeInsuranceMonthly,
          hoaDuesMonthly: sharedInputs.hoaDuesMonthly,
          floodInsuranceMonthly: 0,
          is203k: false,
          prepaidInterestDays: 15,
          prepaidTaxMonths: 6,
          prepaidInsuranceMonths: 15,
        },
        config
      );

    case 'va':
      return calculateVaPurchase(
        {
          salesPrice,
          downPaymentAmount: downPayment,
          interestRate,
          termYears,
          propertyTaxMonthly: sharedInputs.propertyTaxMonthly,
          homeInsuranceMonthly: sharedInputs.homeInsuranceMonthly,
          hoaDuesMonthly: sharedInputs.hoaDuesMonthly,
          floodInsuranceMonthly: 0,
          vaUsage: 'first',
          isDisabledVeteran: false,
          isReservist: false,
          prepaidInterestDays: 15,
          prepaidTaxMonths: 6,
          prepaidInsuranceMonths: 15,
        },
        config
      );

    case 'usda':
      // USDA not fully implemented yet, fall back to conventional
      return calculateConventionalPurchase(
        {
          salesPrice,
          downPaymentAmount: downPayment,
          interestRate,
          termYears,
          propertyTaxMonthly: sharedInputs.propertyTaxMonthly,
          homeInsuranceMonthly: sharedInputs.homeInsuranceMonthly,
          hoaDuesMonthly: sharedInputs.hoaDuesMonthly,
          floodInsuranceMonthly: 0,
          creditScoreTier: '740',
          pmiType: 'monthly',
          sellerCreditAmount: 0,
          lenderCreditAmount: 0,
          originationPoints: 0,
          depositAmount: 0,
          prepaidInterestDays: 15,
          prepaidTaxMonths: 6,
          prepaidInsuranceMonths: 15,
        },
        config
      );

    default:
      throw new Error(`Unknown loan program: ${program}`);
  }
}

/**
 * Compare multiple loan scenarios.
 */
export function compareScenarios(
  input: ComparisonInput,
  config: GhlConfig
): ComparisonResult {
  const { scenarios, propertyTaxMonthly, homeInsuranceMonthly, hoaDuesMonthly } =
    input;

  const sharedInputs = {
    propertyTaxMonthly,
    homeInsuranceMonthly,
    hoaDuesMonthly,
  };

  // Calculate each scenario
  const results: ScenarioResult[] = scenarios.map((scenario) => {
    const calcResult = calculateScenario(scenario, sharedInputs, config);

    return {
      name: scenario.name,
      program: scenario.program,
      loanAmount: calcResult.loanAmount,
      totalLoanAmount: calcResult.totalLoanAmount,
      downPayment: calcResult.downPayment,
      ltv: calcResult.ltv,
      monthlyPayment: calcResult.monthlyPayment.totalMonthly,
      principalAndInterest: calcResult.monthlyPayment.principalAndInterest,
      mortgageInsurance: calcResult.monthlyPayment.mortgageInsurance,
      cashToClose: calcResult.cashToClose,
    };
  });

  // Calculate differences relative to first scenario
  const baseline = results[0];
  const differences: ScenarioDifference[] = results.map((result, index) => ({
    name: result.name,
    monthlyPaymentDiff: roundToCents(
      result.monthlyPayment - baseline.monthlyPayment
    ),
    cashToCloseDiff: roundToCents(result.cashToClose - baseline.cashToClose),
    isBaseline: index === 0,
  }));

  return {
    scenarios: results,
    differences,
  };
}

/**
 * Format a comparison for display.
 * Returns a summary string comparing key metrics.
 */
export function formatComparisonSummary(result: ComparisonResult): string {
  const lines: string[] = [];

  result.scenarios.forEach((scenario, index) => {
    const diff = result.differences[index];
    const diffStr = diff.isBaseline
      ? '(Baseline)'
      : `(${diff.monthlyPaymentDiff >= 0 ? '+' : ''}$${diff.monthlyPaymentDiff.toFixed(2)}/mo)`;

    lines.push(
      `${scenario.name}: $${scenario.monthlyPayment.toFixed(2)}/mo ${diffStr}`
    );
  });

  return lines.join('\n');
}
