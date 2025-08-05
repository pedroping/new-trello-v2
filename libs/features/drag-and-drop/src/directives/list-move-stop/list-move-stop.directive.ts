import { DestroyRef, Directive, inject, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, take } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { BoardEnvironmentEventsService } from '../../services/board-environment-events/board-environment-events.service';
import { BoardEnvironmentStoreService } from '../../services/board-environment-store/board-environment-store.service';
import { ListDataService } from '../../services/list-data/list-data.service';

@Directive({
  selector: '[listMoveStop]',
})
export class ListMoveStopDirective implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly listDataService = inject(ListDataService);
  private readonly listElements = inject(LIST_ELEMENT);
  private readonly boardEnvironmentStoreService = inject(
    BoardEnvironmentStoreService,
  );
  private readonly ngZone = inject(NgZone);

  ngOnInit(): void {
    merge(
      this.boardEnvironmentEventsService.getGlobalTouchUpEvent$(
        this.listDataService.list.id,
        'list',
      ),
      this.boardEnvironmentEventsService.getGlobalMouseUpEvent$(
        this.listDataService.list.id,
        'list',
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.upEventHandle();
      });
  }

  private upEventHandle() {
    this.boardEnvironmentEventsService.actualListMoving = null;
    this.boardEnvironmentEventsService.listMoveEvent = null;
    this.boardEnvironmentEventsService.onListUpStart = false;
    this.listElements.listElementRef.style.transition = 'all 200ms ease-in-out';

    const parentElement = this.listElements.listElementRef
      .parentElement as HTMLElement;

    const previewElementId = this.getAllLists(parentElement, true).indexOf(
      this.boardEnvironmentEventsService.listPreviewElement,
    );

    const previewElementRect =
      this.boardEnvironmentEventsService.listPreviewElement.getBoundingClientRect();

    this.listElements.listElementRef.style.transform = 'rotate(0deg)';
    this.listElements.listElementRef.style.left = previewElementRect.x + 'px';
    this.listElements.listElementRef.style.top = previewElementRect.y + 'px';
    this.listElements.listElementRef.style.maxWidth = '300px';

    document.body.style.cursor = 'default';

    merge(
      fromEvent(this.listElements.listElementRef, 'transitionend'),
      fromEvent(this.listElements.listElementRef, 'transitioncancel'),
    )
      .pipe(take(1))
      .subscribe(() => {
        if (
          parentElement.contains(
            this.boardEnvironmentEventsService.listPreviewElement,
          )
        )
          parentElement.removeChild(
            this.boardEnvironmentEventsService.listPreviewElement,
          );

        this.getAllLists(parentElement).forEach((element) => {
          element.style.transition = '';
        });

        this.listElements.listElementRef.style.width = '100%';
        this.listElements.listElementRef.style.zIndex = '2';

        this.getAllLists(parentElement, true).forEach((element, i) => {
          element.style.transition = 'none';

          const rect = element.getBoundingClientRect();

          element.style.left = (i + 1) * 320 + 'px';
          element.style.width = rect.width + 'px';
          element.style.height = rect.height + 'px';

          element.style.transform = 'translateY(0px)';
        });

        this.getAllLists(parentElement, true).forEach((element, i) => {
          if (i < previewElementId) return;
          element.style.position = 'absolute';
        });

        parentElement.style.transition = 'all 200ms ease-in-out';

        this.ngZone.onStable.pipe(take(1)).subscribe(() => {
          this.boardEnvironmentStoreService.moveList(
            this.listDataService.list.id,
            previewElementId,
          );

          this.ngZone.onStable.pipe(take(1)).subscribe(() => {
            parentElement.style.width = '';
            parentElement.style.minWidth = '';
            parentElement.style.maxWidth = '';
            parentElement.style.transition = '';

            this.getAllLists(parentElement).forEach((element) => {
              element.style.zIndex = '0';
              element.style.minHeight = '';
              element.style.maxWidth = '';
              element.style.zIndex = '';
              element.style.top = '';
              element.style.left = '';
              element.style.position = '';
              element.style.width = '';
              element.style.height = '';
              element.style.transform = '';
              element.style.transition = '';
              element.style.maxHeight = '';
              element.style.left = '';
              element.style.width = '';
              element.style.height = '';
              element.style.position = '';
            });
          });
        });
      });
  }

  private getAllLists(
    parentElement: HTMLElement,
    withFilter = false,
  ): HTMLElement[] {
    if (withFilter)
      return Array.from(parentElement.children).filter(
        (element) => element != this.listElements.listElementRef,
      ) as HTMLElement[];

    return Array.from(parentElement.children) as HTMLElement[];
  }
}
