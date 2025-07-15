import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  inject,
  signal
} from '@angular/core';
import { fadeAnimation } from '@new-trello-v2/animations';

const LIST_WIDTH = 300;

@Component({
  selector: 'lib-board-skeleton',
  templateUrl: './board-skeleton.component.html',
  styleUrl: './board-skeleton.component.scss',
  imports: [],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardSkeletonComponent {
  lists = signal<number[]>([]);

  @HostBinding('@fade') animate = true;

  private readonly element = inject(ElementRef).nativeElement as HTMLElement;

  constructor() {
    afterNextRender(() => {
      const width = window.innerWidth;

      this.lists.set(
        Array.from({ length: Math.round(width / LIST_WIDTH) }).map(() =>
          Math.max(30, this.getRoundedBy10(Math.random() * 50 + 50)),
        ),
      );
    });
  }

  getRoundedBy10(value: number) {
    return Math.round(value / 10) * 10;
  }
}
