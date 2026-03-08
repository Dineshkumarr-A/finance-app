import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FinanceService } from '../finance.service';
import { StatCardComponent } from '../stat-card.component';
import { InputComponent } from '../input.component';
import { ProfileBarComponent } from '../profile-bar.component';
import { ProfileStore } from '../../core/services/profile-store.service';
import { PlannerStore } from '../../core/services/planner-store.service';
import { FidokSettings } from '../../core/models/planner.model';

@Component({
  selector: 'app-fidok',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, StatCardComponent, InputComponent, ProfileBarComponent],
  templateUrl: './fidok.component.html',
  styleUrl: './fidok.component.scss'
})
export class FidokComponent {
  protected Math = Math;
  ps  = inject(ProfileStore);
  private store = inject(PlannerStore);

  // ── Persisted inputs ────────────────────────────────────────────────────────
  otherDebts      = 0;
  investableAssets = 0;
  returnPct        = 10;

  // ── Derived values ───────────────────────────────────────────────────────────
  monthlyIncome    = 0;
  monthlyEMI       = 0;
  monthlySpending  = 0;
  totalDebtMonthly = 0;
  dti              = 0;
  annualExpenses   = 0;
  fiNumber         = 0;
  fiProgress       = 0;
  // Single source of truth for surplus/freeCash/monthlyFiGap
  monthlySurplus   = 0;
  totalGoalSips    = 0;   // sum of SIPs needed for all active goals
  freedGoalSips    = 0;   // SIPs freed from completed goals (now going to FI)
  fiSurplus        = 0;   // what's left for FI after goal SIPs
  goalRows: { name: string; sip: number; progress: number; isCompleted: boolean; originalIndex: number }[] = [];
  yearsToFiSurplus = 0;
  targetEmi        = 0;
  targetIncome     = 0;

  debtStatus  = '';
  dtiMessage  = '';
  fiStatus    = '';
  debtColor: 'green' | 'accent' | 'orange' | 'red' = 'green';

  surplusPositive    = true;
  hasSurplusTimeline = false;
  showActionable     = false;
  showDeficitWarning = false;
  showEmiWarning     = false;

  zones = [
    { range: '< 20%',  label: 'Excellent', desc: 'Strong financial health. Ideal for aggressive SIPs.',          min: 0,  max: 20,  color: 'green'  },
    { range: '20–35%', label: 'Good',      desc: 'Manageable load. Continue investing while reducing EMIs.',     min: 20, max: 35,  color: 'blue'   },
    { range: '35–50%', label: 'Caution',   desc: 'Significant debt. Prioritise prepayment over new investing.',  min: 35, max: 50,  color: 'orange' },
    { range: '> 50%',  label: 'Danger',    desc: 'Debt overload. Seek immediate restructuring advice.',          min: 50, max: 200, color: 'red'    },
  ];

  setField(patch: Partial<FidokSettings>) {
    Object.assign(this, patch);
    this.store.fidokSettings.update(s => ({ ...s, ...patch }));
  }

  constructor(public fs: FinanceService) {
    // Single effect: reads fidokSettings + profile signals (via calc())
    effect(() => {
      const s = this.store.fidokSettings();
      this.otherDebts       = s.otherDebts;
      this.investableAssets = s.investableAssets;
      this.returnPct        = s.returnPct || 10;
      this.calc();
    });
  }

