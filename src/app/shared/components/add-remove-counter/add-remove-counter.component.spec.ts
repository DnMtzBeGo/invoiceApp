import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRemoveCounterComponent } from './add-remove-counter.component';

describe('AddRemoveCounterComponent', () => {
  let component: AddRemoveCounterComponent;
  let fixture: ComponentFixture<AddRemoveCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRemoveCounterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRemoveCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
