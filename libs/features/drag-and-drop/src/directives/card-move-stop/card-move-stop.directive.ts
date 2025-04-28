import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BoardEnvironmentStoreService,
  BoardEnvironmentEventsService,
} from '@new-trello-v2/drag-and-drop-data';
import { take, timer } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { CardDataService } from '../../services/card-data/card-data.service';

@Directive({
  selector: '[cardMoveStop]',
})
export class CardMoveStopDirective implements OnInit {
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cardDataService = inject(CardDataService);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly boardEnvironmentDataService = inject(
    BoardEnvironmentStoreService,
  );
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  ngOnInit(): void {
    this.boardEnvironmentEventsService
      .getGlobalMouseUpEvent$(this.cardDataService.card.id, 'card')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.upEventHandle();
      });
  }

  private upEventHandle() {
    this.boardEnvironmentEventsService.actualCardMoving = null;
    this.boardEnvironmentEventsService.cardMoveEvent = null;
    this.boardEnvironmentEventsService.onCardUpStart = false;

    this.elementRef.style.transition = 'all 200ms ease-in-out';

    const parentElement = this.elementRef.parentElement as HTMLElement;

    const previewElementId = Array.from(parentElement.children)
      .filter((element) => element != this.elementRef)
      .indexOf(this.boardEnvironmentEventsService.cardPreviewElement);
    const previewElementRect =
      this.boardEnvironmentEventsService.cardPreviewElement.getBoundingClientRect();

    this.boardEnvironmentDataService.moveCard(
      this.cardDataService.card.id,
      this.cardDataService.card.listId,
      previewElementId,
    );

    this.elementRef.style.transform = 'rotate(0deg)';
    this.elementRef.style.left = previewElementRect.x + 'px';
    this.elementRef.style.top = previewElementRect.y - 5 + 'px';

    if (
      parentElement.contains(
        this.boardEnvironmentEventsService.cardPreviewElement,
      )
    )
      parentElement.removeChild(
        this.boardEnvironmentEventsService.cardPreviewElement,
      );

    timer(10)
      .pipe(take(1))
      .subscribe(() => {
        Array.from(parentElement.children).forEach((_element) => {
          const element = _element as HTMLElement;
          element.style.transition = 'none';
          element.style.transform = 'translateY(0px)';
        });

        this.elementRef.style.position = 'static';
        this.elementRef.style.width = '100%';
        this.elementRef.style.zIndex = '2';
        this.elementRef.style.zIndex = '0';
      });
  }
}
