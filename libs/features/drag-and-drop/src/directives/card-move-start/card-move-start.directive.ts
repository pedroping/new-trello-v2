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
  private readonly cardDataHandleService = inject(CardDataService);
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onUpStart) return;

    this.boardEnvironmentEventsService.onUpStart = true;

    this.startDownEvent(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event']) onTouchDown(event: TouchEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onUpStart) return;

    const touch = event.touches[0];
    this.boardEnvironmentEventsService.onUpStart = true;

    timer(500)
      .pipe(take(1))
      .subscribe(() => {
        if (!this.boardEnvironmentEventsService.onUpStart) return;

        this.startDownEvent(touch.pageX, touch.pageY);
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.onUpStart = true;

    const cardRect = this.elementRef.getBoundingClientRect();

    this.boardEnvironmentEventsService.setPreviewSize({
      height: cardRect.height,
      width: cardRect.width,
    });

    this.listElements.ulElement.style.minHeight =
      this.listElements.ulElement.offsetHeight + 'px';

    this.listElements.ulElement.style.maxHeight =
      this.listElements.ulElement.offsetHeight + 'px';

    const rect = this.elementRef.getBoundingClientRect();

    this.elementRef.style.zIndex = '20';
    this.elementRef.style.top = 'unset';
    this.elementRef.style.left = 'unset';
    this.elementRef.style.position = 'fixed';
    this.elementRef.style.width = rect.width + 'px';
    this.elementRef.style.transform = 'rotate(2deg)';
    this.elementRef.style.transition = 'none';

    this.cardDataHandleService.actualYPosition = y;
    this.cardDataHandleService.initialX = x - rect.x;
    this.cardDataHandleService.initialY = y - rect.y;

    this.elementRef.style.top = y - this.cardDataHandleService.initialY + 'px';
    this.elementRef.style.left = x - this.cardDataHandleService.initialX + 'px';

    this.cardActionsService.handleCardsTransform(
      this.elementRef,
      this.listElements.ulElement,
      this.elementRef.nextElementSibling,
    );

    this.boardEnvironmentEventsService.actualCardMoving = {
      id: this.cardDataHandleService.card.id,
      listId: this.cardDataHandleService.card.listId,
      element: this.elementRef,
      type: 'card',
    };
    this.boardEnvironmentEventsService.onUpStart = false;
  }
}
