import { Component } from '@angular/core';
import { ListHeaderComponent } from '../list-header/list-header.component';
import { ListCardComponent } from '../list-card/list-card.component';

@Component({
  selector: 'lib-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [ListHeaderComponent, ListCardComponent],
})
export class ListComponent {}
