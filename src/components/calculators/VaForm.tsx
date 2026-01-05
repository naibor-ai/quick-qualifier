'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateVaPurchase } from '@/lib/calculations/va';
import { InputGroup, SelectGroup, SelectToggle, CheckboxGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, AgentSelector } from '@/components/shared';
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
  mortgageInsuranceMonthly: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  floodInsuranceMonthly: z.number().min(0),
  vaUsage: z.enum(['first', 'subsequent']),
  isDisabledVeteran: z.boolean(),
  isReservist: z.boolean(),
  loanFee: z.number().min(0),
  prepaidInterestDays: z.number().min(0).max(365),
  prepaidTaxMonths: z.number().min(0).max(60),
  prepaidInsuranceMonths: z.number().min(0).max(60),
  prepaidInterestAmount: z.number().min(0),
  prepaidTaxAmount: z.number().min(0),
  prepaidInsuranceAmount: z.number().min(0),
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
      mortgageInsuranceMonthly: vaInputs.mortgageInsuranceMonthly || 0,
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

  const [activeTab, setActiveTab] = useState('property');

  const isDisabled = configLoading || !config;

  const tabs = [
    { id: 'property', label: 'Property & Loan' },
    { id: 'costs', label: 'Monthly Costs' },
    { id: 'details', label: 'VA Details & Closing' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-bold text-slate-800 mb-4">{t('va.title')}</CardTitle>
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

              {/* Tab 1: Property & Loan */}
              <div className={activeTab === 'property' ? 'block space-y-5' : 'hidden'}>
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
                      className="text-lg"
                      required
                    />
                  )}
                />

                <Controller
                  name="downPaymentMode"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('calculator.downPaymentMode')}
                      name="downPaymentMode"
                      value={field.value ?? 'amount'}
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

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="propertyTaxMonthly"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Property Tax (Mo)"
                        name="propertyTaxMonthly"
                        type="number"
                        value={field.value}
                        onChange={(val) => {
                          const monthly = Number(val) || 0;
                          field.onChange(monthly);
                          setValue('propertyTaxAnnual', Math.round(monthly * 12));
                        }}
                        prefix="$"
                      />
                    )}
                  />

                  <Controller
                    name="homeInsuranceMonthly"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Home Insurance (Mo)"
                        name="homeInsuranceMonthly"
                        type="number"
                        value={field.value}
                        onChange={(val) => {
                          const monthly = Number(val) || 0;
                          field.onChange(monthly);
                          setValue('homeInsuranceAnnual', Math.round(monthly * 12));
                        }}
                        prefix="$"
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

              {/* Tab 3: VA Details & Closing */}
              <div className={activeTab === 'details' ? 'block space-y-5' : 'hidden'}>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    VA Loan Config
                  </h3>
                  <Controller
                    name="vaUsage"
                    control={control}
                    render={({ field }) => (
                      <SelectToggle
                        label={t('calculator.vaUsage')}
                        name="vaUsage"
                        value={field.value ?? 'first'}
                        onChange={field.onChange}
                        options={vaUsageOptions}
                      />
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
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
                          disabled={isDisabledVeteran || false}
                        />
                      )}
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                    <ul className="space-y-1 list-disc pl-4">
                      <li>No down payment required</li>
                      <li>No monthly mortgage insurance (PMI)</li>
                      <li>Funding fee can be financed into loan</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Credits & Points</h4>
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
                        className="mt-3"
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
                        className="mt-3"
                      />
                    )}
                  />
                </div>

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

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Partner Agent</h4>
                  <AgentSelector />
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
          {vaResult ? (
            <ResultSummary
              result={vaResult}
              config={config}
              loanType={t('va.title')}
              formId="va"
            />
          ) : (
            <Card className="h-full min-h-[500px] flex items-center justify-center bg-white shadow-md border-slate-200">
              <CardContent>
                <div className="text-center py-12 max-w-md mx-auto">
                  <div className="text-6xl mb-6 opacity-80">🎖️</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {t('calculator.readyToCalculate')}
                  </h3>
                  <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    Enter your VA loan details and click Calculate to see your comprehensive breakdown.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('property')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Start with Property Details
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
