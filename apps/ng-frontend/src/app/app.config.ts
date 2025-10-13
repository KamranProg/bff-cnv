import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';
import {
  provideHttpClient,
  withXsrfConfiguration,
  withFetch,
} from '@angular/common/http';
import { AuthStore } from './core/auth/auth.store';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()), // withDebugTracing()) good for development will be removed in production
    provideHttpClient(
      withFetch(), // optional but recommended
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
    provideAppInitializer(() => {
      // Constructing AuthStore triggers: GET /api/me → init Convex → ensure user
      inject(AuthStore);
    }),
  ],
};
