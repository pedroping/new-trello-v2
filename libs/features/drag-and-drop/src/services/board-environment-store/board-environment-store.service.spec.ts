/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { BoardEnvironmentStoreService } from './board-environment-store.service';

describe('Service: BoardEnvironmentData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardEnvironmentStoreService],
    });
  });

  it('should ...', inject(
    [BoardEnvironmentStoreService],
    (service: BoardEnvironmentStoreService) => {
      expect(service).toBeTruthy();
    },
  ));
});
