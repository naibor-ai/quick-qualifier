'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateVaPurchase } from '@/lib/calculations/va';
import { InputGroup, SelectGroup, CheckboxGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';
import type { GhlConfig, VaUsage } from '@/lib/schemas';

const formSchema = z.object({
  salesPrice: z.number().min(10000).max(100000000),
  downPaymentAmount: z.number().min(0),
  downPaymentPercent: z.number().min(0).max(100),
  downPaymentMode: z.enum(['amount', 'percent']),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  floodInsuranceMonthly: z.number().min(0),
  vaUsage: z.enum(['first', 'subsequent', 'refinance']),
  isDisabledVeteran: z.boolean(),
  isReservist: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function VaForm() {
  const t = useTranslations();
  const {
    vaInputs,
    updateVaInputs,
    vaResult,
    setVaResult,
    resetCalculator,
    config,
  } = useCalculatorStore();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesPrice: vaInputs.salesPrice,
      downPaymentAmount: vaInputs.downPaymentAmount,
      downPaymentPercent: vaInputs.downPaymentPercent,
      downPaymentMode: vaInputs.downPaymentMode,
      interestRate: vaInputs.interestRate,
      termYears: vaInputs.termYears,
      propertyTaxAnnual: vaInputs.propertyTaxAnnual,
      homeInsuranceAnnual: vaInputs.homeInsuranceAnnual,
      hoaDuesMonthly: vaInputs.hoaDuesMonthly,
      floodInsuranceMonthly: vaInputs.floodInsuranceMonthly,
      vaUsage: vaInputs.vaUsage,
      isDisabledVeteran: vaInputs.isDisabledVeteran,
      isReservist: vaInputs.isReservist,
    },
  });

  const watchedValues = watch();
  const salesPrice = watch('salesPrice');
  const downPaymentMode = watch('downPaymentMode');
  const isDisabledVeteran = watch('isDisabledVeteran');

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
    // Update store with current inputs
    updateVaInputs(data);

    // Build config for calculation
    const calcConfig: GhlConfig = config ?? {
      companyName: '',
      companyNmls: '',
      companyPhone: '',
      companyEmail: '',
      defaultInterestRate: data.interestRate,
      defaultPropertyTaxRate: 1.2,
      defaultHomeInsuranceRate: 0.35,
      pmiRates: {},
      fhaMipRates: { upfront: 1.75, annual: 0.55 },
      vaFundingFeeRates: {},
      closingCostDefaults: {
        originationFeePercent: 1,
        processingFee: 500,
        underwritingFee: 500,
        appraisalFee: 550,
        creditReportFee: 50,
        floodCertFee: 15,
        titleInsuranceRate: 0.5,
        settlementFee: 500,
        recordingFees: 150,
        prepaidInterestDays: 15,
        escrowMonthsTaxes: 3,
        escrowMonthsInsurance: 3,
      },
    };

    // Calculate the down payment based on mode
    const downPayment = data.downPaymentMode === 'percent'
      ? (data.salesPrice * data.downPaymentPercent) / 100
      : data.downPaymentAmount;

    // Run calculation
    const result = calculateVaPurchase(
      {
        salesPrice: data.salesPrice,
        downPayment,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxAnnual: data.propertyTaxAnnual,
        homeInsuranceAnnual: data.homeInsuranceAnnual,
        hoaDuesMonthly: data.hoaDuesMonthly,
        floodInsuranceMonthly: data.floodInsuranceMonthly,
        vaUsage: data.vaUsage as VaUsage,
        isDisabledVeteran: data.isDisabledVeteran,
        isReservist: data.isReservist,
      },
      calcConfig
    );

    setVaResult(result);
  }, [config, updateVaInputs, setVaResult]);

  const handleReset = () => {
    resetCalculator('va');
    setVaResult(null);
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

  const vaUsageOptions = [
    { value: 'first', label: t('va.usage.first') },
    { value: 'subsequent', label: t('va.usage.subsequent') },
    { value: 'refinance', label: t('va.usage.refinance') },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('va.title')}</CardTitle>
          <CardDescription>{t('va.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onCalculate)} className="space-y-6">
            {/* Property & Loan */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
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
                      error={errors.downPaymentPercent?.message}
                      helperText="VA allows 0% down payment"
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
                      helperText="VA allows 0% down payment"
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
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
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

            {/* VA Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                VA Loan Details
              </h3>

              <Controller
                name="vaUsage"
                control={control}
                render={({ field }) => (
                  <SelectGroup
                    label={t('calculator.vaUsage')}
                    name="vaUsage"
                    value={field.value}
                    onChange={field.onChange}
                    options={vaUsageOptions}
                  />
                )}
              />

              <Controller
                name="isDisabledVeteran"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    label={t('calculator.isDisabledVeteran')}
                    name="isDisabledVeteran"
                    checked={field.value}
                    onChange={field.onChange}
                    helperText="Exempt from VA funding fee"
                  />
                )}
              />

              <Controller
                name="isReservist"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    label={t('calculator.isReservist')}
                    name="isReservist"
                    checked={field.value}
                    onChange={field.onChange}
                    helperText="Higher funding fee rates apply"
                    disabled={isDisabledVeteran}
                  />
                )}
              />
            </div>

            {/* VA Fee Info */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                VA Loan Benefits
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• No down payment required</li>
                <li>• No monthly mortgage insurance (PMI)</li>
                <li>• Funding fee can be financed into loan</li>
                <li>• Disabled veterans are exempt from funding fee</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth>
                {t('common.calculate')}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {vaResult ? (
          <ResultSummary result={vaResult} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎖️</div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Enter your VA loan details and click Calculate to see your estimated payment breakdown.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
