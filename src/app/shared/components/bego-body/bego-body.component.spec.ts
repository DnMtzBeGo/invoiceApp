import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoBodyComponent } from './bego-body.component';

describe('BegoBodyComponent', () => {
  let component: BegoBodyComponent;
  let fixture: ComponentFixture<BegoBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
