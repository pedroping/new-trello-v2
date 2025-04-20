import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BoardEnvironmentEventsService,
  ListStoreService
} from '@new-trello-v2/drag-and-drop-data';
import { throttleTime } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CardDataService } from '../../services/card-data/card-data.service';

@Directive({
  selector: '[cardMove]',
})
export class CardMoveDirective implements OnInit {
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly listDataService = inject(ListStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly cardActionsService = inject(CardActionsService);
  private readonly cardDataHandleService = inject(CardDataService);

  ngOnInit(): void {
    this.boardEnvironmentEventsService
      .getGlobalMouseMoveEvent$(this.cardDataHandleService.card.id, 'card')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.moveEventHandle(event.x, event.y);
      });

    this.listDataService.scrollEvent$$
      .pipe(takeUntilDestroyed(this.destroyRef), throttleTime(200))
      .subscribe(() => {
        if (
          this.boardEnvironmentEventsService.onCardUpStart ||
          this.boardEnvironmentEventsService.cardMoveEvent == null ||
          this.boardEnvironmentEventsService.actualCardMoving == null ||
          this.boardEnvironmentEventsService.actualCardMoving.id !=
            this.cardDataHandleService.card.id
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

    this.cardDataHandleService.actualXPosition = x;
    this.cardDataHandleService.actualYPosition = y;

    this.listElements.listElementRef.style.zIndex = '20';
    this.elementRef.parentElement!.style.zIndex = '20';
    this.elementRef.style.transform = 'rotate(2deg)';
    this.elementRef.style.top = y - this.cardDataHandleService.initialY + 'px';
    this.elementRef.style.left = x - this.cardDataHandleService.initialX + 'px';

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterCardElement(
        this.listElements.ulElement,
        y,
        this.elementRef,
      );

    this.cardActionsService.handleCardsTransform(
      this.elementRef,
      this.listElements.ulElement,
      afterElement,
      true,
    );

    this.boardEnvironmentEventsService.cardMoveEvent = { x, y };
  }
}
