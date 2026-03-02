import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';
import { RealEstateData } from '../../core/models/planner.model';

@Component({
  selector: 'app-real-estate',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatIconModule, DecimalPipe],
  templateUrl: './real-estate.html',
  styleUrl: './real-estate.scss',
})
export class RealEstateComponent {
  store = inject(PlannerStore);

  get re(): RealEstateData { return this.store.realEstate(); }

  update(field: keyof RealEstateData, val: string): void {
    this.store.realEstate.set({ ...this.re, [field]: parseFloat(val) || 0 });
  }
}
