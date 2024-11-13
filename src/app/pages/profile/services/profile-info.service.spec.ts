import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { ProfileInfoService } from './profile-info.service';

describe('ProfileInfoService', () => {
  let service: ProfileInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientModule, TranslateModule.forRoot()] });
    service = TestBed.inject(ProfileInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
