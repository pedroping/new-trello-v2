import { Component } from '@angular/core';
import { BoardEnvironmentComponent } from '@new-trello-v2/board-environment';
@Component({
  selector: 'new-trello-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [BoardEnvironmentComponent],
})
export class HomePageComponent {}
