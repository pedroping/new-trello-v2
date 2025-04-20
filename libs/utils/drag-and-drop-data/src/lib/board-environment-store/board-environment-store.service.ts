import { Injectable } from '@angular/core';
import { IBoardEnvironmentData } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardEnvironmentStoreService {
  private boardEnvironment$ = new BehaviorSubject<IBoardEnvironmentData>(
    <IBoardEnvironmentData>{},
  );

  set boardEnvironment(data: Partial<IBoardEnvironmentData>) {
    this.boardEnvironment$.next({ ...this.boardEnvironment, ...data });
  }

  get boardEnvironment(): IBoardEnvironmentData {
    return this.boardEnvironment$.value;
  }

  get boardEnvironment$$() {
    return this.boardEnvironment$.asObservable();
  }

  moveCard(cardId: number, listId: number, newCardPositon: number) {
    const list = this.boardEnvironment.lists.find((list) => list.id == listId);
    const listIndex = this.boardEnvironment.lists.findIndex(
      (list) => list.id == listId,
    );

    if (!list) return;

    const cardIndex = list.cards.findIndex((card) => card.id == cardId);

    if (cardIndex === newCardPositon) return;

    const card = list.cards.find((card) => card.id == cardId);

    if (!card) return;

    let newCardList = [...list.cards]

    newCardList = newCardList.filter((card) => card.id != cardId);

    newCardList.splice(Math.max(0, newCardPositon), 0, card);

    const newData = this.boardEnvironment;

    if (newData.lists[listIndex])
      newData.lists[listIndex].cards = newCardList;

    this.boardEnvironment = newData;
  }
}
