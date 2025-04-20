import { TestBed, inject } from '@angular/core/testing';
import { CardDataService } from './card-data.service';

describe('Service: CardDataHandle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardDataService]
    });
  });

  it('should ...', inject([CardDataService], (service: CardDataService) => {
    expect(service).toBeTruthy();
  }));
});
