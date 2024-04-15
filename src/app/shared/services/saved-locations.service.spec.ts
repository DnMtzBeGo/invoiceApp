import { TestBed } from '@angular/core/testing';

import { SavedLocationsService } from './saved-locations.service';

describe('SavedLocationsService', () => {
  let service: SavedLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
