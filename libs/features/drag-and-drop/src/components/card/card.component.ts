import { Component, HostListener, inject, input } from '@angular/core';
import { CardMoveStartDirective } from '../../directives/card-move-start/card-move-start.directive';
import { CardMoveStopDirective } from '../../directives/card-move-stop/card-move-stop.directive';
import { CardMoveDirective } from '../../directives/card-move/card-move.directive';
import { ICard } from '../../interfaces/card.interfaces';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CardDataService } from '../../services/card-data/card-data.service';

@Component({
  selector: '[lib-card]',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  providers: [CardDataService, CardActionsService],
  hostDirectives: [
    CardMoveStartDirective,
    CardMoveDirective,
    CardMoveStopDirective,
  ],
})
export class CardComponent {
  card = input.required<ICard>();
  private readonly cardDataHandleService = inject(CardDataService);

  constructor() {
    this.cardDataHandleService.startDomain(this.card);
  }

  edit(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
