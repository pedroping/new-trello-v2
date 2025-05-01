import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
import { merge, throttleTime } from 'rxjs';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CardDataService } from '../../services/card-data/card-data.service';
import { ListDataService } from '../../services/list-data/list-data.service';

@Directive({
  selector: '[cardMove]',
})
export class CardMoveDirective implements OnInit {
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly cardActionsService = inject(CardActionsService);
  private readonly listDataService = inject(ListDataService);
  private readonly cardDataService = inject(CardDataService);

  ngOnInit(): void {
    this.boardEnvironmentEventsService
      .getGlobalMouseMoveEvent$(this.cardDataService.card.id, 'card')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.moveEventHandle(event.x, event.y);
      });

    merge(
      this.listDataService.scrollEvent$$,
      this.boardEnvironmentEventsService.globalScrollEvent$$,
    )
      .pipe(takeUntilDestroyed(this.destroyRef), throttleTime(20))
      .subscribe(() => {
        if (
          this.boardEnvironmentEventsService.onCardUpStart ||
          this.boardEnvironmentEventsService.cardMoveEvent == null ||
          this.boardEnvironmentEventsService.actualCardMoving == null ||
          this.boardEnvironmentEventsService.actualCardMoving.id !=
            this.cardDataService.card.id
        )
          return;

        this.moveEventHandle(
          this.boardEnvironmentEventsService.cardMoveEvent.x,
          this.boardEnvironmentEventsService.cardMoveEvent.y,
        );
      });
  }

  private moveEventHandle(x: number, y: number) {
    if (
      this.boardEnvironmentEventsService.onCardUpStart ||
      !this.boardEnvironmentEventsService.actualCardMoving
    )
      return;

    this.cardDataService.actualXPosition = x;
    this.cardDataService.actualYPosition = y;

    this.cardDataService.cardClone.style.transition = 'none';
    this.cardDataService.cardClone.parentElement!.style.zIndex = '20';
    this.cardDataService.cardClone.style.transform = 'rotate(2deg)';
    this.cardDataService.cardClone.style.top =
      y - this.cardDataService.initialY + 'px';
    this.cardDataService.cardClone.style.left =
      x - this.cardDataService.initialX + 'px';

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterCardElement(
        this.cardDataService.cardClone.parentElement as HTMLElement,
        y,
        this.cardDataService.cardClone,
      );

    this.cardActionsService.handleCardsTransform(
      this.cardDataService.cardClone,
      this.elementRef,
      this.cardDataService.cardClone.parentElement as HTMLElement,
      afterElement,
      true,
    );

    this.boardEnvironmentEventsService.cardMoveEvent = { x, y };
  }
}
