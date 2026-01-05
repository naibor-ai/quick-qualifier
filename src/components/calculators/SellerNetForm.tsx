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

  // ... imports and state ...
  const [activeTab, setActiveTab] = useState('sale');

  const tabs = [
    { id: 'sale', label: 'Sale & Loans' },
    { id: 'costs', label: 'Closing Costs' },
    { id: 'credits', label: 'Credits/Debits' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-slate-50 min-h-[calc(100vh-100px)]">
      {/* Left Panel - Input Form */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className={`${result ? 'h-fit' : 'flex-1 flex flex-col'} overflow-hidden`}>
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <CardTitle className="text-xl font-bold text-slate-800 border-[1.5px] border-blue-300 px-6 py-2 rounded-lg text-center inline-block">
                {t('sellerNet.title')}
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

              {/* Tab 1: Sale & Loans */}
              <div className={activeTab === 'sale' ? 'block space-y-5' : 'hidden'}>
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
                      className="text-lg"
                      required
                    />
                  )}
                />

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    Loan Payoffs
                  </h3>
                  <div className="space-y-4">
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
                </div>
              </div>

              {/* Tab 2: Closing Costs */}
              <div className={activeTab === 'costs' ? 'block space-y-5' : 'hidden'}>
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

              {/* Tab 3: Credits/Debits */}
              <div className={activeTab === 'credits' ? 'block space-y-5' : 'hidden'}>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Other Costs & Credits
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
                        helperText="Credit to buyer"
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

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    Credits to Seller
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
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
                          helperText="Prepaid taxes"
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
                </div>
              </div>

              {/* Action Buttons (Sticky Bottom) */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-[1.02]"
                >
                  {t('common.calculate')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
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
          {result ? (
            <SellerNetResult result={result} />
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
                    Enter sale details and click Calculate to see estimated net proceeds for the seller.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('sale')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    Start with Sale Price
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
