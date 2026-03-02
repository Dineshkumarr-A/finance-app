import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="field">
      <label class="field-label">{{ label }}</label>
      <div class="field-wrap">
        <span class="affix" *ngIf="prefix">{{ prefix }}</span>
        <input
          type="number"
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
          [min]="min"
          [max]="max"
          [step]="step"
          class="field-input"
          [class.has-prefix]="prefix"
          [class.has-suffix]="suffix"
        />
        <span class="affix suffix" *ngIf="suffix">{{ suffix }}</span>
      </div>
    </div>
  `,
  styles: [`
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text3, #64748b);
    }
    .field-wrap {
      display: flex;
      align-items: center;
      background: var(--bg2, #f8fafc);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus-within {
        border-color: var(--accent, #2563eb);
        box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
      }
    }
    .affix {
      padding: 0 0.625rem;
      font-size: 0.75rem;
      color: var(--text3, #64748b);
      background: var(--bg3, #f1f5f9);
      align-self: stretch;
      display: flex;
      align-items: center;
      border-right: 1px solid var(--border, #e2e8f0);
      white-space: nowrap;
      font-weight: 600;
    }
    .affix.suffix {
      border-right: none;
      border-left: 1px solid var(--border, #e2e8f0);
    }
    .field-input {
      flex: 1;
      padding: 0.5rem 0.625rem;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text, #1e293b);
      font-size: 0.875rem;
      min-width: 0;
      font-family: inherit;
      font-variant-numeric: tabular-nums;
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button { opacity: 0.3; }
    }
  `]
})
export class InputComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number = 1;
  @Input() prefix = '';
  @Input() suffix = '';
  @Output() valueChange = new EventEmitter<number>();
}
