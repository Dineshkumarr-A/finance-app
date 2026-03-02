import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { UsEquityData } from '../../core/models/planner.model';

@Component({
  selector: 'app-us-equity',
  standalone: true,
  imports: [FormsModule, MatCardModule, DecimalPipe],
  templateUrl: './us-equity.html',
  styleUrl: './us-equity.scss',
})
export class UsEquityComponent {
  store = inject(PlannerStore);
  get ue(): UsEquityData { return this.store.usEquity(); }
  update(field: keyof UsEquityData, val: string): void {
    this.store.usEquity.set({ ...this.ue, [field]: parseFloat(val) || 0 });
  }
}
