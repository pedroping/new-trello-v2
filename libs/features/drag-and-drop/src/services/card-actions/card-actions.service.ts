import { inject, Injectable } from '@angular/core';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
import { take, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CardActionsService {
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );

  handleCardsTransform(
    elementRef: HTMLElement,
    listElement: HTMLElement,
    afterElement: Element | null | undefined,
    fromMove = false,
  ) {
    if (!afterElement)
      return this.handleLastCardTransform(elementRef, listElement, fromMove);

    listElement.insertBefore(
      this.boardEnvironmentEventsService.previewElement,
      afterElement,
    );

    const elementId = Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .findIndex(
        (element) =>
          element == this.boardEnvironmentEventsService.previewElement,
      );

    const elementHeight = elementRef.offsetHeight;

    Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;

        if (elementId < i)
          element.style.transform = `translateY(${elementHeight + 4}px)`;
        else element.style.transform = 'translateY(0px)';
      });

    if (fromMove) this.setTransitions(true, elementRef, listElement.children);
  }

  private handleLastCardTransform(
    elementRef: HTMLElement,
    listElement: HTMLElement,
    fromMove = false,
  ) {
    listElement.appendChild(this.boardEnvironmentEventsService.previewElement);

    Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;

        element.style.transform = 'translateY(0px)';
      });

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
