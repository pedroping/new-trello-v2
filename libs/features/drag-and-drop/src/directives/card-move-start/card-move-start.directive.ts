import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { filter, fromEvent, take, timer } from 'rxjs';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CardDataService } from '../../services/card-data/card-data.service';
import { LIST_GAP } from '../../interfaces/list.interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[cardMoveStart]',
})
export class CardMoveStartDirective implements OnInit {
  private readonly cardActionsService = inject(CardActionsService);
  private readonly cardDataService = inject(CardDataService);
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly element = inject(ElementRef).nativeElement as HTMLElement;
  private readonly destroyRef = inject(DestroyRef);

  hasMove = false;
  moveHasStart = false;

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onCardUpStart) return;

    this.boardEnvironmentEventsService.onCardUpStart = true;

    this.startDownEvent(event.clientX, event.clientY);
  }

  ngOnInit(): void {
    fromEvent<TouchEvent>(this.element, 'touchstart', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (this.boardEnvironmentEventsService.onCardUpStart) return;

        const touch = event.touches[0];

        this.hasMove = false;
        this.moveHasStart = true;

        this.boardEnvironmentEventsService
          .getGlobalTouchMoveEventUnFiltered$()
          .pipe(filter(() => this.moveHasStart))
          .subscribe(() => {
            this.hasMove = true;
            this.moveHasStart = false;
          });

        timer(500).subscribe(() => {
          if (this.hasMove) return;

          this.boardEnvironmentEventsService.onCardUpStart = true;

          this.startDownEvent(touch.pageX, touch.pageY);

          this.hasMove = false;
          this.moveHasStart = false;
        });
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.onCardUpStart = true;

    const height = this.cardActionsService.getCardsTotalHeight(
      Array.from(this.elementRef.parentElement!.children).filter(
        (element) =>
          element != this.boardEnvironmentEventsService.cardPreviewElement,
      ) as HTMLElement[],
    );

    this.elementRef.parentElement!.style.maxHeight = height + LIST_GAP + 'px';

    const clone = this.elementRef.cloneNode(true) as HTMLElement;
    this.elementRef.parentElement!.appendChild(clone);
    clone.style.transition = 'none';
    clone.setAttribute('clone', 'true');

    this.cardDataService.cardClone = clone;

    const cardRect = this.elementRef.getBoundingClientRect();

    this.boardEnvironmentEventsService.setCardPreviewSize({
      height: cardRect.height,
      width: cardRect.width,
    });

    const parentElement = this.cardDataService.cardClone
      .parentElement as HTMLElement;

    parentElement.style.minHeight = parentElement.offsetHeight + 'px';

    parentElement.style.maxHeight = parentElement.offsetHeight + 'px';

    this.cardDataService.cardClone.style.zIndex = '20';

    parentElement!.parentElement!.parentElement!.parentElement!.style.zIndex =
      '20';

    this.cardDataService.cardClone.style.top = 'unset';
    this.cardDataService.cardClone.style.left = 'unset';
    this.cardDataService.cardClone.style.position = 'fixed';
    this.cardDataService.cardClone.style.width = cardRect.width + 'px';
    this.cardDataService.cardClone.style.transform = 'rotate(2deg)';
    this.cardDataService.cardClone.style.transition = 'none';

    this.cardDataService.actualYPosition = y;
    this.cardDataService.initialX = x - cardRect.x;
    this.cardDataService.initialY = y - cardRect.y;

    this.cardDataService.cardClone.style.top =
      y - this.cardDataService.initialY + 'px';
    this.cardDataService.cardClone.style.left =
      x - this.cardDataService.initialX + 'px';

    this.elementRef.style.display = 'none';

    document.body.style.cursor = 'grab';

    this.cardActionsService.handleCardsTransform(
      this.cardDataService.cardClone,
      this.elementRef,
      this.cardDataService.cardClone.parentElement as HTMLElement,
      this.elementRef.nextElementSibling,
    );

    timer(10)
      .pipe(take(1))
      .subscribe(() => {
        this.boardEnvironmentEventsService.onCardUpStart = false;

        this.boardEnvironmentEventsService.actualCardMoving = {
          id: this.cardDataService.card.id,
          listId: this.cardDataService.card.listId,
          element: this.cardDataService.cardClone,
          type: 'card',
        };
      });
  }
}
