import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetEditTruckComponent } from './fleet-edit-truck.component';

describe('FleetEditTruckComponent', () => {
  let component: FleetEditTruckComponent;
  let fixture: ComponentFixture<FleetEditTruckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetEditTruckComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetEditTruckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
