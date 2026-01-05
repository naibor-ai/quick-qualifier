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
import { persist } from 'zustand/middleware';
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
  closingCostsTotal: number;
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
  closingCostsTotal: number;
  sellerCreditAmount: number;
  lenderCreditAmount: number;
  depositAmount: number;
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
  closingCostsTotal: number;
  sellerCreditAmount: number;
  lenderCreditAmount: number;
  depositAmount: number;
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
  closingCostsTotal: number;
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
  closingCostsTotal: number;
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
  closingCostsTotal: number;
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
  loanFee: 4000,
  closingCostsTotal: 0,
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
  loanFee: 3860,
  closingCostsTotal: 0,
  sellerCreditAmount: 0,
  lenderCreditAmount: 0,
  depositAmount: 0,
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
  closingCostsTotal: 0,
  sellerCreditAmount: 0,
  lenderCreditAmount: 0,
  depositAmount: 0,
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
  closingCostsTotal: 0,
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
  closingCostsTotal: 0,
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
  closingCostsTotal: 0,
};

// ============================================================================
// STORE
// ============================================================================

export const useCalculatorStore = create<CalculatorState>()(
  persist(
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

      resetCalculator: (type) => {
        switch (type) {
          case 'conventional':
            set({
              conventionalInputs: defaultConventionalInputs,
              conventionalResult: null,
            });
            break;
          case 'fha':
            set({ fhaInputs: defaultFhaInputs, fhaResult: null });
            break;
          case 'va':
            set({ vaInputs: defaultVaInputs, vaResult: null });
            break;
          case 'sellerNet':
            set({ sellerNetInputs: defaultSellerNetInputs });
            break;
          case 'comparison':
            set({ comparisonScenarios: defaultComparisonScenarios });
            break;
          case 'conventionalRefi':
            set({
              conventionalRefiInputs: defaultConventionalRefiInputs,
              conventionalRefiResult: null,
            });
            break;
          case 'fhaRefi':
            set({
              fhaRefiInputs: defaultFhaRefiInputs,
              fhaRefiResult: null,
            });
            break;
          case 'vaRefi':
            set({
              vaRefiInputs: defaultVaRefiInputs,
              vaRefiResult: null,
            });
            break;
        }
      },
    }),
    {
      name: 'quick-qualifier-storage',
      partialize: (state) => ({
        // Only persist inputs, not results or config
        conventionalInputs: state.conventionalInputs,
        fhaInputs: state.fhaInputs,
        vaInputs: state.vaInputs,
        sellerNetInputs: state.sellerNetInputs,
        comparisonScenarios: state.comparisonScenarios,
        conventionalRefiInputs: state.conventionalRefiInputs,
        fhaRefiInputs: state.fhaRefiInputs,
        vaRefiInputs: state.vaRefiInputs,
        selectedAgent: state.selectedAgent,
      }),
    }
  )
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
