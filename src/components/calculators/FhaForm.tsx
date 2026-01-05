'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateFhaPurchase } from '@/lib/calculations/fha';
import { InputGroup, SelectGroup, SelectToggle, CheckboxGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, AgentSelector } from '@/components/shared';
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
  propertyTaxMonthly: z.number().min(0),
  homeInsuranceMonthly: z.number().min(0),
  mortgageInsuranceMonthly: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  floodInsuranceMonthly: z.number().min(0),
  is203k: z.boolean(),
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
  closingCostsTotal: z.number().min(0),
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
      propertyTaxMonthly: fhaInputs.propertyTaxAnnual / 12,
      homeInsuranceMonthly: fhaInputs.homeInsuranceAnnual / 12,
      mortgageInsuranceMonthly: fhaInputs.mortgageInsuranceMonthly || 0,
      hoaDuesMonthly: fhaInputs.hoaDuesMonthly,
      floodInsuranceMonthly: fhaInputs.floodInsuranceMonthly,
      is203k: fhaInputs.is203k,
      prepaidInterestDays: fhaInputs.prepaidInterestDays ?? 15,
      prepaidTaxMonths: fhaInputs.prepaidTaxMonths ?? 6,
      prepaidInsuranceMonths: fhaInputs.prepaidInsuranceMonths ?? 15,
      prepaidInterestAmount: fhaInputs.prepaidInterestAmount || 0,
      prepaidTaxAmount: fhaInputs.prepaidTaxAmount || 0,
      prepaidInsuranceAmount: fhaInputs.prepaidInsuranceAmount || 0,
      loanFee: fhaInputs.loanFee || 0,
      sellerCreditAmount: fhaInputs.sellerCreditAmount || 0,
      lenderCreditAmount: fhaInputs.lenderCreditAmount || 0,
      depositAmount: fhaInputs.depositAmount || 0,
      closingCostsTotal: fhaInputs.closingCostsTotal || 0,
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
    if (salesPrice > 0) {
      const annualTax = Math.round(salesPrice * 0.0125);
      const monthlyInsurance = Number(((salesPrice * 0.0035) / 12).toFixed(2));
      const annualInsurance = Math.round(monthlyInsurance * 12);

      setValue('propertyTaxAnnual', annualTax);
      setValue('homeInsuranceAnnual', annualInsurance);
      setValue('propertyTaxMonthly', parseFloat((annualTax / 12).toFixed(2)));
      setValue('homeInsuranceMonthly', monthlyInsurance);

      const baseLoan = salesPrice * 0.965; // Assuming 3.5% down for default calc
      const monthlyMip = Number((baseLoan * 0.0055 / 12).toFixed(2));
      setValue('mortgageInsuranceMonthly', monthlyMip);

      const loanAmount = salesPrice - (watchedValues.downPaymentAmount || 0);
      if (loanAmount > 0) {
        setValue('loanFee', Math.round(loanAmount * 0.01));
      }
    }
  }, [salesPrice, setValue, downPaymentMode, watchedValues.downPaymentPercent, watchedValues.downPaymentAmount]);

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
        propertyTaxMonthly: data.propertyTaxAnnual / 12,
        homeInsuranceMonthly: data.homeInsuranceAnnual / 12,
        mortgageInsuranceMonthly: data.mortgageInsuranceMonthly || undefined,
        hoaDuesMonthly: data.hoaDuesMonthly,
        floodInsuranceMonthly: data.floodInsuranceMonthly,
        is203k: data.is203k,
        prepaidInterestDays: data.prepaidInterestDays,
        prepaidTaxMonths: data.prepaidTaxMonths,
        prepaidInsuranceMonths: data.prepaidInsuranceMonths,
        prepaidInterestAmount: data.prepaidInterestAmount || 0,
        prepaidTaxAmount: data.prepaidTaxAmount || 0,
        prepaidInsuranceAmount: data.prepaidInsuranceAmount || 0,
        loanFee: data.loanFee,
        closingCostsTotal: data.closingCostsTotal,
        sellerCreditAmount: data.sellerCreditAmount,
        lenderCreditAmount: data.lenderCreditAmount,
        depositAmount: data.depositAmount,
      },
      config
    );

    setFhaResult(result);

    // Sync calculated values back to input fields if they are 0
    if (!data.prepaidInterestAmount) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);

    // Sync Closing Costs to input if 0 (auto-calc)
    if (!data.closingCostsTotal || data.closingCostsTotal === 0) {
      setValue('closingCostsTotal', result.closingCosts.totalClosingCosts);
    }
  }, [config, updateFhaInputs, setFhaResult, setValue]);

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

  const [activeTab, setActiveTab] = useState('property');

  const isDisabled = configLoading || !config;

  const tabs = [
    { id: 'property', label: 'Property & Loan' },
    { id: 'costs', label: 'Monthly Costs' },
    { id: 'closing', label: 'FHA & Closing' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className={`${fhaResult ? 'h-fit' : 'flex-1 flex flex-col'} overflow-hidden`}>
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <CardTitle className="text-xl font-bold text-slate-800 px-6 py-2 rounded-lg text-center inline-block">
                {t('fha.title')}
              </CardTitle>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === tab.id
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
                      value={field.value ?? ''}
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
                          const monthly = parseFloat(val) || 0;
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
                        label="Home Insurance (Mo)"
                        name="homeInsuranceMonthly"
                        type="number"
                        value={field.value}
                        onChange={(val) => {
                          const monthly = parseFloat(val) || 0;
                          field.onChange(monthly);
                          setValue('homeInsuranceAnnual', Math.round(monthly * 12));
                        }}
                        prefix="$"
                        helperText="per month"
                      />
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
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
                        helperText="Leave default for standard FHA MIP"
                      />
                    )}
                  />

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
              </div>

              {/* Tab 3: FHA & Closing */}
              <div className={activeTab === 'closing' ? 'block space-y-5' : 'hidden'}>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">FHA Options</h4>
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
                      />
                    )}
                  />
                  <div className="mt-3 text-xs text-blue-700">
                    <p>• Upfront MIP: 1.75%</p>
                    <p>• Annual MIP: 0.55% (typical)</p>
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="depositAmount"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Deposit"
                        name="depositAmount"
                        type="number"
                        value={field.value}
                        onChange={(val) => field.onChange(Number(val) || 0)}
                        prefix="$"
                      />
                    )}
                  />
                  <Controller
                    name="loanFee"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Origination Fee"
                        name="loanFee"
                        type="number"
                        value={field.value}
                        onChange={(val) => field.onChange(Number(val) || 0)}
                        prefix="$"
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

                  {/* Estimated Closing Costs */}
                  <div className="pt-2 border-t border-slate-100 mb-3">
                    <h4 className="font-medium text-slate-700 mb-3">Estimated Closing Costs</h4>
                    <Controller
                      name="closingCostsTotal"
                      control={control}
                      render={({ field }) => (
                        <InputGroup
                          label="Closing Costs"
                          name="closingCostsTotal"
                          type="number"
                          value={field.value}
                          onChange={(val) => field.onChange(Number(val) || 0)}
                          prefix="$"
                          placeholder="0.00"
                          className="text-lg font-semibold"
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
          {fhaResult ? (
            <ResultSummary
              result={fhaResult}
              config={config}
              loanType={t('fha.title')}
              formId="fha"
            />
          ) : (
            <Card className="h-full min-h-[500px] flex items-center justify-center bg-white shadow-md border-slate-200">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center py-12 max-w-md mx-auto">
                  <div className="text-6xl mb-6 opacity-30 flex justify-center">
                    <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21H3V3H21V21ZM5 19H19V5H5V19Z" fill="currentColor" />
                      <path d="M7 11H9V17H7V11Z" fill="currentColor" />
                      <path d="M11 7H13V17H11V7Z" fill="currentColor" />
                      <path d="M15 13H17V17H15V13Z" fill="currentColor" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {t('calculator.readyToCalculate')}
                  </h3>
                  <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    Fill in the details on the left panel and click Calculate to see your comprehensive FHA loan breakdown.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('property')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
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
