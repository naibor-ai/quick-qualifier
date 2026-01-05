'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateConventionalRefinance } from '@/lib/calculations/conventional';
import { InputGroup, SelectGroup, SelectToggle, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
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
  mortgageInsuranceMonthly: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  creditScoreTier: CreditScoreTier,
  refinanceType: ConventionalRefinanceType,
  // Prepaid Items
  prepaidInterestDays: z.number().min(0).max(365),
  prepaidTaxMonths: z.number().min(0).max(60),
  prepaidInsuranceMonths: z.number().min(0).max(60),
  prepaidInterestAmount: z.number().min(0),
  prepaidTaxAmount: z.number().min(0),
  prepaidInsuranceAmount: z.number().min(0),
  loanFee: z.number().min(0),
  closingCostsTotal: z.number().min(0),
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

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyValue: conventionalRefiInputs.propertyValue,
      existingLoanBalance: conventionalRefiInputs.existingLoanBalance,
      newLoanAmount: conventionalRefiInputs.newLoanAmount,
      interestRate: conventionalRefiInputs.interestRate,
      termYears: conventionalRefiInputs.termYears,
      propertyTaxAnnual: conventionalRefiInputs.propertyTaxAnnual,
      homeInsuranceAnnual: conventionalRefiInputs.homeInsuranceAnnual,
      mortgageInsuranceMonthly: conventionalRefiInputs.mortgageInsuranceMonthly || 0,
      hoaDuesMonthly: conventionalRefiInputs.hoaDuesMonthly,
      creditScoreTier: conventionalRefiInputs.creditScoreTier,
      refinanceType: conventionalRefiInputs.refinanceType,
      prepaidInterestDays: conventionalRefiInputs.prepaidInterestDays ?? 15,
      prepaidTaxMonths: conventionalRefiInputs.prepaidTaxMonths ?? 0,
      prepaidInsuranceMonths: conventionalRefiInputs.prepaidInsuranceMonths ?? 0,
      prepaidInterestAmount: conventionalRefiInputs.prepaidInterestAmount || 0,
      prepaidTaxAmount: conventionalRefiInputs.prepaidTaxAmount || 0,
      prepaidInsuranceAmount: conventionalRefiInputs.prepaidInsuranceAmount || 0,
      loanFee: conventionalRefiInputs.loanFee || 0,
      closingCostsTotal: conventionalRefiInputs.closingCostsTotal || 0,
    },
  });

  const watchedNewLoanAmount = watch('newLoanAmount');

  // Sync Loan Fee / Origination Fee (1% of loan amount)
  useEffect(() => {
    if (watchedNewLoanAmount > 0) {
      setValue('loanFee', Math.round(watchedNewLoanAmount * 0.01));
    }
  }, [watchedNewLoanAmount, setValue]);

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
        propertyTaxMonthly: data.propertyTaxAnnual / 12,
        homeInsuranceMonthly: data.homeInsuranceAnnual / 12,
        mortgageInsuranceMonthly: data.mortgageInsuranceMonthly ?? 0,
        hoaDuesMonthly: data.hoaDuesMonthly,
        creditScoreTier: data.creditScoreTier,
        refinanceType: data.refinanceType as 'rate_term' | 'cash_out',
        payoffDays: 30,
        cashOutAmount: 0,
        prepaidInterestDays: data.prepaidInterestDays,
        prepaidTaxMonths: data.prepaidTaxMonths,
        prepaidInsuranceMonths: data.prepaidInsuranceMonths,
        prepaidInterestAmount: data.prepaidInterestAmount || 0,
        prepaidTaxAmount: data.prepaidTaxAmount || 0,
        prepaidInsuranceAmount: data.prepaidInsuranceAmount || 0,
        loanFee: data.loanFee,
        closingCostsTotal: data.closingCostsTotal,
      },
      config
    );

    setConventionalRefiResult(result);

    // Sync calculated values back to input fields if they are 0
    if (!data.prepaidInterestAmount) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);

    // Sync Closing Costs to input if 0 (auto-calc)
    if (!data.closingCostsTotal || data.closingCostsTotal === 0) {
      setValue('closingCostsTotal', result.closingCosts.totalClosingCosts);
    }
  }, [config, updateConventionalRefiInputs, setConventionalRefiResult, setValue]);

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

  const [activeTab, setActiveTab] = useState('loan');

  const isDisabled = configLoading || !config;

  const tabs = [
    { id: 'loan', label: 'Loan Details' },
    { id: 'costs', label: 'Monthly Costs' },
    { id: 'credit', label: 'Credit & Score' },
    { id: 'closing', label: 'Closing & Prepaids' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className={`${conventionalRefiResult ? 'h-fit' : 'flex-1 flex flex-col'} overflow-hidden`}>
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <CardTitle className="text-xl font-bold text-slate-800 px-6 py-2 rounded-lg text-center inline-block">
                {t('conventionalRefi.title')}
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

              {/* Tab 1: Loan */}
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

                <Controller
                  name="refinanceType"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('refinance.type')}
                      name="refinanceType"
                      value={field.value ?? 'rate_term'}
                      onChange={field.onChange}
                      options={refinanceTypeOptions}
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
                        helperText="Leave 0 for auto-calc based on Credit Score"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Tab 3: Credit */}
              <div className={activeTab === 'credit' ? 'block space-y-6' : 'hidden'}>
                <Controller
                  name="creditScoreTier"
                  control={control}
                  render={({ field }) => (
                    <SelectToggle
                      label={t('calculator.creditScore')}
                      name="creditScoreTier"
                      value={field.value ?? '760'}
                      onChange={field.onChange}
                      options={creditTierOptions}
                    />
                  )}
                />
              </div>

              {/* Tab 4: Closing & Prepaids */}
              <div className={activeTab === 'closing' ? 'block space-y-5' : 'hidden'}>
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
          {conventionalRefiResult ? (
            <ResultSummary result={conventionalRefiResult} formId="conventional-refi" />
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
                    Fill in the details on the left panel and click Calculate to see your comprehensive refinance breakdown.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('loan')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
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
