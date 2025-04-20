import { Injectable } from '@angular/core';
import { ICard } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'platform' })
export class ListStoreService {
  private cards$ = new BehaviorSubject<ICard[]>([]);
  private _scrollEvent$ = new Subject<number>();

  set cards(cards: ICard[]) {
    this.cards$.next(cards);
  }

  get cards() {
    return this.cards$.value;
  }

  get cards$$() {
    return this.cards$.asObservable();
  }

  setScrollEvent(scroll: number) {
    this._scrollEvent$.next(scroll);
  }

  get scrollEvent$$() {
    return this._scrollEvent$.asObservable();
  }
}
