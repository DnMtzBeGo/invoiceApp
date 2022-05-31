import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetMembersComponent } from './fleet-members.component';

describe('FleetMembersComponent', () => {
  let component: FleetMembersComponent;
  let fixture: ComponentFixture<FleetMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetMembersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
