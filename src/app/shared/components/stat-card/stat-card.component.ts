import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card card animate-fade-in">
      <div class="stat-icon" [style.background]="iconBg">
        <mat-icon [style.color]="iconColor">{{ icon }}</mat-icon>
      </div>
      <div class="stat-body">
        <div class="stat-value">
          {{ value !== null ? value : '—' }}
          <span *ngIf="suffix" class="stat-suffix">{{ suffix }}</span>
        </div>
        <div class="stat-label">{{ label }}</div>
        <div *ngIf="trend !== null" class="stat-trend" [class.positive]="trend! >= 0">
          <mat-icon>{{ trend! >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ trend! >= 0 ? '+' : '' }}{{ trend }}%
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 22px; }
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .stat-suffix {
      font-size: 16px;
      font-weight: 400;
      color: var(--text-secondary);
      margin-left: 2px;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      color: var(--accent-red);
      margin-top: 6px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &.positive { color: var(--accent-green); }
    }
  `],
})
export class StatCardComponent {
  @Input() label!: string;
  @Input() value: number | string | null = null;
  @Input() icon!: string;
  @Input() iconColor = 'var(--accent-cyan)';
  @Input() iconBg    = 'rgba(56, 189, 248, 0.12)';
  @Input() suffix: string | null = null;
  @Input() trend: number | null  = null;
}
