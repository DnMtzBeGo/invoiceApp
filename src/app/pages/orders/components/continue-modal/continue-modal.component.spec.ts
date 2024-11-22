import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { TranslateModule } from '@ngx-translate/core';

import { ContinueModalComponent } from './continue-modal.component';

describe('ContinueModalComponent', () => {
  let component: ContinueModalComponent;
  let fixture: ComponentFixture<ContinueModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContinueModalComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatLegacyDialogRef, useValue: {} },
        { provide: MAT_LEGACY_DIALOG_DATA, useValue: {} }, // Mock vacío para MatLegacyDialogRef
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinueModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
