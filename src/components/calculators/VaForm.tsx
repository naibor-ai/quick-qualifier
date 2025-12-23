'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateVaPurchase } from '@/lib/calculations/va';
import { InputGroup, SelectGroup, CheckboxGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, AgentSelector } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';
import type { VaUsage } from '@/lib/schemas';

const formSchema = z.object({
  salesPrice: z.number().min(10000).max(100000000),
  downPaymentAmount: z.number().min(0),
  downPaymentPercent: z.number().min(0).max(100),
  downPaymentMode: z.enum(['amount', 'percent']),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  propertyTaxMonthly: z.number().min(0),
  homeInsuranceMonthly: z.number().min(0),
  mortgageInsuranceMonthly: z.number().min(0).default(0),
  hoaDuesMonthly: z.number().min(0),
  floodInsuranceMonthly: z.number().min(0),
  vaUsage: z.enum(['first', 'subsequent']),
  isDisabledVeteran: z.boolean(),
  isReservist: z.boolean(),
  loanFee: z.number().min(0),
  prepaidInterestDays: z.number().min(0).max(365).default(15),
  prepaidTaxMonths: z.number().min(0).max(60).default(6),
  prepaidInsuranceMonths: z.number().min(0).max(60).default(15),
  prepaidInterestAmount: z.number().min(0).default(0),
  prepaidTaxAmount: z.number().min(0).default(0),
  prepaidInsuranceAmount: z.number().min(0).default(0),
  sellerCreditAmount: z.number().min(0),
  lenderCreditAmount: z.number().min(0),
  depositAmount: z.number().min(0),
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
    configLoading,
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
      propertyTaxMonthly: parseFloat((vaInputs.propertyTaxAnnual / 12).toFixed(2)),
      homeInsuranceMonthly: parseFloat((vaInputs.homeInsuranceAnnual / 12).toFixed(2)),
      mortgageInsuranceMonthly: vaInputs.mortgageInsuranceMonthly,
      hoaDuesMonthly: vaInputs.hoaDuesMonthly,
      floodInsuranceMonthly: vaInputs.floodInsuranceMonthly,
      vaUsage: vaInputs.vaUsage,
      isDisabledVeteran: vaInputs.isDisabledVeteran,
      isReservist: vaInputs.isReservist,
      prepaidInterestDays: vaInputs.prepaidInterestDays ?? 15,
      prepaidTaxMonths: vaInputs.prepaidTaxMonths ?? 6,
      prepaidInsuranceMonths: vaInputs.prepaidInsuranceMonths ?? 15,
      prepaidInterestAmount: vaInputs.prepaidInterestAmount || 0,
      prepaidTaxAmount: vaInputs.prepaidTaxAmount || 0,
      prepaidInsuranceAmount: vaInputs.prepaidInsuranceAmount || 0,
      loanFee: vaInputs.loanFee || 0,
      sellerCreditAmount: vaInputs.sellerCreditAmount || 0,
      lenderCreditAmount: vaInputs.lenderCreditAmount || 0,
      depositAmount: vaInputs.depositAmount || 0,
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

  // Sync Loan Fee / Origination Fee (1% of loan amount)
  useEffect(() => {
    const amount = watchedValues.downPaymentAmount || 0;
    const loanAmount = (watchedValues.salesPrice || 0) - amount;
    if (loanAmount > 0) {
      setValue('loanFee', Math.round(loanAmount * 0.01));
    }
  }, [watchedValues.salesPrice, watchedValues.downPaymentAmount, setValue]);

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) {
      return; // Config required for calculation
    }

    // Update store with current inputs
    updateVaInputs(data);

    // Run calculation using the GHL config
    const result = calculateVaPurchase(
      {
        salesPrice: data.salesPrice,
        downPaymentAmount: data.downPaymentMode === 'amount' ? data.downPaymentAmount : undefined,
        downPaymentPercent: data.downPaymentMode === 'percent' ? data.downPaymentPercent : undefined,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxMonthly: data.propertyTaxAnnual / 12,
        homeInsuranceMonthly: data.homeInsuranceAnnual / 12,
        mortgageInsuranceMonthly: data.mortgageInsuranceMonthly ?? 0,
        hoaDuesMonthly: data.hoaDuesMonthly,
        floodInsuranceMonthly: data.floodInsuranceMonthly,
        vaUsage: data.vaUsage as VaUsage,
        isDisabledVeteran: data.isDisabledVeteran,
        isReservist: data.isReservist,
        prepaidInterestDays: data.prepaidInterestDays,
        prepaidTaxMonths: data.prepaidTaxMonths,
        prepaidInsuranceMonths: data.prepaidInsuranceMonths,
        prepaidInterestAmount: data.prepaidInterestAmount || 0,
        prepaidTaxAmount: data.prepaidTaxAmount || 0,
        prepaidInsuranceAmount: data.prepaidInsuranceAmount || 0,
        loanFee: data.loanFee,
        sellerCreditAmount: data.sellerCreditAmount,
        lenderCreditAmount: data.lenderCreditAmount,
        depositAmount: data.depositAmount,
      },
      config
    );

    setVaResult(result);

    // Sync calculated values back to input fields if they are 0
    if (!data.prepaidInterestAmount) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);
  }, [config, updateVaInputs, setVaResult, setValue]);

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
  ];

  const isDisabled = configLoading || !config;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('va.title')}</CardTitle>
          <CardDescription>{t('va.description')}</CardDescription>
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
                      onChange={(val) => {
                        const annual = Number(val) || 0;
                        field.onChange(annual);
                        setValue('propertyTaxMonthly', parseFloat((annual / 12).toFixed(2)));
                      }}
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
                      onChange={(val) => {
                        const annual = Number(val) || 0;
                        field.onChange(annual);
                        setValue('homeInsuranceMonthly', parseFloat((annual / 12).toFixed(2)));
                      }}
                      prefix="$"
                      helperText="Annual"
                    />
                  )}
                />
              </div>

              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mt-6">
                Monthly Costs
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="propertyTaxMonthly"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Property Tax"
                      name="propertyTaxMonthly"
                      type="number"
                      value={field.value}
                      onChange={(val) => {
                        const monthly = Number(val) || 0;
                        field.onChange(monthly);
                        setValue('propertyTaxAnnual', Math.round(monthly * 12));
                      }}
                      prefix="$"
                      helperText="per month"
                    />
                  )}
                />

                <Controller
                  name="homeInsuranceMonthly"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label="Home Insurance"
                      name="homeInsuranceMonthly"
                      type="number"
                      value={field.value}
                      onChange={(val) => {
                        const monthly = Number(val) || 0;
                        field.onChange(monthly);
                        setValue('homeInsuranceAnnual', Math.round(monthly * 12));
                      }}
                      prefix="$"
                      helperText="per month"
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
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
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
                    checked={field.value ?? false}
                    onChange={field.onChange}
                    helperText="Exempt from VA funding fee"
                    disabled={isDisabled}
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
                    checked={field.value ?? false}
                    onChange={field.onChange}
                    helperText="Higher funding fee rates apply"
                    disabled={isDisabled || isDisabledVeteran}
                  />
                )}
              />
            </div>

            {/* Credits & Points */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Credits & Points
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="sellerCreditAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.sellerCredit')}
                      name="sellerCreditAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      disabled={isDisabled}
                    />
                  )}
                />

                <Controller
                  name="lenderCreditAmount"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('calculator.lenderCredit')}
                      name="lenderCreditAmount"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>

              <Controller
                name="depositAmount"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label="Deposit (Earnest Money)"
                    name="depositAmount"
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

            {/* VA Fee Info */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                VA Loan Benefits
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• No down payment required</li>
                <li>• No monthly mortgage insurance (PMI)</li>
                <li>• Funding fee can be financed into loan</li>
                <li>• Disabled veterans are exempt from funding fee</li>
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
        {vaResult ? (
          <ResultSummary
            result={vaResult}
            config={config}
            loanType={t('va.title')}
            formId="va"
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎖️</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-sm text-slate-500">
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
