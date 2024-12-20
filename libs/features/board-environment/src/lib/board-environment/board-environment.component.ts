import { Component } from '@angular/core';
import { ListComponent } from '@new-trello-v2/drag-and-drop';
@Component({
  selector: 'lib-board-environment',
  templateUrl: './board-environment.component.html',
  styleUrl: './board-environment.component.scss',
  imports: [ListComponent],
})
export class BoardEnvironmentComponent {}
