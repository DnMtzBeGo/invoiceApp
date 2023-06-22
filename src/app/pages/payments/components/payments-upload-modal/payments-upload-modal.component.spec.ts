import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsUploadModalComponent } from './payments-upload-modal.component';

describe('PaymentsUploadModalComponent', () => {
  let component: PaymentsUploadModalComponent;
  let fixture: ComponentFixture<PaymentsUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentsUploadModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
