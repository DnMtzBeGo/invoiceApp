import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingStepComponent } from './pricing-step.component';

describe('PricingComponent', () => {
  let component: PricingStepComponent;
  let fixture: ComponentFixture<PricingStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricingStepComponent ]
    })
    .compileComponents();
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
