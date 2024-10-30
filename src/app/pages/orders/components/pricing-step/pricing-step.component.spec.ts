import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PricingStepComponent } from './pricing-step.component';

describe('PricingComponent', () => {
  let component: PricingStepComponent;
  let fixture: ComponentFixture<PricingStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricingStepComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
