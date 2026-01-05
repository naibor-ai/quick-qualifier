'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateVaRefinance } from '@/lib/calculations/va';
import { InputGroup, SelectGroup, SelectToggle, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
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

  const [activeTab, setActiveTab] = useState('loan');

  const isDisabled = configLoading || !config;

  const tabs = [
    { id: 'loan', label: 'Loan Details' },
    { id: 'costs', label: 'Monthly Costs' },
    { id: 'closing', label: 'VA & Closing' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-bold text-slate-800 mb-4">{t('vaRefi.title')}</CardTitle>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-6">
            <form onSubmit={handleSubmit(onCalculate)} className="space-y-6">

              {/* Tab 1: Loan Details */}
              <div className={activeTab === 'loan' ? 'block space-y-5' : 'hidden'}>
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
                      className="text-lg"
                      required
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                        required
                      />
                    )}
                  />
                </div>

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
                </div>
                <Controller
                  name="termYears"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('calculator.term')}
                      name="termYears"
                      value={String(field.value)}
                      onChange={(val) => field.onChange(Number(val))}
                      options={termOptions}
                    />
                  )}
                />
              </div>

              {/* Tab 2: Monthly Costs */}
              <div className={activeTab === 'costs' ? 'block space-y-5' : 'hidden'}>
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

                <div className="space-y-4 pt-4 border-t border-slate-100">
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
                    name="mortgageInsuranceMonthly"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Monthly Mtg Insurance (Override)"
                        name="mortgageInsuranceMonthly"
                        type="number"
                        value={field.value ?? 0}
                        onChange={(val) => field.onChange(Number(val) || 0)}
                        prefix="$"
                        helperText="Leave 0 for auto-calc"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Tab 3: VA & Closing */}
              <div className={activeTab === 'closing' ? 'block space-y-5' : 'hidden'}>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Refinance Type & Eligibility
                </h3>
                <Controller
                  name="isIrrrl"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('refinance.vaRefiType')}
                      name="isIrrrl"
                      value={String(field.value)}
                      onChange={(val) => field.onChange(val === 'true')}
                      options={refiTypeOptions}
                    />
                  )}
                />
                {isIrrrl && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    {t('refinance.irrrlNote')}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="vaUsage"
                    control={control}
                    render={({ field }) => (
                      <SelectToggle
                        label={t('calculator.vaUsage')}
                        name="vaUsage"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={vaUsageOptions}
                      />
                    )}
                  />

                  <Controller
                    name="isDisabledVeteran"
                    control={control}
                    render={({ field }) => (
                      <SelectToggle
                        label={t('calculator.isDisabledVeteran')}
                        name="isDisabledVeteran"
                        value={String(field.value)}
                        onChange={(val) => field.onChange(val === 'true')}
                        options={boolOptions}
                      />
                    )}
                  />
                </div>
                {isDisabledVeteran && (
                  <div className="p-2 bg-green-50 rounded text-sm text-green-700">
                    {t('va.fundingFeeWaived')}
                  </div>
                )}

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
                    />
                  )}
                />

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Prepaid Items Configuration</h4>

                  <div className="grid grid-cols-3 gap-3 mb-3">
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
                          className="text-sm"
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
                          label="Ins. Months"
                          name="prepaidInsuranceMonths"
                          type="number"
                          value={field.value}
                          onChange={(val) => field.onChange(Number(val) || 0)}
                          suffix="mo"
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Controller
                      name="prepaidInterestAmount"
                      control={control}
                      render={({ field }) => (
                        <InputGroup
                          label="Interest Amt"
                          name="prepaidInterestAmount"
                          type="number"
                          value={field.value}
                          onChange={(val) => field.onChange(Number(val) || 0)}
                          prefix="$"
                        />
                      )}
                    />
                    <Controller
                      name="prepaidTaxAmount"
                      control={control}
                      render={({ field }) => (
                        <InputGroup
                          label="Tax Amt"
                          name="prepaidTaxAmount"
                          type="number"
                          value={field.value}
                          onChange={(val) => field.onChange(Number(val) || 0)}
                          prefix="$"
                        />
                      )}
                    />
                    <Controller
                      name="prepaidInsuranceAmount"
                      control={control}
                      render={({ field }) => (
                        <InputGroup
                          label="Ins. Amt"
                          name="prepaidInsuranceAmount"
                          type="number"
                          value={field.value}
                          onChange={(val) => field.onChange(Number(val) || 0)}
                          prefix="$"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Sticky Bottom) */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={isDisabled}
                  loading={configLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-[1.02]"
                >
                  {t('common.calculate')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isDisabled}
                  className="px-6"
                >
                  {t('common.reset')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Results */}
      <div className="lg:col-span-7">
        <div className="h-full sticky top-4">
          {vaRefiResult ? (
            <ResultSummary result={vaRefiResult} formId="va-refi" />
          ) : (
            <Card className="h-full min-h-[500px] flex items-center justify-center bg-white shadow-md border-slate-200">
              <CardContent>
                <div className="text-center py-12 max-w-md mx-auto">
                  <div className="text-6xl mb-6 opacity-80">🔄</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {t('calculator.readyToCalculate')}
                  </h3>
                  <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    Fill in the details on the left panel and click Calculate to see your comprehensive VA refinance breakdown.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('loan')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Start with Loan Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
