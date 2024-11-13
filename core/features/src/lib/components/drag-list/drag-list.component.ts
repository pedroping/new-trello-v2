import { Component } from '@angular/core';
import { DragElementComponent } from '../drag-element/drag-element.component';

@Component({
  selector: 'lib-drag-list',
  templateUrl: './drag-list.component.html',
  styleUrls: ['./drag-list.component.scss'],
  standalone: true,
  imports: [DragElementComponent],
})
export class DragListComponent {
  listElements = Array.from({ length: 10 }).map((_, i) => ({
    name: 'Test' + i,
    id: i,
  }));
}
