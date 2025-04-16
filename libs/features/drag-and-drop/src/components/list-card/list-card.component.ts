import { Component, inject, input } from '@angular/core';
import { ICard } from '@new-trello-v2/types-interfaces';
import { CardMoveStartDirective } from '../../directives/card-move-start/card-move-start.directive';
import { CardMoveStopDirective } from '../../directives/card-move-stop/card-move-stop.directive';
import { CardMoveDirective } from '../../directives/card-move/card-move.directive';
import { CardDataService } from '../../services/card-data/card-data.service';

@Component({
  selector: '[lib-list-card]',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss'],
  providers: [CardDataService],
  hostDirectives: [
    CardMoveDirective,
    CardMoveStartDirective,
    CardMoveStopDirective,
  ],
})
export class ListCardComponent {
  card = input.required<ICard>();

  private readonly cardDataHandleService = inject(CardDataService);

  constructor() {
    this.cardDataHandleService.startDomain(this.card);
  }
}
