import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../finance.service';
import { StatCardComponent } from '../stat-card.component';
import { InputComponent } from '../input.component';
import { ProfileBarComponent } from '../profile-bar.component';
import { ProfileStore } from '../../core/services/profile-store.service';
import { PlannerStore } from '../../core/services/planner-store.service';
import { BudgetSettings } from '../../core/models/planner.model';

interface BudgetSlice { label: string; value: number; color: string; pct: number; }

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, StatCardComponent, InputComponent, ProfileBarComponent],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss'
})
export class BudgetComponent {
  ps = inject(ProfileStore);
  private store = inject(PlannerStore);

  // Editable expense breakdown
  rent = 0; food = 0; transport = 0; utilities = 0;
  entertainment = 0; insurance = 0; otherExpenses = 0;
  ppf = 0; elss = 0; nps = 0; fd = 0;
  emergency = 0;

  // Computed from profile
  income = 0; emi = 0; sipAmount = 0;

  // Outputs
  totalExpenses = 0; totalInvestments = 0; netSavings = 0;
  savingsRate = 0; expenseRatio = 0; emergencyMonths = 0;
  sec80c = 0; taxSaved = 0; slices: BudgetSlice[] = [];
  rulesCheck = { needs: 0, wants: 0, savings: 0 };

  setField(patch: Partial<BudgetSettings>) {
    Object.assign(this, patch);
    this.store.budgetSettings.update(s => ({ ...s, ...patch }));
  }

  constructor(public fs: FinanceService) {
    effect(() => {
      const s = this.store.budgetSettings();
      this.rent          = s.rent;
      this.food          = s.food;
      this.transport     = s.transport;
      this.utilities     = s.utilities;
      this.entertainment = s.entertainment;
      this.insurance     = s.insurance;
      this.otherExpenses = s.otherExpenses;
      this.ppf           = s.ppf;
      this.elss          = s.elss;
      this.nps           = s.nps;
      this.fd            = s.fd;
      this.emergency     = s.emergency;
      this.calc();
    });
  }

  calc() {
    this.income    = this.ps.monthlyIncome();
    this.emi       = this.ps.monthlyEMI();
    this.sipAmount = this.ps.monthlySavings();

    this.totalExpenses = this.rent + this.food + this.transport + this.utilities
      + this.entertainment + this.emi + this.insurance + this.otherExpenses;
    this.totalInvestments = this.sipAmount + this.ppf + this.elss + this.nps + this.fd;
    this.netSavings = this.income - this.totalExpenses - this.totalInvestments;
    this.savingsRate = (this.totalInvestments / (this.income || 1)) * 100;
    this.expenseRatio = (this.totalExpenses / (this.income || 1)) * 100;
    this.emergencyMonths = this.emergency / (this.totalExpenses || 1);
    this.sec80c = Math.min(150000, (this.ppf + this.elss + this.nps) * 12);
    this.taxSaved = this.sec80c * 0.3;

    const total = this.totalExpenses + this.totalInvestments;
    const raw = [
      { label: 'Rent',          value: this.rent,          color: '#7c3aed' },
      { label: 'Food',          value: this.food,          color: '#0891b2' },
      { label: 'Transport',     value: this.transport,     color: '#d97706' },
      { label: 'Utilities',     value: this.utilities,     color: '#2563eb' },
      { label: 'Entertainment', value: this.entertainment, color: '#db2777' },
      { label: 'EMI',           value: this.emi,           color: '#dc2626' },
      { label: 'Insurance',     value: this.insurance,     color: '#7c6af7' },
      { label: 'Other',         value: this.otherExpenses, color: '#94a3b8' },
      { label: 'SIP/MF',        value: this.sipAmount,     color: '#059669' },
      { label: 'PPF',           value: this.ppf,           color: '#10b981' },
      { label: 'ELSS',          value: this.elss,          color: '#f59e0b' },
      { label: 'NPS',           value: this.nps,           color: '#a855f7' },
      { label: 'FD',            value: this.fd,            color: '#fbbf24' },
    ];
    this.slices = raw.filter(s => s.value > 0).map(s => ({ ...s, pct: (s.value / (total || 1)) * 100 }));
    this.rulesCheck = {
      needs:   this.expenseRatio,
      wants:   ((this.entertainment + this.otherExpenses) / (this.income || 1)) * 100,
      savings: this.savingsRate,
    };
  }
}
