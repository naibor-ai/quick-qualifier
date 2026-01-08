import { StyleSheet, Font } from '@react-pdf/renderer';

// Register Poppins font (Using TTF from CDN to avoid format issues with WOFF2)
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf', fontWeight: 400 }, // Regular
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf', fontWeight: 700 }, // Bold
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-italic.ttf', fontStyle: 'italic' }, // Italic
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-italic.ttf', fontWeight: 700, fontStyle: 'italic' }, // Bold Italic
  ],
});

const NAIBOR_BLUE = '#2a8bb3';
const NAIBOR_BLUE_LIGHT = '#eef7fa'; // Lighter version for backgrounds
const NAIBOR_BLUE_BORDER = '#bde0eb'; // Light version for borders
const RED_ACCENT = '#A50000';
const RED_BG = '#FFF1F2';
const RED_BORDER = '#FEE2E2';

/**
 * Shared styles for PDF documents.
 */
export const pdfStyles = StyleSheet.create({
  // Page layout
  page: {
    padding: '20 40',
    fontFamily: 'Poppins',
    fontSize: 10,
    color: '#334155', // slate-700 for better readability
  },

  // Flier border/frame
  pageFrame: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 1.5,
    borderColor: NAIBOR_BLUE,
    borderStyle: 'solid',
    opacity: 0.8,
  },

  // Header section
  header: {
    marginBottom: 10,
    paddingBottom: 5,
    position: 'relative',
  },
  topDisclaimer: {
    fontSize: 9,
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 15, // Reduced from 25
    marginTop: 0,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 11,
    color: RED_ACCENT,
    fontStyle: 'italic',
  },
  sectionTitleBlue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: NAIBOR_BLUE_BORDER,
    paddingBottom: 4,
  },
  sectionTitleRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: RED_ACCENT,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: RED_BORDER,
    paddingBottom: 4,
  },

  // Section styles
  section: {
    marginBottom: 15, // Reduced from 20
    paddingHorizontal: 40,
  },
  sectionHeaderRed: {
    fontSize: 12,
    fontWeight: 'bold',
    color: RED_ACCENT,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderBlueBar: {
    backgroundColor: NAIBOR_BLUE_LIGHT,
    padding: '4 8',
    borderRadius: 6,
    marginBottom: 6,
  },
  sectionHeaderBlueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
  },
  sectionHeaderRedBar: {
    backgroundColor: RED_BG,
    padding: '4 8',
    borderRadius: 6,
    marginBottom: 6,
  },
  sectionHeaderRedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: RED_ACCENT,
  },

  // Table styles
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4, // Reduced from 5
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  tableCellLabel: {
    fontSize: 10,
    color: '#334155',
    fontWeight: 500, // Medium
  },
  tableCellValue: {
    fontSize: 10,
    color: '#0F172A',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableRowSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  subtotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
  },
  subtotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
    textAlign: 'right',
  },

  // Totals
  totalContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: NAIBOR_BLUE_BORDER,
  },
  totalText: {
    fontSize: 14,
    color: NAIBOR_BLUE,
    fontWeight: 'bold',
  },
  creditBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
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
    padding: 10,
    marginBottom: 15,
  },

  // Detailed Disclaimers
  detailedDisclaimer: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.4,
    marginTop: 10, // Reduced from 20
    paddingHorizontal: 40,
    textAlign: 'justify',
  },

  // Contact Section
  contactSection: {
    marginTop: 15, // Reduced from 25
    paddingHorizontal: 40,
    alignItems: 'flex-start',
    gap: 2,
  },
  contactName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 10,
    color: '#334155',
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
    bottom: 20, // Adjusted
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  footerLogoLeft: {
    width: 70,
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
    color: '#64748B',
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 7,
    color: '#94A3B8',
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
    color: NAIBOR_BLUE,
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
    padding: 12,
    backgroundColor: NAIBOR_BLUE_LIGHT,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: NAIBOR_BLUE_BORDER,
  },
  agentInfo: {
    flex: 1,
  },
  agentLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: NAIBOR_BLUE,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  agentName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  agentContact: {
    fontSize: 10,
    color: '#475569',
  },
});

export default pdfStyles;
