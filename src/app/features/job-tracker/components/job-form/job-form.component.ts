import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule }             from '@angular/material/icon';
import {
  Job,
  JobStatus,
  JobSource,
  JOB_STATUS_CONFIG,
  JOB_SOURCE_CONFIG,
} from '../../../../core/models/job.model';
import dayjs from 'dayjs';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEditing ? 'Edit Application' : 'New Application' }}</h2>
        <button class="close-btn" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="dialog-form">

        <div class="form-row">
          <div class="form-field">
            <label>Company *</label>
            <input formControlName="company" placeholder="e.g. Google">
            <span class="field-error"
                  *ngIf="form.get('company')?.invalid && form.get('company')?.touched">
              Required
            </span>
          </div>
          <div class="form-field">
            <label>Role *</label>
            <input formControlName="role" placeholder="e.g. Frontend Engineer">
            <span class="field-error"
                  *ngIf="form.get('role')?.invalid && form.get('role')?.touched">
              Required
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Status *</label>
            <select formControlName="status">
              <option *ngFor="let s of statusKeys" [value]="s">
                {{ statusConfig[s].label }}
              </option>
            </select>
          </div>
          <div class="form-field">
            <label>Source *</label>
            <select formControlName="source">
              <option *ngFor="let s of sourceKeys" [value]="s">
                {{ sourceConfig[s].label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Applied Date *</label>
            <input type="date" formControlName="appliedDate">
          </div>
          <div class="form-field">
            <label>Location</label>
            <input formControlName="location" placeholder="e.g. New York, NY">
          </div>
        </div>

        <div class="form-row">
          <div class="form-field checkbox-field">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="remote">
              <span>Remote position</span>
            </label>
          </div>
          <div class="form-field">
            <label>Job URL</label>
            <input formControlName="url" placeholder="https://...">
          </div>
        </div>

        <div class="form-field full-width">
          <label>Notes</label>
          <textarea formControlName="notes"
                    placeholder="Recruiter name, interview notes..."
                    rows="3">
          </textarea>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-ghost" mat-dialog-close>Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
            {{ isEditing ? 'Save Changes' : 'Add Application' }}
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 24px;
      border-radius: var(--radius-lg);
      min-width: 480px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      h2 { font-size: 18px; font-weight: 700; }
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition);
      &:hover { background: var(--bg-secondary); color: var(--text-primary); }
    }

    .dialog-form { display: flex; flex-direction: column; gap: 16px; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      &.full-width { grid-column: 1 / -1; }
    }

    label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input, select, textarea {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 8px 12px;
      font-size: 14px;
      transition: border-color var(--transition);
      outline: none;
      font-family: inherit;
      &:focus { border-color: var(--accent-cyan); }
      &::placeholder { color: var(--text-muted); }
    }

    select option { background: var(--bg-card); }

    textarea { resize: vertical; min-height: 80px; }

    .checkbox-field  { justify-content: center; }
    .checkbox-label  {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      text-transform: none;
      letter-spacing: 0;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: var(--accent-cyan);
      }
    }

    .field-error { font-size: 11px; color: var(--accent-red); }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      border-radius: var(--radius-md);
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-primary {
      background: var(--accent-cyan);
      color: #000;
      &:hover:not(:disabled) { filter: brightness(1.1); }
    }

    .btn-ghost {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      &:hover { color: var(--text-primary); }
    }
  `],
})
export class JobFormComponent implements OnInit {
  form!: FormGroup;
  isEditing: boolean;

  statusConfig = JOB_STATUS_CONFIG;
  sourceConfig = JOB_SOURCE_CONFIG;
  statusKeys   = Object.keys(JOB_STATUS_CONFIG) as JobStatus[];
  sourceKeys   = Object.keys(JOB_SOURCE_CONFIG) as JobSource[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<JobFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Job | null,
  ) {
    this.isEditing = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      company: [this.data?.company || '', Validators.required],
      role:    [this.data?.role    || '', Validators.required],
      status:  [this.data?.status  || 'applied',  Validators.required],
      source:  [this.data?.source  || 'linkedin', Validators.required],
      appliedDate: [
        this.data?.appliedDate
          ? dayjs(this.data.appliedDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
        Validators.required,
      ],
      location: [this.data?.location || ''],
      remote:   [this.data?.remote   || false],
      url:      [this.data?.url      || ''],
      notes:    [this.data?.notes    || ''],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    this.dialogRef.close({
      ...value,
      appliedDate: dayjs(value.appliedDate).toISOString(),
    });
  }
}
