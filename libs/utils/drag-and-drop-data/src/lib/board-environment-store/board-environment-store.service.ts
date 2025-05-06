import { Injectable } from '@angular/core';
import { IBoardEnvironmentData, ICard } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardEnvironmentStoreService {
  private boardEnvironment$ = new BehaviorSubject<IBoardEnvironmentData>(
    <IBoardEnvironmentData>{},
  );
  private boardElementRef$ = new BehaviorSubject<HTMLElement | null>(null);

  set boardElementRef(element: HTMLElement) {
    this.boardElementRef$.next(element);
  }

  get boardElementRef() {
    return this.boardElementRef$.value as HTMLElement;
  }

  set boardEnvironment(data: Partial<IBoardEnvironmentData>) {
    this.boardEnvironment$.next({ ...this.boardEnvironment, ...data });
  }

  get boardEnvironment(): IBoardEnvironmentData {
    return this.boardEnvironment$.value;
  }

  get boardEnvironment$$() {
    return this.boardEnvironment$.asObservable();
  }

  moveCard(cardId: number, oldListId: number, newCardPositon: number) {
    const { oldListIndex, card } = this.findCardAndList(cardId);

    if (!card) return;

    const newListIndex = this.boardEnvironment.lists.findIndex(
      (list) => list.id == oldListId,
    );

    if (oldListIndex === newListIndex) {
      const cardIndex = this.boardEnvironment.lists[oldListIndex].cards.findIndex(
        (card) => card.id == cardId,
      );

      if (cardIndex === newCardPositon) return;

      let newCardList = [...this.boardEnvironment.lists[oldListIndex].cards];
      newCardList = newCardList.filter((card) => card.id != cardId);
      newCardList.splice(Math.max(0, newCardPositon), 0, card);

      const newData = this.boardEnvironment;

      if (newData.lists[oldListIndex])
        newData.lists[oldListIndex].cards = newCardList;

      this.boardEnvironment = newData;

      return;
    }

    const oldCardList = [...this.boardEnvironment.lists[oldListIndex].cards];
    const newCardList = [...this.boardEnvironment.lists[newListIndex].cards];

    const cardIndex = oldCardList.findIndex((card) => card.id === cardId);
    oldCardList.splice(cardIndex, 1);
    newCardList.splice(Math.max(0, newCardPositon), 0, card);

    const newData = this.boardEnvironment;
    newData.lists[newListIndex].cards = newCardList;
    newData.lists[oldListIndex].cards = oldCardList;

    this.boardEnvironment = newData;
  }

  private findCardAndList(cardId: number) {
    const oldListIndex = this.boardEnvironment.lists.findIndex(
      (list) => !!list.cards.find((card) => card.id === cardId),
    );
    let card = this.boardEnvironment.lists[oldListIndex]?.cards.find(
      (card) => card.id === cardId,
    );
    card = { ...card } as ICard;

    return { oldListIndex, card };
  }

  moveList(listId: number, newListPositon: number) {
    const listIndex = this.boardEnvironment.lists.findIndex(
      (list) => list.id == listId,
    );

    if (listIndex == -1) return;

    const currentList = this.boardEnvironment.lists[listIndex];

    const newLists = this.boardEnvironment.lists;

    newLists.splice(listIndex, 1);
    newLists.splice(Math.max(0, newListPositon), 0, currentList);

    const newData = this.boardEnvironment;
    newData.lists = newLists;

    this.boardEnvironment = newData;
  }
}
