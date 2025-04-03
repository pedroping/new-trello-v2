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
  private onUpStart$ = new BehaviorSubject<boolean>(false);
  private moveEvent$ = new BehaviorSubject<IMoveEvent | null>(null);
  private actualCardMoving$ = new BehaviorSubject<IDragMoveEvent | null>(null);
  private actualListMoving$ = new BehaviorSubject<IDragMoveEvent | null>(null);

  private _previewElement?: HTMLLIElement;

  constructor() {    
    afterNextRender(() => {
      this._previewElement = document.createElement('li');
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

  get moveEvent$$() {
    return this.moveEvent$.asObservable();
  }

  get moveEvent() {
    return this.moveEvent$.value;
  }

  set moveEvent(event: IMoveEvent | null) {
    this.moveEvent$.next(event);
  }

  get onUpStart() {
    return this.onUpStart$.value;
  }

  set onUpStart(value: boolean) {
    this.onUpStart$.next(value);
  }

  get previewElement() {
    return this._previewElement as HTMLElement;
  }

  setPreviewSize(params: { height?: number; width?: number }) {
    if (!this._previewElement) return;

    if (params?.width) this._previewElement.style.width = params.width + 'px';
    if (params?.height)
      this._previewElement.style.height = params.height + 'px';
  }

  getGlobalMouseMoveEvent$(id: number, type: TEventType) {
    return this.mousemoveEvent$.pipe(
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
          element != this._previewElement && element != actualElement,
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
          element != this._previewElement && element != actualElement,
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
    if (!this._previewElement) return;
    this._previewElement.classList.add('preview-card');
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
