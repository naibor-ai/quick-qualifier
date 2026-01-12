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
 * Matches the reference flier design.
 */
export function FlierLayout({
  result,
  config,
  agent,
  loanType = 'Loan',
  propertyAddress,
}: FlierLayoutProps) {
  const { monthlyPayment, closingCosts, cashToClose } = result;

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

          {closingCosts.sellerCredit > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCellLabel}>Seller credit</Text>
              <Text style={pdfStyles.tableCellValue}>-{formatCurrency(closingCosts.sellerCredit)}</Text>
            </View>
          )}

          {closingCosts.lenderCredit > 0 && (
            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCellLabel}>Lender credit</Text>
              <Text style={pdfStyles.tableCellValue}>-{formatCurrency(closingCosts.lenderCredit)}</Text>
            </View>
          )}

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
    </Document>
  );
}
