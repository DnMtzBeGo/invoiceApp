import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoSelectComponent } from './bego-select.component';

describe('BegoSelectComponent', () => {
  let component: BegoSelectComponent;
  let fixture: ComponentFixture<BegoSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
