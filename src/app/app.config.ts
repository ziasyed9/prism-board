import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter }        from '@angular/router';
import { provideAnimations }    from '@angular/platform-browser/animations';
import { provideStore }         from '@ngrx/store';
import { provideEffects }       from '@ngrx/effects';
import { provideStoreDevtools }  from '@ngrx/store-devtools';
import { provideEcharts }       from 'ngx-echarts';
import { routes }      from './app.routes';
import { jobReducer }  from './core/store/jobs/job.reducer';
import { JobEffects }  from './core/store/jobs/job.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideStore({ jobs: jobReducer }),
    provideEffects([JobEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    provideEcharts(),
  ],
};
