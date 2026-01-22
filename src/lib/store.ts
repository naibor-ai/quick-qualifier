/**
 * Zustand store for calculator state management.
 *
 * Manages:
 * - Global configuration (from GHL)
 * - Current calculator inputs
 * - Calculation results
 * - Selected partner agent
 * - UI state (loading, errors)
 */

import { create } from 'zustand';
import type {
  GhlConfig,
  LoanCalculationResult,
  PartnerAgent,
  CreditScoreTier,
  PmiType,
  VaUsage,
  LoanProgram,
} from './schemas';

// ============================================================================
// TYPES
// ============================================================================

export interface DtiResult {
  frontendRatio: number;
  backendRatio: number;
}

export interface DtiInputs {
  incomes: number[];
  payments: number[];
}

export type CalculatorType = 'conventional' | 'fha' | 'va' | 'conventionalRefi' | 'fhaRefi' | 'vaRefi';

interface ConventionalInputs {
  salesPrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  downPaymentMode: 'amount' | 'percent';
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaDuesMonthly: number;
  mortgageInsuranceMonthly?: number;
  floodInsuranceMonthly: number;
  creditScoreTier: CreditScoreTier;
  pmiType: PmiType;
  sellerCreditAmount: number;
  lenderCreditAmount: number;
  prepaidInterestDays: number;
  prepaidTaxMonths: number;
  prepaidInsuranceMonths: number;
  prepaidInterestAmount: number;
  prepaidTaxAmount: number;
  prepaidInsuranceAmount: number;
  loanFee: number;
  loanFeePercent: number;
  loanFeeMode: 'amount' | 'percent';
  closingCostsTotal: number;
  miscFee: number;
  depositAmount: number;
  processingFee?: number;
  underwritingFee?: number;
  docPrepFee?: number;
  appraisalFee?: number;
  creditReportFee?: number;
  floodCertFee?: number;
  taxServiceFee?: number;
  escrowFee?: number;
  notaryFee?: number;
  recordingFee?: number;
  ownerTitlePolicy?: number;
  lenderTitlePolicy?: number;
  pestInspectionFee?: number;
  propertyInspectionFee?: number;
  poolInspectionFee?: number;
  transferTax?: number;
  mortgageTax?: number;
}

interface FhaInputs {
  salesPrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  downPaymentMode: 'amount' | 'percent';
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaDuesMonthly: number;
  mortgageInsuranceMonthly?: number;
  floodInsuranceMonthly: number;
  is203k: boolean;
  prepaidInterestDays: number;
  prepaidTaxMonths: number;
  prepaidInsuranceMonths: number;
  prepaidInterestAmount: number;
  prepaidTaxAmount: number;
  prepaidInsuranceAmount: number;
  loanFee: number;
  loanFeePercent: number;
  loanFeeMode: 'amount' | 'percent';
  closingCostsTotal: number;
  miscFee: number;
  sellerCreditAmount: number;
  lenderCreditAmount: number;
  depositAmount: number;
  processingFee?: number;
  underwritingFee?: number;
  docPrepFee?: number;
  appraisalFee?: number;
  creditReportFee?: number;
  floodCertFee?: number;
  taxServiceFee?: number;
  escrowFee?: number;
  notaryFee?: number;
  recordingFee?: number;
  ownerTitlePolicy?: number;
  lenderTitlePolicy?: number;
  pestInspectionFee?: number;
  propertyInspectionFee?: number;
  poolInspectionFee?: number;
  transferTax?: number;
  mortgageTax?: number;
}

