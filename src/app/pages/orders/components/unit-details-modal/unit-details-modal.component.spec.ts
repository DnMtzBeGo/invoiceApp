import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitDetailsModalComponent } from './unit-details-modal.component';

describe('UnitDetailsModalComponent', () => {
  let component: UnitDetailsModalComponent;
  let fixture: ComponentFixture<UnitDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitDetailsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
