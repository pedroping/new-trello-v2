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
import { switchMap, take, tap, timer } from 'rxjs';
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
    this.elementRef.style.transition = 'all 200ms ease-in-out';
    this.cardDataService.cardClone.parentElement!.style.transition =
      'all 200ms ease-in-out';
    this.cardDataService.cardClone.style.transition = 'all 200ms ease-in-out';

    const parentElement = this.cardDataService.cardClone
      .parentElement as HTMLElement;

    const previewElementId = Array.from(parentElement.children)
      .filter(
        (element) =>
          element != this.elementRef &&
          element != this.cardDataService.cardClone,
      )
      .indexOf(this.boardEnvironmentEventsService.cardPreviewElement);
    const previewElementRect =
      this.boardEnvironmentEventsService.cardPreviewElement.getBoundingClientRect();

    this.cardDataService.cardClone.style.transform = 'rotate(0deg)';
    this.cardDataService.cardClone.style.left = previewElementRect.x + 'px';
    this.cardDataService.cardClone.style.top = previewElementRect.y - 5 + 'px';

    timer(200)
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

          Array.from(parentElement.children).forEach((_element) => {
            const element = _element as HTMLElement;
            element.style.transition = 'all 5ms ease-in-out';
            element.style.transform = 'translateY(0px)';
          });
        }),
        switchMap(() =>
          timer(5).pipe(
            take(1),
            tap(() => {
              this.boardEnvironmentDataService.moveCard(
                this.cardDataService.card.id,
                this.cardDataService.card.listId,
                previewElementId,
              );
            }),
            switchMap(() => timer(5).pipe(take(1))),
          ),
        ),
      )
      .subscribe(() => {
        this.elementRef.style.display = 'block';

        this.cardDataService.cardClone.parentElement!.removeChild(
          this.cardDataService.cardClone,
        );
      });
  }
}
