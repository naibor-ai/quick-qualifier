'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateVaRefinance } from '@/lib/calculations/va';
import { InputGroup, SelectToggle, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
import { ResultSummary } from '@/components/shared/ResultSummary';
import { DtiSection } from './DtiSection';

const formSchema = z.object({
  propertyValue: z.number().min(10000).max(100000000),
  existingLoanBalance: z.number().min(0),
  newLoanAmount: z.number().min(10000),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().min(1).max(40),
  propertyTaxAnnual: z.number().min(0),
  homeInsuranceAnnual: z.number().min(0),
  hoaDuesMonthly: z.number().min(0),
  vaUsage: z.enum(['first', 'subsequent']).default('first'),
  disabilityPercentage: z.number().min(0).max(100).default(0),
  loanFee: z.number().min(0),
  loanFeePercent: z.number().min(0).max(10).default(0),
  loanFeeMode: z.enum(['amount', 'percent']).default('amount'),
  cashOutAmount: z.number().min(0),
  isIrrrl: z.boolean().default(false),
  isDisabledVeteran: z.boolean().default(false),
  // Prepaid Items
  prepaidInterestDays: z.number().min(0).max(365),
  prepaidTaxMonths: z.number().min(0).max(60),
  prepaidInsuranceMonths: z.number().min(0).max(60),
  prepaidInterestAmount: z.number().min(0),
  prepaidTaxAmount: z.number().min(0),
  prepaidInsuranceAmount: z.number().min(0),
  closingCostsTotal: z.number().min(0),
  miscFee: z.number().min(0).default(0),
  // Fee Overrides with defaults
  processingFee: z.number().min(0).default(895),
  underwritingFee: z.number().min(0).default(995),
  docPrepFee: z.number().min(0).default(595),
  appraisalFee: z.number().min(0).default(650),
  creditReportFee: z.number().min(0).default(150),
  floodCertFee: z.number().min(0).default(30),
  taxServiceFee: z.number().min(0).default(59),
  escrowFee: z.number().min(0).default(400),
  notaryFee: z.number().min(0).default(350),
  recordingFee: z.number().min(0).default(275),
  ownerTitlePolicy: z.number().min(0).default(0),
  lenderTitlePolicy: z.number().min(0).default(1115),
  pestInspectionFee: z.number().min(0).default(0),
  propertyInspectionFee: z.number().min(0).default(0),
  poolInspectionFee: z.number().min(0).default(0),
  transferTax: z.number().min(0).default(0),
  mortgageTax: z.number().min(0).default(0),
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
    showDtiSections,
    setShowDtiSection
  } = useCalculatorStore();

  const showDtiSection = showDtiSections.vaRefi;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      ...vaRefiInputs,
      prepaidInterestDays: vaRefiInputs.prepaidInterestDays ?? 15,
      prepaidTaxMonths: vaRefiInputs.prepaidTaxMonths ?? 0,
      prepaidInsuranceMonths: vaRefiInputs.prepaidInsuranceMonths ?? 0,
      loanFeePercent: vaRefiInputs.loanFeePercent || 1.0,
      loanFeeMode: vaRefiInputs.loanFeeMode || 'amount',
      processingFee: vaRefiInputs.processingFee ?? 895,
      underwritingFee: vaRefiInputs.underwritingFee ?? 995,
      docPrepFee: vaRefiInputs.docPrepFee ?? 595,
      appraisalFee: vaRefiInputs.appraisalFee ?? 650,
      creditReportFee: vaRefiInputs.creditReportFee ?? 150,
      floodCertFee: vaRefiInputs.floodCertFee ?? 30,
      taxServiceFee: vaRefiInputs.taxServiceFee ?? 59,
      escrowFee: vaRefiInputs.escrowFee ?? 400,
      notaryFee: vaRefiInputs.notaryFee ?? 350,
      recordingFee: vaRefiInputs.recordingFee ?? 275,
      lenderTitlePolicy: vaRefiInputs.lenderTitlePolicy ?? 1115,
      ownerTitlePolicy: vaRefiInputs.ownerTitlePolicy ?? 0,
      pestInspectionFee: vaRefiInputs.pestInspectionFee ?? 0,
      propertyInspectionFee: vaRefiInputs.propertyInspectionFee ?? 0,
      poolInspectionFee: vaRefiInputs.poolInspectionFee ?? 0,
      transferTax: vaRefiInputs.transferTax ?? 0,
      mortgageTax: vaRefiInputs.mortgageTax ?? 0,
      miscFee: vaRefiInputs.miscFee || 0,
      isIrrrl: vaRefiInputs.isIrrrl ?? false,
      isDisabledVeteran: vaRefiInputs.isDisabledVeteran ?? false,
      vaUsage: vaRefiInputs.vaUsage ?? 'first',
    },
  });

  // Reset calculator to defaults on mount
  useEffect(() => {
    resetCalculator('vaRefi');
    const defaults = useCalculatorStore.getState().vaRefiInputs;
    reset({
      ...defaults,
      prepaidInterestDays: defaults.prepaidInterestDays ?? 15,
      prepaidTaxMonths: defaults.prepaidTaxMonths ?? 0,
      prepaidInsuranceMonths: defaults.prepaidInsuranceMonths ?? 0,
      loanFeePercent: defaults.loanFeePercent || 1.0,
      loanFeeMode: defaults.loanFeeMode || 'amount',
      processingFee: defaults.processingFee ?? 895,
      underwritingFee: defaults.underwritingFee ?? 995,
      docPrepFee: defaults.docPrepFee ?? 595,
      appraisalFee: defaults.appraisalFee ?? 650,
      creditReportFee: defaults.creditReportFee ?? 150,
      floodCertFee: defaults.floodCertFee ?? 30,
      taxServiceFee: defaults.taxServiceFee ?? 59,
      escrowFee: defaults.escrowFee ?? 400,
      notaryFee: defaults.notaryFee ?? 350,
      recordingFee: defaults.recordingFee ?? 275,
      lenderTitlePolicy: defaults.lenderTitlePolicy ?? 1115,
      ownerTitlePolicy: defaults.ownerTitlePolicy ?? 0,
      pestInspectionFee: defaults.pestInspectionFee ?? 0,
      propertyInspectionFee: defaults.propertyInspectionFee ?? 0,
      poolInspectionFee: defaults.poolInspectionFee ?? 0,
      transferTax: defaults.transferTax ?? 0,
      mortgageTax: defaults.mortgageTax ?? 0,
      miscFee: defaults.miscFee || 0,
      isIrrrl: defaults.isIrrrl ?? false,
      isDisabledVeteran: defaults.isDisabledVeteran ?? false,
      vaUsage: defaults.vaUsage ?? 'first',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [closingSubTab, setClosingSubTab] = useState<'general' | 'lender' | 'title'>('general');
  const [loanSubTab, setLoanSubTab] = useState<'details' | 'expenses'>('details');
  const watchedValues = watch();

  // Sync Loan Fee / Origination Fee
  useEffect(() => {
    const baseLoanAmount = watchedValues.newLoanAmount;
    if (baseLoanAmount > 0) {
      if (watchedValues.loanFeeMode === 'percent') {
        const percent = watchedValues.loanFeePercent;
        const feeAmount = (baseLoanAmount * percent) / 100;
        setValue('loanFee', Math.round(feeAmount * 100) / 100);
      } else {
        const feeAmount = watchedValues.loanFee;
        const percent = (feeAmount / baseLoanAmount) * 100;
        setValue('loanFeePercent', Math.round(percent * 1000) / 1000);
      }
    }
  }, [
    watchedValues.newLoanAmount,
    watchedValues.loanFeeMode,
    watchedValues.loanFeePercent,
    watchedValues.loanFee,
    setValue
  ]);

  const onCalculate: SubmitHandler<FormValues> = useCallback((data) => {
    if (!config) return;

    // Determine if closingCostsTotal was manually overridden
    const isManualOverride =
      data.closingCostsTotal > 0 &&
      data.closingCostsTotal !== vaRefiResult?.closingCosts.totalClosingCosts;

    updateVaRefiInputs(data);

    const result = calculateVaRefinance(
      {
        ...data,
        propertyTaxMonthly: data.propertyTaxAnnual / 12,
        homeInsuranceMonthly: data.homeInsuranceAnnual / 12,
        mortgageInsuranceMonthly: 0, // VA has no monthly MI
        payoffDays: 30,
        isDisabledVeteran: data.isDisabledVeteran || data.disabilityPercentage > 0,
        // If manual override is detected, pass the manual value
        closingCostsTotal: isManualOverride ? data.closingCostsTotal : 0,
        miscFee: data.miscFee,
        prepaidInterestAmount: data.prepaidInterestAmount || 0,
        prepaidTaxAmount: data.prepaidTaxAmount || 0,
        prepaidInsuranceAmount: data.prepaidInsuranceAmount || 0,
      },
      config
    );
    setVaRefiResult(result);

    // Sync calculated prepaid values back to form if not manually overridden
    if (!isManualOverride) {
      if (result.closingCosts.prepaidInterest !== data.prepaidInterestAmount) {
        setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
      }
      if (result.closingCosts.taxReserves !== data.prepaidTaxAmount) {
        setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
      }
      if (result.closingCosts.insuranceReserves !== data.prepaidInsuranceAmount) {
        setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);
      }
    }

    // Always sync the total closing costs back to the input field
    setValue('closingCostsTotal', result.closingCosts.totalClosingCosts);
  }, [config, vaRefiResult, updateVaRefiInputs, setVaRefiResult, setValue]);

  const handleReset = () => {
    resetCalculator('vaRefi');
    setVaRefiResult(null);
  };

  const [activeTab, setActiveTab] = useState('loan-payment');
  const isDisabled = configLoading || !config;

  const tabs = [
    { id: 'loan-payment', label: t('calculator.sections.loanPayment') },
    { id: 'closing', label: t('calculator.sections.vaClosing') },
  ];

  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-[#cbe5f266] min-h-[calc(100vh-100px)] backdrop-blur-md rounded-xl">
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4">
        <Card className={`${vaRefiResult ? 'h-fit' : 'flex-1 flex flex-col'} overflow-hidden`}>
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <CardTitle className="text-xl font-bold text-slate-800 px-6 py-2 rounded-lg text-center inline-block">
                {t('vaRefi.title')}
              </CardTitle>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === tab.id
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

              {activeTab === 'loan-payment' && (
                <div className="space-y-6">
                  {/* Sub-tabs for Loan Payment */}
                  <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() => setLoanSubTab('details')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${loanSubTab === 'details'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {t('calculator.sections.loanDetails')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoanSubTab('expenses')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${loanSubTab === 'expenses'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {t('calculator.sections.monthlyExpenses')}
                    </button>
                  </div>

                  {loanSubTab === 'details' && (
                    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <Controller name="propertyValue" control={control} render={({ field }) => <InputGroup label={t('refinance.propertyValue')} name="propertyValue" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" required />} />
                      <div className="grid grid-cols-2 gap-4">
                        <Controller name="existingLoanBalance" control={control} render={({ field }) => <InputGroup label={t('refinance.existingBalance')} name="existingLoanBalance" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" required />} />
                        <Controller name="newLoanAmount" control={control} render={({ field }) => <InputGroup label={t('refinance.newLoanAmount')} name="newLoanAmount" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" required />} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Controller name="interestRate" control={control} render={({ field }) => <InputGroup label={t('calculator.interestRate')} name="interestRate" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="%" step="0.125" required />} />
                        <Controller name="termYears" control={control} render={({ field }) => <InputGroup label={t('calculator.term')} name="termYears" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix={t('common.years')} required />} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Controller name="cashOutAmount" control={control} render={({ field }) => <InputGroup label={t('refinance.cashOutAmount')} name="cashOutAmount" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="isIrrrl" control={control} render={({ field }) => (
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">IRRRL (Streamline)</label>
                            <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                              <button type="button" onClick={() => field.onChange(false)} className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${!field.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>No</button>
                              <button type="button" onClick={() => field.onChange(true)} className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${field.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>Yes</button>
                            </div>
                          </div>
                        )} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Loan Fee</label>
                        <div className="flex gap-2 items-start">
                          <div className="flex bg-slate-100 rounded-full p-1">
                            <button
                              type="button"
                              onClick={() => setValue('loanFeeMode', 'amount')}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${watchedValues.loanFeeMode === 'amount'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                              $
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('loanFeeMode', 'percent')}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${watchedValues.loanFeeMode === 'percent'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                              %
                            </button>
                          </div>
                          <div className="flex-1">
                            {watchedValues.loanFeeMode === 'percent' ? (
                              <Controller name="loanFeePercent" control={control} render={({ field }) => <InputGroup label="" name="loanFeePercent" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="%" step="0.125" />} />
                            ) : (
                              <Controller name="loanFee" control={control} render={({ field }) => <InputGroup label="" name="loanFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {loanSubTab === 'expenses' && (
                    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <Controller name="propertyTaxAnnual" control={control} render={({ field }) => <InputGroup label={t('calculator.propertyTax')} name="propertyTaxAnnual" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" helperText="Annual" />} />
                        <Controller name="homeInsuranceAnnual" control={control} render={({ field }) => <InputGroup label={t('calculator.homeInsurance')} name="homeInsuranceAnnual" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" helperText="Annual" />} />
                      </div>
                      <Controller name="hoaDuesMonthly" control={control} render={({ field }) => <InputGroup label={t('calculator.hoaDues')} name="hoaDuesMonthly" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'closing' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Controller name="vaUsage" control={control} render={({ field }) => <SelectToggle label={t('va.usage')} name="vaUsage" value={field.value as string} onChange={field.onChange} options={[{ value: 'first', label: t('va.usageFirstTime') }, { value: 'subsequent', label: t('va.usageSubsequent') }]} />} />
                    <Controller name="isDisabledVeteran" control={control} render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Disabled Veteran</label>
                        <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                          <button type="button" onClick={() => field.onChange(false)} className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${!field.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>No</button>
                          <button type="button" onClick={() => field.onChange(true)} className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${field.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>Yes</button>
                        </div>
                      </div>
                    )} />
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                      {(['general', 'lender', 'title'] as const).map((tab) => (
                        <button key={tab} type="button" onClick={() => setClosingSubTab(tab)} className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${closingSubTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>
                          {t(`calculator.sections.${tab}`)}
                        </button>
                      ))}
                    </div>

                    {closingSubTab === 'general' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <Controller name="prepaidInterestDays" control={control} render={({ field }) => <InputGroup label="Int. Days" name="prepaidInterestDays" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="d" />} />
                          <Controller name="prepaidTaxMonths" control={control} render={({ field }) => <InputGroup label="Tax Mo." name="prepaidTaxMonths" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="m" />} />
                          <Controller name="prepaidInsuranceMonths" control={control} render={({ field }) => <InputGroup label="Ins. Mo." name="prepaidInsuranceMonths" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} suffix="m" />} />
                        </div>
                        <div className="pt-2 border-t border-slate-100 space-y-4">
                          <Controller
                            name="miscFee"
                            control={control}
                            render={({ field }) => (
                              <InputGroup
                                label="Miscellaneous"
                                name="miscFee"
                                type="number"
                                value={field.value}
                                onChange={(val) => field.onChange(Number(val) || 0)}
                                prefix="$"
                                helperText="Additional miscellaneous fees"
                              />
                            )}
                          />
                          <Controller name="closingCostsTotal" control={control} render={({ field }) => <InputGroup label="Closing Costs" name="closingCostsTotal" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" className="text-lg font-semibold" />} />
                        </div>
                      </div>
                    )}

                    {closingSubTab === 'lender' && (
                      <div className="grid grid-cols-2 gap-3">
                        <Controller name="processingFee" control={control} render={({ field }) => <InputGroup label="Processing" name="processingFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="underwritingFee" control={control} render={({ field }) => <InputGroup label="Underwriting" name="underwritingFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="docPrepFee" control={control} render={({ field }) => <InputGroup label="Doc Prep" name="docPrepFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="creditReportFee" control={control} render={({ field }) => <InputGroup label="Credit Report" name="creditReportFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="floodCertFee" control={control} render={({ field }) => <InputGroup label="Flood Cert" name="floodCertFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="taxServiceFee" control={control} render={({ field }) => <InputGroup label="Tax Service" name="taxServiceFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                      </div>
                    )}

                    {closingSubTab === 'title' && (
                      <div className="grid grid-cols-2 gap-3">
                        <Controller name="escrowFee" control={control} render={({ field }) => <InputGroup label="Escrow Fee" name="escrowFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
                        <Controller name="appraisalFee" control={control} render={({ field }) => <InputGroup label="Appraisal" name="appraisalFee" type="number" value={field.value} onChange={(v) => field.onChange(Number(v))} prefix="$" />} />
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
              )}

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

        {/* Toggle DTI Button - Only show after calculation */}
        {vaRefiResult && (
          <Button
            onClick={() => setShowDtiSection(!showDtiSection, 'vaRefi')}
            className="bg-white hover:bg-slate-50 text-[#2a8bb3] font-black border-none shadow-sm w-fit mx-auto mt-2 transition-transform hover:scale-105"
          >
            {showDtiSection ? 'Hide DTI Section' : 'Show DTI Section'}
          </Button>
        )}
      </div>

      <div className="lg:col-span-12 xl:col-span-7">
        <div className="h-full sticky top-4">
          {vaRefiResult ? (
            <ResultSummary
              activeTab={activeTab === 'closing' ? 'closing-cash' : (activeTab === 'loan-payment' ? 'pitia' : undefined)}
              closingTab={activeTab === 'closing' ? (closingSubTab === 'general' ? 'prepaid' : closingSubTab) : undefined}
              result={vaRefiResult}
              config={config}
              loanType={t('vaRefi.title')}
              formId="va-refi"
            />
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
                  <Button variant="outline" onClick={() => setActiveTab('loan-payment')} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Start with Property Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showDtiSection && <DtiSection />}
        </div>
      </div>
    </div>
  );
}
