import {
  animate,
  style,
  transition,
  trigger
} from '@angular/animations';

export const fadeAnimation = trigger('fade', [
  transition('void => *', [
    style({ opacity: 0 }),
    animate(100, style({ opacity: 1 })),
  ]),
  transition('* => void', [animate(100, style({ opacity: 0 }))]),
]);
