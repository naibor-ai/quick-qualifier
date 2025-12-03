'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCalculatorStore } from '@/lib/store';
import { compareScenarios, type ComparisonResult } from '@/lib/calculations/comparison';
import { InputGroup, SelectGroup, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
import type { LoanProgram } from '@/lib/schemas';

interface Scenario {
  name: string;
  program: LoanProgram;
  salesPrice: number;
  downPaymentPercent: number;
  interestRate: number;
  termYears: number;
}

export function ComparisonForm() {
  const t = useTranslations();
  const { comparisonScenarios, updateComparisonScenario, resetCalculator, config } = useCalculatorStore();
  const [results, setResults] = useState<ComparisonResult | null>(null);

  const [scenarios, setScenarios] = useState<Scenario[]>(comparisonScenarios.map(s => ({
    name: s.name,
    program: s.program,
    salesPrice: s.salesPrice,
    downPaymentPercent: s.downPaymentPercent,
    interestRate: s.interestRate,
    termYears: s.termYears,
  })));

  const updateScenario = (index: number, field: keyof Scenario, value: string | number) => {
    const updated = [...scenarios];
    updated[index] = { ...updated[index], [field]: value };
    setScenarios(updated);
    updateComparisonScenario(index, { [field]: value });
  };

  const addScenario = () => {
    if (scenarios.length >= 4) return;
    setScenarios([
      ...scenarios,
      {
        name: `Scenario ${scenarios.length + 1}`,
        program: 'conventional',
        salesPrice: 500000,
        downPaymentPercent: 20,
        interestRate: 7.0,
        termYears: 30,
      },
    ]);
  };

  const removeScenario = (index: number) => {
    if (scenarios.length <= 2) return;
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const onCalculate = useCallback(() => {
    if (!config) {
      return; // Config required for calculation
    }

    // Default property costs
    const propertyTaxAnnual = 6000;
    const homeInsuranceAnnual = 1800;

    // Run comparison
    const comparisonResult = compareScenarios(
      {
        scenarios: scenarios.map(s => ({
          name: s.name,
          program: s.program,
          salesPrice: s.salesPrice,
          downPaymentPercent: s.downPaymentPercent,
          interestRate: s.interestRate,
          termYears: s.termYears,
        })),
        propertyTaxAnnual,
        homeInsuranceAnnual,
        hoaDuesMonthly: 0,
      },
      config
    );

    setResults(comparisonResult);
  }, [scenarios, config]);

  const handleReset = () => {
    resetCalculator('comparison');
    setResults(null);
    setScenarios([
      {
        name: 'Conventional 20% Down',
        program: 'conventional',
        salesPrice: 500000,
        downPaymentPercent: 20,
        interestRate: 7.0,
        termYears: 30,
      },
      {
        name: 'FHA 3.5% Down',
        program: 'fha',
        salesPrice: 500000,
        downPaymentPercent: 3.5,
        interestRate: 6.5,
        termYears: 30,
      },
      {
        name: 'VA 0% Down',
        program: 'va',
        salesPrice: 500000,
        downPaymentPercent: 0,
        interestRate: 6.5,
        termYears: 30,
      },
    ]);
  };

  const programOptions = [
    { value: 'conventional', label: 'Conventional' },
    { value: 'fha', label: 'FHA' },
    { value: 'va', label: 'VA' },
  ];

  const termOptions = [
    { value: '30', label: '30 Years' },
    { value: '20', label: '20 Years' },
    { value: '15', label: '15 Years' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t('comparison.title')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t('comparison.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addScenario} variant="outline" disabled={scenarios.length >= 4}>
            + {t('comparison.addScenario')}
          </Button>
          <Button onClick={handleReset} variant="ghost">
            {t('common.reset')}
          </Button>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {scenarios.map((scenario, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => updateScenario(index, 'name', e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-zinc-900 dark:text-zinc-100"
                />
                {scenarios.length > 2 && (
                  <button
                    onClick={() => removeScenario(index)}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    title={t('comparison.removeScenario')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <SelectGroup
                label={t('calculator.loanProgram')}
                name={`program-${index}`}
                value={scenario.program}
                onChange={(val) => updateScenario(index, 'program', val as LoanProgram)}
                options={programOptions}
              />

              <InputGroup
                label={t('calculator.salesPrice')}
                name={`salesPrice-${index}`}
                type="number"
                value={scenario.salesPrice}
                onChange={(val) => updateScenario(index, 'salesPrice', Number(val) || 0)}
                prefix="$"
              />

              <InputGroup
                label={t('calculator.downPaymentPercent')}
                name={`downPayment-${index}`}
                type="number"
                value={scenario.downPaymentPercent}
                onChange={(val) => updateScenario(index, 'downPaymentPercent', Number(val) || 0)}
                suffix="%"
                step="0.5"
              />

              <InputGroup
                label={t('calculator.interestRate')}
                name={`interestRate-${index}`}
                type="number"
                value={scenario.interestRate}
                onChange={(val) => updateScenario(index, 'interestRate', Number(val) || 0)}
                suffix="%"
                step="0.125"
              />

              <SelectGroup
                label={t('calculator.term')}
                name={`term-${index}`}
                value={String(scenario.termYears)}
                onChange={(val) => updateScenario(index, 'termYears', Number(val))}
                options={termOptions}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <Button onClick={onCalculate} size="lg">
          {t('common.calculate')}
        </Button>
      </div>

      {/* Results Comparison Table */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 dark:text-zinc-400">Metric</th>
                    {results.scenarios.map((s, i) => (
                      <th key={i} className="text-right py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Loan Amount</td>
                    {results.scenarios.map((s, i) => (
                      <td key={i} className="text-right py-3 px-4 font-medium">
                        {formatCurrency(s.loanAmount)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Down Payment</td>
                    {results.scenarios.map((s, i) => (
                      <td key={i} className="text-right py-3 px-4">
                        {formatCurrency(s.downPayment)}
                        <span className="text-zinc-400 text-xs ml-1">
                          ({formatPercent(s.ltv > 0 ? 100 - s.ltv : 0)})
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
                    <td className="py-3 px-4 font-medium text-blue-700 dark:text-blue-300">Monthly Payment</td>
                    {results.scenarios.map((s, i) => (
                      <td key={i} className="text-right py-3 px-4 font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(s.monthlyPayment)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 pl-8">P&I</td>
                    {results.scenarios.map((s, i) => (
                      <td key={i} className="text-right py-3 px-4">
                        {formatCurrency(s.principalAndInterest)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 pl-8">Mortgage Insurance</td>
                    {results.scenarios.map((s, i) => (
                      <td key={i} className="text-right py-3 px-4">
                        {s.mortgageInsurance > 0
                          ? formatCurrency(s.mortgageInsurance)
                          : '—'
                        }
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-green-50 dark:bg-green-900/20">
                    <td className="py-3 px-4 font-medium text-green-700 dark:text-green-300">Cash to Close</td>
                    {results.scenarios.map((s, i) => (
                      <td key={i} className="text-right py-3 px-4 font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(s.cashToClose)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Lowest Monthly Payment
                </h4>
                {(() => {
                  const lowest = results.scenarios.reduce((min, s) =>
                    s.monthlyPayment < min.monthlyPayment ? s : min
                  );
                  return (
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(lowest.monthlyPayment)}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{lowest.name}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Lowest Cash to Close
                </h4>
                {(() => {
                  const lowest = results.scenarios.reduce((min, s) =>
                    s.cashToClose < min.cashToClose ? s : min
                  );
                  return (
                    <div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(lowest.cashToClose)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">{lowest.name}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                  No Mortgage Insurance
                </h4>
                {(() => {
                  const noMI = results.scenarios.filter(s => s.mortgageInsurance === 0);
                  return (
                    <div>
                      {noMI.length > 0 ? (
                        <>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {noMI.length} option{noMI.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            {noMI.map(s => s.name).join(', ')}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          All options require mortgage insurance
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
