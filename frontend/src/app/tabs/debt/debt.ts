import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { DebtData, DebtHoldingRow, DebtSipRow } from '../../core/models/planner.model';
import { safePct } from '../../core/services/calculator';

type DebtSection = 'liquid' | 'fixedDeposits' | 'debtFunds' | 'govtInvestments';
type DebtSubCat = 'fdArbitrage' | 'bankingPsu' | 'govtSecurities';

const SECTION_LABELS: Record<DebtSection, string> = {
  liquid:          'Liquid',
  fixedDeposits:   'Fixed Deposits',
  debtFunds:       'Debt Funds',
  govtInvestments: 'Government Investments',
};

const SUB_CAT_LABELS: Record<DebtSubCat, string> = {
  fdArbitrage:     'FD / RD / Arbitrage',
  bankingPsu:      'Banking PSUs / Corporate Funds',
  govtSecurities:  'Government Securities / Equity Saver',
};

@Component({
  selector: 'app-debt',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatIconModule, DecimalPipe],
  templateUrl: './debt.html',
  styleUrl: './debt.scss',
})
export class DebtComponent {
  store = inject(PlannerStore);

  sections: DebtSection[] = ['liquid', 'fixedDeposits', 'debtFunds', 'govtInvestments'];
  sectionLabels = SECTION_LABELS;
  subCatKeys: DebtSubCat[] = ['fdArbitrage', 'bankingPsu', 'govtSecurities'];
  subCatLabels = SUB_CAT_LABELS;

  get d(): DebtData { return this.store.debt(); }

  sectionTotal(section: DebtSection): number {
    return this.d[section].reduce((s, r) => s + (r.value || 0), 0);
  }

  mfSummary = computed(() => {
    const sip = this.d.sipAllocator;
    const totals: Record<DebtSubCat, number> = { fdArbitrage: 0, bankingPsu: 0, govtSecurities: 0 };
    sip.forEach(r => { if (r.subCategory in totals) totals[r.subCategory] += r.sipAmount || 0; });
    const grand = Object.values(totals).reduce((a, b) => a + b, 0);
    return this.subCatKeys.map(k => ({
      label: SUB_CAT_LABELS[k],
      value: totals[k],
      pct: safePct(totals[k], grand),
    }));
  });

  updateRow(section: DebtSection, idx: number, field: keyof DebtHoldingRow, val: string): void {
    const d = JSON.parse(JSON.stringify(this.d)) as DebtData;
    if (field === 'value') d[section][idx].value = parseFloat(val) || 0;
    else d[section][idx].name = val;
    this.store.debt.set(d);
  }

  addRow(section: DebtSection): void {
    const d = JSON.parse(JSON.stringify(this.d)) as DebtData;
    d[section].push({ name: '', value: 0 });
    this.store.debt.set(d);
  }

  removeRow(section: DebtSection, idx: number): void {
    const d = JSON.parse(JSON.stringify(this.d)) as DebtData;
    d[section].splice(idx, 1);
    this.store.debt.set(d);
  }

  addSipRow(): void {
    const d = JSON.parse(JSON.stringify(this.d)) as DebtData;
    d.sipAllocator.push({ name: '', subCategory: 'fdArbitrage', sipAmount: 0, max: 0 });
    this.store.debt.set(d);
  }

  updateSipRow(idx: number, field: keyof DebtSipRow, val: string): void {
    const d = JSON.parse(JSON.stringify(this.d)) as DebtData;
    const row = d.sipAllocator[idx];
    if (field === 'sipAmount' || field === 'max') (row as any)[field] = parseFloat(val) || 0;
    else (row as any)[field] = val;
    this.store.debt.set(d);
  }

  removeSipRow(idx: number): void {
    const d = JSON.parse(JSON.stringify(this.d)) as DebtData;
    d.sipAllocator.splice(idx, 1);
    this.store.debt.set(d);
  }

  sipExceedsMax(row: DebtSipRow): boolean {
    return row.sipAmount > row.max && row.max > 0;
  }

  totalSip = computed(() =>
    this.d.sipAllocator.reduce((s, r) => s + (r.sipAmount || 0), 0)
  );
}
