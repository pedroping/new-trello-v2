import { Component } from '@angular/core';
import { DragAndDropComponent } from '@new-trello-v2/drag-and-drop';

@Component({
  selector: 'new-trello-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [DragAndDropComponent]
})
export class HomePageComponent {}
