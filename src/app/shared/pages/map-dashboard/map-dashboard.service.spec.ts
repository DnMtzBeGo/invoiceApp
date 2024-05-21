import { TestBed } from '@angular/core/testing';

import { MapDashboardService } from './map-dashboard.service';

describe('MapDashboardService', () => {
  let service: MapDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
