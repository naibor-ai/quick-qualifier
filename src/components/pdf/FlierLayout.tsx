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

        {/* Property Address if provided */}
        {propertyAddress && (
          <View style={[pdfStyles.section, pdfStyles.mb16]}>
            <Text style={{ fontSize: 11, color: '#64748B' }}>Property:</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E293B' }}>
              {propertyAddress}
            </Text>
          </View>
        )}

        {/* Main Summary Box */}
        <View style={pdfStyles.summaryBox}>
          <Text style={pdfStyles.summaryTitle}>Your Estimated Monthly Payment</Text>
          <View style={[pdfStyles.summaryRow, { marginBottom: 12 }]}>
            <Text style={pdfStyles.summaryLabel}>Total PITI</Text>
            <Text style={pdfStyles.summaryValueLarge}>
              {formatCurrency(monthlyPayment.totalMonthly)}/mo
            </Text>
          </View>

          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Principal & Interest</Text>
            <Text style={pdfStyles.summaryValue}>
              {formatCurrency(monthlyPayment.principalAndInterest)}
            </Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Property Tax</Text>
            <Text style={pdfStyles.summaryValue}>
              {formatCurrency(monthlyPayment.propertyTax)}
            </Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Home Insurance</Text>
            <Text style={pdfStyles.summaryValue}>
              {formatCurrency(monthlyPayment.homeInsurance)}
            </Text>
          </View>
          {monthlyPayment.mortgageInsurance > 0 && (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Mortgage Insurance</Text>
              <Text style={pdfStyles.summaryValue}>
                {formatCurrency(monthlyPayment.mortgageInsurance)}
              </Text>
            </View>
          )}
          {monthlyPayment.hoaDues > 0 && (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>HOA Dues</Text>
              <Text style={pdfStyles.summaryValue}>
                {formatCurrency(monthlyPayment.hoaDues)}
              </Text>
            </View>
          )}
        </View>

        {/* Two Column Layout */}
        <View style={pdfStyles.twoColumn}>
          {/* Loan Details */}
          <View style={pdfStyles.column}>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>Loan Details</Text>

              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Base Loan Amount</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                  {formatCurrency(loanAmount)}
                </Text>
              </View>
              {totalLoanAmount !== loanAmount && (
                <View style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Total Loan Amount</Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                    {formatCurrency(totalLoanAmount)}
                  </Text>
                </View>
              )}
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Loan-to-Value (LTV)</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                  {formatPercentSimple(ltv, 'en', { maximumFractionDigits: 2 })}
                </Text>
              </View>
              {result.downPayment > 0 && (
                <View style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Down Payment</Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                    {formatCurrency(result.downPayment)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Program-specific details */}
          
          <View style={pdfStyles.column}>
            
            {(result.ufmip || result.vaFundingFee) && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>Program Fees</Text>
                {result.ufmip && (
                  <View style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>
                      Upfront MIP (Financed)
                    </Text>
                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                      {formatCurrency(result.ufmip)}
                    </Text>
                  </View>
                )}
                {result.vaFundingFee && (
                  <View style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>
                      VA Funding Fee (Financed)
                    </Text>
                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                      {formatCurrency(result.vaFundingFee)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Cash to Close Section - matching reference image */}
        <View style={pdfStyles.cashToCloseBox}>
          <View style={pdfStyles.cashToCloseRow}>
            <Text style={pdfStyles.cashToCloseLabel}>Total Closing Costs</Text>
            <Text style={pdfStyles.cashToCloseValue}>
              {formatCurrency(closingCosts.totalClosingCosts)}
            </Text>
          </View>
          <View style={pdfStyles.cashToCloseRowLast}>
            <Text style={pdfStyles.cashToCloseHighlightLabel}>Cash to Close</Text>
            <Text style={pdfStyles.cashToCloseHighlightValue}>
              {formatCurrency(cashToClose)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <PdfFooter config={config} />
      </Page>
    </Document>
  );
}
