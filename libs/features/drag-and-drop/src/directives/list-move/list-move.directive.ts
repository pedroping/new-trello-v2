import {
  afterNextRender,
  DestroyRef,
  Directive,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { ListActionsService } from '../../services/list-actions/list-actions.service';
import { ListDataService } from '../../services/list-data/list-data.service';
import { merge, throttleTime } from 'rxjs';
import { ScrollActionsService } from '../../services/scroll-actions/scroll-actions.service';

@Directive({
  selector: '[listMove]',
})
export class ListMoveDirective implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly listDataService = inject(ListDataService);
  private readonly injector = inject(Injector);
  private readonly scrollActionsService = inject(ScrollActionsService);
  private readonly listActionsService = inject(ListActionsService);

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        merge(
          this.boardEnvironmentEventsService.getGlobalTouchMoveEvent$(
            this.listDataService.list.id,
            'list',
          ),
          this.boardEnvironmentEventsService.getGlobalMouseMoveEvent$(
            this.listDataService.list.id,
            'list',
          ),
        )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((event) => {            
            this.moveEventHandle(event.x, event.y);
          });

        this.scrollActionsService.globalScrollEvent$$
          .pipe(takeUntilDestroyed(this.destroyRef), throttleTime(200))
          .subscribe(() => {
            if (
              this.boardEnvironmentEventsService.onListUpStart ||
              this.boardEnvironmentEventsService.listMoveEvent == null ||
              this.boardEnvironmentEventsService.actualListMoving == null ||
              this.boardEnvironmentEventsService.actualListMoving.id !=
                this.listDataService.list.id
            )
              return;

            this.moveEventHandle(
              this.boardEnvironmentEventsService.listMoveEvent.x,
              this.boardEnvironmentEventsService.listMoveEvent.y,
            );
          });
      });
    });
  }

  private moveEventHandle(x: number, y: number) {
    if (
      this.boardEnvironmentEventsService.onListUpStart ||
      !this.boardEnvironmentEventsService.actualListMoving
    )
      return;

    this.listDataService.actualXPosition = x;
    this.listDataService.actualYPosition = y;

    this.listElements.listElementRef.style.zIndex = '40';
    this.listElements.listElementRef.style.transform = 'rotate(2deg)';
    this.listElements.listElementRef.style.top =
      y - this.listDataService.initialY + 'px';
    this.listElements.listElementRef.style.left =
      x - this.listDataService.initialX + 'px';

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterListElement(
        this.listElements.listElementRef.parentElement as HTMLElement,
        x,
        this.listElements.listElementRef,
      );

    this.listActionsService.handleListTransform(
      this.listElements.listElementRef,
      this.listElements.listElementRef.parentElement as HTMLElement,
      afterElement,
      true,
    );

    this.boardEnvironmentEventsService.listMoveEvent = { x, y };
  }
}
