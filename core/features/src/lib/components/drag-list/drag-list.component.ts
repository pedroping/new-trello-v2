import { Component, ElementRef, viewChild, viewChildren } from '@angular/core';
import { DragElementComponent } from '../drag-element/drag-element.component';

@Component({
  selector: 'lib-drag-list',
  templateUrl: './drag-list.component.html',
  styleUrls: ['./drag-list.component.scss'],
  imports: [DragElementComponent],
})
export class DragListComponent {
  listElements = Array.from({ length: 10 }).map((_, i) => ({
    name: 'Test' + i,
    id: i,
  }));

  elements = viewChildren('elemnts', { read: ElementRef });
  otherElement = viewChild('otherElement', { read: ElementRef });

  insert() {
    this.elements().forEach((element: ElementRef<HTMLElement>) => {
      element.nativeElement.style.transform = 'translateY(70px)';
    });

    const element = this.otherElement()?.nativeElement as HTMLElement;

    if (!element) return;

    element.style.top = '0px';
    element.style.left = '0px';

    setTimeout(() => {
      element.style.display = 'none';
      this.listElements = [
        {
          name: 'Test 150',
          id: 150,
        },
        ...this.listElements,
      ];

      this.elements().forEach((element: ElementRef<HTMLElement>) => {
        element.nativeElement.style.transform = 'translateY(0px)';
      });
    }, 200);
  }
}
