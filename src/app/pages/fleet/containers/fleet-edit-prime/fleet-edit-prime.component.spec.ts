import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetEditPrimeComponent } from './fleet-edit-prime.component';

describe('FleetEditPrimeComponent', () => {
  let component: FleetEditPrimeComponent;
  let fixture: ComponentFixture<FleetEditPrimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetEditPrimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetEditPrimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
