import { Injectable } from '@angular/core';
import { ICard } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'platform' })
export class ListDataService {
  private cards$ = new BehaviorSubject<ICard[]>([]);

  set cards(cards: ICard[]) {
    this.cards$.next(cards);
  }

  get cards() {
    return this.cards$.value;
  }

  get cards$$() {
    return this.cards$.asObservable();
  }
}
