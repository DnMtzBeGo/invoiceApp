import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderEvidenceComponent } from './order-evidence.component';

describe('OrderEvidenceComponent', () => {
  let component: OrderEvidenceComponent;
  let fixture: ComponentFixture<OrderEvidenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderEvidenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderEvidenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
