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
      <Page size="LETTER" style={pdfStyles.page}>
        {/* Header */}
        <PdfHeader
          config={config}
          agent={agent}
          title={`${loanType} - Detailed Estimate`}
        />

        {/* Property Address if provided */}
        {propertyAddress && (
          <View style={[pdfStyles.section, pdfStyles.mb12]}>
            <Text style={{ fontSize: 10, color: '#64748B' }}>Property:</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1E293B' }}>
              {propertyAddress}
            </Text>
          </View>
        )}

        {/* Loan Summary */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Loan Summary</Text>
          <View style={pdfStyles.twoColumn}>
            <View style={pdfStyles.column}>
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
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>LTV</Text>
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
            <View style={pdfStyles.column}>
              {/* Empty column for layout balance */}
            </View>
          </View>
        </View>

        {/* Monthly Payment Breakdown */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Monthly Payment Breakdown</Text>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Principal & Interest</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(monthlyPayment.principalAndInterest)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Property Tax</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(monthlyPayment.propertyTax)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Homeowners Insurance</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(monthlyPayment.homeInsurance)}
            </Text>
          </View>
          {monthlyPayment.mortgageInsurance > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Mortgage Insurance</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                {formatCurrency(monthlyPayment.mortgageInsurance)}
              </Text>
            </View>
          )}
          {monthlyPayment.hoaDues > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>HOA Dues</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                {formatCurrency(monthlyPayment.hoaDues)}
              </Text>
            </View>
          )}
          {monthlyPayment.floodInsurance > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Flood Insurance</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                {formatCurrency(monthlyPayment.floodInsurance)}
              </Text>
            </View>
          )}
          <View style={[pdfStyles.tableRow, pdfStyles.tableRowTotal]}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel, pdfStyles.tableCellBold]}>
              Total Monthly Payment
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, pdfStyles.tableCellBold]}>
              {formatCurrency(monthlyPayment.totalMonthly)}
            </Text>
          </View>
        </View>

        {/* Closing Costs - Section A: Lender Fees */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Section A: Lender Fees</Text>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Loan Fee / Origination Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.loanFee || 0)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Admin Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.adminFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Processing Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.processingFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Underwriting Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.underwritingFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Appraisal Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.appraisalFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Credit Report Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.creditReportFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Flood Certification</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.floodCertFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Tax Service Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.taxServiceFee)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.tableRowTotal]}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel, pdfStyles.tableCellBold]}>
              Total Lender Fees
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, pdfStyles.tableCellBold]}>
              {formatCurrency(closingCosts.totalLenderFees)}
            </Text>
          </View>
        </View>

        {/* Section B: Third Party Fees */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Section B: Third Party Fees</Text>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Title Insurance</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.ownerTitlePolicy)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Settlement / Escrow Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.escrowFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Notary Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.notaryFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Recording Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.recordingFee)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Courier Fee</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.courierFee)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.tableRowTotal]}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel, pdfStyles.tableCellBold]}>
              Total Third Party Fees
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, pdfStyles.tableCellBold]}>
              {formatCurrency(closingCosts.totalThirdPartyFees)}
            </Text>
          </View>
        </View>

        {/* Section C: Prepaids */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Section C: Prepaids & Reserves</Text>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Prepaid Interest</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.prepaidInterest)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Tax Reserves</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.taxReserves)}
            </Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Insurance Reserves</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
              {formatCurrency(closingCosts.insuranceReserves)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.tableRowTotal]}>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel, pdfStyles.tableCellBold]}>
              Total Prepaids
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, pdfStyles.tableCellBold]}>
              {formatCurrency(closingCosts.totalPrepaids)}
            </Text>
          </View>
        </View>

        {/* Closing Costs Adjustment (if present) */}
        {closingCosts.adjustment && closingCosts.adjustment !== 0 ? (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Adjustments</Text>
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Manual Adjustment</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue]}>
                {formatCurrency(closingCosts.adjustment)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Section D: Credits */}
        {closingCosts.totalCredits > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Section D: Credits</Text>
            {closingCosts.sellerCredit > 0 && (
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Seller Credit</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, { color: '#059669' }]}>
                  -{formatCurrency(closingCosts.sellerCredit)}
                </Text>
              </View>
            )}
            {closingCosts.lenderCredit > 0 && (
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel]}>Lender Credit</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, { color: '#059669' }]}>
                  -{formatCurrency(closingCosts.lenderCredit)}
                </Text>
              </View>
            )}
            <View style={[pdfStyles.tableRow, pdfStyles.tableRowTotal]}>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellLabel, pdfStyles.tableCellBold]}>
                Total Credits
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableCellValue, pdfStyles.tableCellBold, { color: '#059669' }]}>
                -{formatCurrency(closingCosts.totalCredits)}
              </Text>
            </View>
          </View>
        )}

        {/* Cash to Close Section - matching reference image */}
        {/* Cash to Close Breakdown */}
        <View style={pdfStyles.cashToCloseBox}>
          <Text style={[pdfStyles.cashToCloseLabel, { color: '#1E293B', marginBottom: 6, fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#CBD5E1', paddingBottom: 4, fontWeight: 'bold' }]}>
            Cash to Close Breakdown
          </Text>

          <View style={pdfStyles.cashToCloseRow}>
            <Text style={[pdfStyles.cashToCloseLabel, { color: '#475569', fontSize: 10 }]}>Down Payment</Text>
            <Text style={[pdfStyles.cashToCloseValue, { color: '#1E293B', fontSize: 10 }]}>
              {formatCurrency(result.downPayment)}
            </Text>
          </View>

          <View style={pdfStyles.cashToCloseRow}>
            <Text style={[pdfStyles.cashToCloseLabel, { color: '#475569', fontSize: 10 }]}>+ Total Closing Costs</Text>
            <Text style={[pdfStyles.cashToCloseValue, { color: '#1E293B', fontSize: 10 }]}>
              {formatCurrency(closingCosts.totalClosingCosts)}
            </Text>
          </View>

          {closingCosts.totalCredits > 0 && (
            <View style={pdfStyles.cashToCloseRow}>
              <Text style={[pdfStyles.cashToCloseLabel, { color: '#86efac', fontSize: 10 }]}>- Total Credits</Text>
              <Text style={[pdfStyles.cashToCloseValue, { color: '#86efac', fontSize: 10 }]}>
                {formatCurrency(closingCosts.totalCredits)}
              </Text>
            </View>
          )}

          {/* Calculate Implied Deposit: CashToClose = Down + (Costs - Credits) - Deposit */}
          {/* Deposit = Down + Costs - Credits - CashToClose */}
          {(() => {
            const impliedDeposit = (result.downPayment + closingCosts.totalClosingCosts - closingCosts.totalCredits) - cashToClose;
            if (impliedDeposit > 1) { // Threshold for float errors
              return (
                <View style={pdfStyles.cashToCloseRow}>
                  <Text style={[pdfStyles.cashToCloseLabel, { color: '#86efac', fontSize: 10 }]}>- Deposit / Earnest Money</Text>
                  <Text style={[pdfStyles.cashToCloseValue, { color: '#86efac', fontSize: 10 }]}>
                    {formatCurrency(impliedDeposit)}
                  </Text>
                </View>
              );
            }
            return null;
          })()}

          <View style={[pdfStyles.cashToCloseRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#CBD5E1' }]}>
            <Text style={[pdfStyles.cashToCloseHighlightLabel, { fontSize: 14, color: '#1E293B', fontWeight: 'bold' }]}>Estimated Cash to Close</Text>
            <Text style={[pdfStyles.cashToCloseHighlightValue, { fontSize: 14 }]}>
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
