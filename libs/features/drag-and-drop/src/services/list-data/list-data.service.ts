import { Injectable, InputSignal } from '@angular/core';
import { ICard, IList } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'any' })
export class ListDataService {
  private _initialX = 0;
  private _initialY = 0;
  private _actualYPosition = 0;
  private _actualXPosition = 0;
  private _list?: InputSignal<IList>;

  private cards$ = new BehaviorSubject<ICard[]>([]);

  startDomain(list: InputSignal<IList>) {
    this._list = list;
  }

  set cards(cards: ICard[]) {
    this.cards$.next(cards);
  }

  get cards() {
    return this.cards$.value;
  }

  get cards$$() {
    return this.cards$.asObservable();
  }

  get list() {
    return this._list?.() as IList;
  }

  get initialX() {
    return this._initialX;
  }
  get initialY() {
    return this._initialY;
  }
  get actualYPosition() {
    return this._actualYPosition;
  }
  get actualXPosition() {
    return this._actualXPosition;
  }

  set initialX(value: number) {
    this._initialX = value;
  }
  set initialY(value: number) {
    this._initialY = value;
  }
  set actualYPosition(value: number) {
    this._actualYPosition = value;
  }
  set actualXPosition(value: number) {
    this._actualXPosition = value;
  }
}
