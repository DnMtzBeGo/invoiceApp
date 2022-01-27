import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverRolesComponent } from './driver-roles.component';

describe('DriverRolesComponent', () => {
  let component: DriverRolesComponent;
  let fixture: ComponentFixture<DriverRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
