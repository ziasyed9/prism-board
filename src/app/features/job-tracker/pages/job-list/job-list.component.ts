import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { MatIconModule }   from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject }         from 'rxjs';
import { takeUntil }       from 'rxjs/operators';
import { JobService }      from '../../../../core/services/job.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Job, JOB_STATUS_CONFIG, JobStatus } from '../../../../core/models/job.model';
import { JobFormComponent } from '../../components/job-form/job-form.component';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    StatusBadgeComponent,
  ],
  template: `
    <div class="job-list-page">

      <header class="page-header">
        <div>
          <h1 class="page-title"><span class="title-prism">◈</span> Job Tracker</h1>
          <p class="page-subtitle">{{ jobs.length }} applications tracked</p>
        </div>

        <div class="header-actions">
          <button *ngIf="jobs.length === 0"
                  class="btn btn-ghost"
                  (click)="seedDemo()">
            <mat-icon>science</mat-icon> Load Demo Data
          </button>
          <button class="btn btn-primary" (click)="openAddDialog()">
            <mat-icon>add</mat-icon> Add Application
          </button>
        </div>
      </header>

      <div class="filter-bar card">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input type="text"
                 placeholder="Search company or role..."
                 [(ngModel)]="searchQuery"
                 (ngModelChange)="onSearch($event)">
        </div>

        <div class="filter-pills">
          <button class="pill"
                  [class.active]="activeStatus === 'all'"
                  (click)="filterByStatus('all')">
            All
          </button>
          <button *ngFor="let s of statusKeys"
                  class="pill"
                  [class.active]="activeStatus === s"
                  [style.border-color]="activeStatus === s ? statusConfig[s].color : 'transparent'"
                  [style.color]="activeStatus === s ? statusConfig[s].color : ''"
                  (click)="filterByStatus(s)">
            {{ statusConfig[s].label }}
          </button>
        </div>
      </div>

      <div class="table-card card">
        <table class="job-table">
          <thead>
            <tr>
              <th>Company / Role</th>
              <th>Status</th>
              <th>Source</th>
              <th>Applied</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let job of filteredJobs; trackBy: trackById"
                class="job-row animate-fade-in"
                (click)="selectJob(job)">

              <td class="company-cell">
                <div class="company-name">{{ job.company }}</div>
                <div class="role-name text-secondary">{{ job.role }}</div>
              </td>

              <td>
                <app-status-badge [status]="job.status"></app-status-badge>
              </td>

              <td class="text-secondary">{{ formatSource(job.source) }}</td>

              <td class="text-secondary">{{ fromNow(job.appliedDate) }}</td>

              <td>
                <span class="text-secondary">{{ job.location || '—' }}</span>
                <span *ngIf="job.remote" class="remote-badge">Remote</span>
              </td>

              <td>
                <div class="row-actions" (click)="$event.stopPropagation()">
                  <button class="icon-btn" (click)="openEditDialog(job)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="icon-btn danger" (click)="deleteJob(job.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="filteredJobs.length === 0">
              <td colspan="6" class="empty-state">
                <mat-icon>inbox</mat-icon>
                <p>No applications found</p>
                <span class="text-muted">Try adjusting your filters or add a new application</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .job-list-page {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1400px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .title-prism   { color: var(--accent-cyan); }
    .page-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

    .header-actions { display: flex; gap: 12px; align-items: center; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .btn-primary {
      background: var(--accent-cyan);
      color: #000;
      &:hover { filter: brightness(1.1); }
    }

    .btn-ghost {
      background: var(--bg-card);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      &:hover { color: var(--text-primary); border-color: var(--text-muted); }
    }

    .filter-bar {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
      min-width: 240px;

      mat-icon { color: var(--text-muted); font-size: 18px; }

      input {
        background: none;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-size: 14px;
        width: 100%;
        &::placeholder { color: var(--text-muted); }
      }
    }

    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }

    .pill {
      padding: 4px 12px;
      border-radius: 99px;
      border: 1px solid transparent;
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-size: 12px;
      cursor: pointer;
      transition: all var(--transition);
      &:hover  { color: var(--text-primary); }
      &.active { background: var(--bg-card-hover); }
    }

    .table-card { overflow: hidden; }

    .job-table {
      width: 100%;
      border-collapse: collapse;

      th {
        text-align: left;
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border-color);
      }

      td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
      }
    }

    .job-row {
      cursor: pointer;
      transition: background var(--transition);
      &:hover { background: var(--bg-card-hover); }
      &:last-child td { border-bottom: none; }
    }

    .company-name { font-weight: 600; font-size: 14px; }
    .role-name    { font-size: 12px; margin-top: 2px; }

    .remote-badge {
      margin-left: 8px;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(56,189,248,0.12);
      color: var(--accent-cyan);
      font-size: 10px;
      font-weight: 600;
    }

    .row-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity var(--transition);
    }

    .job-row:hover .row-actions { opacity: 1; }

    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition);

      mat-icon { font-size: 16px; }
      &:hover { background: var(--bg-secondary); color: var(--text-primary); }
      &.danger:hover { background: rgba(248,81,73,0.12); color: var(--accent-red); }
    }

    .empty-state {
      text-align: center;
      padding: 60px !important;
      color: var(--text-secondary);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--text-muted);
        margin-bottom: 12px;
      }

      p { font-size: 16px; font-weight: 500; margin-bottom: 6px; }
    }
  `],
})
export class JobListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  jobs: Job[]         = [];
  filteredJobs: Job[] = [];
  searchQuery         = '';
  activeStatus: JobStatus | 'all' = 'all';

  statusConfig = JOB_STATUS_CONFIG;
  statusKeys   = Object.keys(JOB_STATUS_CONFIG) as JobStatus[];

  constructor(
    private jobService: JobService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.jobService.getFilteredJobs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(jobs => { this.filteredJobs = jobs; });

    this.jobService.getAllJobs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(jobs => { this.jobs = jobs; });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(JobFormComponent, {
      width: '560px',
      data: null,
      panelClass: 'prismboard-dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.jobService.addJob(result);
    });
  }

  openEditDialog(job: Job): void {
    const ref = this.dialog.open(JobFormComponent, {
      width: '560px',
      data: job,
      panelClass: 'prismboard-dialog',
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.jobService.updateJob({ ...job, ...result });
    });
  }

  deleteJob(id: string): void {
    if (confirm('Delete this application?')) {
      this.jobService.deleteJob(id);
    }
  }

  selectJob(job: Job): void {
    this.jobService.selectJob(job.id);
  }

  filterByStatus(status: JobStatus | 'all'): void {
    this.activeStatus = status;
    this.jobService.setFilters({ status });
  }

  onSearch(query: string): void {
    this.jobService.setFilters({ searchQuery: query });
  }

  seedDemo(): void {
    this.jobService.seedDemoData();
  }

  trackById(_: number, job: Job): string {
    return job.id;
  }

  fromNow(date: string): string {
    return dayjs(date).fromNow();
  }

  formatSource(source: string): string {
    return source.replace(/_/g, ' ');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
