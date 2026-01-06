'use client';

import { useEffect, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateFhaPurchase } from '@/lib/calculations/fha';
import { InputGroup, SelectToggle, CheckboxGroup, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
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
  loanFeePercent: z.number().min(0).max(10).default(0),
  loanFeeMode: z.enum(['amount', 'percent']).default('amount'),
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
  // Fee Overrides with defaults
  processingFee: z.number().min(0).optional(),
  underwritingFee: z.number().min(0).optional(),
  docPrepFee: z.number().min(0).optional(),
  appraisalFee: z.number().min(0).optional(),
  creditReportFee: z.number().min(0).optional(),
  floodCertFee: z.number().min(0).optional(),
  taxServiceFee: z.number().min(0).optional(),
  escrowFee: z.number().min(0).optional(),
  notaryFee: z.number().min(0).optional(),
  recordingFee: z.number().min(0).optional(),
  ownerTitlePolicy: z.number().min(0).optional(),
  lenderTitlePolicy: z.number().min(0).optional(),
  pestInspectionFee: z.number().min(0).optional(),
  propertyInspectionFee: z.number().min(0).optional(),
  poolInspectionFee: z.number().min(0).optional(),
  transferTax: z.number().min(0).optional(),
  mortgageTax: z.number().min(0).optional(),
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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

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
      loanFeePercent: fhaInputs.loanFeePercent || 1.0,
      loanFeeMode: fhaInputs.loanFeeMode || 'amount',
      sellerCreditAmount: fhaInputs.sellerCreditAmount || 0,
      lenderCreditAmount: fhaInputs.lenderCreditAmount || 0,
      depositAmount: fhaInputs.depositAmount || 0,
      closingCostsTotal: fhaInputs.closingCostsTotal || 0,
      processingFee: fhaInputs.processingFee ?? 995,
      underwritingFee: fhaInputs.underwritingFee ?? 1495,
      docPrepFee: fhaInputs.docPrepFee ?? 295,
      appraisalFee: fhaInputs.appraisalFee ?? 650,
      creditReportFee: fhaInputs.creditReportFee ?? 150,
      floodCertFee: fhaInputs.floodCertFee ?? 30,
      taxServiceFee: fhaInputs.taxServiceFee ?? 85,
      escrowFee: fhaInputs.escrowFee ?? 1115,
      notaryFee: fhaInputs.notaryFee ?? 350,
      recordingFee: fhaInputs.recordingFee ?? 275,
      ownerTitlePolicy: fhaInputs.ownerTitlePolicy ?? 1730,
      lenderTitlePolicy: fhaInputs.lenderTitlePolicy ?? 1515,
      pestInspectionFee: fhaInputs.pestInspectionFee ?? 150,
      propertyInspectionFee: fhaInputs.propertyInspectionFee ?? 450,
      poolInspectionFee: fhaInputs.poolInspectionFee ?? 100,
      transferTax: fhaInputs.transferTax ?? 0,
      mortgageTax: fhaInputs.mortgageTax ?? 0,
    },
  });

  const [closingSubTab, setClosingSubTab] = useState<'general' | 'lender' | 'title'>('general');
  const watchedValues = watch();
  const salesPrice = watchedValues.salesPrice;
  const downPaymentMode = watchedValues.downPaymentMode;

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

  useEffect(() => {
    if (salesPrice > 0) {
      const annualTax = Math.round(salesPrice * 0.0125);
      const monthlyInsurance = Number(((salesPrice * 0.0035) / 12).toFixed(2));
      const annualInsurance = Math.round(monthlyInsurance * 12);

      setValue('propertyTaxAnnual', annualTax);
      setValue('homeInsuranceAnnual', annualInsurance);
      setValue('propertyTaxMonthly', parseFloat((annualTax / 12).toFixed(2)));
      setValue('homeInsuranceMonthly', monthlyInsurance);

      const baseLoan = salesPrice * (1 - (watchedValues.downPaymentPercent / 100));
      const monthlyMip = Number((baseLoan * 0.0055 / 12).toFixed(2));
      setValue('mortgageInsuranceMonthly', monthlyMip);
    }
  }, [salesPrice, setValue, watchedValues.downPaymentPercent]);

  // Sync Loan Fee / Origination Fee
  useEffect(() => {
    const loanAmount = salesPrice - (watchedValues.downPaymentAmount || 0);
    if (loanAmount > 0) {
      if (watchedValues.loanFeeMode === 'percent') {
        const percent = watchedValues.loanFeePercent;
        const feeAmount = (loanAmount * percent) / 100;
        setValue('loanFee', Math.round(feeAmount * 100) / 100);
      } else {
        const feeAmount = watchedValues.loanFee;
        const percent = (feeAmount / loanAmount) * 100;
        setValue('loanFeePercent', Math.round(percent * 1000) / 1000);
      }
    }
  }, [salesPrice, watchedValues.downPaymentAmount, watchedValues.loanFeeMode, watchedValues.loanFeePercent, watchedValues.loanFee, setValue]);

  const onCalculate: SubmitHandler<FormValues> = useCallback((data) => {
    if (!config) return;
    updateFhaInputs(data);
    const result = calculateFhaPurchase(
      {
        ...data,
        propertyTaxMonthly: data.propertyTaxAnnual / 12,
        homeInsuranceMonthly: data.homeInsuranceAnnual / 12,
      },
      config
    );
    setFhaResult(result);

    if (!data.prepaidInterestAmount) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);
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

  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
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
                      value={field.value ?? 'percent'}
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
                      <SelectToggle
                        label={t('calculator.term')}
                        name="termYears"
                        value={String(field.value ?? 30)}
                        onChange={(val) => field.onChange(Number(val))}
                        options={termOptions}
                      />
                    )}
                  />
                </div>
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
                <div className="bg-blue-50 p-4 rounded-lg">
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
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Origination Fee</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Controller
                      name="loanFeeMode"
                      control={control}
                      render={({ field }) => (
                        <SelectToggle
                          name="loanFeeMode"
                          value={field.value || 'amount'}
                          onChange={field.onChange}
                          options={[
                            { value: 'amount', label: '$' },
                            { value: 'percent', label: '%' },
                          ]}
                          className="h-[42px]"
                        />
                      )}
                    />
                    {watchedValues.loanFeeMode === 'percent' ? (
                      <Controller
                        name="loanFeePercent"
                        control={control}
                        render={({ field }) => (
                          <InputGroup
                            label="Loan Fee %"
                            name="loanFeePercent"
                            type="number"
                            value={field.value}
                            onChange={(val) => field.onChange(Number(val) || 0)}
                            suffix="%"
                            step="0.125"
                          />
                        )}
                      />
                    ) : (
                      <Controller
                        name="loanFee"
                        control={control}
                        render={({ field }) => (
                          <InputGroup
                            label="Loan Fee $"
                            name="loanFee"
                            type="number"
                            value={field.value}
                            onChange={(val) => field.onChange(Number(val) || 0)}
                            prefix="$"
                          />
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                    {(['general', 'lender', 'title'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setClosingSubTab(tab)}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${closingSubTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
                      >
                        {t(`calculator.sections.${tab}`)}
                      </button>
                    ))}
                  </div>

                  {closingSubTab === 'general' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="sellerCreditAmount"
                          control={control}
                          render={({ field }) => <InputGroup label={t('calculator.sellerCredit')} name="sellerCreditAmount" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />}
                        />
                        <Controller
                          name="lenderCreditAmount"
                          control={control}
                          render={({ field }) => <InputGroup label={t('calculator.lenderCredit')} name="lenderCreditAmount" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="depositAmount"
                          control={control}
                          render={({ field }) => <InputGroup label="Deposit" name="depositAmount" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Controller name="prepaidInterestDays" control={control} render={({ field }) => <InputGroup label="Int. Days" name="prepaidInterestDays" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="d" />} />
                        <Controller name="prepaidTaxMonths" control={control} render={({ field }) => <InputGroup label="Tax Mo." name="prepaidTaxMonths" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="m" />} />
                        <Controller name="prepaidInsuranceMonths" control={control} render={({ field }) => <InputGroup label="Ins. Mo." name="prepaidInsuranceMonths" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="m" />} />
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <Controller
                          name="closingCostsTotal"
                          control={control}
                          render={({ field }) => <InputGroup label="Closing Costs" name="closingCostsTotal" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" className="text-lg font-semibold" />}
                        />
                      </div>
                    </div>
                  )}

                  {closingSubTab === 'lender' && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                      <Controller name="processingFee" control={control} render={({ field }) => <InputGroup label="Processing" name="processingFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="underwritingFee" control={control} render={({ field }) => <InputGroup label="Underwriting" name="underwritingFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="docPrepFee" control={control} render={({ field }) => <InputGroup label="Doc Prep" name="docPrepFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="appraisalFee" control={control} render={({ field }) => <InputGroup label="Appraisal" name="appraisalFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="creditReportFee" control={control} render={({ field }) => <InputGroup label="Credit Report" name="creditReportFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="floodCertFee" control={control} render={({ field }) => <InputGroup label="Flood Cert" name="floodCertFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="taxServiceFee" control={control} render={({ field }) => <InputGroup label="Tax Service" name="taxServiceFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                    </div>
                  )}

                  {closingSubTab === 'title' && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                      <Controller name="escrowFee" control={control} render={({ field }) => <InputGroup label="Escrow Fee" name="escrowFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="notaryFee" control={control} render={({ field }) => <InputGroup label="Notary Fee" name="notaryFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="recordingFee" control={control} render={({ field }) => <InputGroup label="Recording Fee" name="recordingFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="ownerTitlePolicy" control={control} render={({ field }) => <InputGroup label="Owner Title" name="ownerTitlePolicy" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="lenderTitlePolicy" control={control} render={({ field }) => <InputGroup label="Lender Title" name="lenderTitlePolicy" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="pestInspectionFee" control={control} render={({ field }) => <InputGroup label="Pest Insp." name="pestInspectionFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="propertyInspectionFee" control={control} render={({ field }) => <InputGroup label="Prop. Insp." name="propertyInspectionFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="poolInspectionFee" control={control} render={({ field }) => <InputGroup label="Pool Insp." name="poolInspectionFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="transferTax" control={control} render={({ field }) => <InputGroup label="Transfer Tax" name="transferTax" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      <Controller name="mortgageTax" control={control} render={({ field }) => <InputGroup label="Mortgage Tax" name="mortgageTax" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Button type="submit" fullWidth size="lg" disabled={isDisabled} loading={configLoading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-[1.02]">
                  {t('common.calculate')}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isDisabled} className="px-6">
                  {t('common.reset')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-7">
        <div className="h-full sticky top-4">
          {fhaResult ? (
            <ResultSummary result={fhaResult} config={config} loanType={t('fha.title')} formId="fha" />
          ) : (
            <Card className="h-full min-h-[500px] flex items-center justify-center bg-white shadow-md border-slate-200">
              <CardContent>
                <div className="text-center py-12 max-w-md mx-auto">
                  <div className="text-6xl mb-6 opacity-30 flex justify-center">
                    <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21H3V3H21V21ZM5 19H19V5H5V19Z" fill="currentColor" />
                      <path d="M7 11H9V17H7V11Z" fill="currentColor" />
                      <path d="M11 7H13V17H11V7Z" fill="currentColor" />
                      <path d="M15 13H17V17H15V13Z" fill="currentColor" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('calculator.readyToCalculate')}</h3>
                  <p className="text-slate-500 text-lg mb-8">{t('calculator.readyDescription')}</p>
                  <Button variant="outline" onClick={() => setActiveTab('property')} className="border-blue-200 text-blue-600 hover:bg-blue-50">
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
