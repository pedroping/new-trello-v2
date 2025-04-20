import { afterNextRender, Injectable } from '@angular/core';
import {
  IDragMoveEvent,
  IMoveEvent,
  TEventType,
} from '@new-trello-v2/types-interfaces';
import { BehaviorSubject, filter, fromEvent, Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardEnvironmentEventsService {
  private mouseUpEvent$ = new Subject<MouseEvent>();
  private mousemoveEvent$ = new Subject<MouseEvent>();
  private onCardUpStart$ = new BehaviorSubject<boolean>(false);
  private onListUpStart$ = new BehaviorSubject<boolean>(false);
  private cardMoveEvent$ = new BehaviorSubject<IMoveEvent | null>(null);
  private listMoveEvent$ = new BehaviorSubject<IMoveEvent | null>(null);
  private actualCardMoving$ = new BehaviorSubject<IDragMoveEvent | null>(null);
  private actualListMoving$ = new BehaviorSubject<IDragMoveEvent | null>(null);

  private _cardPreviewElement?: HTMLLIElement;
  private _listPreviewElement?: HTMLDivElement;

  constructor() {
    afterNextRender(() => {
      this._cardPreviewElement = document.createElement('li');
      this._listPreviewElement = document.createElement('div');
      this.setPreviewClass();
      this.initGlobalEvents();
    });
  }

  get actualCardMoving() {
    return this.actualCardMoving$.value;
  }

  set actualCardMoving(event: IDragMoveEvent | null) {
    this.actualCardMoving$.next(event);
  }

  get actualCardMoving$$() {
    return this.actualCardMoving$.asObservable();
  }

  get actualListMoving() {
    return this.actualListMoving$.value;
  }

  set actualListMoving(event: IDragMoveEvent | null) {
    this.actualListMoving$.next(event);
  }

  get actualListMoving$$() {
    return this.actualListMoving$.asObservable();
  }

  get cardMoveEvent$$() {
    return this.cardMoveEvent$.asObservable();
  }

  get cardMoveEvent() {
    return this.cardMoveEvent$.value;
  }

  set cardMoveEvent(event: IMoveEvent | null) {
    this.cardMoveEvent$.next(event);
  }

  get listMoveEvent$$() {
    return this.listMoveEvent$.asObservable();
  }

  get listMoveEvent() {
    return this.listMoveEvent$.value;
  }

  set listMoveEvent(event: IMoveEvent | null) {
    this.listMoveEvent$.next(event);
  }

  get onCardUpStart() {
    return this.onCardUpStart$.value;
  }

  set onCardUpStart(value: boolean) {
    this.onCardUpStart$.next(value);
  }

  get onListUpStart() {
    return this.onListUpStart$.value;
  }

  set onListUpStart(value: boolean) {
    this.onListUpStart$.next(value);
  }

  get cardPreviewElement() {
    return this._cardPreviewElement as HTMLElement;
  }

  get listPreviewElement() {
    return this._listPreviewElement as HTMLElement;
  }

  setCardPreviewSize(params: { height?: number; width?: number }) {
    if (!this._cardPreviewElement) return;

    if (params?.width)
      this._cardPreviewElement.style.width = params.width + 'px';
    if (params?.height)
      this._cardPreviewElement.style.height = params.height + 'px';
  }

  setListPreviewSize(params: { height?: number; width?: number }) {
    if (!this._listPreviewElement) return;

    if (params?.width)
      this._listPreviewElement.style.width = params.width + 'px';
    if (params?.height)
      this._listPreviewElement.style.height = params.height + 'px';
  }

  getGlobalMouseMoveEvent$(id: number, type: TEventType) {
    return this.mousemoveEvent$.pipe(
      filter(() =>
        type == 'card'
          ? this.actualCardMoving?.id === id
          : this.actualListMoving?.id === id,
      ),
      tap((event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }),
    );
  }

  getGlobalMouseUpEvent$(id: number, type: TEventType) {
    return this.mouseUpEvent$.pipe(
      filter(() =>
        type == 'card'
          ? this.actualCardMoving?.id === id
          : this.actualListMoving?.id == id,
      ),
      tap((event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }),
    );
  }

  getDragAfterCardElement(
    list: HTMLElement,
    y: number,
    actualElement?: HTMLElement,
  ) {
    const draggableElements = Array.from(list.children);

    return draggableElements
      .filter(
        (element) =>
          element != this._cardPreviewElement && element != actualElement,
      )
      .reduce(
        (
          closest: {
            element?: Element | null;
            offset: number;
          },
          child,
        ) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return {
              offset: offset,
              element: child,
            };
          } else {
            return closest;
          }
        },
        {
          offset: Number.NEGATIVE_INFINITY,
        },
      ).element;
  }

  getDragAfterListElement(
    list: HTMLElement,
    x: number,
    actualElement?: HTMLElement,
  ) {
    const draggableElements = Array.from(list.children);

    return draggableElements
      .filter(
        (element) =>
          element != this._cardPreviewElement && element != actualElement,
      )
      .reduce(
        (
          closest: {
            element?: Element | null;
            offset: number;
          },
          child,
        ) => {
          const box = child.getBoundingClientRect();
          const offset = x - box.left - box.width / 2;
          if (offset < 0 && offset > closest.offset) {
            return {
              offset: offset,
              element: child,
            };
          } else {
            return closest;
          }
        },
        {
          offset: Number.NEGATIVE_INFINITY,
        },
      ).element;
  }

  private setPreviewClass() {
    if (!this._cardPreviewElement || !this._listPreviewElement) return;
    this._listPreviewElement.classList.add('preview-list');
    this._cardPreviewElement.classList.add('preview-card');
  }

  private initGlobalEvents() {
    fromEvent<MouseEvent>(window.document.body, 'mousemove').subscribe((e) =>
      this.mousemoveEvent$.next(e),
    );

    fromEvent<MouseEvent>(window, 'mouseup').subscribe((e) =>
      this.mouseUpEvent$.next(e),
    );
  }
}
