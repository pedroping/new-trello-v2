/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { ListStoreService } from './list-store.service';

describe('Service: ListData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListStoreService],
    });
  });

  it('should ...', inject([ListStoreService], (service: ListStoreService) => {
    expect(service).toBeTruthy();
  }));
});
