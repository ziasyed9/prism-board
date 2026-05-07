import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import * as JobActions from './job.actions';
import { Job } from '../../models/job.model';

@Injectable()
export class JobEffects {
  private STORAGE_KEY = 'prismboard_jobs';

  loadJobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.loadJobs),
      switchMap(() => {
        try {
          const raw = localStorage.getItem(this.STORAGE_KEY);
          const jobs: Job[] = raw ? JSON.parse(raw) : [];
          return of(JobActions.loadJobsSuccess({ jobs }));
        } catch {
          return of(JobActions.loadJobsFailure({ error: 'Failed to load jobs' }));
        }
      })
    )
  );

  saveJobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        JobActions.addJob,
        JobActions.updateJob,
        JobActions.deleteJob,
        JobActions.loadJobsSuccess
      ),
      tap(action => {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        let jobs: Job[] = raw ? JSON.parse(raw) : [];

        if (action.type === '[Jobs] Add Job') {
          jobs = [...jobs, action.job];
        } else if (action.type === '[Jobs] Update Job') {
          jobs = jobs.map(j => j.id === action.job.id ? action.job : j);
        } else if (action.type === '[Jobs] Delete Job') {
          jobs = jobs.filter(j => j.id !== action.id);
        } else if (action.type === '[Jobs] Load Jobs Success') {
          jobs = action.jobs;
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));
      })
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions) {}
}
