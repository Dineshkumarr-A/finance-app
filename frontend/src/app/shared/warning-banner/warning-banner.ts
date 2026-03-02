import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-warning-banner',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (show) {
      <div class="warning-banner">
        <mat-icon>warning</mat-icon>
        <span>{{ message }}</span>
      </div>
    }
  `,
})
export class WarningBannerComponent {
  @Input() show = false;
  @Input() message = '';
}
