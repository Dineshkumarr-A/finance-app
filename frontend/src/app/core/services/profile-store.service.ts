import { Injectable, inject, computed } from '@angular/core';
import { PlannerStore } from './planner-store.service';

/**
 * Facade over PlannerStore.cashFlows.
 * Profile bar values are derived from — and write back to — the Cash Flows planner tab,
 * so both stay in sync automatically. All saves go via PlannerStore → DB.
 *
 * Mapping:
 *   monthlyIncome   ↔ cashFlows.inflows.salary
 *   monthlyEMI      ↔ cashFlows.outflows.loanEmis
 *   monthlySpending ↔ cashFlows.outflows.expenses
 *   monthlySavings  ↔ cashFlows.outflows.compulsoryInvestments
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private store = inject(PlannerStore);

  // Read — computed from cashFlows
  monthlyIncome   = computed(() => this.store.cashFlows().inflows.salary);
  monthlyEMI      = computed(() => this.store.cashFlows().outflows.loanEmis);
  monthlySpending = computed(() => this.store.cashFlows().outflows.expenses);
  monthlySavings  = computed(() => this.store.cashFlows().outflows.compulsoryInvestments);

  // Computed total inflows (for profile bar "free cash" display)
  totalInflows = computed(() => {
    const i = this.store.cashFlows().inflows;
    return i.salary + i.business + i.rental + i.othersIn;
  });

  // Setters — write to cashFlows, which triggers auto-save
  setMonthlyIncome  (v: number) { this.store.cashFlows.update(cf => ({ ...cf, inflows:  { ...cf.inflows,  salary:                 v } })); }
  setMonthlyEMI     (v: number) { this.store.cashFlows.update(cf => ({ ...cf, outflows: { ...cf.outflows, loanEmis:               v } })); }
  setMonthlySpending(v: number) { this.store.cashFlows.update(cf => ({ ...cf, outflows: { ...cf.outflows, expenses:               v } })); }
  setMonthlySavings (v: number) { this.store.cashFlows.update(cf => ({ ...cf, outflows: { ...cf.outflows, compulsoryInvestments:  v } })); }
}
