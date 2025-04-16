import { TestBed, inject } from '@angular/core/testing';
import { CardActionsService } from './card-actions.service';

describe('Service: CardActions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardActionsService],
    });
  });

  it('should ...', inject(
    [CardActionsService],
    (service: CardActionsService) => {
      expect(service).toBeTruthy();
    },
  ));
});
