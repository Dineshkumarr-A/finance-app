import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../finance.service';
import { StatCardComponent } from '../stat-card.component';
import { InputComponent } from '../input.component';
import { ProfileBarComponent } from '../profile-bar.component';
import { ProfileStore } from '../../core/services/profile-store.service';
import { PlannerStore } from '../../core/services/planner-store.service';
import { FundsSettings } from '../../core/models/planner.model';

export interface Fund {
  name: string; category: string; expense: number; tracking: number; aum: number;
  risk: 'Low' | 'Moderate' | 'High' | 'Very High';
  returns1yr: number; returns3yr: number; returns5yr: number; recommended: boolean;
}

@Component({
  selector: 'app-funds',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent, InputComponent, ProfileBarComponent],
  templateUrl: './funds.component.html',
  styleUrl: './funds.component.scss'
})
export class FundsComponent implements OnInit {
  ps = inject(ProfileStore);
  private store = inject(PlannerStore);

  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive' = 'Moderate';
  filterCat = 'All';
  sortBy: keyof Fund = 'returns5yr';
  sortAsc = false;
  years = 0; returnPct = 0;
  sipCorpusVal = 0; sipInvested = 0; sipGains = 0;

  allFunds: Fund[] = [
    { name: 'Nifty 50 Index Fund',   category: 'Large Cap',   expense: 0.10, tracking: 0.05, aum: 25000, risk: 'Low',       returns1yr: 18.2, returns3yr: 15.4, returns5yr: 14.1, recommended: true },
    { name: 'Nifty Next 50 Index',   category: 'Large & Mid', expense: 0.25, tracking: 0.08, aum: 8000,  risk: 'Moderate',  returns1yr: 22.1, returns3yr: 17.3, returns5yr: 15.8, recommended: true },
    { name: 'Nifty 500 Index Fund',  category: 'Multi Cap',   expense: 0.18, tracking: 0.06, aum: 5000,  risk: 'Moderate',  returns1yr: 19.8, returns3yr: 16.1, returns5yr: 14.9, recommended: false },
    { name: 'Sensex Index Fund',     category: 'Large Cap',   expense: 0.09, tracking: 0.04, aum: 18000, risk: 'Low',       returns1yr: 17.5, returns3yr: 14.8, returns5yr: 13.7, recommended: false },
    { name: 'Nifty Midcap 150',      category: 'Mid Cap',     expense: 0.35, tracking: 0.12, aum: 3500,  risk: 'High',      returns1yr: 30.5, returns3yr: 24.2, returns5yr: 21.3, recommended: true },
    { name: 'Nifty Smallcap 250',    category: 'Small Cap',   expense: 0.45, tracking: 0.15, aum: 1200,  risk: 'Very High', returns1yr: 38.2, returns3yr: 28.5, returns5yr: 24.7, recommended: false },
    { name: 'Nifty IT Index Fund',   category: 'Sectoral',    expense: 0.40, tracking: 0.10, aum: 2000,  risk: 'High',      returns1yr: 8.2,  returns3yr: 12.4, returns5yr: 18.9, recommended: false },
    { name: 'Nifty Bank Index',      category: 'Sectoral',    expense: 0.38, tracking: 0.09, aum: 4000,  risk: 'High',      returns1yr: 15.6, returns3yr: 11.2, returns5yr: 12.8, recommended: false },
    { name: 'Nifty Infrastructure',  category: 'Thematic',    expense: 0.42, tracking: 0.11, aum: 1800,  risk: 'High',      returns1yr: 26.3, returns3yr: 20.1, returns5yr: 16.4, recommended: false },
    { name: 'Nifty Alpha 50',        category: 'Factor',      expense: 0.30, tracking: 0.09, aum: 900,   risk: 'High',      returns1yr: 35.1, returns3yr: 26.8, returns5yr: 23.2, recommended: true },
  ];

  categories: string[] = [];
  filteredFunds: Fund[] = [];
  riskMap: Record<string, number> = { 'Low': 1, 'Moderate': 2, 'High': 3, 'Very High': 4 };
  riskOptions: Array<'Conservative' | 'Moderate' | 'Aggressive'> = ['Conservative', 'Moderate', 'Aggressive'];

  setField(patch: Partial<FundsSettings>) {
    Object.assign(this, patch);
    this.store.fundsSettings.update(s => ({ ...s, ...patch }));
  }

  constructor(public fs: FinanceService) {
    effect(() => {
      const s = this.store.fundsSettings();
      this.years     = s.years;
      this.returnPct = s.returnPct;
      this.calcSip();
    });
  }

  ngOnInit() {
    this.categories = ['All', ...Array.from(new Set(this.allFunds.map(f => f.category)))];
    this.applyFilters();
  }

  applyFilters() {
    const userRisk = this.riskTolerance === 'Conservative' ? 1 : this.riskTolerance === 'Moderate' ? 2 : 4;
    this.filteredFunds = this.allFunds
      .filter(f => {
        if (this.filterCat !== 'All' && f.category !== this.filterCat) return false;
        return this.riskMap[f.risk] <= userRisk + 1;
      })
      .sort((a, b) => {
        const av = a[this.sortBy] as number;
        const bv = b[this.sortBy] as number;
        return this.sortAsc ? av - bv : bv - av;
      });
  }

  setSort(key: keyof Fund) {
    if (this.sortBy === key) this.sortAsc = !this.sortAsc;
    else { this.sortBy = key; this.sortAsc = false; }
    this.applyFilters();
  }

  calcSip() {
    const monthly = this.ps.monthlySavings();
    this.sipCorpusVal = this.fs.sipCorpus(monthly, this.returnPct, this.years);
    this.sipInvested  = monthly * this.years * 12;
    this.sipGains     = this.sipCorpusVal - this.sipInvested;
    this.applyFilters();
  }
}
