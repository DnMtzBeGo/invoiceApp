import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputBorderRadiusBottomComponent } from './input-border-radius-bottom.component';

describe('InputBorderRadiusBottomComponent', () => {
  let component: InputBorderRadiusBottomComponent;
  let fixture: ComponentFixture<InputBorderRadiusBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputBorderRadiusBottomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputBorderRadiusBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
