// ── Asset class keys ─────────────────────────────────────────────────────────
export type AssetClass = 'domesticEquity' | 'usEquity' | 'debt' | 'gold' | 'crypto' | 'realEstate';
export type TimeHorizon = 'short' | 'medium' | 'long';

// ── Tab 1: Returns & Asset Mix ────────────────────────────────────────────────
export interface AssetReturns {
  domesticEquity: number;
  usEquity: number;
  debt: number;
  gold: number;
  crypto: number;
  realEstate: number;
}

export interface AllocationByHorizon {
  short: number;
  medium: number;
  long: number;
}

export interface AssetAllocation {
  domesticEquity: AllocationByHorizon;
  usEquity: AllocationByHorizon;
  debt: AllocationByHorizon;
  gold: AllocationByHorizon;
  crypto: AllocationByHorizon;
  realEstate: AllocationByHorizon;
}

export interface ReturnsAssumptionData {
  returns: AssetReturns;
  allocation: AssetAllocation;
}

// ── Tab 2: Cash Flows ─────────────────────────────────────────────────────────
export interface CashFlowsData {
  inflows: {
    salary: number;
    business: number;
    rental: number;
    othersIn: number;
  };
  outflows: {
    expenses: number;
    compulsoryInvestments: number;
    loanEmis: number;
    insurance: number;
    othersOut: number;
  };
}

// ── Tab 4: Real Estate & REIT ─────────────────────────────────────────────────
export interface RealEstateData {
  home: number;
  otherRealEstate: number;
  reits: number;
}

// ── Tab 5: Domestic Equity ────────────────────────────────────────────────────
export interface SipAllocatorRow {
  name: string;
  category: string;
  sipAmount: number;
  max: number;
}

export interface DomesticEquityData {
  directStocks: {
    largecap: number;
    midcap: number;
    smallcap: number;
  };
  mutualFunds: {
    largecap: number;
    midcap: number;
    smallcap: number;
    flexiMulticap: number;
  };
  sipAllocator: SipAllocatorRow[];
}

// ── Tab 6: US Equity ──────────────────────────────────────────────────────────
export interface UsEquityData {
  sp500Etf: number;
  otherEtfs: number;
  usMutualFunds: number;
}

// ── Tab 7: Debt ───────────────────────────────────────────────────────────────
export interface DebtHoldingRow {
  name: string;
  value: number;
}

export interface DebtSipRow {
  name: string;
  subCategory: 'fdArbitrage' | 'bankingPsu' | 'govtSecurities';
  sipAmount: number;
  max: number;
}

export interface DebtData {
  liquid: DebtHoldingRow[];
  fixedDeposits: DebtHoldingRow[];
  debtFunds: DebtHoldingRow[];
  govtInvestments: DebtHoldingRow[];
  sipAllocator: DebtSipRow[];
}

// ── Tab 8: Gold ───────────────────────────────────────────────────────────────
export interface GoldData {
  jewellery: number;
  sgb: number;
  goldEtf: number;
}

// ── Tab 9: Crypto ─────────────────────────────────────────────────────────────
export interface CryptoData {
  total: number;
}

// ── Tab 10: Miscellaneous ─────────────────────────────────────────────────────
export interface MiscData {
  ulips: number;
  smallCase: number;
}

// ── Tab 11: Financial Goals ───────────────────────────────────────────────────
export interface GoalData {
  name: string;
  priority: number | null;
  timeYears: number | null;
  amountToday: number | null;
  amountAvailable: number | null;
  inflationPct: number | null;
  sipStepUpPct: number | null;
}

// ── Root planner state ────────────────────────────────────────────────────────
// ── Financial Profile (shared across tool pages) ──────────────────────────────
export interface ProfileData {
  monthlyIncome:   number;
  monthlyEMI:      number;
  monthlySpending: number;
  monthlySavings:  number;
}

export const DEFAULT_PROFILE: ProfileData = {
  monthlyIncome:   0,
  monthlyEMI:      0,
  monthlySpending: 0,
  monthlySavings:  0,
};

// ── Net Worth liabilities (Tab 3 own input, rest auto-computed from other tabs) ──
export interface NetWorthLiabilities {
  homeLoan: number; educationLoan: number; carLoan: number;
  personalGoldLoan: number; creditCard: number; otherLiabilities: number;
}
export const DEFAULT_NET_WORTH_LIABILITIES: NetWorthLiabilities = {
  homeLoan: 0, educationLoan: 0, carLoan: 0, personalGoldLoan: 0, creditCard: 0, otherLiabilities: 0,
};

// ── Tool Settings (persisted to DB inside PlannerState) ───────────────────────
export interface FireSettings {
  age: number; retireAge: number; currentSavings: number;
  preReturnPct: number; postReturnPct: number; inflationPct: number; lifeExpectancy: number;
}
export interface FidokSettings { otherDebts: number; investableAssets: number; returnPct: number; }
export interface BudgetSettings {
  rent: number; food: number; transport: number; utilities: number;
  entertainment: number; insurance: number; otherExpenses: number;
  ppf: number; elss: number; nps: number; fd: number; emergency: number;
}
export interface FundsSettings { years: number; returnPct: number; }

