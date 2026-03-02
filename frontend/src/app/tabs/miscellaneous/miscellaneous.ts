import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { MiscData } from '../../core/models/planner.model';

@Component({
  selector: 'app-miscellaneous',
  standalone: true,
  imports: [FormsModule, MatCardModule, DecimalPipe],
  templateUrl: './miscellaneous.html',
  styleUrl: './miscellaneous.scss',
})
export class MiscellaneousComponent {
  store = inject(PlannerStore);
  get m(): MiscData { return this.store.miscellaneous(); }
  update(field: keyof MiscData, val: string): void {
    this.store.miscellaneous.set({ ...this.m, [field]: parseFloat(val) || 0 });
  }
}
