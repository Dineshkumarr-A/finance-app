import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat" [ngClass]="color">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-sub" *ngIf="sub">{{ sub }}</div>
    </div>
  `,
  styles: [`
    .stat {
      padding: 1rem 1.25rem;
      border-radius: 10px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--bg2, #f8fafc);
      transition: all 0.2s;
      &:hover { border-color: var(--border2, #cbd5e1); }
    }
    .stat-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text3, #64748b);
    }
    .stat-value {
      font-size: 1.4rem;
      font-weight: 800;
      margin-top: 0.25rem;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }
    .stat-sub {
      font-size: 0.65rem;
      color: var(--text3, #64748b);
      margin-top: 0.2rem;
    }
    .accent .stat-value { color: var(--accent, #2563eb); }
    .green .stat-value  { color: var(--t-green, #059669); }
    .orange .stat-value { color: var(--t-orange, #d97706); }
    .red .stat-value    { color: var(--t-red, #dc2626); }
    .purple .stat-value { color: var(--t-purple, #7c3aed); }
    .blue .stat-value   { color: var(--t-blue, #2563eb); }

    .accent { border-color: rgba(37,99,235,0.2);  background: rgba(37,99,235,0.04); }
    .green  { border-color: rgba(5,150,105,0.2);  background: rgba(5,150,105,0.04); }
    .orange { border-color: rgba(217,119,6,0.2);  background: rgba(217,119,6,0.04); }
    .red    { border-color: rgba(220,38,38,0.2);  background: rgba(220,38,38,0.04); }
    .purple { border-color: rgba(124,58,237,0.2); background: rgba(124,58,237,0.04); }
    .blue   { border-color: rgba(37,99,235,0.2);  background: rgba(37,99,235,0.04); }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() sub = '';
  @Input() color: 'accent' | 'green' | 'orange' | 'red' | 'purple' | 'blue' = 'accent';
}
