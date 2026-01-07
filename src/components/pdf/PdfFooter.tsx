import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import type { GhlConfig } from '@/lib/schemas';

interface PdfFooterProps {
  config: GhlConfig;
}

/**
 * PDF Footer component with disclaimers and company info.
 * Matches the reference flier footer layout.
 */
export function PdfFooter({ config }: PdfFooterProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={pdfStyles.footer}>
      <View style={pdfStyles.footerContent}>
        <Text style={pdfStyles.footerText}>
          {config.company.name} | NMLS# {config.company.nmlsId} | {currentDate}
        </Text>
        <Text style={pdfStyles.disclaimer}>
          This is an estimate only and is not an offer to lend. Actual rates, fees, and terms may vary based on
          creditworthiness, property type, and other factors. All information is subject to change without notice.
        </Text>
        <Text style={pdfStyles.disclaimer}>
          Equal Housing Lender. © {new Date().getFullYear()} {config.company.name}. All rights reserved.
        </Text>
      </View>
    </View>
  );
}
