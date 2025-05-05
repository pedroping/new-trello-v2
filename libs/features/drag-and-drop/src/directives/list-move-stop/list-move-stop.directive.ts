import { DestroyRef, Directive, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BoardEnvironmentEventsService,
  BoardEnvironmentStoreService,
} from '@new-trello-v2/drag-and-drop-data';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { ListDataService } from '../../services/list-data/list-data.service';
import { take, timer } from 'rxjs';

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
  private readonly boardEnvironmentDataService = inject(
    BoardEnvironmentStoreService,
  );

  ngOnInit(): void {
    this.boardEnvironmentEventsService
      .getGlobalMouseUpEvent$(this.listDataService.list.id, 'list')
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

    const previewElementId = Array.from(
      (this.listElements.listElementRef.parentElement as HTMLElement).children,
    )
      .filter((element) => element != this.listElements.listElementRef)
      .indexOf(this.boardEnvironmentEventsService.listPreviewElement);
    const previewElementRect =
      this.boardEnvironmentEventsService.listPreviewElement.getBoundingClientRect();

    this.boardEnvironmentDataService.moveList(
      this.listDataService.list.id,
      previewElementId,
    );

    this.listElements.listElementRef.style.transform = 'rotate(0deg)';
    this.listElements.listElementRef.style.left = previewElementRect.x + 'px';
    this.listElements.listElementRef.style.top =
      previewElementRect.y - 5 + 'px';

    if (
      (this.listElements.listElementRef.parentElement as HTMLElement).contains(
        this.boardEnvironmentEventsService.listPreviewElement,
      )
    )
      (
        this.listElements.listElementRef.parentElement as HTMLElement
      ).removeChild(this.boardEnvironmentEventsService.listPreviewElement);

    timer(10)
      .pipe(take(1))
      .subscribe(() => {
        Array.from(
          (this.listElements.listElementRef.parentElement as HTMLElement)
            .children,
        ).forEach((_element) => {
          const element = _element as HTMLElement;
          element.style.transition = 'none';
          element.style.transform = 'translateY(0px)';
        });

        this.listElements.listElementRef.style.position = 'static';
        this.listElements.listElementRef.style.width = '100%';
        this.listElements.listElementRef.style.zIndex = '2';

        const parentElement = this.listElements.listElementRef
          .parentElement as HTMLElement;

        parentElement.style.width = '';
        parentElement.style.minWidth = '';
        parentElement.style.maxWidth = '';

        timer(250)
          .pipe(take(1))
          .subscribe(() => {
            Array.from(
              (this.listElements.listElementRef.parentElement as HTMLElement)
                .children,
            ).forEach((_element) => {
              const element = _element as HTMLElement;
              element.style.zIndex = '0';
              element.style.minHeight = '';
              element.style.maxHeight = '';
              element.style.zIndex = '';
              element.style.top = '';
              element.style.left = '';
              element.style.position = '';
              element.style.width = '';
              element.style.height = '';
              element.style.transform = '';
              element.style.transition = '';
            });
          });
      });
  }
}
