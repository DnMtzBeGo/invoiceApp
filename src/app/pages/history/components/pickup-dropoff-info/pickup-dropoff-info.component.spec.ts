import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupDropoffInfoComponent } from './pickup-dropoff-info.component';

describe('PickupDropoffInfoComponent', () => {
  let component: PickupDropoffInfoComponent;
  let fixture: ComponentFixture<PickupDropoffInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickupDropoffInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupDropoffInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
