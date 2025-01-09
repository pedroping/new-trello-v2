import { Component, input } from '@angular/core';
import { ICard } from '@new-trello-v2/types-interfaces';
import { ListCardMoveDirective } from '../../directives/list-card-move/list-card-move.directive';

@Component({
  selector: '[lib-list-card]',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
  hostDirectives: [
    {
      directive: ListCardMoveDirective,
      inputs: ['card'],
    },
  ],
})
export class ListCardComponent {
  card = input.required<ICard>();
}
