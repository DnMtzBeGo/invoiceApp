/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditPaymentBillComponent } from './edit-payment-bill.component';

describe('EditPaymentBillComponent', () => {
  let component: EditPaymentBillComponent;
  let fixture: ComponentFixture<EditPaymentBillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditPaymentBillComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPaymentBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
