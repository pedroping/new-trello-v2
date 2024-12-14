import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragListComponent } from '../components/drag-list/drag-list.component';

@Component({
  selector: 'lib-drag-and-drop',
  imports: [CommonModule, DragListComponent],
  templateUrl: './drag-and-drop.component.html',
  styleUrl: './drag-and-drop.component.scss',
})
export class DragAndDropComponent {}
