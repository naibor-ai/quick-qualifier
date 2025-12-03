import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import type { GhlConfig, PartnerAgent } from '@/lib/schemas';

interface PdfHeaderProps {
  config: GhlConfig;
  agent?: PartnerAgent | null;
  title?: string;
}

/**
 * PDF Header component with LO branding and optional agent co-branding.
 */
export function PdfHeader({ config, agent, title }: PdfHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <View style={pdfStyles.headerRow}>
        {/* Company/LO Info */}
        <View style={pdfStyles.companyInfo}>
          <Text style={pdfStyles.companyName}>{config.company.name}</Text>
          <Text style={pdfStyles.companyDetails}>NMLS# {config.company.nmlsId}</Text>
          <Text style={pdfStyles.companyDetails}>{config.company.address}</Text>
        </View>

        {/* Loan Officer Info */}
        <View style={pdfStyles.loanOfficerInfo}>
          <Text style={pdfStyles.loName}>{config.company.loName}</Text>
          <Text style={pdfStyles.loContact}>{config.company.loEmail}</Text>
          <Text style={pdfStyles.loContact}>{config.company.loPhone}</Text>
        </View>
      </View>

      {/* Title if provided */}
      {title && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1E293B' }}>{title}</Text>
        </View>
      )}

      {/* Agent co-branding if present */}
      {agent && (
        <View style={pdfStyles.agentSection}>
          <View style={pdfStyles.agentInfo}>
            <Text style={pdfStyles.agentLabel}>Partner Agent</Text>
            <Text style={pdfStyles.agentName}>{agent.name}</Text>
            {agent.company && <Text style={pdfStyles.agentContact}>{agent.company}</Text>}
          </View>
          <View style={pdfStyles.agentInfo}>
            <Text style={pdfStyles.agentLabel}>Contact</Text>
            {agent.email && <Text style={pdfStyles.agentContact}>{agent.email}</Text>}
            {agent.phone && <Text style={pdfStyles.agentContact}>{agent.phone}</Text>}
          </View>
        </View>
      )}
    </View>
  );
}
