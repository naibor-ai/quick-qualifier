'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatorStore } from '@/lib/store';
import { calculateSellerNet, type SellerNetResult as CalcSellerNetResult } from '@/lib/calculations/seller-net';
import { InputGroup, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shared';
import { SellerNetResult } from '@/components/shared/ResultSummary';

const formSchema = z.object({
  salesPrice: z.number().min(10000).max(100000000),
  existingLoanPayoff: z.number().min(0),
  secondLienPayoff: z.number().min(0),
  commissionPercent: z.number().min(0).max(10),
  titleInsurance: z.number().min(0),
  escrowFee: z.number().min(0),
  transferTax: z.number().min(0),
  recordingFees: z.number().min(0),
  repairCredits: z.number().min(0),
  hoaPayoff: z.number().min(0),
  propertyTaxProration: z.number().min(0),
  otherCredits: z.number().min(0),
  otherDebits: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface SellerNetResultType {
  grossSalesPrice: number;
  totalDebits: number;
  totalCredits: number;
  netProceeds: number;
  breakdown: {
    existingLoanPayoff: number;
    secondLienPayoff: number;
    commission: number;
    titleInsurance: number;
    escrowFee: number;
    transferTax: number;
    recordingFees: number;
    repairCredits: number;
    hoaPayoff: number;
    propertyTaxProration: number;
    otherCredits: number;
    otherDebits: number;
  };
}

// Transform calculation result to component format
function transformResult(calcResult: CalcSellerNetResult): SellerNetResultType {
  return {
    grossSalesPrice: calcResult.salesPrice,
    totalDebits: calcResult.totalPayoffs + calcResult.totalCosts,
    totalCredits: calcResult.totalCredits,
    netProceeds: calcResult.estimatedNetProceeds,
    breakdown: {
      existingLoanPayoff: calcResult.firstMortgagePayoff,
      secondLienPayoff: calcResult.secondLienPayoff,
      commission: calcResult.realEstateCommission,
      titleInsurance: calcResult.titleInsurance,
      escrowFee: calcResult.escrowFee,
      transferTax: calcResult.transferTax,
      recordingFees: calcResult.recordingFees,
      repairCredits: calcResult.repairCredits,
      hoaPayoff: calcResult.hoaPayoff,
      propertyTaxProration: calcResult.propertyTaxProration,
      otherCredits: calcResult.otherCredits,
      otherDebits: calcResult.otherDebits,
    },
  };
}

export function SellerNetForm() {
  const t = useTranslations();
  const {
    sellerNetInputs,
    updateSellerNetInputs,
    resetCalculator,
  } = useCalculatorStore();

  const [result, setResult] = useState<SellerNetResultType | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesPrice: sellerNetInputs.salesPrice,
      existingLoanPayoff: sellerNetInputs.existingLoanPayoff,
      secondLienPayoff: sellerNetInputs.secondLienPayoff,
      commissionPercent: sellerNetInputs.commissionPercent,
      titleInsurance: sellerNetInputs.titleInsurance,
      escrowFee: sellerNetInputs.escrowFee,
      transferTax: sellerNetInputs.transferTax,
      recordingFees: sellerNetInputs.recordingFees,
      repairCredits: sellerNetInputs.repairCredits,
      hoaPayoff: sellerNetInputs.hoaPayoff,
      propertyTaxProration: sellerNetInputs.propertyTaxProration,
      otherCredits: sellerNetInputs.otherCredits,
      otherDebits: sellerNetInputs.otherDebits,
    },
  });

  const onCalculate = useCallback((data: FormValues) => {
    // Update store with current inputs
    updateSellerNetInputs(data);

    // Run calculation
    const calcResult = calculateSellerNet({
      salesPrice: data.salesPrice,
      existingLoanPayoff: data.existingLoanPayoff,
      secondLienPayoff: data.secondLienPayoff,
      commissionPercent: data.commissionPercent,
      titleInsurance: data.titleInsurance,
      escrowFee: data.escrowFee,
      transferTax: data.transferTax,
      recordingFees: data.recordingFees,
      repairCredits: data.repairCredits,
      hoaPayoff: data.hoaPayoff,
      propertyTaxProration: data.propertyTaxProration,
      otherCredits: data.otherCredits,
      otherDebits: data.otherDebits,
    });

    setResult(transformResult(calcResult));
  }, [updateSellerNetInputs]);

  const handleReset = () => {
    resetCalculator('sellerNet');
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sellerNet.title')}</CardTitle>
          <CardDescription>{t('sellerNet.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onCalculate)} className="space-y-6">
            {/* Property */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Property Sale
              </h3>

              <Controller
                name="salesPrice"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.salesPrice')}
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
            </div>

            {/* Loan Payoffs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Loan Payoffs
              </h3>

              <Controller
                name="existingLoanPayoff"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.existingLoanPayoff')}
                    name="existingLoanPayoff"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                  />
                )}
              />

              <Controller
                name="secondLienPayoff"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.secondLienPayoff')}
                    name="secondLienPayoff"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    helperText="HELOC, 2nd mortgage, etc."
                  />
                )}
              />
            </div>

            {/* Commission & Fees */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Commission & Fees
              </h3>

              <Controller
                name="commissionPercent"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.commissionPercent')}
                    name="commissionPercent"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    suffix="%"
                    step="0.5"
                    helperText="Total buyer + seller agent commission"
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="titleInsurance"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('sellerNet.inputs.titleInsurance')}
                      name="titleInsurance"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                    />
                  )}
                />

                <Controller
                  name="escrowFee"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('sellerNet.inputs.escrowFee')}
                      name="escrowFee"
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
                  name="transferTax"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('sellerNet.inputs.transferTax')}
                      name="transferTax"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                    />
                  )}
                />

                <Controller
                  name="recordingFees"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('sellerNet.inputs.recordingFees')}
                      name="recordingFees"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                    />
                  )}
                />
              </div>
            </div>

            {/* Other Costs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Other Costs
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="repairCredits"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('sellerNet.inputs.repairCredits')}
                      name="repairCredits"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                      helperText="Credit to buyer for repairs"
                    />
                  )}
                />

                <Controller
                  name="hoaPayoff"
                  control={control}
                  render={({ field }) => (
                    <InputGroup
                      label={t('sellerNet.inputs.hoaPayoff')}
                      name="hoaPayoff"
                      type="number"
                      value={field.value}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      prefix="$"
                    />
                  )}
                />
              </div>

              <Controller
                name="otherDebits"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.otherDebits')}
                    name="otherDebits"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    helperText="Any other seller costs"
                  />
                )}
              />
            </div>

            {/* Credits */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Credits to Seller
              </h3>

              <Controller
                name="propertyTaxProration"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.propertyTaxProration')}
                    name="propertyTaxProration"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                    helperText="Credit if taxes prepaid"
                  />
                )}
              />

              <Controller
                name="otherCredits"
                control={control}
                render={({ field }) => (
                  <InputGroup
                    label={t('sellerNet.inputs.otherCredits')}
                    name="otherCredits"
                    type="number"
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val) || 0)}
                    prefix="$"
                  />
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth>
                {t('common.calculate')}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {result ? (
          <SellerNetResult result={result} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-sm text-slate-500">
                  Enter sale details and click Calculate to see estimated net proceeds.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
