import { Injectable } from '@angular/core';
import { ICardMoveEvent } from '@new-trello-v2/types-interfaces';
import { BehaviorSubject, filter, fromEvent, Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardEnvironmentEventsService {
  private onUpStart$ = new BehaviorSubject<boolean>(false);
  private actualCardMoving$ = new BehaviorSubject<ICardMoveEvent | null>(null);
  private mouseUpEvent$ = new Subject<MouseEvent>();
  private mousemoveEvent$ = new Subject<MouseEvent>();

  constructor() {
    this.initGlobalEvents();
  }

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

  getGlobalMouseMoveEvent$(id: number) {
    return this.mousemoveEvent$.pipe(
      filter(() => this.actualCardMoving?.id === id),
      tap((event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }),
    );
  }

  getGlobalMouseUpEvent$(id: number) {
    return this.mouseUpEvent$.pipe(
      filter(() => this.actualCardMoving?.id === id),
      tap((event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }),
    );
  }

  private initGlobalEvents() {
    fromEvent<MouseEvent>(window.document.body, 'mousemove').subscribe((e) =>
      this.mousemoveEvent$.next(e),
    );

    fromEvent<MouseEvent>(window.document.body, 'mouseup').subscribe((e) =>
      this.mouseUpEvent$.next(e),
    );
  }
}
