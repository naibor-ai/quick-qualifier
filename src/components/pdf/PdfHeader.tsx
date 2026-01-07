import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import type { LoanCalculationResult, GhlConfig } from '@/lib/schemas';
import { formatCurrency, formatPercentSimple } from '@/lib/formatters';

interface PdfHeaderProps {
  config: GhlConfig;
  result: LoanCalculationResult;
  loanType?: string;
}

/**
 * PDF Header component with Viewpoint branding and dynamic loan summary.
 */
export function PdfHeader({ config, result, loanType }: PdfHeaderProps) {
  const { loanAmount, interestRate, apr, term } = result;

  return (
    <View style={pdfStyles.header}>
      {/* Top Disclaimer */}
      <Text style={pdfStyles.topDisclaimer}>
        Your actual rate, payment, and costs could be higher. Get an official Loan Estimate before choosing a loan.
      </Text>

      {/* Main Header with Logo */}
      <View style={pdfStyles.headerMain}>
        <Image
          src="/Viewpoint-Lending-Logo.png"
          style={pdfStyles.logo}
        />
      </View>

      {/* Centered Titles */}
      <View style={pdfStyles.titleContainer}>
        <Text style={pdfStyles.mainTitle}>{loanType || 'Loan'} Financing</Text>
        <Text style={pdfStyles.subTitle}>
          Sales Price {formatCurrency(result.propertyValue)}, Loan Amount {formatCurrency(loanAmount)},
          Interest Rate {formatPercentSimple(interestRate)} (APR {formatPercentSimple(apr)}), {term} Years
        </Text>
      </View>
    </View>
  );
}
