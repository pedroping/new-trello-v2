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
  BoardEnvironmentStoreService,
} from '@new-trello-v2/drag-and-drop-data';
import { fromEvent, merge, switchMap, take, tap, timer } from 'rxjs';
import { CardDataService } from '../../services/card-data/card-data.service';

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

    this.boardEnvironmentEventsService.cardPreviewElement.style.zIndex = '0';
    this.elementRef.style.transition = 'none';
    this.elementRef.style.position = 'fixed';
    this.elementRef.style.display = 'block';
    this.elementRef.style.opacity = '0';
    this.cardDataService.cardClone.style.transition = 'all 200ms ease-in-out';

    const parentElement = this.cardDataService.cardClone
      .parentElement as HTMLElement;

    const previewElementId = this.getAllCardsList(parentElement).indexOf(
      this.boardEnvironmentEventsService.cardPreviewElement,
    );

    const previewElementRect =
      this.boardEnvironmentEventsService.cardPreviewElement.getBoundingClientRect();

    this.cardDataService.cardClone.style.transform = 'rotate(0deg)';
    this.cardDataService.cardClone.style.left = previewElementRect.x + 'px';
    this.cardDataService.cardClone.style.top = previewElementRect.y - 5 + 'px';

    this.elementRef.style.left = previewElementRect.x + 'px';
    this.elementRef.style.top = previewElementRect.y - 5 + 'px';
    this.elementRef.style.width = previewElementRect.width + 'px';

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
        this.getAllCardsList(parentElement, true).forEach((_element, i) => {
          const element = _element as HTMLElement;

          if (i < previewElementId) return;

          element.style.transition = 'none';

          const rect = element.getBoundingClientRect();

          element.style.top = (i + 1) * 43 + 5 + 'px';
          element.style.width = rect.width + 'px';

          element.style.transform = 'translateY(0px)';
        });

        this.getAllCardsList(parentElement, true).forEach((_element, i) => {
          if (i < previewElementId) return;
          const element = _element as HTMLElement;

          element.style.position = 'absolute';
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

        this.getAllCardsList(parentElement, true).forEach((_element) => {
          const element = _element as HTMLElement;
          element.style.position = 'static';
          element.style.top = '';
          element.style.left = '';
          element.style.transition = 'none';
        });
        this.elementRef.style.top = '';
        this.elementRef.style.left = '';
        this.elementRef.style.transition = 'none';

        if (!isSameList)
          this.cardDataService.cardClone.parentElement!.removeChild(
            this.cardDataService.cardClone,
          );
      });
  }

  getAllCardsList(parentElement: HTMLElement, filterById = false) {
    if (filterById)
      return Array.from(parentElement.children).filter(
        (element) =>
          element != this.elementRef &&
          element.getAttribute('card-id') !=
            this.cardDataService.card.id.toString() &&
          element != this.cardDataService.cardClone,
      );

    return Array.from(parentElement.children).filter(
      (element) =>
        element != this.elementRef && element != this.cardDataService.cardClone,
    );
  }
}
