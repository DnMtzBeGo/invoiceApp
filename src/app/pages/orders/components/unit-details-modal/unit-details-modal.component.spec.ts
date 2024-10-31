import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialogModule, MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { UnitDetailsModalComponent } from './unit-details-modal.component';

describe('UnitDetailsModalComponent', () => {
  let component: UnitDetailsModalComponent;
  let fixture: ComponentFixture<UnitDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDetailsModalComponent],
      imports: [MatLegacyDialogModule, ReactiveFormsModule, HttpClientModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatLegacyDialogRef, useValue: {} },
        { provide: MAT_LEGACY_DIALOG_DATA, useValue: {} }, // Mock vacío para MatLegacyDialogRef
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
