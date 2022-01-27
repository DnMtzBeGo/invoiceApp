import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoOrdersYetComponent } from './no-orders-yet.component';

describe('NoOrdersYetComponent', () => {
  let component: NoOrdersYetComponent;
  let fixture: ComponentFixture<NoOrdersYetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoOrdersYetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoOrdersYetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
