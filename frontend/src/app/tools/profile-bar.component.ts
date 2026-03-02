import { Component, inject } from '@angular/core';
import { ProfileStore } from '../core/services/profile-store.service';
import { InputComponent } from './input.component';
import { FinanceService } from './finance.service';

@Component({
  selector: 'app-profile-bar',
  standalone: true,
  imports: [InputComponent],
  template: `
    <div class="profile-bar">
      <div class="profile-bar-header">
        <span class="profile-bar-icon">👤</span>
        <span class="profile-bar-title">Financial Profile</span>
        <span class="profile-bar-badge">synced across all tools</span>
        <span class="profile-bar-summary">
          Free cash: <strong>{{ freeStr }}</strong>
        </span>
      </div>
      <div class="profile-bar-inputs">
        <app-input label="Monthly Income"      [value]="ps.monthlyIncome()"   (valueChange)="ps.setMonthlyIncome($event)"   prefix="₹" [step]="5000"  [min]="0" />
        <app-input label="Monthly EMI / Loans" [value]="ps.monthlyEMI()"     (valueChange)="ps.setMonthlyEMI($event)"     prefix="₹" [step]="1000"  [min]="0" />
        <app-input label="Monthly Spending"    [value]="ps.monthlySpending()" (valueChange)="ps.setMonthlySpending($event)" prefix="₹" [step]="1000"  [min]="0" />
        <app-input label="Monthly Savings/SIP" [value]="ps.monthlySavings()" (valueChange)="ps.setMonthlySavings($event)" prefix="₹" [step]="1000"  [min]="0" />
      </div>
    </div>
  `,
  styles: [`
    .profile-bar {
      background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
      border-radius: 12px;
      padding: 16px 20px;
      color: white;
    }
    .profile-bar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .profile-bar-icon { font-size: 16px; }
    .profile-bar-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .profile-bar-badge {
      font-size: 10px;
      font-weight: 600;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      padding: 2px 8px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .profile-bar-summary {
      margin-left: auto;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      strong { color: #fff; }
    }
    .profile-bar-inputs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    @media (max-width: 900px) {
      .profile-bar-inputs { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ProfileBarComponent {
  ps = inject(ProfileStore);
  fs = inject(FinanceService);

  get freeStr(): string {
    const free = this.ps.totalInflows() - this.ps.monthlyEMI() - this.ps.monthlySpending() - this.ps.monthlySavings();
    return (free >= 0 ? '+' : '') + '₹' + this.fs.fmt(Math.round(free));
  }
}
