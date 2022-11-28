import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoTabComponent } from './bego-tabs.component';

describe('BegoTabComponent', () => {
  let component: BegoTabComponent;
  let fixture: ComponentFixture<BegoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
