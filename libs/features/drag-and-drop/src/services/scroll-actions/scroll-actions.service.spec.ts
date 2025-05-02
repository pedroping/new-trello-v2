import { TestBed, inject } from '@angular/core/testing';
import { ScrollActionsService } from './scroll-actions.service';

describe('Service: ScrollActions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollActionsService]
    });
  });

  it('should ...', inject([ScrollActionsService], (service: ScrollActionsService) => {
    expect(service).toBeTruthy();
  }));
});
