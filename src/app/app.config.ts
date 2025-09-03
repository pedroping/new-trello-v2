import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { ChunckErrorHandleService, VersionCheckService } from '@new-trello-v2/version-checker';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withViewTransitions()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideClientHydration(withEventReplay()),
    {
      provide: ErrorHandler,
      useClass: ChunckErrorHandleService,
    },
    provideAppInitializer(() => {
      return inject(VersionCheckService).start();
    }),
  ],
};
