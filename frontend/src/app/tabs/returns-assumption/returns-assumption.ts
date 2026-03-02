import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { PlannerStore } from '../../core/services/planner-store.service';
import { AssetClass, AssetReturns, AssetAllocation } from '../../core/models/planner.model';

interface AssetRow {
  key: AssetClass;
  label: string;
}

const ASSET_ROWS: AssetRow[] = [
  { key: 'domesticEquity', label: 'Domestic Equity' },
  { key: 'usEquity',       label: 'US Equity' },
  { key: 'debt',           label: 'Debt' },
  { key: 'gold',           label: 'Gold (SGB/ETF)' },
  { key: 'crypto',         label: 'Crypto' },
  { key: 'realEstate',     label: 'Real Estate / REITs' },
];

@Component({
  selector: 'app-returns-assumption',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule],
  templateUrl: './returns-assumption.html',
  styleUrl: './returns-assumption.scss',
})
export class ReturnsAssumptionComponent {
  store = inject(PlannerStore);

  rows = ASSET_ROWS;
  returnColumns = ['asset', 'return'];
  allocationColumns = ['asset', 'short', 'medium', 'long'];
  blendedColumns = ['horizon', 'blended'];

  blendedRows = computed(() => {
    const br = this.store.blendedReturns();
    return [
      { horizon: 'Short Term (< 3 years)',  value: br.short  },
      { horizon: 'Medium Term (3–5 years)', value: br.medium },
      { horizon: 'Long Term (> 6 years)',   value: br.long   },
    ];
  });

  getReturn(key: AssetClass): number {
    return this.store.returnsAssumption().returns[key];
  }
  setReturn(key: AssetClass, val: string): void {
    const ra = { ...this.store.returnsAssumption() };
    ra.returns = { ...ra.returns, [key]: parseFloat(val) || 0 };
    this.store.returnsAssumption.set(ra);
  }

  getAlloc(key: AssetClass, horizon: 'short' | 'medium' | 'long'): number {
    return this.store.returnsAssumption().allocation[key][horizon];
  }
  setAlloc(key: AssetClass, horizon: 'short' | 'medium' | 'long', val: string): void {
    const ra = { ...this.store.returnsAssumption() };
    ra.allocation = {
      ...ra.allocation,
      [key]: { ...ra.allocation[key], [horizon]: parseFloat(val) || 0 },
    };
    this.store.returnsAssumption.set(ra);
  }

  allocSum(horizon: 'short' | 'medium' | 'long'): number {
    const alloc = this.store.returnsAssumption().allocation;
    return ASSET_ROWS.reduce((s, r) => s + (alloc[r.key][horizon] || 0), 0);
  }
}
