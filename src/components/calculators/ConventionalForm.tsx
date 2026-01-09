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
  loanFeePercent: z.number().min(0),
  loanFeeMode: z.enum(['amount', 'percent']),
  // Prepaid Items
  prepaidInterestDays: z.number().min(0).max(365),
  prepaidTaxMonths: z.number().min(0).max(60),
  prepaidInsuranceMonths: z.number().min(0).max(60),
  prepaidInterestAmount: z.number().min(0),
  prepaidTaxAmount: z.number().min(0),
  prepaidInsuranceAmount: z.number().min(0),
  closingCostsTotal: z.number().min(0),
  // Fee Overrides
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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { control, handleSubmit, watch, setValue, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
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
      closingCostsTotal: conventionalInputs.closingCostsTotal || 0,
      loanFeePercent: conventionalInputs.loanFeePercent || 1.0,
      loanFeeMode: conventionalInputs.loanFeeMode || 'percent',
      processingFee: conventionalInputs.processingFee ?? 995,
      underwritingFee: conventionalInputs.underwritingFee ?? 1495,
      docPrepFee: conventionalInputs.docPrepFee ?? 295,
      appraisalFee: conventionalInputs.appraisalFee ?? 650,
      creditReportFee: conventionalInputs.creditReportFee ?? 150,
      floodCertFee: conventionalInputs.floodCertFee ?? 30,
      taxServiceFee: conventionalInputs.taxServiceFee ?? 85,
      escrowFee: conventionalInputs.escrowFee ?? 1115,
      notaryFee: conventionalInputs.notaryFee ?? 350,
      recordingFee: conventionalInputs.recordingFee ?? 275,
      ownerTitlePolicy: conventionalInputs.ownerTitlePolicy ?? 1730,
      lenderTitlePolicy: conventionalInputs.lenderTitlePolicy ?? 1225,
      pestInspectionFee: conventionalInputs.pestInspectionFee ?? 150,
      propertyInspectionFee: conventionalInputs.propertyInspectionFee ?? 450,
      poolInspectionFee: conventionalInputs.poolInspectionFee ?? 100,
      transferTax: conventionalInputs.transferTax ?? 0,
      mortgageTax: conventionalInputs.mortgageTax ?? 0,
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

  // Sync Loan Fee / Origination Fee (1% of loan amount by default)
  useEffect(() => {
    const amount = watchedValues.downPaymentAmount || 0;
    const loanAmount = (watchedValues.salesPrice || 0) - amount;
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
  }, [watchedValues.salesPrice, watchedValues.downPaymentAmount, watchedValues.loanFeeMode, watchedValues.loanFeePercent, watchedValues.loanFee, setValue]);

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) {
      return; // Config required for calculation
    }

    // Determine if should use manual override for closing costs
    // If input is different from last calculated result, it's a manual override
    const isManualOverride = data.closingCostsTotal > 0 &&
      data.closingCostsTotal !== conventionalResult?.closingCosts.totalClosingCosts;

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
        prepaidInterestAmount: 0,
        prepaidTaxAmount: 0,
        prepaidInsuranceAmount: 0,
        loanFeeMode: data.loanFeeMode,
        loanFeePercent: data.loanFeePercent,
        loanFee: data.loanFee,
        closingCostsTotal: isManualOverride ? data.closingCostsTotal : 0,
        // Fee Overrides
        processingFee: data.processingFee,
        underwritingFee: data.underwritingFee,
        docPrepFee: data.docPrepFee,
        appraisalFee: data.appraisalFee,
        creditReportFee: data.creditReportFee,
        floodCertFee: data.floodCertFee,
        taxServiceFee: data.taxServiceFee,
        escrowFee: data.escrowFee,
        notaryFee: data.notaryFee,
        recordingFee: data.recordingFee,
        ownerTitlePolicy: data.ownerTitlePolicy,
        lenderTitlePolicy: data.lenderTitlePolicy,
        pestInspectionFee: data.pestInspectionFee,
        propertyInspectionFee: data.propertyInspectionFee,
        poolInspectionFee: data.poolInspectionFee,
        transferTax: data.transferTax,
        mortgageTax: data.mortgageTax,
      },
      config
    );

    setConventionalResult(result);

    // Sync calculated values back to input fields if they are 0 or changed
    if (!data.prepaidInterestAmount || !isManualOverride) setValue('prepaidInterestAmount', result.closingCosts.prepaidInterest);
    if (!data.prepaidTaxAmount || !isManualOverride) setValue('prepaidTaxAmount', result.closingCosts.taxReserves);
    if (!data.prepaidInsuranceAmount || !isManualOverride) setValue('prepaidInsuranceAmount', result.closingCosts.insuranceReserves);

    // Sync Closing Costs to input
    setValue('closingCostsTotal', result.closingCosts.totalClosingCosts);
  }, [config, conventionalResult, updateConventionalInputs, setConventionalResult, setValue]);

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

  const [activeTab, setActiveTab] = useState<'loan-payment' | 'credit' | 'closing'>('loan-payment');
  const [closingSubTab, setClosingSubTab] = useState<'general' | 'lender' | 'title'>('general');
  const [loanSubTab, setLoanSubTab] = useState<'details' | 'expenses'>('details');

  const isDisabled = configLoading || !config;

  const tabs = [
    { id: 'loan-payment', label: t('calculator.sections.loanPayment') },
    { id: 'credit', label: t('calculator.sections.pmiCredit') },
    { id: 'closing', label: t('calculator.sections.closingPrepaids') },
  ];

  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-[#cbe5f266] min-h-[calc(100vh-100px)] backdrop-blur-md rounded-xl">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4">
        <Card className={`${conventionalResult ? 'h-fit' : 'flex-1 flex flex-col'} overflow-hidden`}>
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <CardTitle className="text-xl font-bold text-slate-800 px-6 py-2 rounded-lg text-center inline-block">
                {t('conventional.title')}
              </CardTitle>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
            <form onSubmit={handleSubmit(onCalculate as any)} className="space-y-6">

              {/* Tab 1: Loan & Payment (Merged) */}
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
                      {t('calculator.sections.propertyLoanDetails')}
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

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Loan Fee</label>
                        <div className="flex gap-3 items-start">
                          <div className="flex bg-slate-100 rounded-full p-1 flex-shrink-0">
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
                          <div className="flex-1 min-w-0">
                            {watchedValues.loanFeeMode === 'percent' ? (
                              <Controller
                                name="loanFeePercent"
                                control={control}
                                render={({ field }) => (
                                  <InputGroup
                                    label=""
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
                                    label=""
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
                      </div>
                    </div>
                  )}

                  {loanSubTab === 'expenses' && (
                    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
                  )}
                </div>
              )}

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
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Prepaid Items Configuration</h4>
                      <div className="grid grid-cols-3 gap-3">
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
                              suffix="months"
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
                              suffix="months"
                            />
                          )}
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <Controller
                          name="closingCostsTotal"
                          control={control}
                          render={({ field }) => (
                            <InputGroup
                              label="Closing Costs (Override)"
                              name="closingCostsTotal"
                              type="number"
                              value={field.value}
                              onChange={(val) => field.onChange(Number(val) || 0)}
                              prefix="$"
                              className="text-lg font-semibold"
                              helperText="Leave 0 for automatic fee estimation"
                            />
                          )}
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

      {/* Right Panel - Results */}
      <div className="lg:col-span-12 xl:col-span-7">
        <div className="h-full sticky top-4">
          {conventionalResult ? (
            <ResultSummary
              activeTab={activeTab === 'closing' ? 'closing-cash' : (activeTab === 'loan-payment' ? 'pitia' : undefined)}
              result={conventionalResult}
              config={config}
              loanType={t('conventional.title')}
              formId="conventional"
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
        </div>
      </div>
    </div>
  );
}
