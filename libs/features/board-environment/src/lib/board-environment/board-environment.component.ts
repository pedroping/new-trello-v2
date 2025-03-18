import { Component } from '@angular/core';
import { MousePageMoveDirective } from '@new-trello-v2/mouse-page-move';

@Component({
  selector: 'lib-board-environment',
  templateUrl: './board-environment.component.html',
  styleUrl: './board-environment.component.scss',
  hostDirectives: [MousePageMoveDirective],
})
export class BoardEnvironmentComponent {}
