import { StyleSheet } from '@react-pdf/renderer';

/**
 * Shared styles for PDF documents.
 */
export const pdfStyles = StyleSheet.create({
  // Page layout
  page: {
    padding: '30 40',
  },

  // Flier border/frame
  pageFrame: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1,
    borderColor: '#0066CC',
    borderStyle: 'solid',
  },

  // Header section
  header: {
    marginBottom: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  topDisclaimer: {
    fontSize: 10,
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 'auto',
  },

  // Titles
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 11,
    color: '#A50000',
    fontStyle: 'italic',
  },
  sectionTitleBlue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    paddingBottom: 4,
  },
  sectionTitleRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A50000',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    paddingBottom: 4,
  },

  // Section styles
  section: {
    marginBottom: 20,
    paddingHorizontal: 60,
  },
  sectionHeaderRed: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A50000',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  sectionHeaderBlueBar: {
    backgroundColor: '#EFF6FF',
    padding: '4 8',
    borderRadius: 4,
    marginBottom: 8,
  },
  sectionHeaderBlueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  sectionHeaderRedBar: {
    backgroundColor: '#FFF1F2',
    padding: '4 8',
    borderRadius: 4,
    marginBottom: 8,
  },
  sectionHeaderRedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#A50000',
  },

  // Table styles
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  tableCellLabel: {
    fontSize: 11,
    color: '#000',
  },
  tableCellValue: {
    fontSize: 11,
    color: '#000',
    textAlign: 'right',
  },
  tableRowSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  subtotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  subtotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0066CC',
    textAlign: 'right',
  },

  // Totals
  totalContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  totalText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  creditBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditBoxText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  loanDetailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  // Detailed Disclaimers
  detailedDisclaimer: {
    fontSize: 8.5,
    color: '#000',
    lineHeight: 1.3,
    marginTop: 10,
    paddingHorizontal: 20,
  },

  // Contact Section
  contactSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 4,
  },
  contactName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  contactText: {
    fontSize: 10,
    color: '#000',
  },

  // Two-column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLogoLeft: {
    width: 60,
    height: 'auto',
  },
  footerLogoRight: {
    width: 25,
    height: 'auto',
  },
  footerContent: {
    flex: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#000',
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 7.5,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },

  // Text utilities
  textSmall: {
    fontSize: 9,
  },
  textMedium: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 12,
  },
  textXLarge: {
    fontSize: 16,
  },
  textBold: {
    fontWeight: 'bold',
  },
  textMuted: {
    color: '#64748B',
  },
  textPrimary: {
    color: '#1E40AF',
  },
  textSuccess: {
    color: '#059669',
  },

  // Spacing utilities
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },

  // Agent co-branding
  agentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    marginTop: 15,
  },
  agentInfo: {
    flex: 1,
  },
  agentLabel: {
    fontSize: 8,
    color: '#94A3B8',
    marginBottom: 2,
  },
  agentName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  agentContact: {
    fontSize: 9,
    color: '#64748B',
  },
});

export default pdfStyles;
