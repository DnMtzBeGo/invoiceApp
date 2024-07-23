import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareReportModalComponent } from './share-report-modal.component';

describe('ShareReportModalComponent', () => {
  let component: ShareReportModalComponent;
  let fixture: ComponentFixture<ShareReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareReportModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
