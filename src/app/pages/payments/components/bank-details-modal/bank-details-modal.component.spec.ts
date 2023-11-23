import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankDetailsModalComponent } from './bank-details-modal.component';

describe('BankDetailsModalComponent', () => {
  let component: BankDetailsModalComponent;
  let fixture: ComponentFixture<BankDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankDetailsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
