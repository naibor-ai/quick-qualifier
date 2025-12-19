'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateFhaPurchase } from '@/lib/calculations/fha';
import { InputGroup, SelectGroup, CheckboxGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, AgentSelector } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';

const formSchema = z.object({
  salesPrice: z.number().min(10000).max(100000000),
  downPaymentAmount: z.number().min(0),
  downPaymentPercent: z.number().min(3.5).max(100),
  downPaymentMode: z.enum(['amount', 'percent']),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  floodInsuranceMonthly: z.number().min(0),
  is203k: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function FhaForm() {
  const t = useTranslations();
  const {
    fhaInputs,
    updateFhaInputs,
    fhaResult,
    setFhaResult,
    resetCalculator,
    config,
    configLoading,
  } = useCalculatorStore();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesPrice: fhaInputs.salesPrice,
      downPaymentAmount: fhaInputs.downPaymentAmount,
      downPaymentPercent: fhaInputs.downPaymentPercent,
      downPaymentMode: fhaInputs.downPaymentMode,
      interestRate: fhaInputs.interestRate,
      termYears: fhaInputs.termYears,
      propertyTaxAnnual: fhaInputs.propertyTaxAnnual,
      homeInsuranceAnnual: fhaInputs.homeInsuranceAnnual,
      hoaDuesMonthly: fhaInputs.hoaDuesMonthly,
      floodInsuranceMonthly: fhaInputs.floodInsuranceMonthly,
      is203k: fhaInputs.is203k,
    },
  });

  const watchedValues = watch();
  const salesPrice = watch('salesPrice');
  const downPaymentMode = watch('downPaymentMode');

  // Sync down payment amount/percent
  useEffect(() => {
    if (downPaymentMode === 'percent') {
      const percent = watchedValues.downPaymentPercent;
      const amount = (salesPrice * percent) / 100;
      setValue('downPaymentAmount', Math.round(amount * 100) / 100);
    }
  }, [watchedValues.downPaymentPercent, salesPrice, downPaymentMode, setValue]);

  useEffect(() => {
    if (downPaymentMode === 'amount') {
      const amount = watchedValues.downPaymentAmount;
      const percent = salesPrice > 0 ? (amount / salesPrice) * 100 : 0;
      setValue('downPaymentPercent', Math.round(percent * 100) / 100);
    }
  }, [watchedValues.downPaymentAmount, salesPrice, downPaymentMode, setValue]);

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) {
      return; // Config required for calculation
    }

    // Update store with current inputs
    updateFhaInputs(data);

    // Run calculation using the GHL config
    const result = calculateFhaPurchase(
      {
        salesPrice: data.salesPrice,
        downPaymentAmount: data.downPaymentMode === 'amount' ? data.downPaymentAmount : undefined,
        downPaymentPercent: data.downPaymentMode === 'percent' ? data.downPaymentPercent : undefined,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxAnnual: data.propertyTaxAnnual,
        homeInsuranceAnnual: data.homeInsuranceAnnual,
        hoaDuesMonthly: data.hoaDuesMonthly,
        floodInsuranceMonthly: data.floodInsuranceMonthly,
        is203k: data.is203k,
      },
      config
    );

    setFhaResult(result);
  }, [config, updateFhaInputs, setFhaResult]);

  const handleReset = () => {
    resetCalculator('fha');
    setFhaResult(null);
  };

  const termOptions = [
    { value: '30', label: '30 Years' },
    { value: '25', label: '25 Years' },
    { value: '20', label: '20 Years' },
    { value: '15', label: '15 Years' },
  ];

  const downPaymentModeOptions = [
    { value: 'percent', label: t('common.percent') },
    { value: 'amount', label: t('common.amount') },
  ];

  const isDisabled = configLoading || !config;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('fha.title')}</CardTitle>
          <CardDescription>{t('fha.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!config && !configLoading && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                {t('errors.configLoadError')}. Please check your GHL configuration.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit(onCalculate)} className="space-y-6">
            {/* Property & Loan */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Property & Loan
              </h3>

              <Controller
                name="salesPrice"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('calculator.salesPrice')}
                    name="salesPrice"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    error={errors.salesPrice?.message}
                    required
                  />
                )}
              />

              <Controller
                name="downPaymentMode"
                control={control}
                render={({ field }) => (
                  <SelectGroup
                    label={t('calculator.downPaymentMode')}
                    name="downPaymentMode"
                    value={field.value}
                    onChange={field.onChange}
                    options={downPaymentModeOptions}
                  />
                )}
              />

              {downPaymentMode === 'percent' ? (
                <Controller
                  name="downPaymentPercent"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.downPaymentPercent')}
                      name="downPaymentPercent"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      suffix="%"
                      step="0.1"
                      min={3.5}
                      error={errors.downPaymentPercent?.message}
                      helperText="FHA minimum is 3.5%"
                      required
                    />
                  )}
                />
              ) : (
                <Controller
                  name="downPaymentAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.downPaymentAmount')}
                      name="downPaymentAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      error={errors.downPaymentAmount?.message}
                      required
                    />
                  )}
                />
              )}

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
                    />
                  )}
                />
              </div>
            </div>

            {/* Monthly Costs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Monthly Costs
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
                      helperText="Annual"
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
                      helperText="Annual"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    />
                  )}
                />

                <Controller
                  name="floodInsuranceMonthly"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.floodInsurance')}
                      name="floodInsuranceMonthly"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                    />
                  )}
                />
              </div>
            </div>

            {/* FHA Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                FHA Options
              </h3>

              <Controller
                name="is203k"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    label={t('calculator.is203k')}
                    name="is203k"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                    helperText="FHA 203(k) loans have higher UFMIP"
                    disabled={isDisabled}
                  />
                )}
              />
            </div>

            {/* FHA Fee Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                FHA Mortgage Insurance
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upfront MIP (UFMIP): 1.75% of loan amount</li>
                <li>• Annual MIP: 0.55% (for most loans)</li>
                <li>• MIP is required for life of loan</li>
              </ul>
            </div>

            {/* Partner Agent */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Partner Agent
              </h3>
              <AgentSelector disabled={isDisabled} />
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
        {fhaResult ? (
          <ResultSummary
            result={fhaResult}
            config={config}
            loanType={t('fha.title')}
            formId="fha"
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-sm text-slate-500">
                  Enter your FHA loan details and click Calculate to see your estimated payment breakdown.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
