import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoPhoneInputComponent } from './bego-phone-input.component';

describe('BegoPhoneInputComponent', () => {
  let component: BegoPhoneInputComponent;
  let fixture: ComponentFixture<BegoPhoneInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoPhoneInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoPhoneInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
