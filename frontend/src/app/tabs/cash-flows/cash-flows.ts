import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { CashFlowsData } from '../../core/models/planner.model';

interface FlowRow { label: string; key: string; section: 'inflows' | 'outflows'; }

@Component({
  selector: 'app-cash-flows',
  standalone: true,
  imports: [FormsModule, MatCardModule, DecimalPipe],
  templateUrl: './cash-flows.html',
  styleUrl: './cash-flows.scss',
})
export class CashFlowsComponent {
  store = inject(PlannerStore);

  inflows: FlowRow[] = [
    { label: 'Post-tax salary',   key: 'salary',   section: 'inflows' },
    { label: 'Business income',   key: 'business', section: 'inflows' },
    { label: 'Rental income',     key: 'rental',   section: 'inflows' },
    { label: 'Others',            key: 'othersIn', section: 'inflows' },
  ];

  outflows: FlowRow[] = [
    { label: 'Monthly expenses',                    key: 'expenses',              section: 'outflows' },
    { label: 'Compulsory investments (ULIPs, chit)', key: 'compulsoryInvestments', section: 'outflows' },
    { label: 'Loan EMIs',                            key: 'loanEmis',              section: 'outflows' },
    { label: 'Insurance premiums',                   key: 'insurance',             section: 'outflows' },
    { label: 'Others',                               key: 'othersOut',             section: 'outflows' },
  ];

  getValue(section: 'inflows' | 'outflows', key: string): number {
    const cf = this.store.cashFlows() as any;
    return cf[section][key] ?? 0;
  }

  setValue(section: 'inflows' | 'outflows', key: string, val: string): void {
    const cf: CashFlowsData = JSON.parse(JSON.stringify(this.store.cashFlows()));
    (cf[section] as any)[key] = parseFloat(val) || 0;
    this.store.cashFlows.set(cf);
  }
}
