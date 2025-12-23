import { z } from 'zod';

// ============================================================================
// CREDIT SCORE TIERS
// ============================================================================
export const CreditScoreTier = z.enum([
  '760',
  '740',
  '720',
  '700',
  '680',
  '660',
  '640',
  '620',
]);
export type CreditScoreTier = z.infer<typeof CreditScoreTier>;

// ============================================================================
// LTV TIERS (for MI lookup)
// ============================================================================
export const LtvTier = z.enum(['97', '95', '90', '85']);
export type LtvTier = z.infer<typeof LtvTier>;

// ============================================================================
// LOAN PROGRAMS
// ============================================================================
export const LoanProgram = z.enum([
  'conventional',
  'fha',
  'va',
  'usda',
]);
export type LoanProgram = z.infer<typeof LoanProgram>;

export const LoanPurpose = z.enum(['purchase', 'refinance']);
export type LoanPurpose = z.infer<typeof LoanPurpose>;

export const RefinanceType = z.enum(['rate_term', 'cash_out', 'streamline']);
export type RefinanceType = z.infer<typeof RefinanceType>;

export const PmiType = z.enum(['monthly', 'single_financed', 'single_cash', 'split']);
export type PmiType = z.infer<typeof PmiType>;

export const VaUsage = z.enum(['first', 'subsequent']);
export type VaUsage = z.infer<typeof VaUsage>;

// ============================================================================
// BASE INPUT SCHEMAS
// ============================================================================

// Common inputs shared by all purchase calculators
export const BasePurchaseInputSchema = z.object({
  salesPrice: z.number().min(0, 'Sales price must be positive'),
  downPaymentAmount: z.number().min(0).optional(),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  interestRate: z.number().min(0).max(20, 'Interest rate seems too high'),
  termYears: z.number().int().min(1).max(40).default(30),
  propertyTaxMonthly: z.number().min(0).default(0),
  homeInsuranceMonthly: z.number().min(0).default(0),
  hoaDuesMonthly: z.number().min(0).default(0),
  mortgageInsuranceMonthly: z.number().min(0).optional(),
  floodInsuranceMonthly: z.number().min(0).default(0),
  prepaidInterestDays: z.number().int().min(0).max(365).default(15),
  prepaidTaxMonths: z.number().int().min(0).max(60).default(6),
  prepaidInsuranceMonths: z.number().int().min(0).max(60).default(15),
  prepaidInterestAmount: z.number().min(0).optional(),
  prepaidTaxAmount: z.number().min(0).optional(),
  prepaidInsuranceAmount: z.number().min(0).optional(),
  loanFee: z.number().min(0).default(0),
  sellerCreditAmount: z.number().min(0).default(0),
  lenderCreditAmount: z.number().min(0).default(0),
  depositAmount: z.number().min(0).default(0),
});
export type BasePurchaseInput = z.infer<typeof BasePurchaseInputSchema>;

// Conventional Purchase specific
export const ConventionalPurchaseInputSchema = BasePurchaseInputSchema.extend({
  creditScoreTier: CreditScoreTier,
  pmiType: PmiType.default('monthly'),
  sellerCreditPercent: z.number().min(0).max(100).optional(),
  depositAmount: z.number().min(0).default(0),
});
export type ConventionalPurchaseInput = z.infer<typeof ConventionalPurchaseInputSchema>;

// FHA Purchase specific
export const FhaPurchaseInputSchema = BasePurchaseInputSchema.extend({
  is203k: z.boolean().default(false),
});
export type FhaPurchaseInput = z.infer<typeof FhaPurchaseInputSchema>;

// VA Purchase specific
export const VaPurchaseInputSchema = BasePurchaseInputSchema.extend({
  vaUsage: VaUsage.default('first'),
  isDisabledVeteran: z.boolean().default(false),
  isReservist: z.boolean().default(false),
});
export type VaPurchaseInput = z.infer<typeof VaPurchaseInputSchema>;

