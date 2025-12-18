'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateConventionalRefinance } from '@/lib/calculations/conventional';
import { InputGroup, SelectGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';
import { CreditScoreTier } from '@/lib/schemas';

const ConventionalRefinanceType = z.enum(['rate_term', 'cash_out']);

const formSchema = z.object({
  propertyValue: z.number().min(10000).max(100000000),
  existingLoanBalance: z.number().min(0),
  newLoanAmount: z.number().min(10000),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  creditScoreTier: CreditScoreTier,
  refinanceType: ConventionalRefinanceType,
});

type FormValues = z.infer<typeof formSchema>;

export function ConventionalRefiForm() {
  const t = useTranslations();
  const {
    conventionalRefiInputs,
    updateConventionalRefiInputs,
    conventionalRefiResult,
    setConventionalRefiResult,
    resetCalculator,
    config,
    configLoading,
  } = useCalculatorStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyValue: conventionalRefiInputs.propertyValue,
      existingLoanBalance: conventionalRefiInputs.existingLoanBalance,
      newLoanAmount: conventionalRefiInputs.newLoanAmount,
      interestRate: conventionalRefiInputs.interestRate,
      termYears: conventionalRefiInputs.termYears,
      propertyTaxAnnual: conventionalRefiInputs.propertyTaxAnnual,
      homeInsuranceAnnual: conventionalRefiInputs.homeInsuranceAnnual,
      hoaDuesMonthly: conventionalRefiInputs.hoaDuesMonthly,
      creditScoreTier: conventionalRefiInputs.creditScoreTier,
      refinanceType: conventionalRefiInputs.refinanceType,
    },
  });

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) return;

    updateConventionalRefiInputs(data);

    const result = calculateConventionalRefinance(
      {
        propertyValue: data.propertyValue,
        existingLoanBalance: data.existingLoanBalance,
        newLoanAmount: data.newLoanAmount,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxAnnual: data.propertyTaxAnnual,
        homeInsuranceAnnual: data.homeInsuranceAnnual,
        hoaDuesMonthly: data.hoaDuesMonthly,
        creditScoreTier: data.creditScoreTier,
        refinanceType: data.refinanceType as 'rate_term' | 'cash_out',
        payoffDays: 30,
        cashOutAmount: 0,
      },
      config
    );

    setConventionalRefiResult(result);
  }, [config, updateConventionalRefiInputs, setConventionalRefiResult]);

  const handleReset = () => {
    resetCalculator('conventionalRefi');
    setConventionalRefiResult(null);
  };

  const creditTierOptions = [
    { value: '760', label: t('creditTiers.760plus') },
    { value: '740', label: t('creditTiers.740to759') },
    { value: '720', label: t('creditTiers.720to739') },
    { value: '700', label: t('creditTiers.700to719') },
    { value: '680', label: t('creditTiers.680to699') },
    { value: '660', label: t('creditTiers.660to679') },
    { value: '640', label: t('creditTiers.640to659') },
    { value: '620', label: t('creditTiers.620to639') },
  ];

  const refinanceTypeOptions = [
    { value: 'rate_term', label: t('refinance.rateAndTerm') },
    { value: 'cash_out', label: t('refinance.cashOut') },
  ];

  const termOptions = [
    { value: '30', label: t('terms.30yr') },
    { value: '25', label: t('terms.25yr') },
    { value: '20', label: t('terms.20yr') },
    { value: '15', label: t('terms.15yr') },
    { value: '10', label: t('terms.10yr') },
  ];

  const isDisabled = configLoading || !config;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('conventionalRefi.title')}</CardTitle>
          <CardDescription>{t('conventionalRefi.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!config && !configLoading && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                {t('errors.configLoadError')}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit(onCalculate)} className="space-y-6">
            {/* Property & Loan */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {t('calculator.sections.propertyLoan')}
              </h3>

              <Controller
                name="propertyValue"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('refinance.propertyValue')}
                    name="propertyValue"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    error={errors.propertyValue?.message}
                    disabled={isDisabled}
                    required
                  />
                )}
              />

              <Controller
                name="existingLoanBalance"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('refinance.existingBalance')}
                    name="existingLoanBalance"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    error={errors.existingLoanBalance?.message}
                    disabled={isDisabled}
                    required
                  />
                )}
              />

              <Controller
                name="newLoanAmount"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('refinance.newLoanAmount')}
                    name="newLoanAmount"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    error={errors.newLoanAmount?.message}
                    disabled={isDisabled}
                    required
                  />
                )}
              />

              <Controller
                name="refinanceType"
                control={control}
                render={({ field }) => (
                  <SelectGroup
                    label={t('refinance.type')}
                    name="refinanceType"
                    value={field.value}
                    onChange={field.onChange}
                    options={refinanceTypeOptions}
                    disabled={isDisabled}
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="interestRate"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.interestRate')}
                      name="interestRate"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      suffix="%"
                      step="0.125"
                      error={errors.interestRate?.message}
                      disabled={isDisabled}
                      required
                    />
                  )}
                />

                <Controller
                  name="termYears"
                  control={control}
                  render={({ field }) => (
                    <SelectGroup
                      label={t('calculator.term')}
                      name="termYears"
                      value={String(field.value)}
                      onChange={(val) => field.onChange(Number(val))}
                      options={termOptions}
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>
            </div>

            {/* Monthly Costs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {t('calculator.sections.monthlyCosts')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="propertyTaxAnnual"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.propertyTax')}
                      name="propertyTaxAnnual"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      helperText={t('common.annual')}
                      disabled={isDisabled}
                    />
                  )}
                />

                <Controller
                  name="homeInsuranceAnnual"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.homeInsurance')}
                      name="homeInsuranceAnnual"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      helperText={t('common.annual')}
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>

              <Controller
                name="hoaDuesMonthly"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('calculator.hoaDues')}
                    name="hoaDuesMonthly"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    disabled={isDisabled}
                  />
                )}
              />
            </div>

            {/* Credit */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {t('calculator.sections.credit')}
              </h3>

              <Controller
                name="creditScoreTier"
                control={control}
                render={({ field }) => (
                  <SelectGroup
                    label={t('calculator.creditScore')}
                    name="creditScoreTier"
                    value={field.value}
                    onChange={field.onChange}
                    options={creditTierOptions}
                    disabled={isDisabled}
                  />
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth disabled={isDisabled} loading={configLoading}>
                {t('common.calculate')}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={isDisabled}>
                {t('common.reset')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {conventionalRefiResult ? (
          <ResultSummary result={conventionalRefiResult} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  {t('calculator.readyToCalculate')}
                </h3>
                <p className="text-sm text-slate-500">
                  {t('refinance.enterDetails')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
