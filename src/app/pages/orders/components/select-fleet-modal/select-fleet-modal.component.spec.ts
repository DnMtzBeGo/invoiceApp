import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFleetModalComponent } from './select-fleet-modal.component';

describe('SelectFleetModalComponent', () => {
  let component: SelectFleetModalComponent;
  let fixture: ComponentFixture<SelectFleetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectFleetModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFleetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
