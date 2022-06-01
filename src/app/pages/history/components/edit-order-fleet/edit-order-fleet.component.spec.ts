import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderFleetComponent } from './edit-order-fleet.component';

describe('EditOrderFleetComponent', () => {
  let component: EditOrderFleetComponent;
  let fixture: ComponentFixture<EditOrderFleetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditOrderFleetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOrderFleetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
