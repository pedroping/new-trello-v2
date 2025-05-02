import { Component } from '@angular/core';
import { BoardEnvironmentComponent } from '@new-trello-v2/board-environment';

@Component({
  selector: 'new-trello-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.scss'],
  imports: [BoardEnvironmentComponent],
})
export class BoardPageComponent {}
