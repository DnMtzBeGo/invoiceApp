import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFleetModalComponent } from './select-fleet-modal.component';
import { MAT_LEGACY_DIALOG_DATA, MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

describe('SelectFleetModalComponent', () => {
  let component: SelectFleetModalComponent;
  let fixture: ComponentFixture<SelectFleetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectFleetModalComponent],
      imports: [HttpClientModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatLegacyDialogRef, useValue: {} },
        { provide: MAT_LEGACY_DIALOG_DATA, useValue: {} }, // Mock vacío para MatLegacyDialogRef
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectFleetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
