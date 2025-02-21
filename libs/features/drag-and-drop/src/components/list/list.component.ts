import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BoardEnvironmentDataService,
  ListDataService,
} from '@new-trello-v2/drag-and-drop-data';
import { ICard, IList } from '@new-trello-v2/types-interfaces';
import { ListAutoScrollDirective } from '../../directives/list-auto-scroll/list-auto-scroll.directive';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { ListCardComponent } from '../list-card/list-card.component';
import { ListHeaderComponent } from '../list-header/list-header.component';

@Component({
  selector: 'lib-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [ListHeaderComponent, ListCardComponent],
  providers: [
    ListDataService,
    {
      provide: LIST_ELEMENT,
      useFactory: () => {
        const element =
          inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

        return {
          listElementRef: element,
          ulElement: element.children[1].firstChild!.firstChild,
        };
      },
    },
  ],
  hostDirectives: [
    {
      directive: ListAutoScrollDirective,
      inputs: ['list'],
    },
  ],
})
export class ListComponent implements OnInit {
  list = input.required<IList>();
  cards = signal<ICard[]>([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly listDataService = inject(ListDataService);
  private readonly boardEnvironmentDataService = inject(
    BoardEnvironmentDataService,
  );

  constructor() {
    effect(() => {
      this.listDataService.cards = this.cards();
    });
  }

  ngOnInit(): void {
    this.cards.set(this.list().cards);

    this.boardEnvironmentDataService.boardEnvironment$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((board) => {
        const listIndex = board.lists.findIndex(
          (list) => list.id == this.list().id,
        );
        this.cards.set(board.lists[listIndex].cards);
      });
  }
}
