import { Component, input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'lib-drag-element',
  templateUrl: './drag-element.component.html',
  styleUrls: ['./drag-element.component.scss'],
})
export class DragElementComponent implements OnInit, OnDestroy {
  id = input();

  ngOnInit(): void {
    console.log('Init', this.id());
  }

  ngOnDestroy(): void {
    console.log('Destroy', this.id());
  }
}
