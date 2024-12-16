import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardEnvironmentComponent } from './board-environment.component';

describe('BoardEnvironmentComponent', () => {
  let component: BoardEnvironmentComponent;
  let fixture: ComponentFixture<BoardEnvironmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardEnvironmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