interface VaInputs {
  salesPrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  downPaymentMode: 'amount' | 'percent';
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  mortgageInsuranceMonthly?: number;
  hoaDuesMonthly: number;
  floodInsuranceMonthly: number;
  vaUsage: VaUsage;
  isDisabledVeteran: boolean;
  isReservist: boolean;
  prepaidInterestDays: number;
  prepaidTaxMonths: number;
  prepaidInsuranceMonths: number;
  prepaidInterestAmount: number;
  prepaidTaxAmount: number;
  prepaidInsuranceAmount: number;
  loanFee: number;
  loanFeePercent: number;
  loanFeeMode: 'amount' | 'percent';
  closingCostsTotal: number;
  miscFee: number;
  sellerCreditAmount: number;
  lenderCreditAmount: number;
  depositAmount: number;
  processingFee?: number;
  underwritingFee?: number;
  docPrepFee?: number;
  appraisalFee?: number;
  creditReportFee?: number;
  floodCertFee?: number;
  taxServiceFee?: number;
  escrowFee?: number;
  notaryFee?: number;
  recordingFee?: number;
  ownerTitlePolicy?: number;
  lenderTitlePolicy?: number;
  pestInspectionFee?: number;
  propertyInspectionFee?: number;
  poolInspectionFee?: number;
  transferTax?: number;
  mortgageTax?: number;
}

// Refinance Inputs
interface ConventionalRefiInputs {
  propertyValue: number;
  existingLoanBalance: number;
  newLoanAmount: number;
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaDuesMonthly: number;
  mortgageInsuranceMonthly?: number;
  creditScoreTier: CreditScoreTier;
  refinanceType: 'rate_term' | 'cash_out';
  prepaidInterestDays: number;
  prepaidTaxMonths: number;
  prepaidInsuranceMonths: number;
  prepaidInterestAmount: number;
  prepaidTaxAmount: number;
  prepaidInsuranceAmount: number;
  loanFee: number;
  loanFeePercent: number;
  loanFeeMode: 'amount' | 'percent';
  closingCostsTotal: number;
  miscFee: number;
  processingFee?: number;
  underwritingFee?: number;
  docPrepFee?: number;
  appraisalFee?: number;
  creditReportFee?: number;
  floodCertFee?: number;
  taxServiceFee?: number;
  escrowFee?: number;
  notaryFee?: number;
  recordingFee?: number;
  ownerTitlePolicy?: number;
  lenderTitlePolicy?: number;
  pestInspectionFee?: number;
  propertyInspectionFee?: number;
  poolInspectionFee?: number;
  transferTax?: number;
  mortgageTax?: number;
}

interface FhaRefiInputs {
  propertyValue: number;
  existingLoanBalance: number;
  newLoanAmount: number;
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaDuesMonthly: number;
  mortgageInsuranceMonthly?: number;
  isStreamline: boolean;
  prepaidInterestDays: number;
  prepaidTaxMonths: number;
  prepaidInsuranceMonths: number;
  prepaidInterestAmount: number;
  prepaidTaxAmount: number;
  prepaidInsuranceAmount: number;
  loanFee: number;
  loanFeePercent: number;
  loanFeeMode: 'amount' | 'percent';
  closingCostsTotal: number;
  miscFee: number;
  processingFee?: number;
  underwritingFee?: number;
  docPrepFee?: number;
  appraisalFee?: number;
  creditReportFee?: number;
  floodCertFee?: number;
  taxServiceFee?: number;
  escrowFee?: number;
  notaryFee?: number;
  recordingFee?: number;
  ownerTitlePolicy?: number;
  lenderTitlePolicy?: number;
  pestInspectionFee?: number;
  propertyInspectionFee?: number;
  poolInspectionFee?: number;
  transferTax?: number;
  mortgageTax?: number;
}

interface VaRefiInputs {
  propertyValue: number;
  existingLoanBalance: number;
  newLoanAmount: number;
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  mortgageInsuranceMonthly?: number;
  hoaDuesMonthly: number;
  isIrrrl: boolean;
  vaUsage: VaUsage;
  isDisabledVeteran: boolean;
  cashOutAmount: number;
  prepaidInterestDays: number;
  prepaidTaxMonths: number;
  prepaidInsuranceMonths: number;
  prepaidInterestAmount: number;
  prepaidTaxAmount: number;
  prepaidInsuranceAmount: number;
  loanFee: number;
  loanFeePercent: number;
  loanFeeMode: 'amount' | 'percent';
  closingCostsTotal: number;
  miscFee: number;
  processingFee?: number;
  underwritingFee?: number;
  docPrepFee?: number;
  appraisalFee?: number;
  creditReportFee?: number;
  floodCertFee?: number;
  taxServiceFee?: number;
  escrowFee?: number;
  notaryFee?: number;
  recordingFee?: number;
  ownerTitlePolicy?: number;
  lenderTitlePolicy?: number;
  pestInspectionFee?: number;
  propertyInspectionFee?: number;
  poolInspectionFee?: number;
  transferTax?: number;
  mortgageTax?: number;
}

