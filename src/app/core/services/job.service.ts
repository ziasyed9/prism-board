import { Injectable } from '@angular/core';
import { Store }      from '@ngrx/store';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Job, JobFilters } from '../models/job.model';
import * as JobActions   from '../store/jobs/job.actions';
import * as JobSelectors from '../store/jobs/job.selectors';

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private store: Store) {}

  getAllJobs()            { return this.store.select(JobSelectors.selectAllJobs); }
  getFilteredJobs()      { return this.store.select(JobSelectors.selectFilteredJobs); }
  getFilters()           { return this.store.select(JobSelectors.selectJobFilters); }
  getSelectedJob()       { return this.store.select(JobSelectors.selectSelectedJob); }
  isLoading()            { return this.store.select(JobSelectors.selectJobsLoading); }
  getJobsByStatus()      { return this.store.select(JobSelectors.selectJobsByStatus); }
  getResponseRate()      { return this.store.select(JobSelectors.selectResponseRate); }
  getApplicationsPerWeek() { return this.store.select(JobSelectors.selectApplicationsPerWeek); }
  getAvgDaysToResponse() { return this.store.select(JobSelectors.selectAvgDaysToResponse); }
  getTotalJobs()         { return this.store.select(JobSelectors.selectTotalJobs); }

  loadAll(): void {
    this.store.dispatch(JobActions.loadJobs());
  }

  addJob(partial: Omit<Job, 'id' | 'lastUpdated'>): void {
    const job: Job = {
      ...partial,
      id: uuidv4(),
      lastUpdated: dayjs().toISOString(),
    };
    this.store.dispatch(JobActions.addJob({ job }));
  }

  updateJob(job: Job): void {
    const updated: Job = {
      ...job,
      lastUpdated: dayjs().toISOString(),
    };
    this.store.dispatch(JobActions.updateJob({ job: updated }));
  }

  deleteJob(id: string): void {
    this.store.dispatch(JobActions.deleteJob({ id }));
  }

  setFilters(filters: Partial<JobFilters>): void {
    this.store.dispatch(JobActions.setFilters({ filters }));
  }

  resetFilters(): void {
    this.store.dispatch(JobActions.resetFilters());
  }

  selectJob(id: string): void {
    this.store.dispatch(JobActions.selectJob({ id }));
  }

  deselectJob(): void {
    this.store.dispatch(JobActions.deselectJob());
  }

  seedDemoData(): void {
    const today = dayjs();
    const demoJobs: Omit<Job, 'id' | 'lastUpdated'>[] = [
      {
        company: 'Google',
        role: 'Angular Developer',
        status: 'interview',
        source: 'linkedin',
        appliedDate: today.subtract(12, 'day').toISOString(),
        remote: true,
        location: 'Remote',
      },
      {
        company: 'Microsoft',
        role: 'Frontend Engineer',
        status: 'phone_screen',
        source: 'company_website',
        appliedDate: today.subtract(8, 'day').toISOString(),
        remote: false,
        location: 'Seattle, WA',
      },
      {
        company: 'Stripe',
        role: 'UI Engineer',
        status: 'applied',
        source: 'referral',
        appliedDate: today.subtract(5, 'day').toISOString(),
        remote: true,
        location: 'Remote',
      },
      {
        company: 'Shopify',
        role: 'Full Stack Developer',
        status: 'rejected',
        source: 'indeed',
        appliedDate: today.subtract(20, 'day').toISOString(),
        remote: true,
        location: 'Remote',
      },
      {
        company: 'Vercel',
        role: 'Frontend Developer',
        status: 'offer',
        source: 'linkedin',
        appliedDate: today.subtract(30, 'day').toISOString(),
        remote: true,
        location: 'Remote',
        salary: { min: 120000, max: 150000, currency: 'USD' },
      },
      {
        company: 'Netflix',
        role: 'Senior UI Engineer',
        status: 'wishlist',
        source: 'glassdoor',
        appliedDate: today.toISOString(),
        remote: false,
        location: 'Los Gatos, CA',
      },
    ];
    demoJobs.forEach(j => this.addJob(j));
  }
}
