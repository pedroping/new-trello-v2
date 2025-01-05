import {
  Component,
  computed,
  effect,
  inject,
  input
} from '@angular/core';
import { ListDataService } from '@new-trello-v2/drag-and-drop-data';
import { IList } from '@new-trello-v2/types-interfaces';
import { ListCardComponent } from '../list-card/list-card.component';
import { ListHeaderComponent } from '../list-header/list-header.component';
@Component({
  selector: 'lib-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [ListHeaderComponent, ListCardComponent],
  providers: [ListDataService],
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
