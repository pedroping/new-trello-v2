import { Component, input } from '@angular/core';
import { ListMoveDirective } from '../../directives/list-move/list-move.directive';

@Component({
  selector: 'lib-list-header',
  templateUrl: './list-header.component.html',
  styleUrls: ['./list-header.component.scss'],
  hostDirectives: [
    {
      directive: ListMoveDirective,
      inputs: ['list'],
    },
  ],
})
export class ListHeaderComponent {
  headerName = input.required<string>();
}
