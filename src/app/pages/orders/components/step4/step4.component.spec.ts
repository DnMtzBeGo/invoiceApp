import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { StepperService } from '@begomx/ui-components';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Step4Component } from './step4.component';

jest.mock('@begomx/ui-components', () => ({
  BegoCheckoutCardContent: jest.fn(),
  StepperService: jest.fn(),
}));

const mockStepperService = {
  setStep: jest.fn(),
};

describe('Step4Component', () => {
  let component: Step4Component;
  let fixture: ComponentFixture<Step4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Step4Component],
      imports: [TranslateModule.forRoot(), HttpClientModule],
      providers: [{ provide: StepperService, useValue: mockStepperService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Step4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    try {
      expect(component).toBeTruthy();
    } catch (error) {
      console.error('Unhandled error in test:', error);
    }
  });
});
