import { inject, Injectable } from '@angular/core';
import {
  BoardEnvironmentEventsService,
  BoardEnvironmentStoreService,
} from '@new-trello-v2/drag-and-drop-data';
import { take, timer } from 'rxjs';
import { CardDataService } from '../card-data/card-data.service';

@Injectable({ providedIn: 'any' })
export class CardActionsService {
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly boardEnvironmentStoreService = inject(
    BoardEnvironmentStoreService,
  );
  private readonly cardDataService = inject(CardDataService);

  private stopCardTransform = false;

  handleCardsTransform(
    elementRef: HTMLElement,
    listElement: HTMLElement,
    afterElement: Element | null | undefined,
    fromMove = false,
  ) {
    this.validateListChange(elementRef);

    if (this.stopCardTransform) return;

    if (!afterElement)
      return this.handleLastCardTransform(elementRef, listElement, fromMove);

    listElement.insertBefore(
      this.boardEnvironmentEventsService.cardPreviewElement,
      afterElement,
    );

    const elementId = Array.from(listElement.children)
      .filter((element) => element != elementRef)
      .findIndex(
        (element) =>
          element == this.boardEnvironmentEventsService.cardPreviewElement,
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

  private validateListChange(elementRef: HTMLElement) {
    const list = this.getActualList(elementRef);
    const listId = list?.getAttribute('list-id');

    if (!listId || !list) return;

    if (+listId == this.cardDataService.card.listId) return;

    const newUlList = list.children[1].firstChild?.firstChild as HTMLElement;

    if (!newUlList) return;

    this.stopCardTransform = true;

    this.cardDataService.card.listId = +listId;

    this.boardEnvironmentEventsService.actualCardMoving = {
      id: this.cardDataService.card.id,
      listId: this.cardDataService.card.listId,
      element: elementRef,
      type: 'card',
    };
    const cardRect = elementRef.getBoundingClientRect();

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterCardElement(
        newUlList,
        cardRect.y,
      );

    newUlList.appendChild(elementRef);

    if (afterElement) {
      newUlList.insertBefore(
        this.boardEnvironmentEventsService.cardPreviewElement,
        afterElement,
      );

      this.stopCardTransform = false;
      this.handleCardsTransform(elementRef, newUlList, afterElement, true);
    }

    return;
  }

  private handleLastCardTransform(
    elementRef: HTMLElement,
    listElement: HTMLElement,
    fromMove = false,
  ) {
    listElement.appendChild(
      this.boardEnvironmentEventsService.cardPreviewElement,
    );

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

  private getActualList(elementRef: HTMLElement) {
    const allLists = Array.from(
      this.boardEnvironmentStoreService.boardElementRef.children,
    );
    const elementRect = elementRef.getBoundingClientRect();

    return allLists.find((element: Element) => {
      const listRect = element.getBoundingClientRect();

      return (
        elementRect.x > listRect.x &&
        elementRect.x < listRect.x + listRect.width
      );
    });
  }
}
