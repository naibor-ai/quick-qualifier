'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateVaRefinance } from '@/lib/calculations/va';
import { InputGroup, SelectGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';
import { VaUsage } from '@/lib/schemas';

const formSchema = z.object({
  propertyValue: z.number().min(10000).max(100000000),
  existingLoanBalance: z.number().min(0),
  newLoanAmount: z.number().min(10000),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  mortgageInsuranceMonthly: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  isIrrrl: z.boolean(),
  vaUsage: z.enum(['first', 'subsequent']),
  isDisabledVeteran: z.boolean(),
  loanFee: z.number().min(0),
  cashOutAmount: z.number().min(0),
  // Prepaid Items
  prepaidInterestDays: z.number().min(0).max(365),
  prepaidTaxMonths: z.number().min(0).max(60),
  prepaidInsuranceMonths: z.number().min(0).max(60),
  prepaidInterestAmount: z.number().min(0),
  prepaidTaxAmount: z.number().min(0),
  prepaidInsuranceAmount: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export function VaRefiForm() {
  const t = useTranslations();
  const {
    vaRefiInputs,
    updateVaRefiInputs,
    vaRefiResult,
    setVaRefiResult,
    resetCalculator,
    config,
    configLoading,
  } = useCalculatorStore();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyValue: vaRefiInputs.propertyValue,
      existingLoanBalance: vaRefiInputs.existingLoanBalance,
      newLoanAmount: vaRefiInputs.newLoanAmount,
      interestRate: vaRefiInputs.interestRate,
      termYears: vaRefiInputs.termYears,
      propertyTaxAnnual: vaRefiInputs.propertyTaxAnnual,
      homeInsuranceAnnual: vaRefiInputs.homeInsuranceAnnual,
      mortgageInsuranceMonthly: vaRefiInputs.mortgageInsuranceMonthly || 0,
      hoaDuesMonthly: vaRefiInputs.hoaDuesMonthly,
      isIrrrl: vaRefiInputs.isIrrrl,
      vaUsage: vaRefiInputs.vaUsage,
      isDisabledVeteran: vaRefiInputs.isDisabledVeteran,
      cashOutAmount: vaRefiInputs.cashOutAmount,
      prepaidInterestDays: vaRefiInputs.prepaidInterestDays ?? 15,
      prepaidTaxMonths: vaRefiInputs.prepaidTaxMonths ?? 0,
      prepaidInsuranceMonths: vaRefiInputs.prepaidInsuranceMonths ?? 0,
      prepaidInterestAmount: vaRefiInputs.prepaidInterestAmount || 0,
      prepaidTaxAmount: vaRefiInputs.prepaidTaxAmount || 0,
      prepaidInsuranceAmount: vaRefiInputs.prepaidInsuranceAmount || 0,
      loanFee: vaRefiInputs.loanFee || 0,
    },
  });

  const isIrrrl = watch('isIrrrl');
  const isDisabledVeteran = watch('isDisabledVeteran');
  const watchedNewLoanAmount = watch('newLoanAmount');

  // Sync Loan Fee / Origination Fee (1% of loan amount)
  useEffect(() => {
    if (watchedNewLoanAmount > 0) {
      setValue('loanFee', Math.round(watchedNewLoanAmount * 0.01));
    }
  }, [watchedNewLoanAmount, setValue]);

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) return;

    updateVaRefiInputs(data);

    const result = calculateVaRefinance(
      {
        propertyValue: data.propertyValue,
        existingLoanBalance: data.existingLoanBalance,
        newLoanAmount: data.newLoanAmount,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxMonthly: data.propertyTaxAnnual / 12,
        homeInsuranceMonthly: data.homeInsuranceAnnual / 12,
        mortgageInsuranceMonthly: data.mortgageInsuranceMonthly ?? 0,
        hoaDuesMonthly: data.hoaDuesMonthly,
        isIrrrl: data.isIrrrl,
        vaUsage: data.vaUsage,
        isDisabledVeteran: data.isDisabledVeteran,
        cashOutAmount: data.cashOutAmount,
        payoffDays: 30,
        prepaidInterestDays: data.prepaidInterestDays,
        prepaidTaxMonths: data.prepaidTaxMonths,
        prepaidInsuranceMonths: data.prepaidInsuranceMonths,
        prepaidInterestAmount: data.prepaidInterestAmount || 0,
        prepaidTaxAmount: data.prepaidTaxAmount || 0,
        prepaidInsuranceAmount: data.prepaidInsuranceAmount || 0,
        loanFee: data.loanFee,
      },
      config
    );

    setVaRefiResult(result);

    // Sync calculated values back to input fields if they are 0
    if (!data.prepaidInterestAmount) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);
  }, [config, updateVaRefiInputs, setVaRefiResult, setValue]);

  const handleReset = () => {
    resetCalculator('vaRefi');
    setVaRefiResult(null);
  };

  const termOptions = [
    { value: '30', label: t('terms.30yr') },
    { value: '25', label: t('terms.25yr') },
    { value: '20', label: t('terms.20yr') },
    { value: '15', label: t('terms.15yr') },
    { value: '10', label: t('terms.10yr') },
  ];

  const refiTypeOptions = [
    { value: 'false', label: t('refinance.cashOutRefi') },
    { value: 'true', label: t('refinance.irrrl') },
  ];

  const vaUsageOptions = [
    { value: 'first', label: t('va.usage.first') },
    { value: 'subsequent', label: t('va.usage.subsequent') },
  ];

  const boolOptions = [
    { value: 'false', label: t('common.no') },
    { value: 'true', label: t('common.yes') },
  ];

  const isDisabled = configLoading || !config;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('vaRefi.title')}</CardTitle>
          <CardDescription>{t('vaRefi.description')}</CardDescription>
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
                name="isIrrrl"
                control={control}
                render={({ field }) => (
                  <SelectGroup
                    label={t('refinance.vaRefiType')}
                    name="isIrrrl"
                    value={String(field.value)}
                    onChange={(val) => field.onChange(val === 'true')}
                    options={refiTypeOptions}
                    disabled={isDisabled}
                  />
                )}
              />

              {isIrrrl && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {t('refinance.irrrlNote')}
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

              {!isIrrrl && (
                <Controller
                  name="cashOutAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('refinance.cashOutAmount')}
                      name="cashOutAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      error={errors.cashOutAmount?.message}
                      disabled={isDisabled}
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

            {/* VA Eligibility */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {t('calculator.sections.vaEligibility')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
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
                      disabled={isDisabled}
                    />
                  )}
                />

                <Controller
                  name="isDisabledVeteran"
                  control={control}
                  render={({ field }) => (
                    <SelectGroup
                      label={t('calculator.isDisabledVeteran')}
                      name="isDisabledVeteran"
                      value={String(field.value)}
                      onChange={(val) => field.onChange(val === 'true')}
                      options={boolOptions}
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>

              {isDisabledVeteran && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    {t('va.fundingFeeWaived')}
                  </p>
                </div>
              )}
            </div>

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
                    helperText="Annual"
                    disabled={isDisabled}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mt-6">
                {t('calculator.sections.monthlyCosts')}
              </h3>

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

              <Controller
                name="loanFee"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label="Loan Fee / Origination Fee"
                    name="loanFee"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    disabled={isDisabled}
                  />
                )}
              />
            </div>

            {/* Prepaid Items Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {t('calculator.sections.prepaids')}
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="prepaidInterestDays"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Interest Days"
                      name="prepaidInterestDays"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      suffix="days"
                    />
                  )}
                />

                <Controller
                  name="prepaidTaxMonths"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Tax Months"
                      name="prepaidTaxMonths"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      suffix="mo"
                    />
                  )}
                />

                <Controller
                  name="prepaidInsuranceMonths"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Insurance Months"
                      name="prepaidInsuranceMonths"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      suffix="mo"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="prepaidInterestAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Pre. Interest Amount"
                      name="prepaidInterestAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      disabled={isDisabled}
                    />
                  )}
                />

                <Controller
                  name="prepaidTaxAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Prepaid Tax Amount"
                      name="prepaidTaxAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      disabled={isDisabled}
                    />
                  )}
                />

                <Controller
                  name="prepaidInsuranceAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Prepaid Ins Amount"
                      name="prepaidInsuranceAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>
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
        {vaRefiResult ? (
          <ResultSummary result={vaRefiResult} formId="va-refi" />
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
