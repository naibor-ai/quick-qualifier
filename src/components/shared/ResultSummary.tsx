'use client';

import { useTranslations } from 'next-intl';
import type { LoanCalculationResult } from '@/lib/schemas';

interface ResultItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  subtext?: string;
}

function ResultItem({ label, value, highlight = false, subtext }: ResultItemProps) {
  return (
    <div className={`flex justify-between items-baseline py-2 ${highlight ? 'border-t border-b border-zinc-200 dark:border-zinc-700' : ''}`}>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="text-right">
        <span className={`font-medium ${highlight ? 'text-lg text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {value}
        </span>
        {subtext && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{subtext}</p>
        )}
      </div>
    </div>
  );
}

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
}

function ResultSection({ title, children }: ResultSectionProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
        {title}
      </h4>
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
        {children}
      </div>
    </div>
  );
}

interface ResultSummaryProps {
  result: LoanCalculationResult;
  showClosingCosts?: boolean;
  showMonthlyBreakdown?: boolean;
}

export function ResultSummary({
  result,
  showClosingCosts = true,
  showMonthlyBreakdown = true,
}: ResultSummaryProps) {
  const t = useTranslations('calculator');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Primary Results */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('results.title')}
        </h3>

        <div className="space-y-2">
          <ResultItem
            label={t('results.loanAmount')}
            value={formatCurrency(result.loanAmount)}
          />
          <ResultItem
            label={t('results.downPayment')}
            value={formatCurrency(result.downPayment)}
            subtext={formatPercent(100 - result.ltv)}
          />
          <ResultItem
            label={t('results.ltv')}
            value={formatPercent(result.ltv)}
          />
          <ResultItem
            label={t('results.monthlyPayment')}
            value={formatCurrency(result.monthlyPayment.totalMonthly)}
            highlight
          />
        </div>
      </div>

      {/* Monthly Payment Breakdown */}
      {showMonthlyBreakdown && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {t('results.monthlyBreakdown')}
          </h3>

          <div className="space-y-2">
            <ResultItem
              label={t('results.principalInterest')}
              value={formatCurrency(result.monthlyPayment.principalAndInterest)}
            />
            <ResultItem
              label={t('results.propertyTax')}
              value={formatCurrency(result.monthlyPayment.propertyTax)}
            />
            <ResultItem
              label={t('results.homeInsurance')}
              value={formatCurrency(result.monthlyPayment.homeInsurance)}
            />
            {result.monthlyPayment.mortgageInsurance > 0 && (
              <ResultItem
                label={t('results.mortgageInsurance')}
                value={formatCurrency(result.monthlyPayment.mortgageInsurance)}
              />
            )}
            {result.monthlyPayment.hoaDues > 0 && (
              <ResultItem
                label={t('results.hoa')}
                value={formatCurrency(result.monthlyPayment.hoaDues)}
              />
            )}
            {result.monthlyPayment.floodInsurance > 0 && (
              <ResultItem
                label={t('results.floodInsurance')}
                value={formatCurrency(result.monthlyPayment.floodInsurance)}
              />
            )}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
              <ResultItem
                label={t('results.totalPiti')}
                value={formatCurrency(result.monthlyPayment.totalMonthly)}
                highlight
              />
            </div>
          </div>
        </div>
      )}

      {/* Closing Costs */}
      {showClosingCosts && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {t('results.closingCosts')}
          </h3>

          <ResultSection title={t('results.prepaidItems')}>
            <ResultItem
              label={t('results.prepaidInterest')}
              value={formatCurrency(result.closingCosts.prepaidInterest)}
            />
            <ResultItem
              label={t('results.taxReserves')}
              value={formatCurrency(result.closingCosts.taxReserves)}
            />
            <ResultItem
              label={t('results.insuranceReserves')}
              value={formatCurrency(result.closingCosts.insuranceReserves)}
            />
          </ResultSection>

          <div className="mt-4">
            <ResultSection title={t('results.lenderFees')}>
              <ResultItem
                label={t('results.originationFee')}
                value={formatCurrency(result.closingCosts.originationFee)}
              />
              <ResultItem
                label={t('results.processingFee')}
                value={formatCurrency(result.closingCosts.processingFee)}
              />
              <ResultItem
                label={t('results.underwritingFee')}
                value={formatCurrency(result.closingCosts.underwritingFee)}
              />
              <ResultItem
                label={t('results.appraisalFee')}
                value={formatCurrency(result.closingCosts.appraisalFee)}
              />
              <ResultItem
                label={t('results.creditReportFee')}
                value={formatCurrency(result.closingCosts.creditReportFee)}
              />
              <ResultItem
                label={t('results.floodCertFee')}
                value={formatCurrency(result.closingCosts.floodCertFee)}
              />
            </ResultSection>
          </div>

          <div className="mt-4">
            <ResultSection title={t('results.titleFees')}>
              <ResultItem
                label={t('results.titleInsurance')}
                value={formatCurrency(result.closingCosts.titleInsurance)}
              />
              <ResultItem
                label={t('results.escrowFee')}
                value={formatCurrency(result.closingCosts.escrowFee)}
              />
              <ResultItem
                label={t('results.recordingFee')}
                value={formatCurrency(result.closingCosts.recordingFee)}
              />
            </ResultSection>
          </div>

          {(result.closingCosts.sellerCredit > 0 || result.closingCosts.lenderCredit > 0) && (
            <div className="mt-4">
              <ResultSection title={t('results.credits')}>
                {result.closingCosts.sellerCredit > 0 && (
                  <ResultItem
                    label={t('results.sellerCredit')}
                    value={`-${formatCurrency(result.closingCosts.sellerCredit)}`}
                  />
                )}
                {result.closingCosts.lenderCredit > 0 && (
                  <ResultItem
                    label={t('results.lenderCredit')}
                    value={`-${formatCurrency(result.closingCosts.lenderCredit)}`}
                  />
                )}
              </ResultSection>
            </div>
          )}

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4">
            <ResultItem
              label={t('results.totalClosingCosts')}
              value={formatCurrency(result.closingCosts.totalClosingCosts)}
              highlight
            />
          </div>
        </div>
      )}

      {/* Cash to Close */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">
          {t('results.cashToClose')}
        </h3>
        <p className="text-3xl font-bold">
          {formatCurrency(result.cashToClose)}
        </p>
        <p className="text-sm text-blue-100 mt-2">
          {t('results.cashToCloseBreakdown', {
            downPayment: formatCurrency(result.downPayment),
            closingCosts: formatCurrency(result.closingCosts.netClosingCosts),
          })}
        </p>
      </div>
    </div>
  );
}

interface SellerNetResultProps {
  result: {
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
  };
}

export function SellerNetResult({ result }: SellerNetResultProps) {
  const t = useTranslations('calculator');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('sellerNet.results.title')}
        </h3>

        <div className="space-y-2">
          <ResultItem
            label={t('sellerNet.results.grossSalesPrice')}
            value={formatCurrency(result.grossSalesPrice)}
          />
        </div>

        <div className="mt-4">
          <ResultSection title={t('sellerNet.results.debits')}>
            <ResultItem
              label={t('sellerNet.inputs.existingLoanPayoff')}
              value={formatCurrency(result.breakdown.existingLoanPayoff)}
            />
            {result.breakdown.secondLienPayoff > 0 && (
              <ResultItem
                label={t('sellerNet.inputs.secondLienPayoff')}
                value={formatCurrency(result.breakdown.secondLienPayoff)}
              />
            )}
            <ResultItem
              label={t('sellerNet.inputs.commission')}
              value={formatCurrency(result.breakdown.commission)}
            />
            <ResultItem
              label={t('sellerNet.inputs.titleInsurance')}
              value={formatCurrency(result.breakdown.titleInsurance)}
            />
            <ResultItem
              label={t('sellerNet.inputs.escrowFee')}
              value={formatCurrency(result.breakdown.escrowFee)}
            />
            <ResultItem
              label={t('sellerNet.inputs.transferTax')}
              value={formatCurrency(result.breakdown.transferTax)}
            />
            <ResultItem
              label={t('sellerNet.inputs.recordingFees')}
              value={formatCurrency(result.breakdown.recordingFees)}
            />
            {result.breakdown.repairCredits > 0 && (
              <ResultItem
                label={t('sellerNet.inputs.repairCredits')}
                value={formatCurrency(result.breakdown.repairCredits)}
              />
            )}
            {result.breakdown.hoaPayoff > 0 && (
              <ResultItem
                label={t('sellerNet.inputs.hoaPayoff')}
                value={formatCurrency(result.breakdown.hoaPayoff)}
              />
            )}
            {result.breakdown.otherDebits > 0 && (
              <ResultItem
                label={t('sellerNet.inputs.otherDebits')}
                value={formatCurrency(result.breakdown.otherDebits)}
              />
            )}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
              <ResultItem
                label={t('sellerNet.results.totalDebits')}
                value={formatCurrency(result.totalDebits)}
                highlight
              />
            </div>
          </ResultSection>
        </div>

        {result.totalCredits > 0 && (
          <div className="mt-4">
            <ResultSection title={t('sellerNet.results.credits')}>
              {result.breakdown.propertyTaxProration > 0 && (
                <ResultItem
                  label={t('sellerNet.inputs.propertyTaxProration')}
                  value={formatCurrency(result.breakdown.propertyTaxProration)}
                />
              )}
              {result.breakdown.otherCredits > 0 && (
                <ResultItem
                  label={t('sellerNet.inputs.otherCredits')}
                  value={formatCurrency(result.breakdown.otherCredits)}
                />
              )}
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
                <ResultItem
                  label={t('sellerNet.results.totalCredits')}
                  value={formatCurrency(result.totalCredits)}
                  highlight
                />
              </div>
            </ResultSection>
          </div>
        )}
      </div>

      {/* Net Proceeds */}
      <div className={`rounded-xl p-6 text-white ${result.netProceeds >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
        <h3 className="text-lg font-semibold mb-2">
          {t('sellerNet.results.netProceeds')}
        </h3>
        <p className="text-3xl font-bold">
          {formatCurrency(result.netProceeds)}
        </p>
        {result.netProceeds < 0 && (
          <p className="text-sm text-red-100 mt-2">
            {t('sellerNet.results.shortfall')}
          </p>
        )}
      </div>
    </div>
  );
}
