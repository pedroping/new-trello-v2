/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ListActionsService } from './list-actions.service';

describe('Service: ListActions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListActionsService]
    });
  });

  it('should ...', inject([ListActionsService], (service: ListActionsService) => {
    expect(service).toBeTruthy();
  }));
});
