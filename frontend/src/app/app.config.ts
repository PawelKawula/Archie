import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { INITIAL_CLUSTER_STATE } from './core/cluster.store';
import { SCENARIOS } from './core/scenarios';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideZonelessChangeDetection(),
    { provide: INITIAL_CLUSTER_STATE, useValue: SCENARIOS.webAndDb },
  ],
};
