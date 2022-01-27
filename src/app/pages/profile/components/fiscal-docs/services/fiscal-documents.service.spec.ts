import { TestBed } from '@angular/core/testing';

import { FiscalDocumentsService } from './fiscal-documents.service';

describe('FiscalDocumentsService', () => {
  let service: FiscalDocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiscalDocumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
