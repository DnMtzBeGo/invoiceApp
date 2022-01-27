import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverFeaturesComponent } from './driver-features.component';

describe('DriverFeaturesComponent', () => {
  let component: DriverFeaturesComponent;
  let fixture: ComponentFixture<DriverFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverFeaturesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
