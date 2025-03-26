import { Directive, input } from '@angular/core';
import { IList } from '@new-trello-v2/types-interfaces';

@Directive({
  selector: '[listMove]',
})
export class ListMoveDirective {
  list = input.required<IList>();
}
