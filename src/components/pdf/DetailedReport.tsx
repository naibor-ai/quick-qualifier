import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { PdfHeader } from './PdfHeader';
import { PdfFooter } from './PdfFooter';
import type { LoanCalculationResult, GhlConfig, PartnerAgent } from '@/lib/schemas';
import { formatCurrency, formatPercentSimple } from '@/lib/formatters';

interface DetailedReportProps {
  result: LoanCalculationResult;
  config: GhlConfig;
  agent?: PartnerAgent | null;
  loanType?: string;
  propertyAddress?: string;
}

/**
 * Detailed multi-section PDF report with full fee breakdown.
 */
export function DetailedReport({
  result,
  config,
  agent,
  loanType = 'Loan',
  propertyAddress,
}: DetailedReportProps) {
  const { monthlyPayment, closingCosts, loanAmount, totalLoanAmount, ltv, cashToClose } = result;

  return (
    <Document>
      {/* Page 1: Summary & Fee Breakdown */}
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader
          config={config}
          agent={agent}
          title={`${loanType} - Detailed Estimate`}
        />

        {propertyAddress && (
          <View style={[pdfStyles.card, pdfStyles.accentCard, { marginTop: -10 }]}>
            <Text style={{ fontSize: 9, color: '#0EA5E9', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Property Address</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0C4A6E' }}>
              {propertyAddress}
            </Text>
          </View>
        )}

        <View style={pdfStyles.twoColumn}>
          <View style={[pdfStyles.column, { flex: 1 }]}>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitleBlue}>Loan details</Text>
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Base Loan Amount</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>{formatCurrency(loanAmount)}</Text>
              </View>
              {totalLoanAmount !== loanAmount && (
                <View style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Total Loan Amount</Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>{formatCurrency(totalLoanAmount)}</Text>
                </View>
              )}
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>LTV (Loan to Value)</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>{formatPercentSimple(ltv, 'en', { maximumFractionDigits: 2 })}</Text>
              </View>
              {result.downPayment > 0 && (
                <View style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Down Payment</Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>{formatCurrency(result.downPayment)}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={[pdfStyles.column, { flex: 1 }]}>
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
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={pdfStyles.sectionTitle}>Detailed Fee Breakdown</Text>
          <View style={pdfStyles.twoColumn}>
            <View style={pdfStyles.column}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E40AF', marginBottom: 6, backgroundColor: '#F0F7FF', padding: '4 8' }}>Section A: Lender Fees</Text>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Origination Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.loanFee || 0)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Admin Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.adminFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Processing Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.processingFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Underwriting Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.underwritingFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Appraisal Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.appraisalFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Credit Report Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.creditReportFee)}</Text></View>
              <View style={[pdfStyles.tableRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                <Text style={[pdfStyles.tableCell, { fontWeight: 'bold', color: '#1E3A8A' }]}>Subtotal Section A</Text>
                <Text style={[pdfStyles.tableCellValue, { fontWeight: 'bold', color: '#1E3A8A' }]}>{formatCurrency(closingCosts.totalLenderFees)}</Text>
              </View>
            </View>

            <View style={pdfStyles.column}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E40AF', marginBottom: 6, backgroundColor: '#F0F7FF', padding: '4 8' }}>Section B: Third Party Fees</Text>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Title Insurance</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.ownerTitlePolicy)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Escrow Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.escrowFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Notary Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.notaryFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Recording Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.recordingFee)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Courier Fee</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.courierFee)}</Text></View>
              <View style={[pdfStyles.tableRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                <Text style={[pdfStyles.tableCell, { fontWeight: 'bold', color: '#1E3A8A' }]}>Subtotal Section B</Text>
                <Text style={[pdfStyles.tableCellValue, { fontWeight: 'bold', color: '#1E3A8A' }]}>{formatCurrency(closingCosts.totalThirdPartyFees)}</Text>
              </View>
            </View>
          </View>

          <View style={[pdfStyles.twoColumn, { marginTop: 15 }]}>
            <View style={pdfStyles.column}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E40AF', marginBottom: 6, backgroundColor: '#F0F7FF', padding: '4 8' }}>Section C: Prepaids & Reserves</Text>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Prepaid Interest</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.prepaidInterest)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Tax Reserves</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.taxReserves)}</Text></View>
              <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Insurance Reserves</Text><Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.insuranceReserves)}</Text></View>
              <View style={[pdfStyles.tableRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                <Text style={[pdfStyles.tableCell, { fontWeight: 'bold', color: '#1E3A8A' }]}>Subtotal Section C</Text>
                <Text style={[pdfStyles.tableCellValue, { fontWeight: 'bold', color: '#1E3A8A' }]}>{formatCurrency(closingCosts.totalPrepaids)}</Text>
              </View>
            </View>

            <View style={pdfStyles.column}>
              {closingCosts.totalCredits > 0 ? (
                <>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#059669', marginBottom: 6, backgroundColor: '#ECFDF5', padding: '4 8' }}>Section D: Credits</Text>
                  {closingCosts.sellerCredit > 0 && <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Seller Credit</Text><Text style={[pdfStyles.tableCellValue, { color: '#059669' }]}>-{formatCurrency(closingCosts.sellerCredit)}</Text></View>}
                  {closingCosts.lenderCredit > 0 && <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Lender Credit</Text><Text style={[pdfStyles.tableCellValue, { color: '#059669' }]}>-{formatCurrency(closingCosts.lenderCredit)}</Text></View>}
                  <View style={[pdfStyles.tableRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                    <Text style={[pdfStyles.tableCell, { fontWeight: 'bold', color: '#059669' }]}>Total Credits</Text>
                    <Text style={[pdfStyles.tableCellValue, { fontWeight: 'bold', color: '#059669' }]}>-{formatCurrency(closingCosts.totalCredits)}</Text>
                  </View>
                </>
              ) : (
                <View style={[pdfStyles.card, { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', marginBottom: 0 }]}>
                  <Text style={{ textAlign: 'center', fontSize: 9, color: '#64748B' }}>No credits applied to this estimate.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <PdfFooter config={config} />
      </Page>

      {/* Page 2: Final Summation & Disclaimer */}
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader
          config={config}
          agent={agent}
          title={`${loanType} - Summary and Disclosures`}
        />

        <View style={{ marginTop: 15 }}>
          <Text style={pdfStyles.sectionTitle}>Summary Disclosures</Text>

          <View style={[pdfStyles.card, { borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginBottom: 15 }]}>
            <Text style={{ fontSize: 10, color: '#92400E', fontWeight: 'bold', marginBottom: 6 }}>IMPORTANT: LOAN ACCURACY</Text>
            <Text style={{ fontSize: 9, color: '#B45309', lineHeight: 1.4 }}>
              This preliminary loan estimate is based on the information provided and current market conditions.
              Actual rates, points, and fees will be determined at the time of official loan application and rate lock.
              The fees listed are estimates and are subject to change based on actual quotes from third-party service providers.
            </Text>
          </View>

          <View style={pdfStyles.twoColumn}>
            <View style={[pdfStyles.column, { flex: 1 }]}>
              <View style={[pdfStyles.card, { backgroundColor: '#F8FAFC', flex: 1 }]}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1E40AF', marginBottom: 8, textTransform: 'uppercase' }}>Next Steps</Text>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 8.5, color: '#475569' }}>• Connect with your loan officer to discuss your options.</Text>
                  <Text style={{ fontSize: 8.5, color: '#475569' }}>• Review the full list of required documentation.</Text>
                  <Text style={{ fontSize: 8.5, color: '#475569' }}>• Lock in your custom interest rate.</Text>
                </View>
              </View>
            </View>

            <View style={[pdfStyles.column, { flex: 1 }]}>
              <View style={[pdfStyles.cashToCloseBox, { marginTop: 0, padding: 15 }]}>
                <Text style={{ color: '#2563EB', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 }}>Estimated Cash to Close</Text>

                <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                  <Text style={[pdfStyles.cashToCloseLabel, { fontSize: 10 }]}>Down Payment</Text>
                  <Text style={[pdfStyles.cashToCloseValue, { fontSize: 10 }]}>{formatCurrency(result.downPayment)}</Text>
                </View>

                <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                  <Text style={[pdfStyles.cashToCloseLabel, { fontSize: 10 }]}>Closing Costs</Text>
                  <Text style={[pdfStyles.cashToCloseValue, { fontSize: 10 }]}>+{formatCurrency(closingCosts.totalClosingCosts)}</Text>
                </View>

                {closingCosts.totalCredits > 0 && (
                  <View style={[pdfStyles.cashToCloseRow, { paddingVertical: 6 }]}>
                    <Text style={[pdfStyles.cashToCloseLabel, { color: '#059669', fontSize: 10 }]}>Total Credits</Text>
                    <Text style={[pdfStyles.cashToCloseValue, { color: '#059669', fontSize: 10 }]}>-{formatCurrency(closingCosts.totalCredits)}</Text>
                  </View>
                )}

                <View style={[pdfStyles.cashToCloseRowLast, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#DBEAFE' }]}>
                  <Text style={[pdfStyles.cashToCloseHighlightLabel, { fontSize: 12 }]}>Total Cash Due</Text>
                  <Text style={[pdfStyles.cashToCloseHighlightValue, { fontSize: 14 }]}>{formatCurrency(cashToClose)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <PdfFooter config={config} />
      </Page>
    </Document>
  );
}
