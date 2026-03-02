import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../finance.service';
import { StatCardComponent } from '../stat-card.component';
import { InputComponent } from '../input.component';
import { ProfileBarComponent } from '../profile-bar.component';
import { ProfileStore } from '../../core/services/profile-store.service';
import { PlannerStore } from '../../core/services/planner-store.service';
import { FireSettings } from '../../core/models/planner.model';

interface YearRow {
  age: number; year: number; corpus: number; annualExpense: number;
  sipTotal: number; fireNumber: number; progress: number;
  isRetireYear: boolean; isReady: boolean;
}

@Component({
  selector: 'app-fire',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent, InputComponent, ProfileBarComponent],
  templateUrl: './fire.component.html',
  styleUrl: './fire.component.scss'
})
export class FireComponent {
  ps = inject(ProfileStore);
  private store = inject(PlannerStore);

  age = 0; retireAge = 0; currentSavings = 0;
  preReturnPct = 0; postReturnPct = 0; inflationPct = 0; lifeExpectancy = 0;

  fireNumber = 0; projectedCorpus = 0; surplus = 0; isReady = false;
  progress = 0; safeMonthly = 0; annualExpenseAtRetire = 0;
  yearsSustained = 0; yearsToRetire = 0; retireDuration = 0;
  rows: YearRow[] = [];

  setField(patch: Partial<FireSettings>) {
    Object.assign(this, patch);
    this.store.fireSettings.update(s => ({ ...s, ...patch }));
  }

  constructor(public fs: FinanceService) {
    effect(() => {
      const s = this.store.fireSettings();
      this.age = s.age;
      this.retireAge = s.retireAge;
      this.currentSavings = s.currentSavings;
      this.preReturnPct = s.preReturnPct;
      this.postReturnPct = s.postReturnPct;
      this.inflationPct = s.inflationPct;
      this.lifeExpectancy = s.lifeExpectancy;
      this.calc();
    });
  }

  calc() {
    const monthlyExpense = this.ps.monthlySpending() + this.ps.monthlyEMI();
    const monthlySavings = this.ps.monthlySavings();

    const years = this.retireAge - this.age;
    this.yearsToRetire = years;
    this.retireDuration = this.lifeExpectancy - this.retireAge;
    const inf = this.inflationPct / 100;

    this.annualExpenseAtRetire = monthlyExpense * 12 * Math.pow(1 + inf, years);
    this.fireNumber = this.annualExpenseAtRetire / 0.04;

    const savingsGrowth = this.fs.lumpSumGrowth(this.currentSavings, this.preReturnPct, years);
    const sipCorpus = this.fs.sipCorpus(monthlySavings, this.preReturnPct, years);

    this.projectedCorpus = savingsGrowth + sipCorpus;
    this.surplus = this.projectedCorpus - this.fireNumber;
    this.isReady = this.surplus >= 0;
    this.progress = Math.min(100, (this.projectedCorpus / this.fireNumber) * 100);
    this.safeMonthly = (this.projectedCorpus * 0.04) / 12;

    const postMonthlyRate = (this.postReturnPct / 100) / 12;
    const postMonthlyExpense = this.annualExpenseAtRetire / 12;
    let c = this.projectedCorpus; let yrs = 0;
    for (let y = 0; y < 100; y++) {
      for (let m = 0; m < 12; m++) {
        if (c <= 0) break;
        c = c * (1 + postMonthlyRate) - postMonthlyExpense;
      }
      if (c <= 0) break; yrs++;
    }
    this.yearsSustained = c > 0 ? 100 : yrs;

    this.rows = Array.from({ length: years + 1 }, (_, i) => {
      const corpus = this.fs.lumpSumGrowth(this.currentSavings, this.preReturnPct, i)
        + this.fs.sipCorpus(monthlySavings, this.preReturnPct, i);
      const expense = monthlyExpense * 12 * Math.pow(1 + inf, i);
      const fn = expense / 0.04;
      return {
        age: this.age + i, year: new Date().getFullYear() + i, corpus,
        annualExpense: expense, sipTotal: monthlySavings * i * 12,
        fireNumber: fn, progress: Math.min(100, (corpus / fn) * 100),
        isRetireYear: this.age + i === this.retireAge, isReady: corpus >= fn,
      };
    });
  }
}
