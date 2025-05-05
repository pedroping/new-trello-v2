import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
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
import { ScrollActionsService } from '../../services/scroll-actions/scroll-actions.service';

const SIZE_GAP = 200;

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

        const rightSize = window.innerWidth - SIZE_GAP;

        if (moveEvent.x <= SIZE_GAP) {
          if (this.leftHasStart) {
            this.rightHasStart = false;
            this.rightDestroyEvents$.next();

            return;
          }

          this.leftHasStart = true;
          this.rightDestroyEvents$.next();

          this.startLeftEvent();

          return;
        }

        if (moveEvent.x >= rightSize) {
          if (this.rightHasStart) {
            this.leftHasStart = false;
            this.leftDestroyEvents$.next();

            return;
          }

          this.rightHasStart = true;
          this.leftDestroyEvents$.next();

          this.startRightEvent();

          return;
        }

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
        this.scrollElement.scrollLeft -= 2;
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
        this.scrollElement.scrollLeft += 2;
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