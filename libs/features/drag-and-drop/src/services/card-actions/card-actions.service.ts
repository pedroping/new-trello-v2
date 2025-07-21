import { inject, Injectable } from '@angular/core';
import { take, timer } from 'rxjs';
import { CARD_GAP } from '../../interfaces/card.interfaces';
import { LIST_GAP } from '../../interfaces/list.interfaces';
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
    afterElement: Element | null | undefined,
    fromMove = false,
  ) {
    const listElement = this.cardDataService.actualListParent.ulElement;

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
      elementId === 0 ? `translateY(${CARD_GAP}px)` : '';

    if (fromMove)
      this.setTransitions(true, cloneElement, elementRef, listElement.children);
  }

  getCardsTotalHeight(parentList: HTMLElement[], maxIndex?: number) {
    return parentList
      .slice(0, maxIndex ?? parentList.length)
      .reduce((prev, curr) => {
        return prev + CARD_GAP + (curr as HTMLElement).offsetHeight;
      }, 0);
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

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterCardElement(
        newUlList,
        cloneRect.y,
      );
    const prevList = this.cardDataService.actualListParent.ulElement;

    const newListParent = newUlList.parentElement?.parentElement?.parentElement;

    timer(20)
      .pipe(take(1))
      .subscribe(() => {
        this.cardDataService.actualListParent = {
          ulElement: newUlList,
          listElementRef: newListParent as HTMLElement,
        };

        const height = this.getCardsTotalHeight(
          Array.from(newUlList.children).filter(
            (element) =>
              element !=
                this.boardEnvironmentEventsService.cardPreviewElement &&
              element != elementRef,
          ) as HTMLElement[],
        );

        const newHeight =
          height +
          this.cardDataService.cardClone.offsetHeight +
          LIST_GAP +
          'px';

        newUlList.style.minHeight = newHeight;
        newUlList.style.maxHeight = newHeight;

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
        this.handleCardsTransform(cloneElement, elementRef, afterElement, true);

        timer(10)
          .pipe(take(1))
          .subscribe(() => {
            Array.from(prevList.children).forEach((_element) => {
              const element = _element as HTMLElement;
              element.style.transform = '';
            });

            const prevHeight = this.getCardsTotalHeight(
              Array.from(prevList.children).filter(
                (element) =>
                  element !=
                    this.boardEnvironmentEventsService.cardPreviewElement &&
                  element != cloneElement &&
                  element != elementRef,
              ) as HTMLElement[],
            );

            prevList.style.minHeight = prevHeight + LIST_GAP + 'px';
            prevList.style.maxHeight = prevHeight + LIST_GAP + 'px';
          });
      });
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
    const listsElement =
      this.boardEnvironmentStoreService.boardElementRef.querySelector(
        '#all-lists',
      ) as HTMLElement;

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
