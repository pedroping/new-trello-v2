import { AsyncPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Injector,
  OnInit
} from '@angular/core';
import { fadeAnimation } from '@new-trello-v2/animations';
import {
  AutoScrollDirective,
  BoardEnvironmentStoreService,
  IBoardEnvironmentData,
  ListComponent,
} from '@new-trello-v2/drag-and-drop';
import { MousePageMoveDirective } from '@new-trello-v2/mouse-page-move';
import { BoardSkeletonComponent } from '@new-trello-v2/skeletons';
import { timer } from 'rxjs';

@Component({
  selector: 'lib-board-environment',
  templateUrl: './board-environment.component.html',
  styleUrl: './board-environment.component.scss',
  imports: [ListComponent, AsyncPipe, BoardSkeletonComponent],
  hostDirectives: [MousePageMoveDirective, AutoScrollDirective],
  animations: [fadeAnimation],
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
    this.boardEnvironmentStoreService.boardElementRef =
      this.elementRef.nativeElement;

    const newData: IBoardEnvironmentData = {
      id: 1,
      name: 'Initial Board',
      lists: Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        name: 'List ' + (i + 1),
        environmentId: 1,
        cards: Array.from({ length: 25 }).map((_, y) => ({
          name: this.getNameByLength(y) + ' ' + (i + 1),
          id: +`${i + 1}${y}`,
          listId: i,
        })),
      })),
    };

    timer(1000).subscribe(() => {
      this.boardEnvironmentStoreService.boardEnvironment = newData;
    });
  }

  getNameByLength(id: number) {
    return Array.from({ length: id }).reduce((curr, _, i) => {
      return curr + `Card ${i} `;
    }, 'Card ');
  }
}
