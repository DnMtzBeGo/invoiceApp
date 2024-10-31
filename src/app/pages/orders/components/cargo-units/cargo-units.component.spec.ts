import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CargoUnitsComponent } from './cargo-units.component';

describe('CargoUnitsComponent', () => {
  let component: CargoUnitsComponent;
  let fixture: ComponentFixture<CargoUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargoUnitsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
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
