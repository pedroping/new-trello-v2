import {
  Component,
  ElementRef,
  HostBinding,
  inject,
  OnInit,
} from '@angular/core';
import { fadeAnimation } from '@new-trello-v2/animations';

const LIST_WIDTH = 300;

@Component({
  selector: 'lib-board-skeleton',
  templateUrl: './board-skeleton.component.html',
  styleUrl: './board-skeleton.component.scss',
  imports: [],
  animations: [fadeAnimation],
})
export class BoardSkeletonComponent implements OnInit {
  lists: number[] = [];

  @HostBinding('@fade') animate = true;

  private readonly element = inject(ElementRef).nativeElement as HTMLElement;

  ngOnInit(): void {
    const width = this.element.offsetWidth;

    this.lists = Array.from({ length: Math.round(width / LIST_WIDTH) }).map(
      () => Math.max(30, this.getRoundedBy10(Math.random() * 101)),
    );
  }

  getRoundedBy10(value: number) {
    return Math.round(value / 10) * 10;
  }
}
