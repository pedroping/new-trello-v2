import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IDragMoveEvent } from '../../interfaces/card.interfaces';

@Injectable({ providedIn: 'root' })
export class ScrollActionsService {
  private _scrollEvent$ = new Subject<IDragMoveEvent | null>();
  private globalScrollEvent$ = new Subject<number>();

  setScrollEvent(cardEvent: IDragMoveEvent | null) {
    this._scrollEvent$.next(cardEvent);
  }

  get scrollEvent$$() {
    return this._scrollEvent$.asObservable();
  }

  get globalScrollEvent$$() {
    return this.globalScrollEvent$.asObservable();
  }

  setGlobalScrollEvent(scroll: number) {
    this.globalScrollEvent$.next(scroll);
  }
}
