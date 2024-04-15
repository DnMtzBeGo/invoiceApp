import { TestBed } from '@angular/core/testing';

import { PrimeService } from './prime.service';

describe('PrimeService', () => {
  let service: PrimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
