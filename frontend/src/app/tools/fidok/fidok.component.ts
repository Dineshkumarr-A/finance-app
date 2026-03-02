import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, StatCardComponent, InputComponent, ProfileBarComponent],
  templateUrl: './fidok.component.html',
  styleUrl: './fidok.component.scss'
})
export class FidokComponent {
  protected Math = Math;
  ps = inject(ProfileStore);
  private store = inject(PlannerStore);

  // Tool-specific inputs
  otherDebts = 0; investableAssets = 0; returnPct = 0;

  // Computed outputs
  monthlyIncome = 0; totalDebtMonthly = 0; dti = 0; annualExpenses = 0;
  fiNumber = 0; fiProgress = 0; passiveIncome = 0; piRatio = 0;
  yearsToFi = 0; debtStatus = ''; fiStatus = '';
  debtColor: 'green' | 'accent' | 'orange' | 'red' = 'green';

  zones = [
    { range: '< 20%',  label: 'Excellent', desc: 'Strong financial health. Ideal for aggressive SIPs.', min: 0,  max: 20,  color: 'green'  },
    { range: '20–35%', label: 'Good',      desc: 'Manageable load. Continue investing while reducing EMIs.', min: 20, max: 35, color: 'blue' },
    { range: '35–50%', label: 'Caution',   desc: 'Significant debt. Prioritise prepayment over investing.', min: 35, max: 50, color: 'orange' },
    { range: '> 50%',  label: 'Danger',    desc: 'Debt overload. Seek immediate restructuring advice.', min: 50, max: 200, color: 'red' },
  ];

  setField(patch: Partial<FidokSettings>) {
    Object.assign(this, patch);
    this.store.fidokSettings.update(s => ({ ...s, ...patch }));
  }

  constructor(public fs: FinanceService) {
    effect(() => {
      const s = this.store.fidokSettings();
      this.otherDebts      = s.otherDebts;
      this.investableAssets = s.investableAssets;
      this.returnPct       = s.returnPct;
      this.calc();
    });
  }

  calc() {
    this.monthlyIncome    = this.ps.monthlyIncome();
    this.totalDebtMonthly = this.ps.monthlyEMI() + this.otherDebts;
    this.dti              = (this.totalDebtMonthly / (this.monthlyIncome || 1)) * 100;
    this.annualExpenses   = (this.ps.monthlySpending() + this.ps.monthlyEMI()) * 12;

    this.fiNumber    = this.annualExpenses * 25;
    this.fiProgress  = Math.min(100, (this.investableAssets / (this.fiNumber || 1)) * 100);
    this.passiveIncome = this.investableAssets * (this.returnPct / 100);
    this.piRatio     = (this.passiveIncome / (this.annualExpenses || 1)) * 100;
    this.yearsToFi   = this.investableAssets < this.fiNumber
      ? Math.log(this.fiNumber / Math.max(1, this.investableAssets)) / Math.log(1 + this.returnPct / 100)
      : 0;

    if      (this.dti < 20) { this.debtStatus = 'Excellent'; this.debtColor = 'green'; }
    else if (this.dti < 35) { this.debtStatus = 'Good';      this.debtColor = 'accent'; }
    else if (this.dti < 50) { this.debtStatus = 'Caution';   this.debtColor = 'orange'; }
    else                    { this.debtStatus = 'Danger';    this.debtColor = 'red'; }

    if      (this.fiProgress >= 100) this.fiStatus = 'FI Achieved! 🎉';
    else if (this.fiProgress >= 75)  this.fiStatus = 'Almost there!';
    else if (this.fiProgress >= 50)  this.fiStatus = 'Halfway!';
    else                             this.fiStatus = 'Building...';
  }

  isActiveZone(zone: any): boolean {
    return this.dti >= zone.min && this.dti < zone.max;
  }
}
