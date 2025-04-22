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
  BoardEnvironmentEventsService,
  ListStoreService,
} from '@new-trello-v2/drag-and-drop-data';
import { IList } from '@new-trello-v2/types-interfaces';
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
  private readonly listDataService = inject(ListStoreService);

  private upHasStart = false;
  private downHasStart = false;
  private destroyEvents$ = new Subject<void>();

  ngOnInit(): void {
    this.boardEnvironmentEventsService.actualCardMoving$$
      .pipe(
        skip(1),
        takeUntilDestroyed(this.destroyRef),
        tap((event) => {
          if (!event) this.destroyEvents$.next();
        }),
        switchMap((cardEvent) => {
          return this.boardEnvironmentEventsService.cardMoveEvent$$.pipe(
            filter(Boolean),
            throttleTime(10),
            takeUntilDestroyed(this.destroyRef),
            map((moveEvent) => ({ cardEvent, moveEvent })),
          );
        }),
        filter(Boolean),
        filter((event) => event.cardEvent?.listId == this.list().id),
      )
      .subscribe(({ moveEvent }) => {
        const downSize = window.innerHeight - SIZE_GAP;

        if (moveEvent.y <= SIZE_GAP) {
          if (this.upHasStart) {
            this.downHasStart = false;
            return;
          }

          this.upHasStart = true;
          this.destroyEvents$.next();
          this.startUpEvent();

          return;
        }

        if (moveEvent.y >= downSize) {
          if (this.downHasStart) {
            this.upHasStart = false;
            return;
          }

          this.downHasStart = true;
          this.destroyEvents$.next();
          this.startDownEvent();

          return;
        }

        this.upHasStart = false;
        this.downHasStart = false;
        this.destroyEvents$.next();
      });
  }

  private startUpEvent() {
    const contentElement = this.scrollElement.children[1];

    timer(0, 10)
      .pipe(takeUntil(this.destroyEvents$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        contentElement.scrollTop += -1;
        this.listDataService.setScrollEvent(contentElement.scrollTop);
      });
  }

  private startDownEvent() {
    const contentElement = this.scrollElement.children[1];

    timer(0, 10)
      .pipe(takeUntil(this.destroyEvents$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        contentElement.scrollTop += 1;
        this.listDataService.setScrollEvent(contentElement.scrollTop);
      });
  }

  ngOnDestroy(): void {
    this.destroyEvents$.next();
  }
}
