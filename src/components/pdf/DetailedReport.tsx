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
  const { monthlyPayment, closingCosts, loanAmount, cashToClose } = result;

  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page}>
        {/* Border Frame */}
        <View style={pdfStyles.pageFrame} />

        <PdfHeader
          config={config}
          result={result}
          loanType={loanType}
        />

        {/* Monthly Payment Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionHeaderRed}>Your Monthly Payment Includes:</Text>

          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Principal & Interest</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(monthlyPayment.principalAndInterest)}</Text>
          </View>

          {monthlyPayment.mortgageInsurance > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCellLabel}>Monthly mortgage insurance ({formatPercentSimple(result.monthlyMiRate || 0.55)})</Text>
              <Text style={pdfStyles.tableCellValue}>{formatCurrency(monthlyPayment.mortgageInsurance)}</Text>
            </View>
          )}

          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Property tax</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(monthlyPayment.propertyTax)}</Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Hazard insurance (estimated)</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(monthlyPayment.homeInsurance)}</Text>
          </View>

          {monthlyPayment.hoaDues > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCellLabel}>HOA dues</Text>
              <Text style={pdfStyles.tableCellValue}>{formatCurrency(monthlyPayment.hoaDues)}</Text>
            </View>
          )}

          <View style={pdfStyles.totalContainer}>
            <Text style={pdfStyles.totalText}>Total payment is {formatCurrency(monthlyPayment.totalMonthly)}</Text>
          </View>
        </View>

        {/* Cash Requirements Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionHeaderRed}>Your Cash Requirements Include:</Text>

          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Down payment ({formatPercentSimple(result.downPaymentPercent || 0)})</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(result.downPayment)}</Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Closing costs</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.totalThirdPartyFees + closingCosts.totalLenderFees)}</Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Prepaid costs</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.totalPrepaids)}</Text>
          </View>

          <View style={pdfStyles.totalContainer}>
            <Text style={pdfStyles.totalText}>Total cash required is {formatCurrency(cashToClose)}</Text>
          </View>
        </View>

        {/* Detailed Disclaimer Text */}
        <Text style={pdfStyles.detailedDisclaimer}>
          When impounded, prepaid costs are 15 days interest, 6 mo taxes, 15 mo hazard insurance and 0 mo mortgage insurance if it applies. Title insurance and closing fees are estimated for your area, but can vary from one title company to another. The above rates and fees are estimates as of {new Date().toLocaleDateString()}. This is not a Loan Estimate. It is also not intended to be an indication of loan qualification or guaranteed interest rates.
        </Text>

        {/* Contact Info Section */}
        <View style={pdfStyles.contactSection}>
          <Text style={pdfStyles.contactText}>For additional financing options, call...</Text>
          <Text style={pdfStyles.contactName}>{config.company.loName}</Text>
          <Text style={pdfStyles.contactText}>{config.company.name}</Text>
          <Text style={pdfStyles.contactText}>{config.company.address}</Text>
          <Text style={pdfStyles.contactText}>{config.company.loPhone}</Text>
          <Text style={[pdfStyles.contactText, { marginTop: 10 }]}>{config.company.loEmail}</Text>
          <Text style={pdfStyles.contactText}>NMLS#{config.company.loNmlsId || config.company.nmlsId}</Text>
        </View>

        <PdfFooter config={config} />
      </Page>

      {/* Page 2: Detailed Breakdown */}
      <Page size="LETTER" style={pdfStyles.page}>
        {/* Border Frame */}
        <View style={pdfStyles.pageFrame} />

        <PdfHeader
          config={config}
          result={result}
          loanType={loanType}
        />

        {/* Loan Details Section (Image 2) */}
        <View style={[pdfStyles.section, { marginBottom: 15 }]}>
          <View style={pdfStyles.sectionHeaderRedBar}>
            <Text style={pdfStyles.sectionHeaderRedText}>Loan details</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Base Loan Amount</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(result.loanAmount)}</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>LTV (Loan to Value)</Text>
            <Text style={pdfStyles.tableCellValue}>{formatPercentSimple(result.ltv)}</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCellLabel}>Down Payment</Text>
            <Text style={pdfStyles.tableCellValue}>{formatCurrency(result.downPayment)}</Text>
          </View>
        </View>

        <View style={[pdfStyles.section, { paddingHorizontal: 20 }]}>
          <Text style={pdfStyles.sectionTitleRed}>Detailed Fee Breakdown</Text>

          <View style={pdfStyles.twoColumn}>
            {/* Section A: Lender Fees */}
            <View style={pdfStyles.column}>
              <View style={pdfStyles.sectionHeaderBlueBar}>
                <Text style={pdfStyles.sectionHeaderBlueText}>Section A: Lender Fees</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Origination Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency((closingCosts.loanFee || 0) + (closingCosts.originationFee || 0))}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Admin Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.adminFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Processing Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.processingFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Underwriting Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.underwritingFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Appraisal Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.appraisalFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Credit Report Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.creditReportFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRowSubtotal}>
                <Text style={pdfStyles.subtotalLabel}>Subtotal Section A</Text>
                <Text style={pdfStyles.subtotalValue}>{formatCurrency(closingCosts.totalLenderFees)}</Text>
              </View>
            </View>

            {/* Section B: Third Party Fees */}
            <View style={pdfStyles.column}>
              <View style={pdfStyles.sectionHeaderBlueBar}>
                <Text style={pdfStyles.sectionHeaderBlueText}>Section B: Third Party Fees</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Title Insurance</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency((closingCosts.ownerTitlePolicy || 0) + (closingCosts.lenderTitlePolicy || 0))}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Escrow Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.escrowFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Notary Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.notaryFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Recording Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.recordingFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Courier Fee</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.courierFee || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRowSubtotal}>
                <Text style={pdfStyles.subtotalLabel}>Subtotal Section B</Text>
                <Text style={pdfStyles.subtotalValue}>{formatCurrency(closingCosts.totalThirdPartyFees)}</Text>
              </View>
            </View>
          </View>

          <View style={[pdfStyles.twoColumn, { marginTop: 20 }]}>
            {/* Section C: Prepaids & Reserves */}
            <View style={pdfStyles.column}>
              <View style={pdfStyles.sectionHeaderBlueBar}>
                <Text style={pdfStyles.sectionHeaderBlueText}>Section C: Prepaids & Reserves</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Prepaid Interest</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.prepaidInterest || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Tax Reserves</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.taxReserves || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCellLabel}>Insurance Reserves</Text>
                <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.insuranceReserves || 0)}</Text>
              </View>
              <View style={pdfStyles.tableRowSubtotal}>
                <Text style={pdfStyles.subtotalLabel}>Subtotal Section C</Text>
                <Text style={pdfStyles.subtotalValue}>{formatCurrency(closingCosts.totalPrepaids)}</Text>
              </View>
            </View>

            {/* Section D: Credits (Box) */}
            <View style={pdfStyles.column}>
              {closingCosts.totalCredits > 0 ? (
                <>
                  <View style={pdfStyles.sectionHeaderBlueBar}>
                    <Text style={pdfStyles.sectionHeaderBlueText}>Section D: Credits</Text>
                  </View>
                  <View style={pdfStyles.tableRow}>
                    <Text style={pdfStyles.tableCellLabel}>Seller Credit</Text>
                    <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.sellerCredit || 0)}</Text>
                  </View>
                  <View style={pdfStyles.tableRow}>
                    <Text style={pdfStyles.tableCellLabel}>Lender Credit</Text>
                    <Text style={pdfStyles.tableCellValue}>{formatCurrency(closingCosts.lenderCredit || 0)}</Text>
                  </View>
                  <View style={pdfStyles.tableRowSubtotal}>
                    <Text style={pdfStyles.subtotalLabel}>Subtotal Section D</Text>
                    <Text style={pdfStyles.subtotalValue}>{formatCurrency(closingCosts.totalCredits)}</Text>
                  </View>
                </>
              ) : (
                <View style={[pdfStyles.creditBox, { marginTop: 25 }]}>
                  <Text style={pdfStyles.creditBoxText}>No credits applied to this estimate.</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <PdfFooter config={config} />
      </Page>
    </Document>
  );
}
