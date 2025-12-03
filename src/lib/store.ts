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
  floodInsuranceMonthly: number;
  creditScoreTier: CreditScoreTier;
  pmiType: PmiType;
  sellerCreditAmount: number;
  lenderCreditAmount: number;
  originationPoints: number;
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
  floodInsuranceMonthly: number;
  is203k: boolean;
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
  hoaDuesMonthly: number;
  floodInsuranceMonthly: number;
  vaUsage: VaUsage;
  isDisabledVeteran: boolean;
  isReservist: boolean;
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

  // Results
  conventionalResult: LoanCalculationResult | null;
  fhaResult: LoanCalculationResult | null;
  vaResult: LoanCalculationResult | null;

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

  setConventionalResult: (result: LoanCalculationResult | null) => void;
  setFhaResult: (result: LoanCalculationResult | null) => void;
  setVaResult: (result: LoanCalculationResult | null) => void;

  resetCalculator: (type: 'conventional' | 'fha' | 'va' | 'sellerNet' | 'comparison') => void;
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
  floodInsuranceMonthly: 0,
  creditScoreTier: '740',
  pmiType: 'monthly',
  sellerCreditAmount: 0,
  lenderCreditAmount: 0,
  originationPoints: 0,
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
  floodInsuranceMonthly: 0,
  is203k: false,
};

const defaultVaInputs: VaInputs = {
  salesPrice: 450000,
  downPaymentAmount: 0,
  downPaymentPercent: 0,
  downPaymentMode: 'percent',
  interestRate: 6.5,
  termYears: 30,
  propertyTaxAnnual: 5500,
  homeInsuranceAnnual: 1600,
  hoaDuesMonthly: 0,
  floodInsuranceMonthly: 0,
  vaUsage: 'first',
  isDisabledVeteran: false,
  isReservist: false,
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

      // Results
      conventionalResult: null,
      fhaResult: null,
      vaResult: null,

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

      setConventionalResult: (conventionalResult) => set({ conventionalResult }),
      setFhaResult: (fhaResult) => set({ fhaResult }),
      setVaResult: (vaResult) => set({ vaResult }),

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
        selectedAgent: state.selectedAgent,
      }),
    }
  )
);

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch and load config on mount.
 */
export function useLoadConfig() {
  const { setConfig, setConfigLoading, setConfigError, config } =
    useCalculatorStore();

  const loadConfig = async () => {
    if (config) return; // Already loaded

    setConfigLoading(true);
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setConfigLoading(false);
    }
  };

  return { loadConfig };
}

/**
 * Hook to fetch partner agents.
 */
export function useLoadAgents() {
  const { setAgents, setAgentsLoading, agents } = useCalculatorStore();

  const loadAgents = async () => {
    if (agents.length > 0) return; // Already loaded

    setAgentsLoading(true);
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setAgentsLoading(false);
    }
  };

  return { loadAgents };
}
