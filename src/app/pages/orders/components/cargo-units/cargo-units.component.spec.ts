import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoUnitsComponent } from './cargo-units.component';

describe('CargoUnitsComponent', () => {
  let component: CargoUnitsComponent;
  let fixture: ComponentFixture<CargoUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargoUnitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargoUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
