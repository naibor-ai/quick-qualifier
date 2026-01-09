'use client';

import { useState, useEffect } from 'react';
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
      <div className="bg-[#cbe5f2]/50 rounded-lg p-3">
        {children}
      </div>
    </div>
  );
}

interface ResultSummaryProps {
  activeTab?: string;
  result: LoanCalculationResult;
  showClosingCosts?: boolean;
  showMonthlyBreakdown?: boolean;
  config?: GhlConfig | null;
  loanType?: string;
  propertyAddress?: string;
  formId?: string;
}

export function ResultSummary({
  activeTab: externalActiveTab,
  result,
  showClosingCosts = true,
  showMonthlyBreakdown = true,
  config,
  loanType,
  propertyAddress,
  formId,
}: ResultSummaryProps) {
  const t = useTranslations('calculator');
  const [activeTab, setActiveTab] = useState('summary');
  const [closingTab, setClosingTab] = useState('prepaid');

  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

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

  const mainTabs = [
    { id: 'summary', label: 'Loan Summary' },
    { id: 'payment', label: 'Monthly Payment' },
    { id: 'closing', label: 'Closing Costs' },
    { id: 'cash', label: 'Cash to Close' },
  ];

  const closingTabs = [
    { id: 'prepaid', label: 'Prepaid Items' },
    { id: 'lender', label: 'Lender Fees' },
    { id: 'title', label: 'Title Fees' },
  ];

  return (
    <div className="space-y-4">
      {/* Main Tabs Navigation */}
      <div className="bg-white p-1 rounded-lg border border-slate-200">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#cbe5f2]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Loan Summary */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in duration-300">
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
            {!['conventional', 'conventional-refi', 'fha', 'va', 'fha-refi', 'va-refi'].includes(formId || '') && (
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
      )}

      {/* Tab 2: Monthly Payment */}
      {activeTab === 'payment' && showMonthlyBreakdown && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {t('results.monthlyBreakdown')}
          </h3>

          <div className="space-y-2">
            <ResultItem
              label={(formId === 'fha' || formId === 'fha-refi' || formId === 'va-refi') ? ((formId === 'fha-refi' || formId === 'va-refi') ? "P & I (new loan)" : "P & I") : t('results.principalInterest')}
              value={formatCurrency(result.monthlyPayment.principalAndInterest)}
            />
            {!['fha-refi', 'va-refi', 'conventional-refi'].includes(formId || '') && result.monthlyPayment.propertyTax > 0 && (
              <ResultItem
                label={formId === 'fha' || formId === 'fha-refi' ? "Tax per month" : "Property Tax (per month)"}
                value={formatCurrency(result.monthlyPayment.propertyTax)}
              />
            )}
            {!['fha-refi', 'va-refi', 'conventional-refi'].includes(formId || '') && result.monthlyPayment.homeInsurance > 0 && (
              <ResultItem
                label={formId === 'fha' || formId === 'fha-refi' ? "Insurance per month" : "Home Insurance (per month)"}
                value={formatCurrency(result.monthlyPayment.homeInsurance)}
              />
            )}
            {result.monthlyPayment.mortgageInsurance > 0 && (
              <ResultItem
                label={(formId === 'fha' || formId === 'fha-refi') ? (formId === 'fha-refi' ? "MI/mo (new loan)" : "Monthly Mtg Insurance") : t('results.mortgageInsurance')}
                value={formatCurrency(result.monthlyPayment.mortgageInsurance)}
              />
            )}
            {formId !== 'va-refi' && result.monthlyPayment.hoaDues > 0 && (
              <ResultItem
                label={t('results.hoa')}
                value={formatCurrency(result.monthlyPayment.hoaDues)}
              />
            )}
            {formId !== 'va-refi' && result.monthlyPayment.floodInsurance > 0 && (
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

      {/* Tab 3: Closing Costs */}
      {activeTab === 'closing' && showClosingCosts && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-slate-100 bg-[#cbe5f2]">
            <div className="flex gap-2 text-sm">
              {closingTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setClosingTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${closingTab === tab.id
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {closingTab === 'prepaid' && (
              <div className="space-y-4 animate-in slide-in-from-left-2 duration-200">
                <ResultSection title={t('results.prepaidItems')}>
                  <ResultItem
                    label={`Prepaid Interest (${result.closingCosts.prepaidInterestDays ?? 15} days)`}
                    value={formatCurrency(result.closingCosts.prepaidInterest)}
                  />
                  <ResultItem
                    label={`Prepaid property tax (${result.closingCosts.prepaidTaxMonths ?? 0} months)`}
                    value={formatCurrency(result.closingCosts.taxReserves)}
                  />
                  <ResultItem
                    label={`Prepaid hazard ins (${result.closingCosts.prepaidInsuranceMonths ?? 0} months)`}
                    value={formatCurrency(result.closingCosts.insuranceReserves)}
                  />
                </ResultSection>
                <div className="pt-2 border-t border-slate-100">
                  <ResultItem
                    label="Total Prepaids"
                    value={formatCurrency(result.closingCosts.totalPrepaids)}
                    highlight
                  />
                </div>
              </div>
            )}

            {closingTab === 'lender' && (
              <div className="space-y-4 animate-in slide-in-from-left-2 duration-200">
                <ResultSection title={t('results.lenderFees')}>
                  {result.closingCosts.loanFee !== undefined && (
                    <ResultItem
                      label="Loan Fee / Origination Fee"
                      value={formatCurrency(result.closingCosts.loanFee)}
                    />
                  )}
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
                <div className="pt-2 border-t border-slate-100">
                  <ResultItem
                    label="Total Lender Fees"
                    value={formatCurrency(result.closingCosts.totalLenderFees)}
                    highlight
                  />
                </div>
              </div>
            )}

            {closingTab === 'title' && (
              <div className="space-y-4 animate-in slide-in-from-left-2 duration-200">
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
                <div className="pt-2 border-t border-slate-100">
                  <ResultItem
                    label="Total Third Party Fees"
                    value={formatCurrency(result.closingCosts.totalThirdPartyFees)}
                    highlight
                  />
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 mt-4 bg-[#cbe5f2]/50 -mx-6 -mb-6 p-6">
              <ResultItem
                label={t('results.totalClosingCosts')}
                value={formatCurrency(result.closingCosts.totalClosingCosts)}
                highlight
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cash to Close */}
      {activeTab === 'cash' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-linear-to-r from-[#2A8BB3] to-[#31B2E8] rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              Estimated Cash to Close
            </h3>
            <p className="text-4xl font-bold mb-4 tracking-tight">
              {formatCurrency(result.cashToClose)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 text-sm bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <span className="opacity-90">Down Payment: <strong>{formatCurrency(result.downPayment)}</strong></span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="opacity-90">Closing Costs: <strong>{formatCurrency(result.closingCosts.totalClosingCosts)}</strong></span>
            </div>
          </div>

          {config && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              {/* <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                Download Reports
              </h4> */}
              <PdfDownloadButtons
                result={result}
                config={config}
                loanType={loanType}
                propertyAddress={propertyAddress}
              />
            </div>
          )}
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
