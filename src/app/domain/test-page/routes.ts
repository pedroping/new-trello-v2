import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: async () =>
      (await import('./test/test.component')).TestComponent,
  },
] as Routes;
