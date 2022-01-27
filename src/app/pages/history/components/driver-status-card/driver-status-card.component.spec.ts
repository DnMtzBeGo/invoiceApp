import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverStatusCardComponent } from './driver-status-card.component';

describe('DriverStatusCardComponent', () => {
  let component: DriverStatusCardComponent;
  let fixture: ComponentFixture<DriverStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverStatusCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverStatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
