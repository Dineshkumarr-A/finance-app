import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { DomesticEquityData, SipAllocatorRow } from '../../core/models/planner.model';
import { safePct } from '../../core/services/calculator';

const EQUITY_CATEGORIES = ['Largecap', 'Midcap', 'Smallcap', 'Flexi/Multicap'];

const AGE_ALLOC = [
  { cat: 'Largecap',      a: '20%', b: '30%', c: '40%', d: '60%' },
  { cat: 'Midcap',        a: '30%', b: '20%', c: '20%', d: '20%' },
  { cat: 'Smallcap',      a: '20%', b: '20%', c: '10%', d: '0%'  },
  { cat: 'Flexi/Multicap', a: '30%', b: '30%', c: '30%', d: '20%' },
];

@Component({
  selector: 'app-domestic-equity',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatIconModule, DecimalPipe],
  templateUrl: './domestic-equity.html',
  styleUrl: './domestic-equity.scss',
})
export class DomesticEquityComponent {
  store = inject(PlannerStore);
  categories = EQUITY_CATEGORIES;
  ageAlloc = AGE_ALLOC;

  get de(): DomesticEquityData { return this.store.domesticEquity(); }

  totalDirectStocks = computed(() => {
    const s = this.de.directStocks;
    return s.largecap + s.midcap + s.smallcap;
  });
  totalMutualFunds = computed(() => {
    const m = this.de.mutualFunds;
    return m.largecap + m.midcap + m.smallcap + m.flexiMulticap;
  });

  pctDirect(val: number): number { return safePct(val, this.totalDirectStocks()); }
  pctMf(val: number): number     { return safePct(val, this.totalMutualFunds()); }

  updateDirect(field: 'largecap' | 'midcap' | 'smallcap', val: string): void {
    const de = JSON.parse(JSON.stringify(this.de)) as DomesticEquityData;
    de.directStocks[field] = parseFloat(val) || 0;
    this.store.domesticEquity.set(de);
  }

  updateMf(field: 'largecap' | 'midcap' | 'smallcap' | 'flexiMulticap', val: string): void {
    const de = JSON.parse(JSON.stringify(this.de)) as DomesticEquityData;
    de.mutualFunds[field] = parseFloat(val) || 0;
    this.store.domesticEquity.set(de);
  }

  addSipRow(): void {
    const de = JSON.parse(JSON.stringify(this.de)) as DomesticEquityData;
    de.sipAllocator.push({ name: '', category: 'Largecap', sipAmount: 0, max: 0 });
    this.store.domesticEquity.set(de);
  }

  updateSip(idx: number, field: keyof SipAllocatorRow, val: string): void {
    const de = JSON.parse(JSON.stringify(this.de)) as DomesticEquityData;
    const row = de.sipAllocator[idx];
    if (field === 'sipAmount' || field === 'max') {
      (row as any)[field] = parseFloat(val) || 0;
    } else {
      (row as any)[field] = val;
    }
    this.store.domesticEquity.set(de);
  }

  removeSipRow(idx: number): void {
    const de = JSON.parse(JSON.stringify(this.de)) as DomesticEquityData;
    de.sipAllocator.splice(idx, 1);
    this.store.domesticEquity.set(de);
  }

  sipExceedsMax(row: SipAllocatorRow): boolean {
    return row.sipAmount > row.max && row.max > 0;
  }

  totalSip = computed(() =>
    this.de.sipAllocator.reduce((s, r) => s + (r.sipAmount || 0), 0)
  );
}
