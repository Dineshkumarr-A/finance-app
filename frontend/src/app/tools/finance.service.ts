import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FinanceService {

  fmt(n: number, decimals = 0): string {
    if (isNaN(n) || !isFinite(n)) return '—';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(n);
  }

  fmtCr(n: number): string {
    if (isNaN(n) || !isFinite(n)) return '—';
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1e7) return `${sign}₹${this.fmt(abs / 1e7, 2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${this.fmt(abs / 1e5, 2)} L`;
    return `${sign}₹${this.fmt(abs)}`;
  }

  pct(n: number, decimals = 1): string {
    if (isNaN(n)) return '—';
    return `${n.toFixed(decimals)}%`;
  }

  sipCorpus(monthly: number, annualRate: number, years: number): number {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r === 0) return monthly * n;
    return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  }

  lumpSumGrowth(principal: number, annualRate: number, years: number): number {
    return principal * Math.pow(1 + annualRate / 100, years);
  }
}
