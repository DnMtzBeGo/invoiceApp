import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverScreenshotsComponent } from './driver-screenshots.component';

describe('DriverScreenshotsComponent', () => {
  let component: DriverScreenshotsComponent;
  let fixture: ComponentFixture<DriverScreenshotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverScreenshotsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverScreenshotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
