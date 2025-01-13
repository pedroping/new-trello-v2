import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ListComponent } from '@new-trello-v2/drag-and-drop';
import { BoardEnvironmentDataService } from '@new-trello-v2/drag-and-drop-data';
import { MousePageMoveDirective } from '@new-trello-v2/mouse-page-move';
import { IBoardEnvironmentData } from '@new-trello-v2/types-interfaces';

@Component({
  selector: 'lib-board-environment',
  templateUrl: './board-environment.component.html',
  styleUrl: './board-environment.component.scss',
  imports: [ListComponent, AsyncPipe],
  hostDirectives: [MousePageMoveDirective],
})
export class BoardEnvironmentComponent implements OnInit {
  private readonly boardEnvironmentDataService = inject(
    BoardEnvironmentDataService,
  );

  readonly boardEnvironment$ =
    this.boardEnvironmentDataService.boardEnvironment$$;

  ngOnInit(): void {
    const newData: IBoardEnvironmentData = {
      id: 1,
      name: 'Initial Board',
      lists: Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        name: 'List ' + (i + 1),
        environmentId: 1,
        cards: Array.from({ length: 20 }).map((_, y) => ({
          name: 'Card ' + (y + 1),
          id: +`${i + 1}${y}`,
          listId: i,
        })),
      })),
    };

    this.boardEnvironmentDataService.boardEnvironment = newData;
  }

  change() {
    const newData: IBoardEnvironmentData = {
      id: 1,
      name: 'Initial Board',
      lists: Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        name: 'List ' + (i + 1),
        environmentId: 1,
        cards: Array.from({ length: 15 }).map((_, y) => ({
          name: 'Card ' + (y + 1),
          id: y,
          listId: i,
        })),
      })),
    };

    this.boardEnvironmentDataService.boardEnvironment = newData;
  }
}
