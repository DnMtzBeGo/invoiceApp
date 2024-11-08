import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mercanciasv20Component } from './mercanciasv2.0.component';

describe('Mercanciasv20Component', () => {
  let component: Mercanciasv20Component;
  let fixture: ComponentFixture<Mercanciasv20Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Mercanciasv20Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mercanciasv20Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
