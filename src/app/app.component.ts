import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'new-trello-root',
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class AppComponent {}
