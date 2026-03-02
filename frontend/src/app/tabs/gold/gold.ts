import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { GoldData } from '../../core/models/planner.model';

@Component({
  selector: 'app-gold',
  standalone: true,
  imports: [FormsModule, MatCardModule, DecimalPipe],
  templateUrl: './gold.html',
  styleUrl: './gold.scss',
})
export class GoldComponent {
  store = inject(PlannerStore);
  get g(): GoldData { return this.store.gold(); }
  update(field: keyof GoldData, val: string): void {
    this.store.gold.set({ ...this.g, [field]: parseFloat(val) || 0 });
  }
}
