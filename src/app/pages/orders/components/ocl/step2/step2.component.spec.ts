import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { OclStep2Component } from './step2.component';

describe('OclStep2Component', () => {
  let component: OclStep2Component;
  let fixture: ComponentFixture<OclStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OclStep2Component],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OclStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
