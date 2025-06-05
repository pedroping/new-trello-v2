import { AsyncPipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import {
  AutoScrollDirective,
  BoardEnvironmentStoreService,
  IBoardEnvironmentData,
  ListComponent,
} from '@new-trello-v2/drag-and-drop';
import { MousePageMoveDirective } from '@new-trello-v2/mouse-page-move';

@Component({
  selector: 'lib-board-environment',
  templateUrl: './board-environment.component.html',
  styleUrl: './board-environment.component.scss',
  imports: [ListComponent, AsyncPipe],
  hostDirectives: [MousePageMoveDirective, AutoScrollDirective],
})
export class BoardEnvironmentComponent implements OnInit {
  private readonly boardEnvironmentStoreService = inject(
    BoardEnvironmentStoreService,
  );
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly boardEnvironment$ =
    this.boardEnvironmentStoreService?.boardEnvironment$$;

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.boardEnvironmentStoreService.boardElementRef =
          this.elementRef.nativeElement;
      });
    });

    const newData: IBoardEnvironmentData = {
      id: 1,
      name: 'Initial Board',
      lists: Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        name: 'List ' + (i + 1),
        environmentId: 1,
        cards: Array.from({ length: 25 }).map((_, y) => ({
          name: 'Card Card Card Card Card Card Card Card Card Card Card Card Card Card Card Card Card' + (y + 1) + ' ' + (i + 1),
          id: +`${i + 1}${y}`,
          listId: i,
        })),
      })),
    };

    this.boardEnvironmentStoreService.boardEnvironment = newData;
  }
}
