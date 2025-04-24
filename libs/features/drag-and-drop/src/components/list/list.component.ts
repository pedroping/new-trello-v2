import { Component, effect, ElementRef, inject, input } from '@angular/core';
import { ICard, IList } from '@new-trello-v2/types-interfaces';
import { CardAutoScrollDirective } from '../../directives/card-auto-scroll/card-auto-scroll.directive';
import { LIST_ELEMENT } from '../../providers/list-element-provider';
import { ListDataService } from '../../services/list-data/list-data.service';
import { CardComponent } from '../card/card.component';
import { ListHeaderComponent } from '../list-header/list-header.component';

@Component({
  selector: 'lib-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [ListHeaderComponent, CardComponent],
  providers: [
    ListDataService,
    {
      provide: LIST_ELEMENT,
      useFactory: () => {
        const element =
          inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

        return {
          listElementRef: element,
          ulElement: element.children[1]?.firstChild!.firstChild,
        };
      },
    },
  ],
  hostDirectives: [
    {
      directive: CardAutoScrollDirective,
      inputs: ['list'],
    },
  ],
})
export class ListComponent {
  list = input.required<IList>();
  cards = input.required<ICard[]>();

  private readonly listDataService = inject(ListDataService);

  constructor() {
    effect(() => {
      this.listDataService.cards = this.cards();
    });
  }
}
