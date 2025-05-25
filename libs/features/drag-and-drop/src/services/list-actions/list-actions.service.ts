import { inject, Injectable } from '@angular/core';
import { take, timer } from 'rxjs';
import { BoardEnvironmentEventsService } from '../board-environment-events/board-environment-events.service';

@Injectable({ providedIn: 'root' })
export class ListActionsService {
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );

  handleListTransform(
    elementRef: HTMLElement,
    listElement: HTMLElement,
    afterElement: Element | null | undefined,
    fromMove = false,
  ) {
    if (!afterElement)
      return this.handleLastListTransform(elementRef, listElement, fromMove);

    if (!fromMove)
      Array.from(listElement.children).forEach((_element) => {
        (_element as HTMLElement).style.transition = 'none';
      });

    listElement.insertBefore(
      this.boardEnvironmentEventsService.listPreviewElement,
      afterElement,
    );

    const elementId = Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .findIndex(
        (element) =>
          element == this.boardEnvironmentEventsService.listPreviewElement,
      );

    const elementWidth = elementRef.offsetWidth;

    const previewGap = Math.max((elementWidth + 20) * elementId, 0);

    Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;

        if (element == this.boardEnvironmentEventsService.listPreviewElement)
          return;

        if (elementId < i)
          element.style.transform = `translateX(${elementWidth + 20}px)`;
        else element.style.transform = 'translateX(0px)';
      });

    this.boardEnvironmentEventsService.listPreviewElement.style.transition =
      'none';
    this.boardEnvironmentEventsService.listPreviewElement.style.transform = `translateX(${previewGap}px)`;

    if (fromMove) this.setTransitions(true, elementRef, listElement.children);
  }

  private handleLastListTransform(
    elementRef: HTMLElement,
    listElement: HTMLElement,
    fromMove = false,
  ) {
    listElement.appendChild(
      this.boardEnvironmentEventsService.listPreviewElement,
    );

    Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .forEach((_element) => {
        const element = _element as HTMLElement;

        if (element == this.boardEnvironmentEventsService.listPreviewElement)
          return;

        element.style.transform = 'translateX(0px)';
      });

    const elementId = Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .findIndex(
        (element) =>
          element == this.boardEnvironmentEventsService.listPreviewElement,
      );

    const elementWidth = elementRef.offsetWidth;

    const previewGap = Math.max((elementWidth + 20) * elementId, 0);

    this.boardEnvironmentEventsService.listPreviewElement.style.transition =
      'none';
    this.boardEnvironmentEventsService.listPreviewElement.style.transform = `translateX(${previewGap}px)`;

    if (fromMove) this.setTransitions(true, elementRef, listElement.children);
  }

  private setTransitions(
    set: boolean,
    elementRef: HTMLElement,
    listElements: HTMLCollection,
  ) {
    timer(1)
      .pipe(take(1))
      .subscribe(() => {
        Array.from(listElements)
          .filter((element) => element != elementRef)
          .forEach((_element) => {
            const element = _element as HTMLElement;

            element.style.transition = set ? 'all 200ms ease-in-out' : 'none';
          });
      });
  }
}