// ============================================================================
// REFINANCE INPUT SCHEMAS
// ============================================================================

export const BaseRefinanceInputSchema = z.object({
  propertyValue: z.number().min(0),
  existingLoanBalance: z.number().min(0),
  newLoanAmount: z.number().min(0),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().int().min(1).max(40).default(30),
  currentInterestRate: z.number().min(0).max(20).optional(),
  currentMonthlyPayment: z.number().min(0).optional(),
  propertyTaxMonthly: z.number().min(0).default(0),
  homeInsuranceMonthly: z.number().min(0).default(0),
  hoaDuesMonthly: z.number().min(0).default(0),
  mortgageInsuranceMonthly: z.number().min(0).optional().default(0),
  payoffDays: z.number().int().min(0).max(60).default(30),
  prepaidInterestDays: z.number().int().min(0).max(365).default(15),
  prepaidTaxMonths: z.number().int().min(0).max(60).default(0),
  prepaidInsuranceMonths: z.number().int().min(0).max(60).default(0),
  prepaidInterestAmount: z.number().min(0).optional(),
  prepaidTaxAmount: z.number().min(0).optional(),
  prepaidInsuranceAmount: z.number().min(0).optional(),
  loanFee: z.number().min(0).default(0),
});
export type BaseRefinanceInput = z.infer<typeof BaseRefinanceInputSchema>;

export const ConventionalRefinanceInputSchema = BaseRefinanceInputSchema.extend({
  refinanceType: RefinanceType,
  creditScoreTier: CreditScoreTier,
  cashOutAmount: z.number().min(0).default(0),
});
export type ConventionalRefinanceInput = z.infer<typeof ConventionalRefinanceInputSchema>;

export const FhaRefinanceInputSchema = BaseRefinanceInputSchema.extend({
  isStreamline: z.boolean().default(false),
  existingFhaLoanDate: z.string().optional(), // For MIP refund calculation
});
export type FhaRefinanceInput = z.infer<typeof FhaRefinanceInputSchema>;

export const VaRefinanceInputSchema = BaseRefinanceInputSchema.extend({
  isIrrrl: z.boolean().default(false),
  vaUsage: VaUsage.default('first'),
  isDisabledVeteran: z.boolean().default(false),
  cashOutAmount: z.number().min(0).default(0),
});
export type VaRefinanceInput = z.infer<typeof VaRefinanceInputSchema>;

// ============================================================================
// SELLER NET SHEET SCHEMA
// ============================================================================

export const SellerNetInputSchema = z.object({
  salesPrice: z.number().min(0),
  existingLoanPayoff: z.number().min(0).default(0),
  secondLienPayoff: z.number().min(0).default(0),
  closingDate: z.string().optional(),
  commissionPercent: z.number().min(0).max(10).default(6),
  titleInsurance: z.number().min(0).default(0),
  escrowFee: z.number().min(0).default(0),
  transferTax: z.number().min(0).default(0),
  recordingFees: z.number().min(0).default(0),
  repairCredits: z.number().min(0).default(0),
  hoaPayoff: z.number().min(0).default(0),
  propertyTaxProration: z.number().default(0), // Can be positive or negative
  otherCredits: z.number().default(0),
  otherDebits: z.number().min(0).default(0),
});
export type SellerNetInput = z.infer<typeof SellerNetInputSchema>;

// ============================================================================
// COMPARISON SCHEMA
// ============================================================================

export const ComparisonScenarioSchema = z.object({
  name: z.string().default('Scenario'),
  program: LoanProgram,
  salesPrice: z.number().min(0),
  downPaymentPercent: z.number().min(0).max(100),
  interestRate: z.number().min(0).max(20),
  termYears: z.number().int().min(1).max(40).default(30),
});
export type ComparisonScenario = z.infer<typeof ComparisonScenarioSchema>;

