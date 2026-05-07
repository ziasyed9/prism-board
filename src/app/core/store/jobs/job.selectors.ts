import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JobState, adapter } from './job.reducer';
import dayjs from 'dayjs';

export const selectJobState = createFeatureSelector<JobState>('jobs');

const { selectAll, selectEntities, selectTotal } = adapter.getSelectors();

export const selectAllJobs       = createSelector(selectJobState, selectAll);
export const selectJobEntities   = createSelector(selectJobState, selectEntities);
export const selectTotalJobs     = createSelector(selectJobState, selectTotal);
export const selectJobsLoading   = createSelector(selectJobState, s => s.loading);
export const selectJobFilters    = createSelector(selectJobState, s => s.filters);
export const selectSelectedJobId = createSelector(selectJobState, s => s.selectedJobId);

export const selectFilteredJobs = createSelector(
  selectAllJobs,
  selectJobFilters,
  (jobs, filters) => {
    return jobs.filter(job => {
      if (filters.status !== 'all' && job.status !== filters.status) return false;
      if (filters.source !== 'all' && job.source !== filters.source) return false;
      if (filters.remote !== 'all' && job.remote !== filters.remote) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          job.company.toLowerCase().includes(q) ||
          job.role.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }
);

export const selectJobsByStatus = createSelector(selectAllJobs, jobs => {
  const counts: Record<string, number> = {};
  jobs.forEach(j => {
    counts[j.status] = (counts[j.status] || 0) + 1;
  });
  return counts;
});

export const selectResponseRate = createSelector(selectAllJobs, jobs => {
  const applied   = jobs.filter(j => j.status !== 'wishlist').length;
  const responded = jobs.filter(j =>
    ['phone_screen', 'interview', 'offer', 'rejected'].includes(j.status)
  ).length;
  return applied > 0 ? Math.round((responded / applied) * 100) : 0;
});

export const selectApplicationsPerWeek = createSelector(selectAllJobs, jobs => {
  const grouped: Record<string, number> = {};
  jobs
    .filter(j => j.status !== 'wishlist')
    .forEach(j => {
      const week = dayjs(j.appliedDate).startOf('week').format('MMM D');
      grouped[week] = (grouped[week] || 0) + 1;
    });
  return Object.entries(grouped)
    .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
    .map(([week, count]) => ({ week, count }));
});

export const selectAvgDaysToResponse = createSelector(selectAllJobs, jobs => {
  const withResponse = jobs.filter(j =>
    j.status !== 'wishlist' &&
    j.status !== 'applied' &&
    j.appliedDate &&
    j.lastUpdated
  );
  if (!withResponse.length) return 0;
  const total = withResponse.reduce((sum, j) => {
    return sum + dayjs(j.lastUpdated).diff(dayjs(j.appliedDate), 'day');
  }, 0);
  return Math.round(total / withResponse.length);
});

export const selectSelectedJob = createSelector(
  selectJobEntities,
  selectSelectedJobId,
  (entities, id) => (id ? entities[id] ?? null : null)
);
