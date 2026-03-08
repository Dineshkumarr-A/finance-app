import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  PlannerState, INITIAL_STATE, AssetReturns, AssetAllocation,
  ReturnsAssumptionData, CashFlowsData, RealEstateData, DomesticEquityData,
  UsEquityData, DebtData, GoldData, CryptoData, MiscData, GoalData,
  TimeHorizon,
  FireSettings, DEFAULT_FIRE_SETTINGS,
  FidokSettings, DEFAULT_FIDOK_SETTINGS,
  BudgetSettings, DEFAULT_BUDGET_SETTINGS,
  FundsSettings, DEFAULT_FUNDS_SETTINGS,
  NetWorthLiabilities, DEFAULT_NET_WORTH_LIABILITIES,
} from '../models/planner.model';
import { ApiService } from './api.service';
import { blendedReturn, futureValue, monthlySIP, goalType, safePct } from './calculator';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Months elapsed from a stored ISO date string to today (0 if absent/invalid). */
function calcMonthsElapsed(startDate: string | null | undefined): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}

/** Future value of a regular monthly SIP over `months` months at `annualReturnPct`. */
function calcExpectedAccumulated(sip: number, months: number, annualReturnPct: number): number {
  if (months <= 0 || sip <= 0) return 0;
  const r = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
  if (r <= 0) return sip * months;
  return sip * (Math.pow(1 + r, months) - 1) / r;
}

