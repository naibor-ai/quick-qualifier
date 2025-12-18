'use client';

import { useTranslations } from 'next-intl';
import type { LoanCalculationResult, GhlConfig } from '@/lib/schemas';
import { PdfDownloadButtons } from './PdfDownloadButtons';

interface ResultItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  subtext?: string;
}

function ResultItem({ label, value, highlight = false, subtext }: ResultItemProps) {
  return (
    <div className={`flex justify-between items-baseline py-2 ${highlight ? 'border-t border-b border-slate-200' : ''}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <div className="text-right">
        <span className={`font-medium ${highlight ? 'text-lg bg-linear-to-b from-[#2A8BB3] to-[#31B2E8] bg-clip-text text-transparent' : 'text-slate-800'}`}>
          {value}
        </span>
        {subtext && (
          <p className="text-xs text-slate-500">{subtext}</p>
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
      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        {title}
      </h4>
      <div className="bg-slate-50/50 rounded-lg p-3">
        {children}
      </div>
    </div>
  );
}

interface ResultSummaryProps {
  result: LoanCalculationResult;
  showClosingCosts?: boolean;
  showMonthlyBreakdown?: boolean;
  config?: GhlConfig | null;
  loanType?: string;
  propertyAddress?: string;
  formId?: string;
}

export function ResultSummary({
  result,
  showClosingCosts = true,
  showMonthlyBreakdown = true,
  config,
  loanType,
  propertyAddress,
  formId,
}: ResultSummaryProps) {
  const t = useTranslations('calculator');

  const isRefi = formId?.includes('refi');

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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
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
          {formId === 'fha' && result.totalLoanAmount !== result.loanAmount && (
            <ResultItem
              label="Loan with MIP"
              value={formatCurrency(result.totalLoanAmount)}
            />
          )}
          {/* Hide Monthly Payment highlight for Conventional and FHA as per user request */}
          {!['conventional', 'fha', 'fha-refi', 'va-refi'].includes(formId || '') && (
            <ResultItem
              label={t('results.monthlyPayment')}
              value={formatCurrency(result.monthlyPayment.totalMonthly)}
              highlight
            />
          )}
          <ResultItem
            label="Prepaids"
            value={formatCurrency(result.closingCosts.totalPrepaids)}
          />
          <ResultItem
            label="Closing Costs (Fees Only)"
            value={formatCurrency(result.closingCosts.totalLenderFees + result.closingCosts.totalThirdPartyFees)}
          />
        </div>
      </div>

      {/* Monthly Payment Breakdown */}
      {showMonthlyBreakdown && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {t('results.monthlyBreakdown')}
          </h3>

          <div className="space-y-2">
            <ResultItem
              label={(formId === 'fha' || formId === 'fha-refi' || formId === 'va-refi') ? ((formId === 'fha-refi' || formId === 'va-refi') ? "P & I (new loan)" : "P & I") : t('results.principalInterest')}
              value={formatCurrency(result.monthlyPayment.principalAndInterest)}
            />
            {!['fha-refi', 'va-refi'].includes(formId || '') && (
              <ResultItem
                label={formId === 'fha' ? "Tax per month" : "Property Tax (per month)"}
                value={formatCurrency(result.monthlyPayment.propertyTax)}
              />
            )}
            {!['fha-refi', 'va-refi'].includes(formId || '') && (
              <ResultItem
                label={formId === 'fha' ? "Insurance per month" : "Home Insurance (per month)"}
                value={formatCurrency(result.monthlyPayment.homeInsurance)}
              />
            )}
            {result.monthlyPayment.mortgageInsurance > 0 && (
              <ResultItem
                label={(formId === 'fha' || formId === 'fha-refi') ? (formId === 'fha-refi' ? "MI/mo (new loan)" : "Monthly Mtg Insurance") : t('results.mortgageInsurance')}
                value={formatCurrency(result.monthlyPayment.mortgageInsurance)}
              />
            )}
            {!['fha-refi', 'va-refi'].includes(formId || '') && result.monthlyPayment.hoaDues > 0 && (
              <ResultItem
                label={t('results.hoa')}
                value={formatCurrency(result.monthlyPayment.hoaDues)}
              />
            )}
            {!['fha-refi', 'va-refi'].includes(formId || '') && result.monthlyPayment.floodInsurance > 0 && (
              <ResultItem
                label={t('results.floodInsurance')}
                value={formatCurrency(result.monthlyPayment.floodInsurance)}
              />
            )}
            <div className="border-t border-slate-200 pt-2 mt-2">
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
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {t('results.closingCosts')}
          </h3>

          <ResultSection title={t('results.prepaidItems')}>
            <ResultItem
              label="Prepaid Interest (15 days)"
              value={formatCurrency(result.closingCosts.prepaidInterest)}
            />
            {!['fha-refi', 'va-refi'].includes(formId || '') && (
              <ResultItem
                label="Prepaid property tax (6 months)"
                value={formatCurrency(result.closingCosts.taxReserves)}
              />
            )}
            {!['fha-refi', 'va-refi'].includes(formId || '') && (
              <ResultItem
                label="Prepaid hazard ins (15 months)"
                value={formatCurrency(result.closingCosts.insuranceReserves)}
              />
            )}
          </ResultSection>

          <div className="mt-4">
            <ResultSection title={t('results.lenderFees')}>
              {result.closingCosts.loanFee !== undefined && (
                <ResultItem
                  label="Loan Fee"
                  value={formatCurrency(result.closingCosts.loanFee)}
                />
              )}
              <ResultItem
                label={t('results.originationFee')}
                value={formatCurrency(result.closingCosts.originationFee)}
              />
              {result.closingCosts.adminFee > 0 && (
                <ResultItem
                  label={t('results.adminFee')}
                  value={formatCurrency(result.closingCosts.adminFee)}
                />
              )}
              <ResultItem
                label={t('results.docPrepFee')}
                value={formatCurrency(result.closingCosts.docPrepFee)}
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
              <ResultItem
                label={t('results.taxServiceFee')}
                value={formatCurrency(result.closingCosts.taxServiceFee)}
              />
            </ResultSection>
          </div>

          <div className="mt-4">
            <ResultSection title={t('results.titleFees')}>
              <ResultItem
                label={t('results.lenderTitlePolicy')}
                value={formatCurrency(result.closingCosts.lenderTitlePolicy)}
              />
              {!isRefi && (
                <ResultItem
                  label={t('results.ownerTitlePolicy')}
                  value={formatCurrency(result.closingCosts.ownerTitlePolicy)}
                />
              )}
              <ResultItem
                label={t('results.escrowFee')}
                value={formatCurrency(result.closingCosts.escrowFee)}
              />
              <ResultItem
                label={t('results.recordingFee')}
                value={formatCurrency(result.closingCosts.recordingFee)}
              />
              <ResultItem
                label={t('results.notaryFee')}
                value={formatCurrency(result.closingCosts.notaryFee)}
              />
              {/* Courier Fee removed as per user request/images */}

              {!isRefi && (
                <>
                  <ResultItem
                    label={t('results.pestInspectionFee')}
                    value={formatCurrency(result.closingCosts.pestInspectionFee)}
                  />
                  <ResultItem
                    label={t('results.propertyInspectionFee')}
                    value={formatCurrency(result.closingCosts.propertyInspectionFee)}
                  />
                  {formId !== 'va' && (
                    <ResultItem
                      label={t('results.poolInspectionFee')}
                      value={formatCurrency(result.closingCosts.poolInspectionFee)}
                    />
                  )}
                </>
              )}
              {result.closingCosts.transferTax !== undefined && (
                <ResultItem
                  label="Transfer Tax"
                  value={formatCurrency(result.closingCosts.transferTax)}
                />
              )}
              {result.closingCosts.mortgageTax !== undefined && (
                <ResultItem
                  label="Mortgage Tax"
                  value={formatCurrency(result.closingCosts.mortgageTax)}
                />
              )}
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

          <div className="border-t border-slate-200 pt-4 mt-4">
            <ResultItem
              label={t('results.totalClosingCosts')}
              value={formatCurrency(result.closingCosts.totalClosingCosts)}
              highlight
            />
          </div>
        </div>
      )}

      {/* Cash to Close */}
      <div className="bg-linear-to-r from-[#2A8BB3] to-[#31B2E8] rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">
          {t('results.cashToClose')}
        </h3>
        <p className="text-3xl font-bold">
          {formatCurrency(result.cashToClose)}
        </p>
        <p className="text-sm text-white/80 mt-2">
          {t('results.cashToCloseBreakdown', {
            downPayment: formatCurrency(result.downPayment),
            closingCosts: formatCurrency(result.closingCosts.netClosingCosts),
          })}
        </p>
      </div>

      {/* PDF Download Buttons */}
      {config && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <PdfDownloadButtons
            result={result}
            config={config}
            loanType={loanType}
            propertyAddress={propertyAddress}
          />
        </div>
      )}
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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
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
            <div className="border-t border-slate-200 pt-2 mt-2">
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
              <div className="border-t border-slate-200 pt-2 mt-2">
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
      <div className={`rounded-xl p-6 text-white ${result.netProceeds >= 0 ? 'bg-linear-to-r from-green-500 to-green-600' : 'bg-linear-to-r from-red-500 to-red-600'}`}>
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