interface SellerNetInputs {
  salesPrice: number;
  existingLoanPayoff: number;
  secondLienPayoff: number;
  commissionPercent: number;
  titleInsurance: number;
  escrowFee: number;
  transferTax: number;
  recordingFees: number;
  repairCredits: number;
  hoaPayoff: number;
  propertyTaxProration: number;
  otherCredits: number;
  otherDebits: number;
}

interface ComparisonScenarioInputs {
  name: string;
  program: LoanProgram;
  salesPrice: number;
  downPaymentPercent: number;
  interestRate: number;
  termYears: number;
}

interface CalculatorState {
  // Config
  config: GhlConfig | null;
  configLoading: boolean;
  configError: string | null;

  // Partner Agent
  selectedAgent: PartnerAgent | null;
  agents: PartnerAgent[];
  agentsLoading: boolean;

  // Calculator Inputs
  conventionalInputs: ConventionalInputs;
  fhaInputs: FhaInputs;
  vaInputs: VaInputs;
  sellerNetInputs: SellerNetInputs;
  comparisonScenarios: ComparisonScenarioInputs[];

  // Refinance Inputs
  conventionalRefiInputs: ConventionalRefiInputs;
  fhaRefiInputs: FhaRefiInputs;
  vaRefiInputs: VaRefiInputs;

  // Results
  conventionalResult: LoanCalculationResult | null;
  fhaResult: LoanCalculationResult | null;
  vaResult: LoanCalculationResult | null;
  conventionalRefiResult: LoanCalculationResult | null;
  fhaRefiResult: LoanCalculationResult | null;
  vaRefiResult: LoanCalculationResult | null;

  // DTI (Now dynamic per calculator)
  dtiInputs: Record<string, DtiInputs>;
  dtiResults: Record<string, DtiResult | null>;
  showDtiSections: Record<string, boolean>;
  // Deprecated single fields (retained for migration/compatibility if needed, but we'll try to move everything)
  dtiResult: DtiResult | null;
  showDtiSection: boolean;

  // Actions
  setConfig: (config: GhlConfig) => void;
  setConfigLoading: (loading: boolean) => void;
  setConfigError: (error: string | null) => void;

  setSelectedAgent: (agent: PartnerAgent | null) => void;
  setAgents: (agents: PartnerAgent[]) => void;
  setAgentsLoading: (loading: boolean) => void;

  updateConventionalInputs: (inputs: Partial<ConventionalInputs>) => void;
  updateFhaInputs: (inputs: Partial<FhaInputs>) => void;
  updateVaInputs: (inputs: Partial<VaInputs>) => void;
  updateSellerNetInputs: (inputs: Partial<SellerNetInputs>) => void;
  updateComparisonScenario: (index: number, inputs: Partial<ComparisonScenarioInputs>) => void;
  updateConventionalRefiInputs: (inputs: Partial<ConventionalRefiInputs>) => void;
  updateFhaRefiInputs: (inputs: Partial<FhaRefiInputs>) => void;
  updateVaRefiInputs: (inputs: Partial<VaRefiInputs>) => void;

  setConventionalResult: (result: LoanCalculationResult | null) => void;
  setFhaResult: (result: LoanCalculationResult | null) => void;
  setVaResult: (result: LoanCalculationResult | null) => void;
  setConventionalRefiResult: (result: LoanCalculationResult | null) => void;
  setFhaRefiResult: (result: LoanCalculationResult | null) => void;
  setVaRefiResult: (result: LoanCalculationResult | null) => void;

