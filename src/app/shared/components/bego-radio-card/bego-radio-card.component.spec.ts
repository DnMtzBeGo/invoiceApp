import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoRadioCardComponent } from './bego-radio-card.component';

describe('BegoRadioCardComponent', () => {
  let component: BegoRadioCardComponent;
  let fixture: ComponentFixture<BegoRadioCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoRadioCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoRadioCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
