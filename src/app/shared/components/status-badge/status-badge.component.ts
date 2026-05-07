import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { JobStatus, JOB_STATUS_CONFIG } from '../../../core/models/job.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [style.color]="config.color" [style.background]="bgColor">
      {{ config.label }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
  `],
})
export class StatusBadgeComponent {
  @Input() status!: JobStatus;

  get config() {
    return JOB_STATUS_CONFIG[this.status];
  }

  get bgColor() {
    const hex = this.config.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  }
}