  updateDtiInputs: (inputs: Partial<DtiInputs>, type?: string) => void;
  setDtiResult: (result: DtiResult | null, type?: string) => void;
  setShowDtiSection: (show: boolean, type?: string) => void;

  resetCalculator: (type: 'conventional' | 'fha' | 'va' | 'sellerNet' | 'comparison' | 'conventionalRefi' | 'fhaRefi' | 'vaRefi') => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultConventionalInputs: ConventionalInputs = {
  salesPrice: 500000,
  downPaymentAmount: 100000,
  downPaymentPercent: 20,
  downPaymentMode: 'percent',
  interestRate: 7.0,
  termYears: 30,
  propertyTaxAnnual: 6000,
  homeInsuranceAnnual: 1800,
  hoaDuesMonthly: 0,
  mortgageInsuranceMonthly: 0,
  floodInsuranceMonthly: 0,
  creditScoreTier: '740',
  pmiType: 'monthly',
  sellerCreditAmount: 0,
  lenderCreditAmount: 0,
  prepaidInterestDays: 15,
  prepaidTaxMonths: 6,
  prepaidInsuranceMonths: 15,
  prepaidInterestAmount: 0,
  prepaidTaxAmount: 0,
  prepaidInsuranceAmount: 0,
  loanFee: 5000,
  loanFeePercent: 1.0,
  loanFeeMode: 'amount',
  closingCostsTotal: 0,
  miscFee: 0,
  depositAmount: 1000,
  processingFee: 995,
  underwritingFee: 1495,
  docPrepFee: 295,
  appraisalFee: 650,
  creditReportFee: 150,
  floodCertFee: 30,
  taxServiceFee: 85,
  escrowFee: 1115,
  notaryFee: 350,
  recordingFee: 275,
  ownerTitlePolicy: 1730,
  lenderTitlePolicy: 1225,
  pestInspectionFee: 150,
  propertyInspectionFee: 450,
  poolInspectionFee: 100,
  transferTax: 0,
  mortgageTax: 0,
};

const defaultFhaInputs: FhaInputs = {
  salesPrice: 400000,
  downPaymentAmount: 14000,
  downPaymentPercent: 3.5,
  downPaymentMode: 'percent',
  interestRate: 6.5,
  termYears: 30,
  propertyTaxAnnual: 5000,
  homeInsuranceAnnual: 1500,
  hoaDuesMonthly: 0,
  mortgageInsuranceMonthly: 0,
  floodInsuranceMonthly: 0,
  is203k: false,
  prepaidInterestDays: 15,
  prepaidTaxMonths: 6,
  prepaidInsuranceMonths: 15,
  prepaidInterestAmount: 0,
  prepaidTaxAmount: 0,
  prepaidInsuranceAmount: 0,
  loanFee: 4000,
  loanFeePercent: 1.0,
  loanFeeMode: 'amount',
  closingCostsTotal: 0,
  miscFee: 0,
  sellerCreditAmount: 0,
  lenderCreditAmount: 0,
  depositAmount: 0,
  processingFee: 995,
  underwritingFee: 1495,
  docPrepFee: 295,
  appraisalFee: 650,
  creditReportFee: 150,
  floodCertFee: 30,
  taxServiceFee: 85,
  escrowFee: 1115,
  notaryFee: 350,
  recordingFee: 275,
  ownerTitlePolicy: 1730,
  lenderTitlePolicy: 1515,
  pestInspectionFee: 150,
  propertyInspectionFee: 450,
  poolInspectionFee: 100,
  transferTax: 0,
  mortgageTax: 0,
};

const defaultVaInputs: VaInputs = {
  salesPrice: 450000,
  downPaymentAmount: 0,
  downPaymentPercent: 0,
  downPaymentMode: 'percent',
  interestRate: 6.5,
  termYears: 30,
  propertyTaxAnnual: 6250, // 520.83 * 12
  homeInsuranceAnnual: 1750, // 145.83 * 12
  mortgageInsuranceMonthly: 0,
  hoaDuesMonthly: 0,
  floodInsuranceMonthly: 0,
  vaUsage: 'first',
  isDisabledVeteran: false,
  isReservist: false,
  prepaidInterestDays: 15,
  prepaidTaxMonths: 6,
  prepaidInsuranceMonths: 15,
  prepaidInterestAmount: 0,
  prepaidTaxAmount: 0,
  prepaidInsuranceAmount: 0,
  loanFee: 4500,
  loanFeePercent: 1.0,
  loanFeeMode: 'amount',
  closingCostsTotal: 0,
  miscFee: 0,
  sellerCreditAmount: 0,
  lenderCreditAmount: 0,
  depositAmount: 0,
  processingFee: 995,
  underwritingFee: 1495,
  docPrepFee: 295,
  appraisalFee: 650,
  creditReportFee: 150,
  floodCertFee: 30,
  taxServiceFee: 85,
  escrowFee: 1115,
  notaryFee: 350,
  recordingFee: 275,
  ownerTitlePolicy: 1730,
  lenderTitlePolicy: 1515,
  pestInspectionFee: 150,
  propertyInspectionFee: 450,
  poolInspectionFee: 0,
  transferTax: 0,
  mortgageTax: 0,
};

const defaultSellerNetInputs: SellerNetInputs = {
  salesPrice: 500000,
  existingLoanPayoff: 300000,
  secondLienPayoff: 0,
  commissionPercent: 6,
  titleInsurance: 2000,
  escrowFee: 1500,
  transferTax: 1000,
  recordingFees: 150,
  repairCredits: 0,
  hoaPayoff: 0,
  propertyTaxProration: 0,
  otherCredits: 0,
  otherDebits: 0,
};

const defaultComparisonScenarios: ComparisonScenarioInputs[] = [
  {
    name: 'Conventional 20% Down',
    program: 'conventional',
    salesPrice: 500000,
    downPaymentPercent: 20,
    interestRate: 7.0,
    termYears: 30,
  },
  {
    name: 'FHA 3.5% Down',
    program: 'fha',
    salesPrice: 500000,
    downPaymentPercent: 3.5,
    interestRate: 6.5,
    termYears: 30,
  },
  {
    name: 'VA 0% Down',
    program: 'va',
    salesPrice: 500000,
    downPaymentPercent: 0,
    interestRate: 6.5,
    termYears: 30,
  },
];

const defaultConventionalRefiInputs: ConventionalRefiInputs = {
  propertyValue: 500000,
  existingLoanBalance: 350000,
  newLoanAmount: 350000,
  interestRate: 6.5,
  termYears: 30,
  propertyTaxAnnual: 0,
  homeInsuranceAnnual: 0,
  hoaDuesMonthly: 0,
  mortgageInsuranceMonthly: 0,
  creditScoreTier: '740',
  refinanceType: 'rate_term',
  prepaidInterestDays: 15,
  prepaidTaxMonths: 0,
  prepaidInsuranceMonths: 0,
  prepaidInterestAmount: 0,
  prepaidTaxAmount: 0,
  prepaidInsuranceAmount: 0,
  loanFee: 3500,
  loanFeePercent: 1.0,
  loanFeeMode: 'amount',
  closingCostsTotal: 0,
  miscFee: 0,
  processingFee: 895,
  underwritingFee: 995,
  docPrepFee: 595,
  appraisalFee: 650,
  creditReportFee: 150,
  floodCertFee: 30,
  taxServiceFee: 59,
  escrowFee: 400,
  notaryFee: 350,
  recordingFee: 275,
  lenderTitlePolicy: 1015,
  ownerTitlePolicy: 0,
  pestInspectionFee: 0,
  propertyInspectionFee: 0,
  poolInspectionFee: 0,
  transferTax: 0,
  mortgageTax: 0,
};

const defaultFhaRefiInputs: FhaRefiInputs = {
  propertyValue: 400000,
  existingLoanBalance: 300000,
  newLoanAmount: 300000,
  interestRate: 6.0,
  termYears: 30,
  propertyTaxAnnual: 5000,
  homeInsuranceAnnual: 1500,
  hoaDuesMonthly: 0,
  mortgageInsuranceMonthly: 0,
  isStreamline: false,
  prepaidInterestDays: 15,
  prepaidTaxMonths: 0,
  prepaidInsuranceMonths: 0,
  prepaidInterestAmount: 0,
  prepaidTaxAmount: 0,
  prepaidInsuranceAmount: 0,
  loanFee: 3000,
  loanFeePercent: 1.0,
  loanFeeMode: 'amount',
  closingCostsTotal: 0,
  miscFee: 0,
  processingFee: 895,
  underwritingFee: 995,
  docPrepFee: 595,
  appraisalFee: 650,
  creditReportFee: 150,
  floodCertFee: 30,
  taxServiceFee: 59,
  escrowFee: 400,
  notaryFee: 350,
  recordingFee: 275,
  lenderTitlePolicy: 1015,
  ownerTitlePolicy: 0,
  pestInspectionFee: 0,
  propertyInspectionFee: 0,
  poolInspectionFee: 0,
  transferTax: 0,
  mortgageTax: 0,
};

const defaultVaRefiInputs: VaRefiInputs = {
  propertyValue: 450000,
  existingLoanBalance: 320000,
  newLoanAmount: 320000,
  interestRate: 6.0,
  termYears: 30,
  propertyTaxAnnual: 5500,
  homeInsuranceAnnual: 1600,
  mortgageInsuranceMonthly: 0,
  hoaDuesMonthly: 0,
  isIrrrl: false,
  vaUsage: 'first',
  isDisabledVeteran: false,
  cashOutAmount: 0,
  prepaidInterestDays: 15,
  prepaidTaxMonths: 0,
  prepaidInsuranceMonths: 0,
  prepaidInterestAmount: 0,
  prepaidTaxAmount: 0,
  prepaidInsuranceAmount: 0,
  loanFee: 3200,
  loanFeePercent: 1.0,
  loanFeeMode: 'amount',
  closingCostsTotal: 0,
  miscFee: 0,
  processingFee: 895,
  underwritingFee: 995,
  docPrepFee: 595,
  appraisalFee: 650,
  creditReportFee: 150,
  floodCertFee: 30,
  taxServiceFee: 59,
  escrowFee: 400,
  notaryFee: 350,
  recordingFee: 275,
  lenderTitlePolicy: 1115,
  ownerTitlePolicy: 0,
  pestInspectionFee: 0,
  propertyInspectionFee: 0,
  poolInspectionFee: 0,
  transferTax: 0,
  mortgageTax: 0,
};

const defaultDtiInputs: DtiInputs = {
  incomes: [0, 0, 0, 0, 0, 0],
  payments: [0, 0, 0, 0, 0, 0],
};

const initialDtiInputs: Record<string, DtiInputs> = {
  conventional: defaultDtiInputs,
  fha: defaultDtiInputs,
  va: defaultDtiInputs,
  conventionalRefi: defaultDtiInputs,
  fhaRefi: defaultDtiInputs,
  vaRefi: defaultDtiInputs,
};

const initialDtiResults: Record<string, DtiResult | null> = {
  conventional: null,
  fha: null,
  va: null,
  conventionalRefi: null,
  fhaRefi: null,
  vaRefi: null,
};

const initialShowDtiSections: Record<string, boolean> = {
  conventional: false,
  fha: false,
  va: false,
  conventionalRefi: false,
  fhaRefi: false,
  vaRefi: false,
};

// ============================================================================
// STORE
// ============================================================================

export const useCalculatorStore = create<CalculatorState>()(
    (set) => ({
      // Config
      config: null,
      configLoading: false,
      configError: null,

      // Partner Agent
      selectedAgent: null,
      agents: [],
      agentsLoading: false,

      // Calculator Inputs
      conventionalInputs: defaultConventionalInputs,
      fhaInputs: defaultFhaInputs,
      vaInputs: defaultVaInputs,
      sellerNetInputs: defaultSellerNetInputs,
      comparisonScenarios: defaultComparisonScenarios,

      // Refinance Inputs
      conventionalRefiInputs: defaultConventionalRefiInputs,
      fhaRefiInputs: defaultFhaRefiInputs,
      vaRefiInputs: defaultVaRefiInputs,

      // Results
      conventionalResult: null,
      fhaResult: null,
      vaResult: null,
      conventionalRefiResult: null,
      fhaRefiResult: null,
      vaRefiResult: null,

      // DTI
      dtiInputs: initialDtiInputs,
      dtiResults: initialDtiResults,
      showDtiSections: initialShowDtiSections,
      dtiResult: null, // Legacy
      showDtiSection: false, // Legacy

      // Actions
      setConfig: (config) => set({ config, configError: null }),
      setConfigLoading: (configLoading) => set({ configLoading }),
      setConfigError: (configError) => set({ configError }),

      setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
      setAgents: (agents) => set({ agents }),
      setAgentsLoading: (agentsLoading) => set({ agentsLoading }),

      updateConventionalInputs: (inputs) =>
        set((state) => ({
          conventionalInputs: { ...state.conventionalInputs, ...inputs },
        })),

      updateFhaInputs: (inputs) =>
        set((state) => ({
          fhaInputs: { ...state.fhaInputs, ...inputs },
        })),

      updateVaInputs: (inputs) =>
        set((state) => ({
          vaInputs: { ...state.vaInputs, ...inputs },
        })),

      updateSellerNetInputs: (inputs) =>
        set((state) => ({
          sellerNetInputs: { ...state.sellerNetInputs, ...inputs },
        })),

      updateComparisonScenario: (index, inputs) =>
        set((state) => {
          const scenarios = [...state.comparisonScenarios];
          if (scenarios[index]) {
            scenarios[index] = { ...scenarios[index], ...inputs };
          }
          return { comparisonScenarios: scenarios };
        }),

      updateConventionalRefiInputs: (inputs) =>
        set((state) => ({
          conventionalRefiInputs: { ...state.conventionalRefiInputs, ...inputs },
        })),

      updateFhaRefiInputs: (inputs) =>
        set((state) => ({
          fhaRefiInputs: { ...state.fhaRefiInputs, ...inputs },
        })),

      updateVaRefiInputs: (inputs) =>
        set((state) => ({
          vaRefiInputs: { ...state.vaRefiInputs, ...inputs },
        })),

      setConventionalResult: (conventionalResult) => set({ conventionalResult }),
      setFhaResult: (fhaResult) => set({ fhaResult }),
      setVaResult: (vaResult) => set({ vaResult }),
      setConventionalRefiResult: (conventionalRefiResult) => set({ conventionalRefiResult }),
      setFhaRefiResult: (fhaRefiResult) => set({ fhaRefiResult }),
      setVaRefiResult: (vaRefiResult) => set({ vaRefiResult }),

      updateDtiInputs: (inputs, type) =>
        set((state) => {
          if (!type) {
            // Legacy fallback if no type provided
            return { dtiInputs: { ...state.dtiInputs, default: { ...state.dtiInputs.default, ...inputs } } };
          }
          return {
            dtiInputs: {
              ...state.dtiInputs,
              [type]: { ...(state.dtiInputs[type] || defaultDtiInputs), ...inputs },
            },
          };
        }),
      setDtiResult: (dtiResult, type) =>
        set((state) => {
          if (!type) return { dtiResult }; // Legacy
          return {
            dtiResults: {
              ...state.dtiResults,
              [type]: dtiResult,
            },
            dtiResult, // Keep sync for now for layout usage
          };
        }),
      setShowDtiSection: (show, type) =>
        set((state) => {
          if (!type) return { showDtiSection: show }; // Legacy
          return {
            showDtiSections: {
              ...state.showDtiSections,
              [type]: show,
            },
            showDtiSection: show, // Keep sync for now
          };
        }),

      resetCalculator: (type) => {
        switch (type) {
          case 'conventional':
            set((state) => ({
              conventionalInputs: defaultConventionalInputs,
              conventionalResult: null,
              dtiInputs: { ...state.dtiInputs, conventional: defaultDtiInputs },
              dtiResults: { ...state.dtiResults, conventional: null },
              showDtiSections: { ...state.showDtiSections, conventional: false },
            }));
            break;
          case 'fha':
            set((state) => ({
              fhaInputs: defaultFhaInputs,
              fhaResult: null,
              dtiInputs: { ...state.dtiInputs, fha: defaultDtiInputs },
              dtiResults: { ...state.dtiResults, fha: null },
              showDtiSections: { ...state.showDtiSections, fha: false },
            }));
            break;
          case 'va':
            set((state) => ({
              vaInputs: defaultVaInputs,
              vaResult: null,
              dtiInputs: { ...state.dtiInputs, va: defaultDtiInputs },
              dtiResults: { ...state.dtiResults, va: null },
              showDtiSections: { ...state.showDtiSections, va: false },
            }));
            break;
          case 'sellerNet':
            set({ sellerNetInputs: defaultSellerNetInputs });
            break;
          case 'comparison':
            set({ comparisonScenarios: defaultComparisonScenarios });
            break;
          case 'conventionalRefi':
            set((state) => ({
              conventionalRefiInputs: defaultConventionalRefiInputs,
              conventionalRefiResult: null,
              dtiInputs: { ...state.dtiInputs, conventionalRefi: defaultDtiInputs },
              dtiResults: { ...state.dtiResults, conventionalRefi: null },
              showDtiSections: { ...state.showDtiSections, conventionalRefi: false },
            }));
            break;
          case 'fhaRefi':
            set((state) => ({
              fhaRefiInputs: defaultFhaRefiInputs,
              fhaRefiResult: null,
              dtiInputs: { ...state.dtiInputs, fhaRefi: defaultDtiInputs },
              dtiResults: { ...state.dtiResults, fhaRefi: null },
              showDtiSections: { ...state.showDtiSections, fhaRefi: false },
            }));
            break;
          case 'vaRefi':
            set((state) => ({
              vaRefiInputs: defaultVaRefiInputs,
              vaRefiResult: null,
              dtiInputs: { ...state.dtiInputs, vaRefi: defaultDtiInputs },
              dtiResults: { ...state.dtiResults, vaRefi: null },
              showDtiSections: { ...state.showDtiSections, vaRefi: false },
            }));
            break;
        }
      },
    })
);

// ============================================================================
// HOOKS
// ============================================================================

import { useCallback, useRef } from 'react';

/**
 * Hook to fetch and load config on mount.
 */
export function useLoadConfig() {
  const loadingRef = useRef(false);

  const loadConfig = useCallback(async () => {
    const state = useCalculatorStore.getState();

    // Already loaded or currently loading
    if (state.config || state.configLoading || loadingRef.current) return;

    loadingRef.current = true;
    state.setConfigLoading(true);
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const data = await response.json();
      useCalculatorStore.getState().setConfig(data);
    } catch (error) {
      useCalculatorStore.getState().setConfigError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      useCalculatorStore.getState().setConfigLoading(false);
      loadingRef.current = false;
    }
  }, []);

  return { loadConfig };
}

/**
 * Hook to fetch partner agents.
 */
export function useLoadAgents() {
  const loadingRef = useRef(false);

  const loadAgents = useCallback(async () => {
    const state = useCalculatorStore.getState();

    // Already loaded or currently loading
    if (state.agents.length > 0 || state.agentsLoading || loadingRef.current) return;

    loadingRef.current = true;
    state.setAgentsLoading(true);
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        // Log warning but don't crash - agents are optional
        console.warn('Failed to fetch agents, status:', response.status);
        useCalculatorStore.getState().setAgents([]);
        return;
      }
      const data = await response.json();
      useCalculatorStore.getState().setAgents(data.agents || []);
    } catch (error) {
      // Log warning but don't throw to avoid UI blocking
      console.warn('Error loading agents (optional):', error);
      useCalculatorStore.getState().setAgents([]);
    } finally {
      useCalculatorStore.getState().setAgentsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  return { loadAgents };
}
