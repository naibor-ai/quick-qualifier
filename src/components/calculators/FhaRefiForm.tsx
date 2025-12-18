'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateFhaRefinance } from '@/lib/calculations/fha';
import { InputGroup, SelectGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';

const formSchema = z.object({
  propertyValue: z.number().min(10000).max(100000000),
  existingLoanBalance: z.number().min(0),
  newLoanAmount: z.number().min(10000),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  isStreamline: z.boolean(),
  originationPoints: z.number().min(0).max(5).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export function FhaRefiForm() {
  const t = useTranslations();
  const {
    fhaRefiInputs,
    updateFhaRefiInputs,
    fhaRefiResult,
    setFhaRefiResult,
    resetCalculator,
    config,
    configLoading,
  } = useCalculatorStore();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyValue: fhaRefiInputs.propertyValue,
      existingLoanBalance: fhaRefiInputs.existingLoanBalance,
      newLoanAmount: fhaRefiInputs.newLoanAmount,
      interestRate: fhaRefiInputs.interestRate,
      termYears: fhaRefiInputs.termYears,
      propertyTaxAnnual: fhaRefiInputs.propertyTaxAnnual,
      homeInsuranceAnnual: fhaRefiInputs.homeInsuranceAnnual,
      hoaDuesMonthly: fhaRefiInputs.hoaDuesMonthly,
      isStreamline: fhaRefiInputs.isStreamline,
      originationPoints: (fhaRefiInputs as any).originationPoints ?? 0,
    },
  });

  const isStreamline = watch('isStreamline');

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) return;

    updateFhaRefiInputs(data);

    const result = calculateFhaRefinance(
      {
        propertyValue: data.propertyValue,
        existingLoanBalance: data.existingLoanBalance,
        newLoanAmount: data.newLoanAmount,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxAnnual: data.propertyTaxAnnual,
        homeInsuranceAnnual: data.homeInsuranceAnnual,
        hoaDuesMonthly: data.hoaDuesMonthly,
        isStreamline: data.isStreamline,
        payoffDays: 30,
        originationPoints: data.originationPoints,
      },
      config
    );

    setFhaRefiResult(result);
  }, [config, updateFhaRefiInputs, setFhaRefiResult]);

  const handleReset = () => {
    resetCalculator('fhaRefi');
    setFhaRefiResult(null);
  };

  const termOptions = [
    { value: '30', label: t('terms.30yr') },
    { value: '25', label: t('terms.25yr') },
    { value: '20', label: t('terms.20yr') },
    { value: '15', label: t('terms.15yr') },
    { value: '10', label: t('terms.10yr') },
  ];

  const streamlineOptions = [
    { value: 'false', label: t('refinance.standardRefi') },
    { value: 'true', label: t('refinance.streamline') },
  ];

  const isDisabled = configLoading || !config;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('fhaRefi.title')}</CardTitle>
          <CardDescription>{t('fhaRefi.description')}</CardDescription>
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
            {/* Refinance Type */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {t('refinance.type')}
              </h3>

              <Controller
                name="isStreamline"
                control={control}
                render={({ field }) => (
                  <SelectGroup
                    label={t('refinance.fhaRefiType')}
                    name="isStreamline"
                    value={String(field.value)}
                    onChange={(val) => field.onChange(val === 'true')}
                    options={streamlineOptions}
                    disabled={isDisabled}
                  />
                )}
              />

              {isStreamline && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {t('refinance.streamlineNote')}
                  </p>
                </div>
              )}
            </div>

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
        {fhaRefiResult ? (
          <ResultSummary
            result={fhaRefiResult}
            config={config!}
            loanType={t('fhaRefi.title')}
            formId="fha-refi"
          />
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
