/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DragElementComponent } from './drag-element.component';

describe('DragElementComponent', () => {
  let component: DragElementComponent;
  let fixture: ComponentFixture<DragElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