/** End date = startDate + effectiveYears, formatted as "Mon YYYY". Returns null if inputs are missing. */
function calcEndByDate(startDate: string | null | undefined, effectiveYears: number): string | null {
  if (!startDate || effectiveYears <= 0) return null;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setMonth(end.getMonth() + Math.round(effectiveYears * 12));
  return end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// ── Derived goal row ──────────────────────────────────────────────────────────
export interface ComputedGoal {
  raw: GoalData;
  horizon: TimeHorizon | null;
  futureAmount: number | null;
  monthlySip: number | null;
  progress: number;              // 0–100: how much of the corpus is already funded (availableFv / futureAmount)
  isCompleted: boolean;          // goal achieved — SIP freed for FI
  monthsElapsed: number;         // months since startDate (0 if no startDate set)
  expectedAccumulated: number;   // corpus expected from regular SIP payments since startDate
  endByDate: string | null;      // formatted end date = startDate + effectiveYears
  allocation: {
    domesticEquity: number;
    usEquity: number;
    debt: number;
    gold: number;
    crypto: number;
    realEstate: number;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class PlannerStore {
  private api = inject(ApiService);

  // ── Raw state ─────────────────────────────────────────────────────────────
  returnsAssumption = signal<ReturnsAssumptionData>(deepClone(INITIAL_STATE.returnsAssumption));
  cashFlows         = signal<CashFlowsData>(deepClone(INITIAL_STATE.cashFlows));
  realEstate        = signal<RealEstateData>(deepClone(INITIAL_STATE.realEstate));
  domesticEquity    = signal<DomesticEquityData>(deepClone(INITIAL_STATE.domesticEquity));
  usEquity          = signal<UsEquityData>(deepClone(INITIAL_STATE.usEquity));
  debt              = signal<DebtData>(deepClone(INITIAL_STATE.debt));
  gold              = signal<GoldData>(deepClone(INITIAL_STATE.gold));
  crypto            = signal<CryptoData>(deepClone(INITIAL_STATE.crypto));
  miscellaneous     = signal<MiscData>(deepClone(INITIAL_STATE.miscellaneous));
  goals             = signal<GoalData[]>(deepClone(INITIAL_STATE.goals));
  fireSettings   = signal<FireSettings>(deepClone(DEFAULT_FIRE_SETTINGS));
  fidokSettings  = signal<FidokSettings>(deepClone(DEFAULT_FIDOK_SETTINGS));
  budgetSettings = signal<BudgetSettings>(deepClone(DEFAULT_BUDGET_SETTINGS));
  fundsSettings          = signal<FundsSettings>(deepClone(DEFAULT_FUNDS_SETTINGS));
  netWorthLiabilities    = signal<NetWorthLiabilities>(deepClone(DEFAULT_NET_WORTH_LIABILITIES));

  saveStatus = signal<'saved' | 'saving' | 'error' | 'idle'>('idle');

  // ── Computed: Tab 1 blended returns ──────────────────────────────────────
  blendedReturns = computed(() => {
    const ra = this.returnsAssumption();
    return {
      short:  blendedReturn('short',  ra.returns, ra.allocation),
      medium: blendedReturn('medium', ra.returns, ra.allocation),
      long:   blendedReturn('long',   ra.returns, ra.allocation),
    };
  });

  // ── Computed: Tab 2 cash flows ────────────────────────────────────────────
  totalInflows = computed(() => {
    const { salary, business, rental, othersIn } = this.cashFlows().inflows;
    return salary + business + rental + othersIn;
  });
  totalOutflows = computed(() => {
    const { expenses, compulsoryInvestments, loanEmis, insurance, othersOut } = this.cashFlows().outflows;
    return expenses + compulsoryInvestments + loanEmis + insurance + othersOut;
  });
  investingSurplus = computed(() => this.totalInflows() - this.totalOutflows());

  // ── Computed: Asset totals (from tabs 4–10) ───────────────────────────────
  totalRealEstate = computed(() => {
    const re = this.realEstate();
    return re.home + re.otherRealEstate + re.reits;
  });

  totalDomesticEquity = computed(() => {
    const de = this.domesticEquity();
    const stocks = de.directStocks.largecap + de.directStocks.midcap + de.directStocks.smallcap;
    const mf = de.mutualFunds.largecap + de.mutualFunds.midcap + de.mutualFunds.smallcap + de.mutualFunds.flexiMulticap;
    return stocks + mf;
  });

  totalUsEquity = computed(() => {
    const ue = this.usEquity();
    return ue.sp500Etf + ue.otherEtfs + ue.usMutualFunds;
  });

  totalDebt = computed(() => {
    const d = this.debt();
    const sumRows = (rows: { value: number }[]) => rows.reduce((s, r) => s + (r.value || 0), 0);
    return sumRows(d.liquid) + sumRows(d.fixedDeposits) + sumRows(d.debtFunds) + sumRows(d.govtInvestments);
  });

  totalGold = computed(() => {
    const g = this.gold();
    return g.jewellery + g.sgb + g.goldEtf;
  });

  totalCrypto = computed(() => this.crypto().total);

  totalMisc = computed(() => {
    const m = this.miscellaneous();
    return m.ulips + m.smallCase;
  });

  // ── Computed: Net Worth aggregations ──────────────────────────────────────
  // (Tab 3 reads these from the store — the tab itself also has its own illiquid/liability inputs)
  totalInvestableAssets = computed(() =>
    this.totalDomesticEquity() + this.totalUsEquity() + this.totalDebt() +
    this.totalGold() + this.totalCrypto() + this.totalRealEstate()
  );

  assetClassBreakdown = computed(() => {
    const total = this.totalInvestableAssets();
    return {
      realEstate:     { value: this.totalRealEstate(),     pct: safePct(this.totalRealEstate(), total) },
      domesticEquity: { value: this.totalDomesticEquity(), pct: safePct(this.totalDomesticEquity(), total) },
      usEquity:       { value: this.totalUsEquity(),       pct: safePct(this.totalUsEquity(), total) },
      debt:           { value: this.totalDebt(),           pct: safePct(this.totalDebt(), total) },
      gold:           { value: this.totalGold(),           pct: safePct(this.totalGold(), total) },
      crypto:         { value: this.totalCrypto(),         pct: safePct(this.totalCrypto(), total) },
    };
  });

  // ── Computed: Tab 11 goals ────────────────────────────────────────────────
  computedGoals = computed<ComputedGoal[]>(() => {
    const br = this.blendedReturns();
    const ra = this.returnsAssumption();
    return this.goals().map((g): ComputedGoal => {
      const isCompleted = g.completed ?? false;
      const effectiveYears = (g.timeYears ?? 0) + (g.timeMonths ?? 0) / 12;
      if (!g.amountToday || effectiveYears <= 0) {
        return { raw: g, horizon: null, futureAmount: null, monthlySip: null, progress: 0, isCompleted, monthsElapsed: 0, expectedAccumulated: 0, endByDate: null, allocation: null };
      }
      const horizon = goalType(effectiveYears);
      const annualReturn = br[horizon];
      const fv = futureValue(g.amountToday, g.inflationPct ?? 0, effectiveYears);
      const availableFv = (g.amountAvailable ?? 0) * Math.pow(1 + annualReturn / 100, effectiveYears);
      const gap = Math.max(0, fv - availableFv);
      const sip = monthlySIP(gap, annualReturn, g.sipStepUpPct ?? 0, effectiveYears);
      const progress = fv > 0 ? Math.min(100, (availableFv / fv) * 100) : 0;
      const monthsElapsed = calcMonthsElapsed(g.startDate);
      const expectedAccumulated = calcExpectedAccumulated(sip, monthsElapsed, annualReturn);
      const endByDate = calcEndByDate(g.startDate, effectiveYears);
      const alloc = ra.allocation;
      return {
        raw: g,
        horizon,
        futureAmount: fv,
        monthlySip: sip,
        progress,
        isCompleted,
        monthsElapsed,
        expectedAccumulated,
        endByDate,
        allocation: {
          domesticEquity: sip * alloc.domesticEquity[horizon] / 100,
          usEquity:       sip * alloc.usEquity[horizon] / 100,
          debt:           sip * alloc.debt[horizon] / 100,
          gold:           sip * alloc.gold[horizon] / 100,
          crypto:         sip * alloc.crypto[horizon] / 100,
          realEstate:     sip * alloc.realEstate[horizon] / 100,
        },
      };
    });
  });

  // Active goal SIPs (excludes completed goals)
  totalSip = computed(() =>
    this.computedGoals().reduce((s, g) => g.isCompleted ? s : s + (g.monthlySip ?? 0), 0)
  );

  // SIPs freed from completed goals — redirected to FI
  freedGoalSips = computed(() =>
    this.computedGoals().reduce((s, g) => g.isCompleted ? s + (g.monthlySip ?? 0) : s, 0)
  );

  toggleGoalComplete(index: number): void {
    this.goals.update(goals => {
      const updated = [...goals];
      updated[index] = { ...updated[index], completed: !(updated[index].completed ?? false) };
      return updated;
    });
  }

  // ── Load plan from backend ────────────────────────────────────────────────
  loadPlan(): void {
    this.api.loadPlan().subscribe(state => {
      if (!state) return;
      this.returnsAssumption.set(state.returnsAssumption);
      this.cashFlows.set(state.cashFlows);
      this.realEstate.set(state.realEstate);
      this.domesticEquity.set(state.domesticEquity);
      this.usEquity.set(state.usEquity);
      this.debt.set(state.debt);
      this.gold.set(state.gold);
      this.crypto.set(state.crypto);
      this.miscellaneous.set(state.miscellaneous);
      this.goals.set(state.goals);
      if (state.fireSettings)   this.fireSettings.set(state.fireSettings);
      if (state.fidokSettings)  this.fidokSettings.set(state.fidokSettings);
      if (state.budgetSettings) this.budgetSettings.set(state.budgetSettings);
      if (state.fundsSettings)         this.fundsSettings.set(state.fundsSettings);
      if (state.netWorthLiabilities)   this.netWorthLiabilities.set(state.netWorthLiabilities);
    });
  }

  // ── Auto-save (debounced via effect) ──────────────────────────────────────
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      // Access all state signals to register dependencies
      const state: PlannerState = {
        returnsAssumption: this.returnsAssumption(),
        cashFlows:         this.cashFlows(),
        realEstate:        this.realEstate(),
        domesticEquity:    this.domesticEquity(),
        usEquity:          this.usEquity(),
        debt:              this.debt(),
        gold:              this.gold(),
        crypto:            this.crypto(),
        miscellaneous:     this.miscellaneous(),
        goals:             this.goals(),
        fireSettings:      this.fireSettings(),
        fidokSettings:     this.fidokSettings(),
        budgetSettings:    this.budgetSettings(),
        fundsSettings:          this.fundsSettings(),
        netWorthLiabilities:    this.netWorthLiabilities(),
      };

      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.saveStatus.set('saving');
        this.api.savePlan(state).subscribe(res => {
          this.saveStatus.set(res.success ? 'saved' : 'error');
        });
      }, 800);
    });
  }
}
