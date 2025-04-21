import {
  afterNextRender,
  AfterViewInit,
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
import { ListDataService } from '../../services/list-data/list-data.service';
import { ListActionsService } from '../../services/list-actions/list-actions.service';

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
  private readonly listActionsService = inject(ListActionsService);

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.boardEnvironmentEventsService
          .getGlobalMouseMoveEvent$(this.listDataService.list.id, 'list')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((event) => {
            this.moveEventHandle(event.x, event.y);
          });

        this.boardEnvironmentEventsService
          .getGlobalMouseUpEvent$(this.listDataService.list.id, 'list')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.upEventHandle();
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

    this.listElements.listElementRef.style.zIndex = '20';
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

  private upEventHandle() {}
}
