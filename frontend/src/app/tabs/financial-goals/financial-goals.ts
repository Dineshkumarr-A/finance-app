import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { PlannerStore, ComputedGoal } from '../../core/services/planner-store.service';
import { GoalData } from '../../core/models/planner.model';
import { WarningBannerComponent } from '../../shared/warning-banner/warning-banner';

const HORIZON_LABEL: Record<string, string> = {
  short: 'Short (<3yr)', medium: 'Medium (3–5yr)', long: 'Long (>6yr)',
};

@Component({
  selector: 'app-financial-goals',
  standalone: true,
  imports: [FormsModule, MatCardModule, DecimalPipe, WarningBannerComponent],
  templateUrl: './financial-goals.html',
  styleUrl: './financial-goals.scss',
})
export class FinancialGoalsComponent {
  store = inject(PlannerStore);
  horizonLabel = HORIZON_LABEL;

  showAdvanced  = false;
  showAllocation = false;

  computedGoals = computed(() => this.store.computedGoals());
  totalSip      = computed(() => this.store.totalSip());
  surplus       = computed(() => this.store.investingSurplus());
  available     = computed(() => this.surplus() - this.totalSip());
  sipExceeds    = computed(() => this.totalSip() > this.surplus() && this.surplus() > 0);

  totalAmountToday = computed(() =>
    this.store.goals().reduce((s, g) => s + (g.amountToday ?? 0), 0)
  );
  totalAvailableToday = computed(() =>
    this.store.goals().reduce((s, g) => s + (g.amountAvailable ?? 0), 0)
  );

  // ── Progress dashboard ────────────────────────────────────────────────────
  freedSips         = computed(() => this.store.freedGoalSips());
  activeGoalCount   = computed(() =>
    this.computedGoals().filter(g => g.raw.name && !g.isCompleted && (g.monthlySip ?? 0) > 0).length
  );
  completedGoalCount = computed(() =>
    this.computedGoals().filter(g => g.raw.name && g.isCompleted).length
  );

  toggleComplete(idx: number): void {
    this.store.toggleGoalComplete(idx);
  }

  progColor(g: ComputedGoal): string {
    if (g.isCompleted || g.progress >= 100) return 'prog-done';
    if (g.progress >= 50) return 'prog-mid';
    return 'prog-low';
  }

  totalAllocSip = computed(() => {
    const goals = this.computedGoals();
    const result = { domesticEquity: 0, usEquity: 0, debt: 0, gold: 0, crypto: 0, realEstate: 0 };
    for (const g of goals) {
      if (g.allocation) {
        result.domesticEquity += g.allocation.domesticEquity;
        result.usEquity       += g.allocation.usEquity;
        result.debt           += g.allocation.debt;
        result.gold           += g.allocation.gold;
        result.crypto         += g.allocation.crypto;
        result.realEstate     += g.allocation.realEstate;
      }
    }
    return result;
  });

  // ── Smart SIP Allocator chart data ────────────────────────────────────────
  sipAllocChart = computed(() => {
    const alloc = this.totalAllocSip();
    const total = this.totalSip();
    const r = 80;
    const C = 2 * Math.PI * r;

    const items = [
      { label: 'Dom. Equity', value: alloc.domesticEquity, color: '#6366f1' },
      { label: 'US Equity',   value: alloc.usEquity,       color: '#3b82f6' },
      { label: 'Debt',        value: alloc.debt,           color: '#10b981' },
      { label: 'Gold',        value: alloc.gold,           color: '#f59e0b' },
      { label: 'Crypto',      value: alloc.crypto,         color: '#8b5cf6' },
      { label: 'RE/REIT',     value: alloc.realEstate,     color: '#ef4444' },
    ];

    let cumPct = 0;
    const segments = items
      .filter(item => total > 0 && item.value > 0)
      .map(item => {
        const pct = item.value / total;
        const dashLen = Math.max(0, pct * C - 3);
        const offset = -(cumPct * C);
        cumPct += pct;
        return { label: item.label, value: item.value, color: item.color,
                 pct: pct * 100, dashArray: `${dashLen} ${C}`, dashOffset: offset };
      });

    // Per-goal breakdown rows
    const goalRows = this.computedGoals()
      .filter(g => g.raw.name && g.allocation)
      .map(g => ({
        name: g.raw.name,
        horizon: g.horizon,
        sip: g.monthlySip ?? 0,
        alloc: g.allocation!,
      }));

    return { segments, total, r, goalRows };
  });

  update(idx: number, field: keyof GoalData, val: string): void {
    const goals = JSON.parse(JSON.stringify(this.store.goals())) as GoalData[];
    const numFields: (keyof GoalData)[] = ['priority', 'timeYears', 'timeMonths', 'amountToday', 'amountAvailable', 'inflationPct', 'sipStepUpPct'];
    if (numFields.includes(field)) {
      (goals[idx] as any)[field] = val === '' ? null : parseFloat(val);
    } else {
      (goals[idx] as any)[field] = val;
    }
    this.store.goals.set(goals);
  }

  fmtSip(g: ComputedGoal): string {
    if (g.monthlySip === null) return '—';
    return '₹ ' + Math.round(g.monthlySip).toLocaleString('en-IN');
  }
  fmtFv(g: ComputedGoal): string {
    if (g.futureAmount === null) return '—';
    return '₹ ' + Math.round(g.futureAmount).toLocaleString('en-IN');
  }
  fmtAlloc(v: number | undefined): string {
    if (!v) return '₹0';
    return '₹ ' + Math.round(v).toLocaleString('en-IN');
  }
  fmtSaved(g: ComputedGoal): string {
    if (g.monthsElapsed === 0 || g.expectedAccumulated === 0) return '—';
    return '₹ ' + Math.round(g.expectedAccumulated).toLocaleString('en-IN');
  }
}
