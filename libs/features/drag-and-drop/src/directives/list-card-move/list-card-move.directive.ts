import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BoardEnvironmentDataService,
  BoardEnvironmentEventsService,
} from '@new-trello-v2/drag-and-drop-data';
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
  private readonly boardEnvironmentDataService = inject(
    BoardEnvironmentDataService,
  );
  private readonly destroyRef = inject(DestroyRef);
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.moveEventHandle(event.x, event.y);
      });

    this.boardEnvironmentEventsService
      .getGlobalMouseUpEvent$(this.card().id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.upEventHandle();
      });
  }

  private startDownEvent(x: number, y: number) {
    this.boardEnvironmentEventsService.onUpStart = true;

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

    this.elementRef.style.zIndex = '20';
    this.elementRef.style.top = 'unset';
    this.elementRef.style.left = 'unset';
    this.elementRef.style.position = 'fixed';
    this.elementRef.style.width = rect.width + 'px';
    this.elementRef.style.transform = 'rotate(2deg)';
    this.elementRef.style.transition = 'none';

    this.actualYPosition = y;
    this.initialX = x - rect.x;
    this.initialY = y - rect.y;

    this.elementRef.style.top = y - this.initialY + 'px';
    this.elementRef.style.left = x - this.initialX + 'px';

    this.handleCardsTransform(this.elementRef.nextElementSibling);

    this.boardEnvironmentEventsService.actualCardMoving = {
      id: this.card().id,
      listId: this.card().listId,
      element: this.elementRef,
    };
    this.boardEnvironmentEventsService.onUpStart = false;
  }

  private moveEventHandle(x: number, y: number) {
    if (
      this.boardEnvironmentEventsService.onUpStart ||
      !this.boardEnvironmentEventsService.actualCardMoving
    )
      return;

    this.actualXPosition = x;
    this.actualYPosition = y;

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

    this.handleCardsTransform(afterElement, true);

    this.boardEnvironmentEventsService.moveEvent = { x, y };
  }

  private upEventHandle() {
    this.boardEnvironmentEventsService.actualCardMoving = null;
    this.boardEnvironmentEventsService.onUpStart = false;
    this.boardEnvironmentEventsService.moveEvent = null;

    this.elementRef.style.transition = 'all 200ms ease-in-out';

    const previewElementId = Array.from(
      this.listElements.ulElement.children,
    ).indexOf(this.boardEnvironmentEventsService.previewElement);
    const previewElementRect =
      this.boardEnvironmentEventsService.previewElement.getBoundingClientRect();

    this.elementRef.style.transform = 'rotate(0deg)';
    this.elementRef.style.left = previewElementRect.x + 'px';
    this.elementRef.style.top = previewElementRect.y - 5 + 'px';

    this.boardEnvironmentDataService.moveCard(
      this.card().id,
      this.card().listId,
      previewElementId,
    );

    this.elementRef.style.position = 'static';
    this.elementRef.style.width = '100%';
    this.elementRef.style.zIndex = '2';
    this.elementRef.style.zIndex = '0';

    if (
      this.listElements.ulElement.contains(
        this.boardEnvironmentEventsService.previewElement,
      )
    )
      this.listElements.ulElement.removeChild(
        this.boardEnvironmentEventsService.previewElement,
      );

    Array.from(this.listElements.ulElement.children).forEach((_element) => {
      const element = _element as HTMLElement;
      element.style.transform = 'translateY(0px)';
      element.style.transition = 'none';
    });
  }

  private handleCardsTransform(
    afterElement: Element | null | undefined,
    fromMove = false,
  ) {
    if (!afterElement) return this.handleLastCardTransform(fromMove);

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

    const elementHeight = this.elementRef.offsetHeight;

    Array.from(this.listElements.ulElement.children)
      .filter((element) => element != this.elementRef)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;

        if (elementId < i)
          element.style.transform = `translateY(${elementHeight + 4}px)`;
        else element.style.transform = 'translateY(0px)';
      });

    if (fromMove) this.setTransitions(true);
  }

  private handleLastCardTransform(fromMove = false) {
    this.listElements.ulElement.appendChild(
      this.boardEnvironmentEventsService.previewElement,
    );

    Array.from(this.listElements.ulElement.children)
      .filter((element) => element != this.elementRef)
      .forEach((_element, i) => {
        const element = _element as HTMLElement;

        element.style.transform = 'translateY(0px)';
      });

    if (fromMove) this.setTransitions(true);
  }

  private setTransitions(set: boolean) {
    timer(1)
      .pipe(take(1))
      .subscribe(() => {
        Array.from(this.listElements.ulElement.children)
          .filter((element) => element != this.elementRef)
          .forEach((_element) => {
            const element = _element as HTMLElement;

            element.style.transition = set ? 'all 200ms ease-in-out' : 'none';
          });
      });
  }
}