export const ComparisonInputSchema = z.object({
  scenarios: z.array(ComparisonScenarioSchema).min(2).max(3),
  propertyTaxMonthly: z.number().min(0).default(0),
  homeInsuranceMonthly: z.number().min(0).default(0),
  hoaDuesMonthly: z.number().min(0).default(0),
});
export type ComparisonInput = z.infer<typeof ComparisonInputSchema>;

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const MonthlyPaymentBreakdownSchema = z.object({
  principalAndInterest: z.number(),
  mortgageInsurance: z.number(),
  propertyTax: z.number(),
  homeInsurance: z.number(),
  hoaDues: z.number(),
  floodInsurance: z.number(),
  totalMonthly: z.number(),
});
export type MonthlyPaymentBreakdown = z.infer<typeof MonthlyPaymentBreakdownSchema>;

export const ClosingCostsBreakdownSchema = z.object({
  // Section A - Lender Fees
  originationFee: z.number(),
  adminFee: z.number(),
  processingFee: z.number(),
  underwritingFee: z.number(),
  appraisalFee: z.number(),
  creditReportFee: z.number(),
  floodCertFee: z.number(),
  taxServiceFee: z.number(),
  docPrepFee: z.number(),
  totalLenderFees: z.number(),

  // Section B - Third Party Fees
  ownerTitlePolicy: z.number(),
  lenderTitlePolicy: z.number(),
  escrowFee: z.number(),
  notaryFee: z.number(),
  recordingFee: z.number(),
  courierFee: z.number(),
  pestInspectionFee: z.number(),
  propertyInspectionFee: z.number(),
  poolInspectionFee: z.number(),
  totalThirdPartyFees: z.number(),

  // Section C - Prepaids
  prepaidInterest: z.number(),
  taxReserves: z.number(),
  insuranceReserves: z.number(),
  totalPrepaids: z.number(),

  // Section D - Credits
  sellerCredit: z.number(),
  lenderCredit: z.number(),
  totalCredits: z.number(),

  // Totals
  totalClosingCosts: z.number(),
  netClosingCosts: z.number(), // After credits

  // New fees added for Conventional Sale
  loanFee: z.number().optional(),
  transferTax: z.number().optional(),
  mortgageTax: z.number().optional(),

  // Inputs used for calculation (passed back for UI)
  prepaidInterestDays: z.number().optional(),
  prepaidTaxMonths: z.number().optional(),
  prepaidInsuranceMonths: z.number().optional(),
});
export type ClosingCostsBreakdown = z.infer<typeof ClosingCostsBreakdownSchema>;

export const LoanCalculationResultSchema = z.object({
  loanAmount: z.number(),
  totalLoanAmount: z.number(), // Includes financed fees (UFMIP, VA FF, etc.)
  ltv: z.number(),
  downPayment: z.number(),
  monthlyPayment: MonthlyPaymentBreakdownSchema,
  closingCosts: ClosingCostsBreakdownSchema,
  cashToClose: z.number(),
  // Program-specific fields
  pmiRate: z.number().optional(),
  ufmip: z.number().optional(), // FHA upfront MIP
  vaFundingFee: z.number().optional(),
});
export type LoanCalculationResult = z.infer<typeof LoanCalculationResultSchema>;

// ============================================================================
// GHL CONFIG SCHEMA (for sanitized config from API)
// ============================================================================

