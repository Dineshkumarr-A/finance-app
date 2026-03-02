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

  update(idx: number, field: keyof GoalData, val: string): void {
    const goals = JSON.parse(JSON.stringify(this.store.goals())) as GoalData[];
    const numFields: (keyof GoalData)[] = ['priority', 'timeYears', 'amountToday', 'amountAvailable', 'inflationPct', 'sipStepUpPct'];
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
}
