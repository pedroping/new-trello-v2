import { Injectable } from '@angular/core';
import { IBoardEnvironmentData } from '@new-trello-v2/types-interfaces';
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

  moveCard(cardId: number, newListId: number, newCardPositon: number) {
    const list = this.boardEnvironment.lists.find(
      (list) => list.id == newListId,
    );
    if (!list) return;

    const { listIndex, card } = this.findCardAndList(cardId);
    if (!card) return;

    if (listIndex === newListId) {
      const cardIndex = list.cards.findIndex((card) => card.id == cardId);
      if (cardIndex === newCardPositon) return;
      let newCardList = [...list.cards];
      newCardList = newCardList.filter((card) => card.id != cardId);
      newCardList.splice(Math.max(0, newCardPositon), 0, card);
      const newData = this.boardEnvironment;
      if (newData.lists[listIndex])
        newData.lists[listIndex].cards = newCardList;
      this.boardEnvironment = newData;

      return;
    }

    const newData = this.boardEnvironment;

    newData.lists[listIndex].cards = newData.lists[listIndex].cards.filter(
      (card) => card.id !== cardId,
    );
    newData.lists[newListId].cards.splice(Math.max(0, newCardPositon), 0, card);

    this.boardEnvironment = newData;
  }

  private findCardAndList(cardId: number) {
    const listIndex = this.boardEnvironment.lists.findIndex((list) =>
      list.cards.find((card) => card.id === cardId),
    );
    const card = this.boardEnvironment.lists[listIndex]?.cards.find(
      (card) => card.id === cardId,
    );

    return { listIndex, card };
  }

  moveList(listId: number, newListPositon: number) {
    const listIndex = this.boardEnvironment.lists.findIndex(
      (list) => list.id == listId,
    );

    if (listIndex == -1) return;

    const currentList = this.boardEnvironment.lists[listIndex];

    const newLists = this.boardEnvironment.lists.filter(
      (list) => list != currentList,
    );

    newLists.splice(Math.max(0, newListPositon), 0, currentList);

    const newData = this.boardEnvironment;
    newData.lists = newLists;

    this.boardEnvironment = newData;
  }
}
