import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDirectionsComponent } from './input-directions.component';

describe('InputDirectionsComponent', () => {
  let component: InputDirectionsComponent;
  let fixture: ComponentFixture<InputDirectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputDirectionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
