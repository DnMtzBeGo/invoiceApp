import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoWeightComponent } from './cargo-weight.component';

describe('CargoWeightComponent', () => {
  let component: CargoWeightComponent;
  let fixture: ComponentFixture<CargoWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargoWeightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargoWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
