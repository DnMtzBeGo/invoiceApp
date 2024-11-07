import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialog, MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { PaymentsUploadModalComponent } from './payments-upload-modal.component';

describe('PaymentsUploadModalComponent', () => {
  let component: PaymentsUploadModalComponent;
  let fixture: ComponentFixture<PaymentsUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsUploadModalComponent],
      imports: [HttpClientModule, TranslateModule.forRoot(), MatSnackBarModule],
      providers: [
        { provide: MAT_LEGACY_DIALOG_DATA, useValue: {} },
        { provide: MatLegacyDialogRef, useValue: {} },
        { provide: MatLegacyDialog, useValue: {} },
      ],
    }).compileComponents();
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
