import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { OclStep1Component } from './step1.component';

describe('OclStep1Component', () => {
  let component: OclStep1Component;
  let fixture: ComponentFixture<OclStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OclStep1Component],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OclStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
