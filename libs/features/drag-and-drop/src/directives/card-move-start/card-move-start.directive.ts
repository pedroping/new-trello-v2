import {
  Directive,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';
import {
  BoardEnvironmentEventsService
} from '@new-trello-v2/drag-and-drop-data';
import { take, timer } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CardDataService } from '../../services/card-data/card-data.service';

@Directive({
  selector: '[cardMoveStart]',
})
export class CardMoveStartDirective {
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly cardActionsService = inject(CardActionsService);
  private readonly cardDataService = inject(CardDataService);
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onCardUpStart) return;

    this.boardEnvironmentEventsService.onCardUpStart = true;

    this.startDownEvent(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event']) onTouchDown(event: TouchEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onCardUpStart) return;

    const touch = event.touches[0];
    this.boardEnvironmentEventsService.onCardUpStart = true;

    timer(500)
      .pipe(take(1))
      .subscribe(() => {
        if (!this.boardEnvironmentEventsService.onCardUpStart) return;

        this.startDownEvent(touch.pageX, touch.pageY);
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.onCardUpStart = true;

    const cardRect = this.elementRef.getBoundingClientRect();

    this.boardEnvironmentEventsService.setCardPreviewSize({
      height: cardRect.height,
      width: cardRect.width,
    });

    this.listElements.ulElement.style.minHeight =
      this.listElements.ulElement.offsetHeight + 'px';

    this.listElements.ulElement.style.maxHeight =
      this.listElements.ulElement.offsetHeight + 'px';

    this.elementRef.style.zIndex = '20';
    this.elementRef.style.top = 'unset';
    this.elementRef.style.left = 'unset';
    this.elementRef.style.position = 'fixed';
    this.elementRef.style.width = cardRect.width + 'px';
    this.elementRef.style.transform = 'rotate(2deg)';
    this.elementRef.style.transition = 'none';

    this.cardDataService.actualYPosition = y;
    this.cardDataService.initialX = x - cardRect.x;
    this.cardDataService.initialY = y - cardRect.y;

    this.elementRef.style.top = y - this.cardDataService.initialY + 'px';
    this.elementRef.style.left = x - this.cardDataService.initialX + 'px';

    this.cardActionsService.handleCardsTransform(
      this.elementRef,
      this.elementRef.parentElement as HTMLElement,
      this.elementRef.nextElementSibling,
    );

    this.boardEnvironmentEventsService.actualCardMoving = {
      id: this.cardDataService.card.id,
      listId: this.cardDataService.card.listId,
      element: this.elementRef,
      type: 'card',
    };
    this.boardEnvironmentEventsService.onCardUpStart = false;
  }
}
