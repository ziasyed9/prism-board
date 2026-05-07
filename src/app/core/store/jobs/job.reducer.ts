import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Job, JobFilters } from '../../models/job.model';
import * as JobActions from './job.actions';

export const adapter: EntityAdapter<Job> = createEntityAdapter<Job>();

export interface JobState extends EntityState<Job> {
  loading: boolean;
  error: string | null;
  selectedJobId: string | null;
  filters: JobFilters;
}

const defaultFilters: JobFilters = {
  status: 'all',
  source: 'all',
  remote: 'all',
  searchQuery: '',
  dateRange: { start: null, end: null },
};

export const initialState: JobState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedJobId: null,
  filters: defaultFilters,
});

export const jobReducer = createReducer(
  initialState,

  on(JobActions.loadJobs, state => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(JobActions.loadJobsSuccess, (state, { jobs }) =>
    adapter.setAll(jobs, { ...state, loading: false })
  ),

  on(JobActions.loadJobsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(JobActions.addJob,    (state, { job }) => adapter.addOne(job, state)),
  on(JobActions.updateJob, (state, { job }) => adapter.upsertOne(job, state)),
  on(JobActions.deleteJob, (state, { id })  => adapter.removeOne(id, state)),

  on(JobActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  on(JobActions.resetFilters, state => ({
    ...state,
    filters: defaultFilters,
  })),

  on(JobActions.selectJob,   (state, { id }) => ({ ...state, selectedJobId: id })),
  on(JobActions.deselectJob, state           => ({ ...state, selectedJobId: null })),
);
