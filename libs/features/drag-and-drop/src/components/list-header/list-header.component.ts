import { Component, inject, input } from '@angular/core';
import { ListMoveStartDirective } from '../../directives/list-move-start/list-move-start.directive';
import { ListMoveStopDirective } from '../../directives/list-move-stop/list-move-stop.directive';
import { ListMoveDirective } from '../../directives/list-move/list-move.directive';
import { IList } from '../../interfaces/list.interfaces';
import { ListDataService } from '../../services/list-data/list-data.service';

@Component({
  selector: 'lib-list-header',
  templateUrl: './list-header.component.html',
  styleUrls: ['./list-header.component.scss'],
  hostDirectives: [
    ListMoveStartDirective,
    ListMoveDirective,
    ListMoveStopDirective,
  ],
})
export class ListHeaderComponent {
  headerName = input.required<string>();
  list = input.required<IList>();

  private readonly listDataService = inject(ListDataService);

  constructor() {
    this.listDataService.startDomain(this.list);
  }

  edit(event: Event) {
    if (event.eventPhase != 101) event.preventDefault();
    event.stopImmediatePropagation();
  }
}
