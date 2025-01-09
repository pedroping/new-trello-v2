import { Injectable } from '@angular/core';
import { ICardMoveEvent } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardEnvironmentEventsService {
  private onUpStart$ = new BehaviorSubject<boolean>(false);
  private actualCardMoving$ = new BehaviorSubject<ICardMoveEvent | null>(null);

  get actualCardMoving() {
    return this.actualCardMoving$.value;
  }

  set actualCardMoving(event: ICardMoveEvent | null) {
    this.actualCardMoving$.next(event);
  }

  get onUpStart() {
    return this.onUpStart$.value;
  }

  set onUpStart(value: boolean) {
    this.onUpStart$.next(value);
  }
}
