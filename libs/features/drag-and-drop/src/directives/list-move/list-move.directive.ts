import { DestroyRef, Directive, inject, input, OnInit } from '@angular/core';
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
