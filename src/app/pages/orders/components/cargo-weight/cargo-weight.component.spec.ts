import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialogModule, MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CargoWeightComponent } from './cargo-weight.component';

describe('CargoWeightComponent', () => {
  let component: CargoWeightComponent;
  let fixture: ComponentFixture<CargoWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargoWeightComponent],
      imports: [MatLegacyDialogModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatLegacyDialogRef, useValue: {} },
        { provide: MAT_LEGACY_DIALOG_DATA, useValue: {} }, // Mock vacío para MatLegacyDialogRef
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargoWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
