import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
import { ICard } from '@new-trello-v2/types-interfaces';
import { take, timer } from 'rxjs';
import { LIST_ELEMENT } from '../../providers/list-element-provider';

@Directive({
  selector: '[listCardMove]',
})
export class ListCardMoveDirective implements OnInit {
  card = input.required<ICard>();

  elementRef = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  initialX = 0;
  initialY = 0;
  actualYPosition = 0;
  actualXPosition = 0;

  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );
  private readonly listElements = inject(LIST_ELEMENT);

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onUpStart) return;

    this.boardEnvironmentEventsService.onUpStart = true;

    this.startDownEvent(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event']) onTouchDown(event: TouchEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.boardEnvironmentEventsService.onUpStart) return;

    const touch = event.touches[0];
    this.boardEnvironmentEventsService.onUpStart = true;

    timer(500)
      .pipe(take(1))
      .subscribe(() => {
        if (!this.boardEnvironmentEventsService.onUpStart) return;

        this.startDownEvent(touch.pageX, touch.pageY);
      });
  }

  ngOnInit(): void {
    this.boardEnvironmentEventsService
      .getGlobalMouseMoveEvent$(this.card().id)
      .subscribe((event) => {
        this.moveEventHandle(event.x, event.y);
      });

    this.boardEnvironmentEventsService
      .getGlobalMouseUpEvent$(this.card().id)
      .subscribe(() => {
        this.boardEnvironmentEventsService.onUpStart = false;
        this.upEventHandle();
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.actualCardMoving = {
      id: this.card().id,
      listId: this.card().listId,
      element: this.elementRef,
    };

    const cardRect = this.elementRef.getBoundingClientRect();

    this.boardEnvironmentEventsService.setPreviewSize({
      height: cardRect.height,
      width: cardRect.width,
    });

    this.listElements.ulElement.style.minHeight =
      this.listElements.ulElement.offsetHeight + 'px';

    this.listElements.ulElement.style.maxHeight =
      this.listElements.ulElement.offsetHeight + 'px';

    const rect = this.elementRef.getBoundingClientRect();

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterListElement(
        this.listElements.ulElement,
        y,
        this.elementRef,
      );

    if (afterElement) {
      this.listElements.ulElement.insertBefore(
        this.boardEnvironmentEventsService.previewElement,
        afterElement,
      );
    } else {
      this.listElements.ulElement.appendChild(
        this.boardEnvironmentEventsService.previewElement,
      );
    }

    this.elementRef.style.top = 'unset';
    this.elementRef.style.left = 'unset';
    this.elementRef.style.position = 'fixed';
    this.elementRef.style.zIndex = '2';
    this.elementRef.style.width = rect.width + 'px';
    this.elementRef.style.transform = 'rotate(2deg)';
    this.elementRef.style.transition = 'none';

    this.actualYPosition = y;
    this.initialX = x - rect.x;
    this.initialY = y - rect.y;

    this.elementRef.style.top = y - this.initialY + 'px';
    this.elementRef.style.left = x - this.initialX + 'px';

    this.boardEnvironmentEventsService.onUpStart = false;
  }

  private moveEventHandle(x: number, y: number) {
    if (this.boardEnvironmentEventsService.onUpStart) return;

    this.actualXPosition = x;
    this.actualYPosition = y;

    this.elementRef.style.zIndex = '20';
    this.listElements.listElementRef.style.zIndex = '20';
    this.elementRef.parentElement!.style.zIndex = '20';
    this.elementRef.style.transform = 'rotate(2deg)';
    this.elementRef.style.top = y - this.initialY + 'px';
    this.elementRef.style.left = x - this.initialX + 'px';

    const afterElement =
      this.boardEnvironmentEventsService.getDragAfterListElement(
        this.listElements.ulElement,
        y,
        this.elementRef,
      );

    if (afterElement) {
      this.listElements.ulElement.insertBefore(
        this.boardEnvironmentEventsService.previewElement,
        afterElement,
      );

      const elementId = Array.from(this.listElements.ulElement.children)
        .filter((element) => element != this.elementRef)
        .findIndex(
          (element) =>
            element == this.boardEnvironmentEventsService.previewElement,
        );

      Array.from(this.listElements.ulElement.children)
        .filter((element) => element != this.elementRef)
        .forEach((_element, i) => {
          const element = _element as HTMLElement;
          if (elementId < i) {
            element.style.transform = 'translateY(38px)';
            return;
          }
          element.style.transform = 'translateY(0px)';
        });

      return;
    }

    this.listElements.ulElement.appendChild(
      this.boardEnvironmentEventsService.previewElement,
    );

    Array.from(this.listElements.ulElement.children)
      .filter((element) => element != this.elementRef)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;

        element.style.transform = 'translateY(0px)';
      });
  }

  private upEventHandle() {
    this.elementRef.style.transform = '';
    this.elementRef.style.transform = 'rotate(0deg)';
    this.elementRef.style.position = 'static';
    this.elementRef.style.width = '100%';
    this.elementRef.style.zIndex = '2';
    this.elementRef.style.transition = 'all 200ms ease-in-out';
    this.listElements.ulElement.removeChild(
      this.boardEnvironmentEventsService.previewElement,
    );
    this.boardEnvironmentEventsService.actualCardMoving = null;
  }
}
