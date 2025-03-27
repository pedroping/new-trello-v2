import {
  DestroyRef,
  Directive,
  HostListener,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoardEnvironmentEventsService } from '@new-trello-v2/drag-and-drop-data';
import { IList } from '@new-trello-v2/types-interfaces';

@Directive({
  selector: '[listMove]',
})
export class ListMoveDirective implements OnInit {
  list = input.required<IList>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly boardEnvironmentEventsService = inject(
    BoardEnvironmentEventsService,
  );

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    // event.preventDefault();
    // event.stopImmediatePropagation();
    // if (this.boardEnvironmentEventsService.onUpStart) return;
    // this.boardEnvironmentEventsService.onUpStart = true;
    // this.startDownEvent(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event']) onTouchDown(event: TouchEvent) {
    // event.preventDefault();
    // event.stopImmediatePropagation();
    // if (this.boardEnvironmentEventsService.onUpStart) return;
    // const touch = event.touches[0];
    // this.boardEnvironmentEventsService.onUpStart = true;
    // timer(500)
    //   .pipe(take(1))
    //   .subscribe(() => {
    //     if (!this.boardEnvironmentEventsService.onUpStart) return;
    //     this.startDownEvent(touch.pageX, touch.pageY);
    //   });
  }

  ngOnInit(): void {
    this.boardEnvironmentEventsService
      .getGlobalMouseMoveEvent$(this.list().id, 'list')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.moveEventHandle(event.x, event.y);
      });

    this.boardEnvironmentEventsService
      .getGlobalMouseUpEvent$(this.list().id, 'list')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.upEventHandle();
      });
  }

  private moveEventHandle(x: number, y: number) {
    console.log(x, y);
  }

  private upEventHandle() {}
}
