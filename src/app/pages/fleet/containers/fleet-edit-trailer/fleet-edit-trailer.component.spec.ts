import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetEditTrailerComponent } from './fleet-edit-trailer.component';

describe('FleetEditTrailerComponent', () => {
  let component: FleetEditTrailerComponent;
  let fixture: ComponentFixture<FleetEditTrailerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetEditTrailerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetEditTrailerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
