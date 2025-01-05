/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { BoardEnvironmentDataService } from './board-environment-data.service';

describe('Service: BoardEnvironmentData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardEnvironmentDataService],
    });
  });

  it('should ...', inject(
    [BoardEnvironmentDataService],
    (service: BoardEnvironmentDataService) => {
      expect(service).toBeTruthy();
    },
  ));
});
