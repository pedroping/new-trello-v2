import { Injectable, InputSignal } from '@angular/core';
import { ICard } from '../../interfaces/card.interfaces';
import { ListElements } from '../../interfaces/list.interfaces';

@Injectable({ providedIn: 'any' })
export class CardDataService {
  private _initialX = 0;
  private _initialY = 0;
  private _actualYPosition = 0;
  private _actualXPosition = 0;
  private _card?: InputSignal<ICard>;
  private _cardClone?: HTMLElement;
  private _actualListParent?: ListElements;

  startDomain(card: InputSignal<ICard>) {
    this._card = card;
  }

  get actualListParent() {
    return this._actualListParent as ListElements;
  }

  set actualListParent(data: ListElements) {
    this._actualListParent = data;
  }

  get cardClone() {
    return this._cardClone as HTMLElement;
  }

  set cardClone(clone: HTMLElement) {
    this._cardClone = clone;
  }

  get card() {
    return this._card?.() as ICard;
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
