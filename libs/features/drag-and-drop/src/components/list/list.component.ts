import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { ListDataService } from '@new-trello-v2/drag-and-drop-data';
import { IList } from '@new-trello-v2/types-interfaces';
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
export class ListComponent {
  list = input.required<IList>();
  cards = computed(() => this.list().cards);

  private listDataService = inject(ListDataService);

  constructor() {
    effect(() => {
      this.listDataService.cards = this.cards();
    });
  }
}
