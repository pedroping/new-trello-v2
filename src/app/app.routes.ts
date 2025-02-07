import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: async () => await import('./domain/home/routes'),
  },
  {
    path: 'test',
    loadChildren: async () => await import('./domain/test-page/routes'),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
