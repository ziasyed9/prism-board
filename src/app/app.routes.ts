import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'Dashboard | Prismboard',
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/job-tracker/pages/job-list/job-list.component')
        .then(m => m.JobListComponent),
    title: 'Job Tracker | Prismboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
