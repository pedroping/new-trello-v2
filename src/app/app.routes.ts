import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: async () => await import('./domain/home/routes'),
  },
  {
    path: 'board',
    loadChildren: async () => await import('./domain/board/routes'),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
