import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-list-header',
  templateUrl: './list-header.component.html',
  styleUrls: ['./list-header.component.scss'],
})
export class ListHeaderComponent {
  headerName = input.required<string>();
}
