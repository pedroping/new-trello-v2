/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { BoardEnvironmentEventsService } from './board-environment-events.service';

describe('Service: BoardEnvironmentEvents', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardEnvironmentEventsService],
    });
  });

  it('should ...', inject(
    [BoardEnvironmentEventsService],
    (service: BoardEnvironmentEventsService) => {
      expect(service).toBeTruthy();
    },
  ));
});