  calc() {
    const income   = this.ps.monthlyIncome();
    const emi      = this.ps.monthlyEMI();
    const spending = this.ps.monthlySpending();

    this.monthlyIncome    = income;
    this.monthlyEMI       = emi;
    this.monthlySpending  = spending;
    this.totalDebtMonthly = emi + this.otherDebts;

    // ── Core metrics (single source of truth) ─────────────────────────────────
    this.dti            = (this.totalDebtMonthly / (income || 1)) * 100;
    this.monthlySurplus = income - emi - spending;           // = freeCash = monthlyFiGap
    this.annualExpenses = (emi + spending) * 12;
    this.fiNumber       = this.annualExpenses * 25;          // 4% rule
    this.fiProgress     = this.investableAssets > 0 && this.fiNumber > 0
      ? Math.min(100, (this.investableAssets / this.fiNumber) * 100)
      : 0;
    this.surplusPositive = this.monthlySurplus >= 0;

    // ── Split surplus: goals first, FI gets the rest ──────────────────────────
    this.totalGoalSips = this.store.totalSip();              // tracked — re-runs when goals change
    this.freedGoalSips = this.store.freedGoalSips();
    this.fiSurplus     = Math.max(0, this.monthlySurplus - this.totalGoalSips);
    this.goalRows      = this.store.computedGoals()
      .map((g, i) => ({ ...g, originalIndex: i }))
      .filter(g => g.raw.name && ((g.monthlySip ?? 0) > 0 || g.isCompleted))
      .map(g => ({
        name:          g.raw.name,
        sip:           g.monthlySip ?? 0,
        progress:      g.progress,
        isCompleted:   g.isCompleted,
        originalIndex: g.originalIndex,
      }));

    // ── FI timeline via fiSurplus SIP (after goals) ───────────────────────────
    if (this.fiSurplus > 0 && this.fiNumber > 0 && this.investableAssets < this.fiNumber) {
      const months = this.calcMonthsToFi(
        this.investableAssets, this.fiSurplus, this.returnPct, this.fiNumber
      );
      this.yearsToFiSurplus  = months / 12;
      this.hasSurplusTimeline = isFinite(this.yearsToFiSurplus) && this.yearsToFiSurplus > 0;
    } else if (this.fiNumber > 0 && this.investableAssets >= this.fiNumber) {
      this.yearsToFiSurplus  = 0;
      this.hasSurplusTimeline = true;
    } else {
      this.yearsToFiSurplus  = 0;
      this.hasSurplusTimeline = false;
    }

    // ── Validation ────────────────────────────────────────────────────────────
    this.showEmiWarning     = income > 0 && emi > income;
    this.showDeficitWarning = income > 0 && !this.showEmiWarning && (emi + spending) > income;

    // ── DTI status ────────────────────────────────────────────────────────────
    if      (this.dti < 20) { this.debtStatus = 'Excellent'; this.debtColor = 'green';  this.dtiMessage = 'Strong financial health'; }
    else if (this.dti < 35) { this.debtStatus = 'Good';      this.debtColor = 'accent'; this.dtiMessage = 'Manageable debt'; }
    else if (this.dti < 50) { this.debtStatus = 'Caution';   this.debtColor = 'orange'; this.dtiMessage = 'Reduce EMI'; }
    else                    { this.debtStatus = 'Danger';    this.debtColor = 'red';    this.dtiMessage = 'Immediate action required'; }

    // ── FI progress label ─────────────────────────────────────────────────────
    if      (this.investableAssets === 0) this.fiStatus = 'Start investing to build FI corpus';
    else if (this.fiProgress >= 100)      this.fiStatus = 'FI Achieved!';
    else if (this.fiProgress >= 75)       this.fiStatus = 'Almost there!';
    else if (this.fiProgress >= 50)       this.fiStatus = 'Halfway there!';
    else                                  this.fiStatus = 'Building corpus...';

    // ── Actionable insights (DTI > 50%) ───────────────────────────────────────
    this.showActionable = this.dti > 50 && income > 0;
    if (this.showActionable) {
      this.targetEmi    = income * 0.4;
      this.targetIncome = this.totalDebtMonthly / 0.4;
    }
  }

  // Months to reach FV using lump-sum PV + monthly PMT at annualReturnPct
  private calcMonthsToFi(pv: number, pmt: number, annualReturnPct: number, fv: number): number {
    const r = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
    if (r <= 0) return pmt > 0 ? (fv - pv) / pmt : Infinity;
    const a = pv + pmt / r;
    const b = fv + pmt / r;
    if (a <= 0 || b <= a) return 0;
    return Math.log(b / a) / Math.log(1 + r);
  }

  toggleGoal(originalIndex: number): void {
    this.store.toggleGoalComplete(originalIndex);
  }

  isActiveZone(zone: { min: number; max: number }): boolean {
    return this.dti >= zone.min && this.dti < zone.max;
  }

  get completedGoalCount(): number {
    return this.goalRows.filter(g => g.isCompleted).length;
  }

  get surplusDisplay(): string {
    const sign = this.monthlySurplus < 0 ? '−' : '';
    return sign + '₹' + this.fs.fmt(Math.abs(this.monthlySurplus));
  }
}
