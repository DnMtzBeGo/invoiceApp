import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoAlertComponent } from './bego-alert.component';

describe('BegoAlertComponent', () => {
  let component: BegoAlertComponent;
  let fixture: ComponentFixture<BegoAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
