/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ListDataService } from './list-data.service';

describe('Service: ListDataHandle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListDataService]
    });
  });

  it('should ...', inject([ListDataService], (service: ListDataService) => {
    expect(service).toBeTruthy();
  }));
});
