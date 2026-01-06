import { StyleSheet } from '@react-pdf/renderer';

/**
 * Shared styles for PDF documents.
 */
export const pdfStyles = StyleSheet.create({
  // Page layout
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },

  // Header section
  header: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    borderBottomStyle: 'solid',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#64748B',
    lineHeight: 1.4,
  },
  loanOfficerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  loName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  loContact: {
    fontSize: 9,
    color: '#64748B',
  },

  // Section styles
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
    marginTop: 15,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#BFDBFE',
    borderBottomStyle: 'solid',
  },
  sectionTitleBlue: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    padding: '6 12',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Table styles
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderBottomStyle: 'solid',
    paddingVertical: 4,
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableRowTotal: {
    borderTopWidth: 2,
    borderTopColor: '#CBD5E1',
    borderTopStyle: 'solid',
    backgroundColor: '#F1F5F9',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 8.5,
    color: '#475569',
  },
  tableCellLabel: {
    flex: 2,
    fontWeight: 'normal',
  },
  tableCellValue: {
    flex: 1,
    textAlign: 'right',
    color: '#1E293B',
    fontWeight: 'medium',
    fontSize: 8.5,
  },
  tableCellBold: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#1E3A8A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  accentCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },

  // Summary box
  summaryBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'solid',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  summaryValueLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },

  // Cash to Close highlight styles - matching reference image with blue-600 theme
  cashToCloseBox: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#2563EB', // Updated to blue-600 for consistency
  },
  cashToCloseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE', // Updated to match blue-600 theme
    borderBottomStyle: 'solid',
  },
  cashToCloseRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0,
  },
  cashToCloseLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 'normal',
  },
  cashToCloseValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 'medium',
  },
  cashToCloseHighlightLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  cashToCloseHighlightValue: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  paymentMainValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    marginVertical: 4,
  },
  paymentSubLabel: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
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
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 2,
  },
  disclaimer: {
    fontSize: 7,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
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
