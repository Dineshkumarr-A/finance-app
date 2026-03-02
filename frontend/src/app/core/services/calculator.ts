import {
  AssetReturns,
  AssetAllocation,
  TimeHorizon,
  AssetClass,
} from '../models/planner.model';

/** Classify goal time horizon */
export function goalType(years: number): TimeHorizon {
  if (years <= 3) return 'short';
  if (years <= 5) return 'medium';
  return 'long';
}

/** Blended annual return for a time horizon (%) */
export function blendedReturn(
  horizon: TimeHorizon,
  returns: AssetReturns,
  allocation: AssetAllocation
): number {
  const classes: AssetClass[] = ['domesticEquity', 'usEquity', 'debt', 'gold', 'crypto', 'realEstate'];
  const total = classes.reduce((sum, cls) => {
    const weight = allocation[cls][horizon] / 100;
    return sum + weight * returns[cls];
  }, 0);
  return total;
}

/** Future value adjusted for inflation */
export function futureValue(presentValue: number, inflationPct: number, years: number): number {
  if (years <= 0 || presentValue <= 0) return presentValue;
  return presentValue * Math.pow(1 + inflationPct / 100, years);
}

/**
 * Monthly SIP required (with annual step-up).
 *
 * Uses the growing annuity FV formula (annual approximation):
 *   FV = SIP_annual_yr1 × [(1+r)^n − (1+g)^n] / (r − g)   when r ≠ g
 *   FV = SIP_annual_yr1 × n × (1+r)^(n-1)                  when r = g
 *
 *   monthly_sip = SIP_annual_yr1 / 12
 *
 * When stepUp = 0 uses exact monthly SIP formula:
 *   monthly_sip = gap × r_m / [(1+r_m)^n_m − 1]
 */
export function monthlySIP(
  gap: number,
  annualReturnPct: number,
  stepUpPct: number,
  years: number
): number {
  if (gap <= 0 || years <= 0) return 0;

  const r = annualReturnPct / 100;
  const g = stepUpPct / 100;
  const n = years;

  if (g === 0) {
    // Simple SIP (monthly compounding)
    const r_m = Math.pow(1 + r, 1 / 12) - 1;
    const n_m = n * 12;
    if (r_m === 0) return gap / n_m;
    return (gap * r_m) / (Math.pow(1 + r_m, n_m) - 1);
  }

  // Step-up SIP (growing annuity, annual periods)
  if (Math.abs(r - g) < 1e-9) {
    // r ≈ g case
    const annualSip1 = gap / (n * Math.pow(1 + r, n - 1));
    return annualSip1 / 12;
  }

  const annualSip1 = (gap * (r - g)) / (Math.pow(1 + r, n) - Math.pow(1 + g, n));
  return Math.max(0, annualSip1 / 12);
}

/** Formats a number as Indian currency string (no symbol) */
export function formatInr(value: number): string {
  if (!isFinite(value)) return '—';
  return Math.round(value).toLocaleString('en-IN');
}

/** Safe division — returns 0 when denominator is 0 */
export function safePct(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : (numerator / denominator) * 100;
}
