import { createAction, props } from '@ngrx/store';
import { Job, JobFilters } from '../../models/job.model';

export const loadJobs        = createAction('[Jobs] Load Jobs');
export const loadJobsSuccess = createAction('[Jobs] Load Jobs Success', props<{ jobs: Job[] }>());
export const loadJobsFailure = createAction('[Jobs] Load Jobs Failure', props<{ error: string }>());

export const addJob    = createAction('[Jobs] Add Job',    props<{ job: Job }>());
export const updateJob = createAction('[Jobs] Update Job', props<{ job: Job }>());
export const deleteJob = createAction('[Jobs] Delete Job', props<{ id: string }>());

export const setFilters   = createAction('[Jobs] Set Filters',   props<{ filters: Partial<JobFilters> }>());
export const resetFilters = createAction('[Jobs] Reset Filters');

export const selectJob   = createAction('[Jobs] Select Job',   props<{ id: string }>());
export const deselectJob = createAction('[Jobs] Deselect Job');
