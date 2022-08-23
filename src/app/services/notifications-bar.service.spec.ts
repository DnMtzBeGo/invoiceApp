import { TestBed } from '@angular/core/testing';

import { NotificationsBarService } from './notifications-bar.service';

describe('NotificationsBarService', () => {
  let service: NotificationsBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
