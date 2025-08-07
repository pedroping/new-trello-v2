import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  filter,
  map,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
  timer,
} from 'rxjs';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { ScrollActionsService } from '../../services/scroll-actions/scroll-actions.service';

@Directive({
  selector: '[autoScroll]',
})
export class AutoScrollDirective implements OnInit, OnDestroy {
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly destroyRef = inject(DestroyRef);

  private leftHasStart = false;
  private rightHasStart = false;
  private rightDestroyEvents$ = new Subject<void>();
  private leftDestroyEvents$ = new Subject<void>();
  private readonly scrollElement = inject(ElementRef)
    .nativeElement as HTMLElement;
  private readonly scrollActionsService = inject(ScrollActionsService);

  leftPlusMovement = 0;
  rightPlusMovement = 0;

  ngOnInit() {
    const cardMoveEvent$ =
      this.boardEnvironmentEventsService.cardMoveEvent$$.pipe(
        startWith(this.boardEnvironmentEventsService.cardMoveEvent),
      );
    const listMoveEvent$ =
      this.boardEnvironmentEventsService.listMoveEvent$$.pipe(
        startWith(this.boardEnvironmentEventsService.listMoveEvent),
      );

    const cardStartEvent$ =
      this.boardEnvironmentEventsService.actualCardMoving$$.pipe(
        startWith(this.boardEnvironmentEventsService.actualCardMoving),
      );
    const listStartEvent$ =
      this.boardEnvironmentEventsService.actualListMoving$$.pipe(
        startWith(this.boardEnvironmentEventsService.actualListMoving),
      );

    combineLatest([cardStartEvent$, listStartEvent$])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(([cardStartEvent, listStartEvent]) => {
          if (!cardStartEvent && !listStartEvent) {
            this.rightDestroyEvents$.next();
            this.leftDestroyEvents$.next();
          }
        }),
        filter(
          ([cardStartEvent, listStartEvent]) =>
            !!cardStartEvent || !!listStartEvent,
        ),
        switchMap(([cardStartEvent, listStartEvent]) => {
          return combineLatest([cardMoveEvent$, listMoveEvent$]).pipe(
            filter(
              ([cardMoveEvent, listMoveEvent]) =>
                !!cardMoveEvent || !!listMoveEvent,
            ),
            throttleTime(10),
            takeUntilDestroyed(this.destroyRef),
            map(([cardMoveEvent, listMoveEvent]) => ({
              cardMoveEvent,
              listMoveEvent,
              cardStartEvent,
              listStartEvent,
            })),
          );
        }),
      )
      .subscribe(({ cardMoveEvent, listMoveEvent }) => {
        const moveEvent = cardMoveEvent || listMoveEvent;

        if (!moveEvent) return;

        const SIZE_GAP = Math.min(200, window.innerWidth * 0.2);

        const rightSize = window.innerWidth - SIZE_GAP;

        if (moveEvent.x <= SIZE_GAP) {
          const per = (moveEvent.x * 100) / SIZE_GAP;
          this.leftPlusMovement = 3 - 3 * (per / 100);

          if (this.leftHasStart) {
            this.rightHasStart = false;
            this.rightPlusMovement = 0;
            this.rightDestroyEvents$.next();

            return;
          }

          this.leftHasStart = true;
          this.rightDestroyEvents$.next();

          this.startLeftEvent();

          return;
        }

        if (moveEvent.x >= rightSize) {
          const per =
            ((moveEvent.x - rightSize) * 100) /
            (window.innerWidth - rightSize);
          this.rightPlusMovement = 3 * (per / 100);

          if (this.rightHasStart) {
            this.leftHasStart = false;
            this.leftPlusMovement = 0;
            this.leftDestroyEvents$.next();

            return;
          }

          this.rightHasStart = true;
          this.leftDestroyEvents$.next();

          this.startRightEvent();

          return;
        }

        this.rightPlusMovement = 0;
        this.leftPlusMovement = 0;
        this.leftHasStart = false;
        this.rightHasStart = false;

        this.rightDestroyEvents$.next();
        this.leftDestroyEvents$.next();
      });
  }

  private startLeftEvent() {
    timer(0, 5)
      .pipe(
        takeUntil(this.leftDestroyEvents$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.scrollElement.scrollLeft -= Math.ceil(2 + this.leftPlusMovement);
        this.scrollActionsService.setGlobalScrollEvent(
          this.scrollElement.scrollLeft,
        );
      });
  }

  private startRightEvent() {
    timer(0, 5)
      .pipe(
        takeUntil(this.rightDestroyEvents$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.scrollElement.scrollLeft += Math.ceil(2 + this.rightPlusMovement);
        this.scrollActionsService.setGlobalScrollEvent(
          this.scrollElement.scrollLeft,
        );
      });
  }

  ngOnDestroy(): void {
    this.rightDestroyEvents$.next();
    this.leftDestroyEvents$.next();
  }
}
