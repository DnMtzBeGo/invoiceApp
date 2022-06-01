import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFleetElementComponent } from './choose-fleet-element.component';

describe('ChooseFleetElementComponent', () => {
  let component: ChooseFleetElementComponent;
  let fixture: ComponentFixture<ChooseFleetElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseFleetElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFleetElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
