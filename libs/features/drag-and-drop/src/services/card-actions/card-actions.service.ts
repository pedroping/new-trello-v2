import { inject, Injectable } from '@angular/core';
import { take, timer } from 'rxjs';
import { BoardEnvironmentEventsService } from '../board-environment-events/board-environment-events.service';
import { BoardEnvironmentStoreService } from '../board-environment-store/board-environment-store.service';
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
    cloneElement: HTMLElement,
    elementRef: HTMLElement,
    listElement: HTMLElement,
    afterElement: Element | null | undefined,
    fromMove = false,
  ) {
    listElement = cloneElement.parentElement as HTMLElement;

    if (this.stopCardTransform) return;

    this.validateListChange(cloneElement, elementRef);

    if (!afterElement)
      return this.handleLastCardTransform(
        cloneElement,
        elementRef,
        listElement,
        fromMove,
      );

    listElement.insertBefore(
      this.boardEnvironmentEventsService.cardPreviewElement,
      afterElement,
    );

    const elementId = Array.from(listElement.children)
      .filter((element) => element != elementRef && element != cloneElement)
      .findIndex(
        (element) =>
          element == this.boardEnvironmentEventsService.cardPreviewElement,
      );

    const elementHeight = cloneElement.offsetHeight;

    Array.from(listElement.children)
      .filter((element) => element != elementRef && element != cloneElement)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;
        if (elementId < i)
          element.style.transform = `translateY(${elementHeight + 4}px)`;
        else element.style.transform = 'translateY(0px)';
      });

    this.boardEnvironmentEventsService.cardPreviewElement.style.transform =
      elementId === 0 ? 'translateY(5px)' : '';

    if (fromMove)
      this.setTransitions(true, cloneElement, elementRef, listElement.children);
  }

  private validateListChange(
    cloneElement: HTMLElement,
    elementRef: HTMLElement,
  ) {
    const list = this.getActualList(cloneElement);
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
      element: cloneElement,
      type: 'card',
    };

    const cloneRect = cloneElement.getBoundingClientRect();
    this.boardEnvironmentEventsService.cardMoveEvent = {
      x: cloneRect.x,
      y: cloneRect.y,
    };

    const cardRect = cloneElement.getBoundingClientRect();
    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterCardElement(
        newUlList,
        cardRect.y,
      );
    const prevList = cloneElement.parentElement as HTMLElement;
    newUlList.appendChild(cloneElement);

    const cardsCount = Array.from(newUlList.children).filter(
      (element) =>
        element != this.boardEnvironmentEventsService.cardPreviewElement &&
        element != elementRef,
    ).length;

    newUlList.style.minHeight = cardsCount * 43 + 10 + 'px';
    newUlList.style.maxHeight = cardsCount * 43 + 10 + 'px';

    if (afterElement) {
      newUlList.insertBefore(
        this.boardEnvironmentEventsService.cardPreviewElement,
        afterElement,
      );
    } else {
      newUlList.appendChild(
        this.boardEnvironmentEventsService.cardPreviewElement,
      );
    }

    this.stopCardTransform = false;
    this.handleCardsTransform(
      cloneElement,
      elementRef,
      newUlList,
      afterElement,
      true,
    );

    timer(10)
      .pipe(take(1))
      .subscribe(() => {
        Array.from(prevList.children).forEach((_element) => {
          const element = _element as HTMLElement;
          element.style.transform = '';
        });
        const previListCardCount = Array.from(prevList.children).filter(
          (element) =>
            element != this.boardEnvironmentEventsService.cardPreviewElement &&
            element != cloneElement &&
            element != elementRef,
        ).length;
        prevList.style.minHeight = previListCardCount * 43 + 10 + 'px';
        prevList.style.maxHeight = previListCardCount * 43 + 10 + 'px';

        const newListParent =
          newUlList.parentElement?.parentElement?.parentElement;
        const prevListParent =
          prevList.parentElement?.parentElement?.parentElement;

        if (newListParent) newListParent.style.zIndex = '20';
        if (prevListParent) prevListParent.style.zIndex = '0';
      });
    return;
  }

  private handleLastCardTransform(
    cloneElement: HTMLElement,
    elementRef: HTMLElement,
    listElement: HTMLElement,
    fromMove = false,
  ) {
    listElement.appendChild(
      this.boardEnvironmentEventsService.cardPreviewElement,
    );

    Array.from(listElement.children)
      .filter((element) => element != elementRef && element != cloneElement)
      .forEach((_element) => {
        const element = _element as HTMLElement;

        element.style.transform = 'translateY(0px)';
      });

    if (fromMove)
      this.setTransitions(true, cloneElement, elementRef, listElement.children);
  }

  private setTransitions(
    set: boolean,
    cloneElement: HTMLElement,
    elementRef: HTMLElement,
    listElements: HTMLCollection,
  ) {
    timer(1)
      .pipe(take(1))
      .subscribe(() => {
        Array.from(listElements)
          .filter((element) => element != elementRef && element != cloneElement)
          .forEach((_element) => {
            const element = _element as HTMLElement;

            element.style.transition = set ? 'all 200ms ease-in-out' : 'none';
          });
      });
  }

  private getActualList(elementRef: HTMLElement) {
    const listsElement = this.boardEnvironmentStoreService.boardElementRef
      .firstChild as HTMLElement;
    const allLists = Array.from(listsElement.children);

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
