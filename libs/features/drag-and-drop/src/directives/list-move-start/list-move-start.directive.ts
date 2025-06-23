import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { filter, fromEvent, timer } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { BoardEnvironmentStoreService } from '../../services/board-environment-store/board-environment-store.service';
import { ListActionsService } from '../../services/list-actions/list-actions.service';
import { ListDataService } from '../../services/list-data/list-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Directive({
  selector: '[appListMoveStart]',
})
export class ListMoveStartDirective implements OnInit {
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly listDataService = inject(ListDataService);
  private readonly listActionsService = inject(ListActionsService);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly boardEnvironmentStoreService = inject(
    BoardEnvironmentStoreService,
  );
  private readonly element = inject(ElementRef).nativeElement as HTMLElement;
  private readonly destroyRef = inject(DestroyRef);

  hasMove = false;
  moveHasStart = false;

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onListUpStart) return;

    this.boardEnvironmentEventsService.onListUpStart = true;

    this.startDownEvent(event.clientX, event.clientY);
  }

  ngOnInit(): void {
    fromEvent<TouchEvent>(this.element, 'touchstart', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (this.boardEnvironmentEventsService.onListUpStart) return;

        const touch = event.touches[0];

        this.hasMove = false;
        this.moveHasStart = true;

        this.boardEnvironmentEventsService
          .getGlobalTouchMoveEventUnFiltered$()
          .pipe(filter(() => this.moveHasStart))
          .subscribe(() => {
            this.hasMove = true;
            this.moveHasStart = false;
          });

        timer(500).subscribe(() => {
          if (this.hasMove) return;

          this.boardEnvironmentEventsService.onListUpStart = true;

          this.startDownEvent(touch.pageX, touch.pageY);

          this.hasMove = false;
          this.moveHasStart = false;
        });
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.onListUpStart = true;

    const listRect = this.listElements.listElementRef.getBoundingClientRect();

    this.boardEnvironmentEventsService.setListPreviewSize({
      height: listRect.height,
      width: listRect.width,
    });

    const parentElement = this.listElements.listElementRef
      .parentElement as HTMLElement;

    const elementsTotal = parentElement.children.length;

    const pageWidth =
      elementsTotal * (parentElement.firstChild as HTMLElement).offsetWidth +
      (elementsTotal - 1) * 20;

    parentElement.style.width = pageWidth + 'px';
    parentElement.style.minWidth = pageWidth + 'px';

    this.listElements.listElementRef.style.minHeight =
      this.listElements.listElementRef.offsetHeight + 'px';

    this.listElements.listElementRef.style.maxHeight =
      this.listElements.listElementRef.offsetHeight + 'px';

    document.body.style.cursor = 'grab';

    const allListsElement = this.boardEnvironmentStoreService.boardElementRef
      .firstChild as HTMLElement;

    Array.from(allListsElement.children).forEach((list) => {
      (list as HTMLElement).style.zIndex = '20';
    });

    this.listElements.listElementRef.style.zIndex = '40';
    this.listElements.listElementRef.style.top = 'unset';
    this.listElements.listElementRef.style.left = 'unset';
    this.listElements.listElementRef.style.position = 'fixed';
    this.listElements.listElementRef.style.width = listRect.width + 'px';
    this.listElements.listElementRef.style.height = listRect.height + 'px';
    this.listElements.listElementRef.style.transform = 'rotate(2deg)';
    this.listElements.listElementRef.style.transition = 'none';

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
