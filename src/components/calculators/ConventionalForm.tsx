'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateConventionalPurchase } from '@/lib/calculations/conventional';
import { InputGroup, SelectGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, AgentSelector } from '@/components/shared';
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
  hoaDuesMonthly: z.number().min(0),
  floodInsuranceMonthly: z.number().min(0),
  creditScoreTier: CreditScoreTier,
  pmiType: PmiType,
  sellerCreditAmount: z.number().min(0),
  lenderCreditAmount: z.number().min(0),
  originationPoints: z.number().min(0).max(5),
  depositAmount: z.number().min(0),
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
      hoaDuesMonthly: conventionalInputs.hoaDuesMonthly,
      floodInsuranceMonthly: conventionalInputs.floodInsuranceMonthly,
      creditScoreTier: conventionalInputs.creditScoreTier,
      pmiType: conventionalInputs.pmiType,
      sellerCreditAmount: conventionalInputs.sellerCreditAmount,
      lenderCreditAmount: conventionalInputs.lenderCreditAmount,
      originationPoints: conventionalInputs.originationPoints,
      depositAmount: conventionalInputs.depositAmount,
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

  const onCalculate = useCallback((data: FormValues) => {
    if (!config) {
      return; // Config required for calculation
    }

    // Update store with current inputs
    updateConventionalInputs(data);

    // Run calculation using the GHL config
    const result = calculateConventionalPurchase(
      {
        salesPrice: data.salesPrice,
        downPaymentAmount: data.downPaymentMode === 'amount' ? data.downPaymentAmount : undefined,
        downPaymentPercent: data.downPaymentMode === 'percent' ? data.downPaymentPercent : undefined,
        interestRate: data.interestRate,
        termYears: data.termYears,
        propertyTaxAnnual: data.propertyTaxAnnual,
        homeInsuranceAnnual: data.homeInsuranceAnnual,
        hoaDuesMonthly: data.hoaDuesMonthly,
        floodInsuranceMonthly: data.floodInsuranceMonthly,
        creditScoreTier: data.creditScoreTier,
        pmiType: data.pmiType,
        sellerCreditAmount: data.sellerCreditAmount,
        lenderCreditAmount: data.lenderCreditAmount,
        originationPoints: data.originationPoints,
        depositAmount: data.depositAmount,
      },
      config
    );

    setConventionalResult(result);
  }, [config, updateConventionalInputs, setConventionalResult]);

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

  const isDisabled = configLoading || !config;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('conventional.title')}</CardTitle>
          <CardDescription>{t('conventional.description')}</CardDescription>
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                      disabled={isDisabled}
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
                      disabled={isDisabled}
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

            {/* Monthly Costs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Monthly Costs
              </h3>

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
                      disabled={isDisabled}
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
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>
            </div>

            {/* PMI & Credit */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                PMI & Credit
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="creditScoreTier"
                  control={control}
                  render={({ field }) => (
                    <SelectGroup
                      label={t('calculator.creditScore')}
                      name="creditScoreTier"
                      value={field.value}
                      onChange={field.onChange}
                      options={creditTierOptions}
                      disabled={isDisabled}
                    />
                  )}
                />

                <Controller
                  name="pmiType"
                  control={control}
                  render={({ field }) => (
                    <SelectGroup
                      label={t('calculator.pmiType')}
                      name="pmiType"
                      value={field.value}
                      onChange={field.onChange}
                      options={pmiTypeOptions}
                      disabled={isDisabled}
                    />
                  )}
                />
              </div>
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
                name="originationPoints"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('calculator.originationPoints')}
                    name="originationPoints"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    suffix="pts"
                    step="0.25"
                    helperText="0-5 points"
                    disabled={isDisabled}
                  />
                )}
              />

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
        {conventionalResult ? (
          <ResultSummary
            result={conventionalResult}
            config={config}
            loanType={t('conventional.title')}
            formId="conventional"
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-sm text-slate-500">
                  Enter your loan details and click Calculate to see your estimated payment breakdown.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
