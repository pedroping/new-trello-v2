import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, switchMap, take, tap, timer } from 'rxjs';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { BoardEnvironmentStoreService } from '../../services/board-environment-store/board-environment-store.service';
import { CardDataService } from '../../services/card-data/card-data.service';
import { CardActionsService } from '../../services/card-actions/card-actions.service';
import { CARD_GAP } from '../../interfaces/card.interfaces';

@Directive({
  selector: '[cardMoveStop]',
})
export class CardMoveStopDirective implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cardDataService = inject(CardDataService);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly boardEnvironmentDataService = inject(
    BoardEnvironmentStoreService,
  );
  private readonly cardActionsService = inject(CardActionsService);

  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  ngOnInit(): void {
    merge(
      this.boardEnvironmentEventsService.getGlobalTouchUpEvent$(
        this.cardDataService.card.id,
        'card',
      ),
      this.boardEnvironmentEventsService.getGlobalMouseUpEvent$(
        this.cardDataService.card.id,
        'card',
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.upEventHandle();
      });
  }

  private upEventHandle() {
    this.boardEnvironmentEventsService.actualCardMoving = null;
    this.boardEnvironmentEventsService.cardMoveEvent = null;
    this.boardEnvironmentEventsService.onCardUpStart = false;

    this.boardEnvironmentEventsService.cardPreviewElement.style.zIndex = '0';
    this.elementRef.style.transition = 'none';
    this.elementRef.style.position = 'fixed';
    this.elementRef.style.display = 'block';
    this.elementRef.style.opacity = '0';
    this.cardDataService.cardClone.style.transition = 'all 200ms ease-in-out';

    const parentElement = this.cardDataService.actualListParent.ulElement;

    const previewElementId = this.getAllCardsList(parentElement).indexOf(
      this.boardEnvironmentEventsService.cardPreviewElement,
    );

    const previewElementRect =
      this.boardEnvironmentEventsService.cardPreviewElement.getBoundingClientRect();

    this.cardDataService.cardClone.style.transform = 'rotate(0deg)';
    this.cardDataService.cardClone.style.left = previewElementRect.x + 'px';
    this.cardDataService.cardClone.style.top =
      previewElementRect.y - CARD_GAP + 'px';

    this.elementRef.style.left = previewElementRect.x + 'px';
    this.elementRef.style.top = previewElementRect.y - CARD_GAP + 'px';
    this.elementRef.style.width = previewElementRect.width + 'px';

    document.body.style.cursor = 'default';

    const isSameList =
      this.cardDataService.card.listId.toString() ===
      this.elementRef.getAttribute('list-id');

    if (!isSameList) {
      Array.from(this.elementRef.parentElement!.children).forEach(
        (_element) => {
          const element = _element as HTMLElement;
          element.style.transition = 'none';
        },
      );

      this.elementRef.parentElement?.removeChild(this.elementRef);
    }

    merge(
      fromEvent(this.cardDataService.cardClone, 'transitionend'),
      fromEvent(this.cardDataService.cardClone, 'transitioncancel'),
    )
      .pipe(
        take(1),
        tap(() => {
          if (
            parentElement.contains(
              this.boardEnvironmentEventsService.cardPreviewElement,
            )
          )
            parentElement.removeChild(
              this.boardEnvironmentEventsService.cardPreviewElement,
            );

          this.elementRef.style.opacity = '1';
        }),
        switchMap(() =>
          timer(1).pipe(
            take(1),
            tap(() => {
              if (isSameList)
                this.boardEnvironmentDataService.moveCard(
                  this.cardDataService.card.id,
                  this.cardDataService.card.listId,
                  previewElementId,
                );
            }),
          ),
        ),
      )
      .subscribe(() => {
        this.getAllCardsList(parentElement, true).forEach((element, i) => {
          if (i < previewElementId) return;

          element.style.transition = 'none';
          element.style.position = 'absolute';

          const rect = element.getBoundingClientRect();

          const height = this.cardActionsService.getCardsTotalHeight(
            this.getAllCardsList(parentElement, true) as HTMLElement[],
            i + 1,
          );

          element.style.top = height + CARD_GAP + 'px';
          element.style.width = rect.width + 'px';

          element.style.transform = 'translateY(0px)';
        });

        this.elementRef.style.position = 'static';

        if (isSameList)
          this.cardDataService.cardClone.parentElement!.removeChild(
            this.cardDataService.cardClone,
          );

        if (!isSameList)
          this.boardEnvironmentDataService.moveCard(
            this.cardDataService.card.id,
            this.cardDataService.card.listId,
            previewElementId,
          );

        this.getAllCardsList(parentElement, false).forEach((element) => {
          element.style.position = 'static';
          element.style.top = '';
          element.style.left = '';
          element.style.width = '';
          element.style.transition = 'none';
        });

        if (!isSameList)
          this.cardDataService.cardClone.parentElement!.removeChild(
            this.cardDataService.cardClone,
          );
      });
  }

  getAllCardsList(
    parentElement: HTMLElement,
    filterById = false,
  ): HTMLElement[] {
    if (filterById)
      return Array.from(parentElement.children).filter(
        (element) =>
          element != this.elementRef &&
          element.getAttribute('card-id') !=
            this.cardDataService.card.id.toString() &&
          element != this.cardDataService.cardClone,
      ) as HTMLElement[];

    return Array.from(parentElement.children).filter(
      (element) =>
        element != this.elementRef && element != this.cardDataService.cardClone,
    ) as HTMLElement[];
  }
}