export const DEFAULT_FIRE_SETTINGS: FireSettings = {
  age: 0, retireAge: 0, currentSavings: 0,
  preReturnPct: 0, postReturnPct: 0, inflationPct: 0, lifeExpectancy: 0,
};
export const DEFAULT_FIDOK_SETTINGS: FidokSettings = { otherDebts: 0, investableAssets: 0, returnPct: 0 };
export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  rent: 0, food: 0, transport: 0, utilities: 0,
  entertainment: 0, insurance: 0, otherExpenses: 0,
  ppf: 0, elss: 0, nps: 0, fd: 0, emergency: 0,
};
export const DEFAULT_FUNDS_SETTINGS: FundsSettings = { years: 0, returnPct: 0 };

export interface PlannerState {
  returnsAssumption: ReturnsAssumptionData;
  cashFlows: CashFlowsData;
  realEstate: RealEstateData;
  domesticEquity: DomesticEquityData;
  usEquity: UsEquityData;
  debt: DebtData;
  gold: GoldData;
  crypto: CryptoData;
  miscellaneous: MiscData;
  goals: GoalData[];
  fireSettings: FireSettings;
  fidokSettings: FidokSettings;
  budgetSettings: BudgetSettings;
  fundsSettings: FundsSettings;
  netWorthLiabilities: NetWorthLiabilities;
}

// ── Defaults ──────────────────────────────────────────────────────────────────
export const DEFAULT_RETURNS: AssetReturns = {
  domesticEquity: 12,
  usEquity: 12,
  debt: 6,
  gold: 6,
  crypto: 20,
  realEstate: 10,
};

export const DEFAULT_ALLOCATION: AssetAllocation = {
  domesticEquity: { short: 0,   medium: 40, long: 60 },
  usEquity:       { short: 0,   medium: 0,  long: 10 },
  debt:           { short: 100, medium: 50, long: 15 },
  gold:           { short: 0,   medium: 10, long: 5  },
  crypto:         { short: 0,   medium: 0,  long: 5  },
  realEstate:     { short: 0,   medium: 0,  long: 5  },
};

export const DEFAULT_GOALS: GoalData[] = Array.from({ length: 15 }, () => ({
  name: '',
  priority: null,
  timeYears: null,
  amountToday: null,
  amountAvailable: null,
  inflationPct: null,
  sipStepUpPct: null,
}));

export const DEFAULT_DEBT_ROWS = (): DebtHoldingRow[] =>
  Array.from({ length: 3 }, () => ({ name: '', value: 0 }));

export const INITIAL_STATE: PlannerState = {
  returnsAssumption: {
    returns: { ...DEFAULT_RETURNS },
    allocation: {
      domesticEquity: { ...DEFAULT_ALLOCATION.domesticEquity },
      usEquity:       { ...DEFAULT_ALLOCATION.usEquity },
      debt:           { ...DEFAULT_ALLOCATION.debt },
      gold:           { ...DEFAULT_ALLOCATION.gold },
      crypto:         { ...DEFAULT_ALLOCATION.crypto },
      realEstate:     { ...DEFAULT_ALLOCATION.realEstate },
    },
  },
  cashFlows: {
    inflows:  { salary: 0, business: 0, rental: 0, othersIn: 0 },
    outflows: { expenses: 0, compulsoryInvestments: 0, loanEmis: 0, insurance: 0, othersOut: 0 },
  },
  realEstate: { home: 0, otherRealEstate: 0, reits: 0 },
  domesticEquity: {
    directStocks: { largecap: 0, midcap: 0, smallcap: 0 },
    mutualFunds:  { largecap: 0, midcap: 0, smallcap: 0, flexiMulticap: 0 },
    sipAllocator: [{ name: '', category: 'Largecap', sipAmount: 0, max: 0 }],
  },
  usEquity: { sp500Etf: 0, otherEtfs: 0, usMutualFunds: 0 },
  debt: {
    liquid:          DEFAULT_DEBT_ROWS(),
    fixedDeposits:   DEFAULT_DEBT_ROWS(),
    debtFunds:       DEFAULT_DEBT_ROWS(),
    govtInvestments: DEFAULT_DEBT_ROWS(),
    sipAllocator: [{ name: '', subCategory: 'fdArbitrage', sipAmount: 0, max: 0 }],
  },
  gold:          { jewellery: 0, sgb: 0, goldEtf: 0 },
  crypto:        { total: 0 },
  miscellaneous: { ulips: 0, smallCase: 0 },
  goals:         DEFAULT_GOALS,
  fireSettings:  { ...DEFAULT_FIRE_SETTINGS },
  fidokSettings: { ...DEFAULT_FIDOK_SETTINGS },
  budgetSettings: { ...DEFAULT_BUDGET_SETTINGS },
  fundsSettings: { ...DEFAULT_FUNDS_SETTINGS },
  netWorthLiabilities: { ...DEFAULT_NET_WORTH_LIABILITIES },
};
