import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
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

  private readonly listElement = inject(LIST_ELEMENT);
  private readonly listDataService = inject(ListDataService);

  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      this.listDataService.cards = this.cards();
    });

    afterNextRender(() => this.refreshInjectedView());
  }

  refreshInjectedView() {
    this.listElement.listElementRef = this.element;
    this.listElement.ulElement = this.element.children[1]?.firstChild
      ?.firstChild as HTMLElement;
  }
}
