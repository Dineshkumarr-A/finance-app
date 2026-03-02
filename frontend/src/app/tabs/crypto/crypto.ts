import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { PlannerStore } from '../../core/services/planner-store.service';

@Component({
  selector: 'app-crypto',
  standalone: true,
  imports: [FormsModule, MatCardModule, DecimalPipe],
  templateUrl: './crypto.html',
  styleUrl: './crypto.scss',
})
export class CryptoComponent {
  store = inject(PlannerStore);
  update(val: string): void {
    this.store.crypto.set({ total: parseFloat(val) || 0 });
  }
}
