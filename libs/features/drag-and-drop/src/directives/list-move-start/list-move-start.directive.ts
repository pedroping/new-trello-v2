import { Directive, HostListener, inject } from '@angular/core';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
import { take, timer } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { ListActionsService } from '../../services/list-actions/list-actions.service';
import { ListDataService } from '../../services/list-data/list-data.service';

const LISTGAP = 340;

@Directive({
  selector: '[appListMoveStart]',
})
export class ListMoveStartDirective {
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly listDataService = inject(ListDataService);
  private readonly listActionsService = inject(ListActionsService);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onListUpStart) return;

    this.boardEnvironmentEventsService.onListUpStart = true;

    this.startDownEvent(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event']) onTouchDown(event: TouchEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onListUpStart) return;

    const touch = event.touches[0];
    this.boardEnvironmentEventsService.onListUpStart = true;

    timer(500)
      .pipe(take(1))
      .subscribe(() => {
        if (!this.boardEnvironmentEventsService.onListUpStart) return;

        this.startDownEvent(touch.pageX, touch.pageY);
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.onListUpStart = true;

    const listRect = this.listElements.listElementRef.getBoundingClientRect();

    this.boardEnvironmentEventsService.setListPreviewSize({
      height: listRect.height,
      width: listRect.width,
    });

    this.listElements.listElementRef.style.minHeight =
      this.listElements.listElementRef.offsetHeight + 'px';

    this.listElements.listElementRef.style.maxHeight =
      this.listElements.listElementRef.offsetHeight + 'px';

    this.listElements.listElementRef.style.zIndex = '20';
    this.listElements.listElementRef.style.top = 'unset';
    this.listElements.listElementRef.style.left = 'unset';
    this.listElements.listElementRef.style.position = 'fixed';
    this.listElements.listElementRef.style.width = listRect.width + 'px';
    this.listElements.listElementRef.style.height = listRect.height + 'px';
    this.listElements.listElementRef.style.transform = 'rotate(2deg)';
    this.listElements.listElementRef.style.transition = 'none';

    const parentElement = this.listElements.listElementRef
      .parentElement as HTMLElement;

    const pageWidth = parentElement.offsetWidth + LISTGAP;

    parentElement.style.width = pageWidth + 'px';
    parentElement.style.minWidth = pageWidth + 'px';
    parentElement.style.maxWidth = pageWidth + 'px';

    this.listDataService.actualYPosition = y;
    this.listDataService.initialX = x - listRect.x;
    this.listDataService.initialY = y - listRect.y;

    this.listElements.listElementRef.style.top =
      y - this.listDataService.initialY + 'px';
    this.listElements.listElementRef.style.left =
      x - this.listDataService.initialX + 'px';

    this.listActionsService.handleListTransform(
      this.listElements.listElementRef,
      parentElement,
      this.listElements.listElementRef,
    );

    this.boardEnvironmentEventsService.actualListMoving = {
      id: this.listDataService.list.id,
      element: this.listElements.listElementRef,
      type: 'list',
    };
    this.boardEnvironmentEventsService.onListUpStart = false;
  }
}
