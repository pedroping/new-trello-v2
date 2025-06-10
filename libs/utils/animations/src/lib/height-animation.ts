import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const heightAnimation = trigger('heightAnimation', [
  state(
    'void',
    style({
      height: '0px',
      overflow: 'hidden',
    }),
  ),
  transition(':enter', [
    style({ opacity: 0, height: 0, overflow: 'hidden' }),
    animate('250ms', style({ opacity: 1, height: '*', overflow: 'hidden' })),
  ]),
  transition(':leave', [
    style({ opacity: 1, height: '*', overflow: 'hidden' }),
    animate('250ms', style({ opacity: 0, height: 0, overflow: 'hidden' })),
  ]),
]);
