import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetInviteDriverComponent } from './fleet-invite-driver.component';

describe('FleetInviteDriverComponent', () => {
  let component: FleetInviteDriverComponent;
  let fixture: ComponentFixture<FleetInviteDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetInviteDriverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetInviteDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
