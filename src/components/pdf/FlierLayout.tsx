import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { PdfHeader } from './PdfHeader';
import { PdfFooter } from './PdfFooter';
import type { LoanCalculationResult, GhlConfig, PartnerAgent } from '@/lib/schemas';
import { formatCurrency, formatPercentSimple } from '@/lib/formatters';

interface FlierLayoutProps {
  result: LoanCalculationResult;
  config: GhlConfig;
  agent?: PartnerAgent | null;
  loanType?: string;
  propertyAddress?: string;
}

/**
 * Marketing-friendly single-page PDF flier with loan summary.
 */
export function FlierLayout({
  result,
  config,
  agent,
  loanType = 'Loan',
  propertyAddress,
}: FlierLayoutProps) {
  const { monthlyPayment, closingCosts, loanAmount, totalLoanAmount, ltv, cashToClose } = result;

  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page}>
        {/* Header */}
        <PdfHeader
          config={config}
          agent={agent}
          title={`${loanType} Estimate`}
        />

        {/* Property Address Area */}
        {propertyAddress && (
          <View style={[pdfStyles.card, pdfStyles.accentCard, { marginTop: -10, padding: 8 }]}>
            <Text style={{ fontSize: 8, color: '#0EA5E9', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Property Review</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0C4A6E' }}>
              {propertyAddress}
            </Text>
          </View>
        )}

        {/* Hero Section: Monthly Payment */}
        <View style={[pdfStyles.paymentCard, { padding: 12, alignItems: 'center', backgroundColor: '#F0F9FF', borderLeftColor: '#0EA5E9', borderLeftWidth: 6, marginBottom: 12 }]}>
          <Text style={{ fontSize: 10, color: '#0369A1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2 }}>Estimated Monthly Payment</Text>
          <Text style={{ fontSize: 24, color: '#1E40AF', fontWeight: 'bold', marginVertical: 4 }}>
            {formatCurrency(monthlyPayment.totalMonthly)}
          </Text>
          <Text style={{ fontSize: 8, color: '#64748B' }}>*Includes Principal, Interest, Taxes, and Insurance</Text>
        </View>

        <View style={pdfStyles.twoColumn}>
          {/* Monthly Payment Breakdown - Replacing the old Payment Breakdown */}
          <View style={[pdfStyles.column, { flex: 1.2 }]}>
            <View style={pdfStyles.cashToCloseBox}>
              <Text style={{ color: '#2563EB', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10 }}>Monthly Payment Breakdown</Text>

              <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                <Text style={pdfStyles.cashToCloseLabel}>Principal & Interest</Text>
                <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(monthlyPayment.principalAndInterest)}</Text>
              </View>
              <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                <Text style={pdfStyles.cashToCloseLabel}>Property Taxes</Text>
                <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(monthlyPayment.propertyTax)}</Text>
              </View>
              <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                <Text style={pdfStyles.cashToCloseLabel}>Home Insurance</Text>
                <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(monthlyPayment.homeInsurance)}</Text>
              </View>
              {monthlyPayment.mortgageInsurance > 0 && (
                <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                  <Text style={pdfStyles.cashToCloseLabel}>Mortgage Insurance</Text>
                  <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(monthlyPayment.mortgageInsurance)}</Text>
                </View>
              )}
              {monthlyPayment.hoaDues > 0 && (
                <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                  <Text style={pdfStyles.cashToCloseLabel}>HOA Dues</Text>
                  <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(monthlyPayment.hoaDues)}</Text>
                </View>
              )}
              {monthlyPayment.floodInsurance > 0 && (
                <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                  <Text style={pdfStyles.cashToCloseLabel}>Flood Insurance</Text>
                  <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(monthlyPayment.floodInsurance)}</Text>
                </View>
              )}

              <View style={[pdfStyles.cashToCloseRowLast, { marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#DBEAFE' }]}>
                <Text style={pdfStyles.cashToCloseHighlightLabel}>Total Monthly Payment</Text>
                <Text style={pdfStyles.cashToCloseHighlightValue}>{formatCurrency(monthlyPayment.totalMonthly)}</Text>
              </View>
            </View>

            <View style={[pdfStyles.section, { marginTop: 15 }]}>
              <Text style={pdfStyles.sectionTitleBlue}>Loan Summary</Text>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCell}>Base Loan Amount</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(loanAmount)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCell}>Down Payment</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(result.downPayment)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCell}>LTV</Text>
                <Text style={pdfStyles.tableCellValue}>{formatPercentSimple(ltv, 'en', { maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          {/* Highlights Column */}
          <View style={[pdfStyles.column, { flex: 1 }]}>
            {/* Next Steps Card */}
            <View style={[pdfStyles.card, { backgroundColor: '#F8FAFC', padding: 15, marginBottom: 15 }]}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E40AF', marginBottom: 8, textTransform: 'uppercase' }}>Next Steps</Text>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 9, color: '#475569' }}>• Contact your loan officer today</Text>
                <Text style={{ fontSize: 9, color: '#475569' }}>• Get pre-approved in minutes</Text>
                <Text style={{ fontSize: 9, color: '#475569' }}>• Lock in your custom interest rate</Text>
              </View>
            </View>

            {/* Program Specific if FHA/VA */}
            {(result.ufmip || result.vaFundingFee) && (
              <View style={[pdfStyles.card, { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }]}>
                <Text style={{ fontSize: 8, color: '#0369A1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>Financed Fee</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E40AF' }}>
                  {formatCurrency(result.ufmip || result.vaFundingFee || 0)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Cash to Close Highlight - Moved to bottom for final impact */}
        <View style={pdfStyles.cashToCloseBox}>
          <Text style={{ color: '#2563EB', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10 }}>Estimated Cash to Close</Text>

          <View style={{ flexDirection: 'row', gap: 30 }}>
            <View style={{ flex: 1 }}>
              <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                <Text style={pdfStyles.cashToCloseLabel}>Down Payment</Text>
                <Text style={pdfStyles.cashToCloseValue}>{formatCurrency(result.downPayment)}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                <Text style={pdfStyles.cashToCloseLabel}>Closing Costs</Text>
                <Text style={pdfStyles.cashToCloseValue}>+{formatCurrency(closingCosts.totalClosingCosts)}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              {closingCosts.totalCredits > 0 && (
                <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                  <Text style={[pdfStyles.cashToCloseLabel, { color: '#059669' }]}>Total Credits</Text>
                  <Text style={[pdfStyles.cashToCloseValue, { color: '#059669' }]}>-{formatCurrency(closingCosts.totalCredits)}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={[pdfStyles.cashToCloseRowLast, { marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#DBEAFE' }]}>
            <Text style={pdfStyles.cashToCloseHighlightLabel}>Total Estimated Cash Due at Closing</Text>
            <Text style={pdfStyles.cashToCloseHighlightValue}>{formatCurrency(cashToClose)}</Text>
          </View>
        </View>

        {/* Program Specific if FHA/VA */}
        {(result.ufmip || result.vaFundingFee) && (
          <View style={[pdfStyles.card, { marginTop: 10, borderColor: '#BFDBFE', backgroundColor: '#F0F9FF' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E40AF' }}>Program Fees Financed</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1E40AF' }}>
                {formatCurrency(result.ufmip || result.vaFundingFee || 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <PdfFooter config={config} />
      </Page>
    </Document>
  );
}
