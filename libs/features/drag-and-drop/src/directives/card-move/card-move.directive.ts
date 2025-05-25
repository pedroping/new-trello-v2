import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, throttleTime } from 'rxjs';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CardDataService } from '../../services/card-data/card-data.service';
import { ScrollActionsService } from '../../services/scroll-actions/scroll-actions.service';

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
  private readonly cardDataService = inject(CardDataService);
  private readonly scrollActionsService = inject(ScrollActionsService);

  ngOnInit(): void {
    merge(
      this.boardEnvironmentEventsService.getGlobalTouchMoveEvent$(
        this.cardDataService.card.id,
        'card',
      ),
      this.boardEnvironmentEventsService.getGlobalMouseMoveEvent$(
        this.cardDataService.card.id,
        'card',
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.moveEventHandle(event.x, event.y);
      });

    merge(
      this.scrollActionsService.scrollEvent$$,
      this.scrollActionsService.globalScrollEvent$$,
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

    if (!this.cardDataService.cardClone) return;

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
    this.boardEnvironmentEventsService.onCardUpStart = false;
  }
}
