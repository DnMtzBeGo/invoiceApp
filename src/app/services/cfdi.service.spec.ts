import { TestBed } from '@angular/core/testing';

import { CfdiService } from './cfdi.service';

describe('CfdiService', () => {
  let service: CfdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CfdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