export const GhlConfigSchema = z.object({
  // Interest Rates
  rates: z.object({
    conv30: z.number(),
    conv15: z.number(),
    fha30: z.number(),
    va30: z.number(),
    jumbo: z.number(),
  }),

  // Lender Fees
  fees: z.object({
    originationPoints: z.number(),
    admin: z.number(),
    processing: z.number(),
    underwriting: z.number(),
    appraisal: z.number(),
    creditReport: z.number(),
    floodCert: z.number(),
    taxService: z.number(),
    docPrep: z.number(),
    settlement: z.number(),
    notary: z.number(),
    recording: z.number(),
    courier: z.number(),
    // New fields from reference images
    ownerTitlePolicy: z.number().default(0),
    lenderTitlePolicy: z.number().default(0),
    pestInspection: z.number().default(0),
    propertyInspection: z.number().default(0),
    poolInspection: z.number().default(0),
  }),

  // Refinance Specific Fees (mirrors structure of fees)
  feesRefi: z.object({
    originationPoints: z.number().default(0),
    admin: z.number().default(0),
    processing: z.number().default(0),
    underwriting: z.number().default(0),
    appraisal: z.number().default(0),
    creditReport: z.number().default(0),
    floodCert: z.number().default(0),
    taxService: z.number().default(0),
    docPrep: z.number().default(0),
    settlement: z.number().default(0),
    notary: z.number().default(0),
    recording: z.number().default(0),
    courier: z.number().default(0),
    ownerTitlePolicy: z.number().default(0),
    lenderTitlePolicy: z.number().default(0),
    pestInspection: z.number().default(0),
    propertyInspection: z.number().default(0),
    poolInspection: z.number().default(0),
  }),

  // Prepaids & Reserves
  prepaids: z.object({
    taxMonths: z.number(),
    insuranceMonths: z.number(),
    interestDays: z.number(),
    taxRateAnnual: z.number(),
  }),

  // Loan Limits
  limits: z.object({
    conforming: z.number(),
    highBalance: z.number(),
    fha: z.number(),
  }),

  // FHA Settings
  fha: z.object({
    minDownPct: z.number(),
    maxLtvCashout: z.number(),
    ufmipPurchase: z.number(),
    ufmipRefi: z.number(),
    ufmipStreamline: z.number(),
    mip30yrGt95: z.number(),
    mip30yrLe95: z.number(),
    mip15yrGt90: z.number(),
    mip15yrLe90: z.number(),
  }),

  // VA Settings
  va: z.object({
    maxGuarantee: z.number(),
    maxLtvCashout: z.number(),
    maxLtvIrrrl: z.number(),
    ffFirstLe90: z.number(),
    ffFirst90to95: z.number(),
    ffFirstGt95: z.number(),
    ffSubseqLe90: z.number(),
    ffSubseq90to95: z.number(),
    ffSubseqGt95: z.number(),
    ffIrrrl: z.number(),
    ffCashoutFirst: z.number(),
    ffCashoutSubseq: z.number(),
  }),

  // MI Factors (indexed by LTV tier and credit tier)
  miFactors: z.object({
    standard: z.object({
      monthly: z.record(z.string(), z.record(z.string(), z.number())),
      single: z.record(z.string(), z.record(z.string(), z.number())),
    }),
    highBalance: z.object({
      monthly: z.record(z.string(), z.record(z.string(), z.number())),
      single: z.record(z.string(), z.record(z.string(), z.number())),
    }),
  }),

  // Company Info
  company: z.object({
    name: z.string(),
    nmlsId: z.string(),
    loName: z.string(),
    loEmail: z.string(),
    loPhone: z.string(),
    address: z.string(),
  }),

  // Homepage Blurbs
  blurbs: z.object({
    home1: z.string(),
    home2: z.string(),
    home3: z.string(),
  }),
});
export type GhlConfig = z.infer<typeof GhlConfigSchema>;

// ============================================================================
// CLIENT STATE SCHEMA (for saving to GHL)
// ============================================================================

export const ClientStateSchema = z.object({
  version: z.string().default('1.0'),
  lastUpdated: z.string(),
  calculatorType: z.string(),
  inputs: z.record(z.string(), z.unknown()),
  results: LoanCalculationResultSchema.optional(),
  selectedAgent: z.string().optional(),
});
export type ClientState = z.infer<typeof ClientStateSchema>;

// ============================================================================
// PARTNER AGENT SCHEMA
// ============================================================================

export const PartnerAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  headshotUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  company: z.string().optional(),
});
export type PartnerAgent = z.infer<typeof PartnerAgentSchema>;
