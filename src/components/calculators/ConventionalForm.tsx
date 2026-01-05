'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateConventionalPurchase } from '@/lib/calculations/conventional';
import { InputGroup, SelectGroup, SelectToggle, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, AgentSelector } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';
import { CreditScoreTier, PmiType } from '@/lib/schemas';

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
  creditScoreTier: CreditScoreTier,
  pmiType: PmiType,
  sellerCreditAmount: z.number().min(0),
  lenderCreditAmount: z.number().min(0),
  depositAmount: z.number().min(0),
  loanFee: z.number().min(0),
  // Prepaid Items
  prepaidInterestDays: z.number().min(0).max(365),
  prepaidTaxMonths: z.number().min(0).max(60),
  prepaidInsuranceMonths: z.number().min(0).max(60),
  prepaidInterestAmount: z.number().min(0),
  prepaidTaxAmount: z.number().min(0),
  prepaidInsuranceAmount: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export function ConventionalForm() {
  const t = useTranslations();
  const {
    conventionalInputs,
    updateConventionalInputs,
    conventionalResult,
    setConventionalResult,
    resetCalculator,
    config,
    configLoading,
  } = useCalculatorStore();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesPrice: conventionalInputs.salesPrice,
      downPaymentAmount: conventionalInputs.downPaymentAmount,
      downPaymentPercent: conventionalInputs.downPaymentPercent,
      downPaymentMode: conventionalInputs.downPaymentMode,
      interestRate: conventionalInputs.interestRate,
      termYears: conventionalInputs.termYears,
      propertyTaxAnnual: conventionalInputs.propertyTaxAnnual,
      homeInsuranceAnnual: conventionalInputs.homeInsuranceAnnual,
      propertyTaxMonthly: conventionalInputs.propertyTaxAnnual / 12,
      homeInsuranceMonthly: conventionalInputs.homeInsuranceAnnual / 12,
      mortgageInsuranceMonthly: conventionalInputs.mortgageInsuranceMonthly || 0,
      hoaDuesMonthly: conventionalInputs.hoaDuesMonthly,
      floodInsuranceMonthly: conventionalInputs.floodInsuranceMonthly,
      creditScoreTier: conventionalInputs.creditScoreTier,
      pmiType: conventionalInputs.pmiType,
      sellerCreditAmount: conventionalInputs.sellerCreditAmount,
      lenderCreditAmount: conventionalInputs.lenderCreditAmount,
      depositAmount: 0,
      prepaidInterestDays: conventionalInputs.prepaidInterestDays || 15,
      prepaidTaxMonths: conventionalInputs.prepaidTaxMonths || 6,
      prepaidInsuranceMonths: conventionalInputs.prepaidInsuranceMonths || 15,
      prepaidInterestAmount: conventionalInputs.prepaidInterestAmount || 0,
      prepaidTaxAmount: conventionalInputs.prepaidTaxAmount || 0,
      prepaidInsuranceAmount: conventionalInputs.prepaidInsuranceAmount || 0,
      loanFee: conventionalInputs.loanFee || 0,
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

  // Formulas: 
  // Property Tax Annual = Sales Price * 1.25%
  // Home Insurance Annual = Sales Price * 0.35%
  useEffect(() => {
    if (salesPrice > 0) {
      const annualTax = Math.round(salesPrice * 0.0125);
      const annualInsurance = Math.round(salesPrice * 0.0035);
      setValue('propertyTaxAnnual', annualTax);
      setValue('homeInsuranceAnnual', annualInsurance);
      setValue('propertyTaxMonthly', Math.round(annualTax / 12));
      setValue('homeInsuranceMonthly', Math.round(annualInsurance / 12));
    }
  }, [salesPrice, setValue]);

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

    // Convert form data to store format
    const storeData = {
      ...data,
      mortgageInsuranceMonthly: data.mortgageInsuranceMonthly || 0,
    };

    // Update store with current inputs
    updateConventionalInputs(storeData);

    // Run calculation using the GHL config
    const result = calculateConventionalPurchase(
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
        creditScoreTier: data.creditScoreTier,
        pmiType: data.pmiType,
        sellerCreditAmount: data.sellerCreditAmount,
        lenderCreditAmount: data.lenderCreditAmount,
        depositAmount: data.depositAmount,
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

    setConventionalResult(result);

    // Sync calculated values back to input fields if they are 0
    if (!data.prepaidInterestAmount) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);
  }, [config, updateConventionalInputs, setConventionalResult, setValue]);

  const handleReset = () => {
    resetCalculator('conventional');
    setConventionalResult(null);
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

  const pmiTypeOptions = [
    { value: 'monthly', label: t('pmiTypes.monthly') },
    { value: 'single_financed', label: 'Single Premium (Financed)' },
    { value: 'single_cash', label: 'Single Premium (Cash)' },
    { value: 'split', label: t('pmiTypes.split') },
  ];

  const termOptions = [
    { value: '30', label: '30 Years' },
    { value: '25', label: '25 Years' },
    { value: '20', label: '20 Years' },
    { value: '15', label: '15 Years' },
    { value: '10', label: '10 Years' },
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
    { id: 'credit', label: 'Credit & PMI' },
    { id: 'closing', label: 'Closing & Prepaids' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className={`${conventionalResult ? 'h-fit' : 'flex-1 flex flex-col'} overflow-hidden`}>
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <CardTitle className="text-xl font-bold text-slate-800 border-[1.5px] border-blue-300 px-6 py-2 rounded-lg text-center inline-block">
                {t('conventional.title')}
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
                        error={errors.downPaymentPercent?.message}
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
                        label="Home Ins (Mo)"
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
                        helperText="Leave 0 for auto-calc based on PMI settings"
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

              {/* Tab 3: Credit & PMI */}
              <div className={activeTab === 'credit' ? 'block space-y-6' : 'hidden'}>
                <Controller
                  name="creditScoreTier"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('calculator.creditScore')}
                      name="creditScoreTier"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      options={creditTierOptions}
                    />
                  )}
                />

                <Controller
                  name="pmiType"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('calculator.pmiType')}
                      name="pmiType"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      options={pmiTypeOptions}
                    />
                  )}
                />
              </div>

              {/* Tab 4: Closing & Prepaids */}
              <div className={activeTab === 'closing' ? 'block space-y-5' : 'hidden'}>
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
          {conventionalResult ? (
            <ResultSummary
              result={conventionalResult}
              config={config}
              loanType={t('conventional.title')}
              formId="conventional"
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
                    Fill in the details on the left panel and click Calculate to see your comprehensive loan breakdown.
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
