import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  filter,
  map,
  skip,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
  timer,
} from 'rxjs';
import { IDragMoveEvent } from '../../interfaces/card.interfaces';
import { IList } from '../../interfaces/list.interfaces';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { ScrollActionsService } from '../../services/scroll-actions/scroll-actions.service';

const SIZE_GAP = 200;

@Directive({
  selector: '[cardAutoScroll]',
})
export class CardAutoScrollDirective implements OnInit, OnDestroy {
  list = input.required<IList>();

  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly scrollElement = inject(ElementRef)
    .nativeElement as HTMLElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollActionsService = inject(ScrollActionsService);

  private upHasStart = false;
  private downHasStart = false;
  private destroyEvents$ = new Subject<void>();
  upPlusMovement = 0;
  downPlusMovement = 0;

  ngOnInit(): void {
    this.boardEnvironmentEventsService.actualCardMoving$$
      .pipe(
        skip(1),
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.downHasStart = false;
          this.upHasStart = false;
          this.destroyEvents$.next();
        }),
        switchMap((cardEvent) => {
          return this.boardEnvironmentEventsService.cardMoveEvent$$.pipe(
            filter(Boolean),
            throttleTime(10),
            takeUntilDestroyed(this.destroyRef),
            filter(() => cardEvent?.listId == this.list().id),
            map((moveEvent) => ({ cardEvent, moveEvent })),
          );
        }),
        filter(Boolean),
        filter((event) => event.cardEvent?.listId == this.list().id),
      )
      .subscribe(({ moveEvent, cardEvent }) => {
        const downSize = window.innerHeight - SIZE_GAP;

        if (moveEvent.y <= SIZE_GAP) {
          const per = (moveEvent.y * 100) / SIZE_GAP;
          this.upPlusMovement = 3 - 3 * (per / 100);

          if (this.upHasStart) {
            this.downHasStart = false;
            this.downPlusMovement = 0;
            return;
          }

          this.upHasStart = true;
          this.destroyEvents$.next();
          this.startUpEvent(cardEvent);

          return;
        }

        if (moveEvent.y >= downSize) {
          const per =
            ((moveEvent.y - downSize) * 100) / (window.innerHeight - downSize);
          this.downPlusMovement = 3 * (per / 100);

          if (this.downHasStart) {
            this.upHasStart = false;
            this.upPlusMovement = 0;
            return;
          }

          this.downHasStart = true;
          this.destroyEvents$.next();
          this.startDownEvent(cardEvent);

          return;
        }

        this.upPlusMovement = 0;
        this.downPlusMovement = 0;
        this.upHasStart = false;
        this.downHasStart = false;
        this.destroyEvents$.next();
      });
  }

  private startUpEvent(cardEvent: IDragMoveEvent | null) {
    const contentElement = this.scrollElement.children[1];

    timer(0, 5)
      .pipe(takeUntil(this.destroyEvents$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        contentElement.scrollTop += -Math.ceil(1 + this.upPlusMovement);
        this.scrollActionsService.setScrollEvent(cardEvent);
      });
  }

  private startDownEvent(cardEvent: IDragMoveEvent | null) {
    const contentElement = this.scrollElement.children[1];

    timer(0, 5)
      .pipe(takeUntil(this.destroyEvents$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        contentElement.scrollTop += Math.ceil(1 + this.downPlusMovement);
        this.scrollActionsService.setScrollEvent(cardEvent);
      });
  }

  ngOnDestroy(): void {
    this.destroyEvents$.next();
  }
}
