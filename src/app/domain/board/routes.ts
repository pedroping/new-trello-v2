import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: async () =>
      (await import('./board-page/board-page.component')).BoardPageComponent,
  },
] as Routes;
