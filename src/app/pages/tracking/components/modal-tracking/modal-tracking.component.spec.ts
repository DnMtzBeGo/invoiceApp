import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTrackingComponent } from './modal-tracking.component';

describe('ModalTrackingComponent', () => {
  let component: ModalTrackingComponent;
  let fixture: ComponentFixture<ModalTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
