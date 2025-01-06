import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[mousePageMove]',
})
export class MousePageMoveDirective {
  startX = 0;
  scrollLeft = 0;
  mouseDown = false;

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    this.mouseDown = true;
    this.startX = event.pageX - this.elementRef.nativeElement.offsetLeft;
    this.scrollLeft = this.elementRef.nativeElement.scrollLeft;
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (!this.mouseDown) return;

    const x =
      event.pageX - this.elementRef.nativeElement.parentElement!.scrollLeft;
    const scroll = x - this.startX;

    this.elementRef.nativeElement.scrollLeft = this.scrollLeft - scroll;
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseLeaveOrUp() {
    this.mouseDown = false;
  }
}
