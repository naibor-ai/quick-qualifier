'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCalculatorStore } from '@/lib/store';
import type { LoanCalculationResult, GhlConfig, PartnerAgent } from '@/lib/schemas';

// Dynamic import for PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <ButtonSkeleton /> }
);

function ButtonSkeleton() {
  return (
    <div className="h-10 w-full bg-slate-200 animate-pulse rounded-lg" />
  );
}

interface PdfDownloadButtonsProps {
  result: LoanCalculationResult;
  config: GhlConfig;
  loanType?: string;
  propertyAddress?: string;
}

export function PdfDownloadButtons({
  result,
  config,
  loanType = 'Loan',
  propertyAddress,
}: PdfDownloadButtonsProps) {
  const t = useTranslations();
  const { selectedAgent } = useCalculatorStore();
  const [activeDownload, setActiveDownload] = useState<'flyer' | 'detailed' | null>(null);

  const fileName = `${loanType.toLowerCase().replace(/\s+/g, '-')}-estimate`;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        {t('calculator.downloadReports')}
      </h4>

      <div className="flex flex-col sm:flex-row gap-2">
        <PdfButton
          type="flyer"
          result={result}
          config={config}
          agent={selectedAgent}
          loanType={loanType}
          propertyAddress={propertyAddress}
          fileName={`${fileName}-flyer.pdf`}
          isLoading={activeDownload === 'flyer'}
          onLoadingChange={(loading) => setActiveDownload(loading ? 'flyer' : null)}
        />

        <PdfButton
          type="detailed"
          result={result}
          config={config}
          agent={selectedAgent}
          loanType={loanType}
          propertyAddress={propertyAddress}
          fileName={`${fileName}-detailed.pdf`}
          isLoading={activeDownload === 'detailed'}
          onLoadingChange={(loading) => setActiveDownload(loading ? 'detailed' : null)}
        />
      </div>

      {selectedAgent && (
        <p className="text-xs text-slate-500">
          {t('calculator.pdfIncludesAgent', { agentName: selectedAgent.name })}
        </p>
      )}
    </div>
  );
}

interface PdfButtonProps {
  type: 'flyer' | 'detailed';
  result: LoanCalculationResult;
  config: GhlConfig;
  agent: PartnerAgent | null;
  loanType: string;
  propertyAddress?: string;
  fileName: string;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

function PdfButton({
  type,
  result,
  config,
  agent,
  loanType,
  propertyAddress,
  fileName,
  isLoading,
  onLoadingChange,
}: PdfButtonProps) {
  const t = useTranslations();
  const [isReady, setIsReady] = useState(false);

  // Lazy load PDF documents
  const PdfDocument = type === 'flyer'
    ? require('@/components/pdf').FlierLayout
    : require('@/components/pdf').DetailedReport;

  const label = type === 'flyer'
    ? t('calculator.downloadFlyer')
    : t('calculator.downloadDetailed');

  const icon = type === 'flyer' ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <PDFDownloadLink
      document={
        <PdfDocument
          result={result}
          config={config}
          agent={agent}
          loanType={loanType}
          propertyAddress={propertyAddress}
        />
      }
      fileName={fileName}
      className={`
        flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
        text-sm font-medium transition-colors
        ${isLoading
          ? 'bg-slate-100 text-slate-400 cursor-wait'
          : 'bg-linear-to-b from-[#2A8BB3] to-[#31B2E8] text-white hover:from-[#31B2E8] hover:to-[#2A8BB3] active:from-[#2A8BB3] active:to-[#31B2E8]'
        }
      `}
    >
      {({ loading }) => (
        <>
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            icon
          )}
          <span>{loading ? t('common.preparing') : label}</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
