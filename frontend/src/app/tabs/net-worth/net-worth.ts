import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { NetWorthLiabilities } from '../../core/models/planner.model';

interface AssetRow { label: string; value: number; sourceTab: string; }

@Component({
  selector: 'app-net-worth',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatTooltipModule, MatIconModule, DecimalPipe],
  templateUrl: './net-worth.html',
  styleUrl: './net-worth.scss',
})
export class NetWorthComponent {
  store = inject(PlannerStore);

  // ── Illiquid assets — computed from store ──────────────────────────────────
  illiquidRows = computed<AssetRow[]>(() => [
    { label: 'Home',                       value: this.store.realEstate().home,                                                                   sourceTab: 'Real Estate' },
    { label: 'Other Real Estate',          value: this.store.realEstate().otherRealEstate,                                                        sourceTab: 'Real Estate' },
    { label: 'Jewellery',                  value: this.store.gold().jewellery,                                                                    sourceTab: 'Gold' },
    { label: 'SGB (Sovereign Gold Bonds)', value: this.store.gold().sgb,                                                                          sourceTab: 'Gold' },
    { label: 'ULIPs',                      value: this.store.miscellaneous().ulips,                                                               sourceTab: 'Miscellaneous' },
    { label: 'EPF / PPF / VPF',            value: this.store.debt().govtInvestments.reduce((s, r) => s + (r.value || 0), 0),                      sourceTab: 'Debt' },
  ]);

  // ── Liquid assets — computed from store ───────────────────────────────────
  liquidRows = computed<AssetRow[]>(() => {
    const de = this.store.domesticEquity();
    const ue = this.store.usEquity();
    const debt = this.store.debt();
    return [
      { label: 'Liquid (Savings / Cash / Liquid Fund)', value: debt.liquid.reduce((s, r) => s + (r.value || 0), 0),                          sourceTab: 'Debt' },
      { label: 'Fixed Deposit',                         value: debt.fixedDeposits.reduce((s, r) => s + (r.value || 0), 0),                    sourceTab: 'Debt' },
      { label: 'Debt Funds',                            value: debt.debtFunds.reduce((s, r) => s + (r.value || 0), 0),                        sourceTab: 'Debt' },
      { label: 'Domestic Stock Market',                 value: de.directStocks.largecap + de.directStocks.midcap + de.directStocks.smallcap,  sourceTab: 'Domestic Equity' },
      { label: 'Domestic Equity Mutual Funds',          value: de.mutualFunds.largecap + de.mutualFunds.midcap + de.mutualFunds.smallcap + de.mutualFunds.flexiMulticap, sourceTab: 'Domestic Equity' },
      { label: 'US Equity',                             value: ue.sp500Etf + ue.otherEtfs + ue.usMutualFunds,                                  sourceTab: 'US Equity' },
      { label: 'Small Case',                            value: this.store.miscellaneous().smallCase,                                           sourceTab: 'Miscellaneous' },
      { label: 'Gold ETF / Digital Gold',               value: this.store.gold().goldEtf,                                                      sourceTab: 'Gold' },
      { label: 'Crypto',                                value: this.store.crypto().total,                                                      sourceTab: 'Crypto' },
      { label: 'REITs',                                 value: this.store.realEstate().reits,                                                  sourceTab: 'Real Estate' },
    ];
  });

  // ── Liabilities — editable, backed by store ───────────────────────────────
  liabilityRows: { key: keyof NetWorthLiabilities; label: string }[] = [
    { key: 'homeLoan',         label: 'Home Loan' },
    { key: 'educationLoan',    label: 'Education Loan' },
    { key: 'carLoan',          label: 'Car Loan' },
    { key: 'personalGoldLoan', label: 'Personal / Gold Loan' },
    { key: 'creditCard',       label: 'Credit Card' },
    { key: 'otherLiabilities', label: 'Other Liabilities' },
  ];

  setLiability(key: string, val: string): void {
    this.store.netWorthLiabilities.update(v => ({ ...v, [key]: parseFloat(val) || 0 }));
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  totalIlliquid    = computed(() => this.illiquidRows().reduce((s, r) => s + r.value, 0));
  totalLiquid      = computed(() => this.liquidRows().reduce((s, r) => s + r.value, 0));
  totalLiabilities = computed(() => Object.values(this.store.netWorthLiabilities()).reduce((a, b) => a + b, 0));
  totalAssets      = computed(() => this.totalIlliquid() + this.totalLiquid());
  netWorth         = computed(() => this.totalAssets() - this.totalLiabilities());

  // ── Asset class breakdown (from store, tabs 4–10) ─────────────────────────
  assetClassRows = computed(() => {
    const bd = this.store.assetClassBreakdown();
    return [
      { label: 'Real Estate / REITs', ...bd.realEstate },
      { label: 'Domestic Equity',     ...bd.domesticEquity },
      { label: 'US Equity',           ...bd.usEquity },
      { label: 'Debt',                ...bd.debt },
      { label: 'Gold',                ...bd.gold },
      { label: 'Crypto',              ...bd.crypto },
    ];
  });

  reqAllocRows = computed(() => {
    const alloc = this.store.returnsAssumption().allocation;
    const total = this.store.totalInvestableAssets();
    return [
      { label: 'Real Estate / REITs', reqPct: alloc.realEstate.long,    reqVal: total * alloc.realEstate.long / 100 },
      { label: 'Domestic Equity',     reqPct: alloc.domesticEquity.long, reqVal: total * alloc.domesticEquity.long / 100 },
      { label: 'US Equity',           reqPct: alloc.usEquity.long,       reqVal: total * alloc.usEquity.long / 100 },
      { label: 'Debt',                reqPct: alloc.debt.long,           reqVal: total * alloc.debt.long / 100 },
      { label: 'Gold',                reqPct: alloc.gold.long,           reqVal: total * alloc.gold.long / 100 },
      { label: 'Crypto',              reqPct: alloc.crypto.long,         reqVal: total * alloc.crypto.long / 100 },
    ];
  });
}
