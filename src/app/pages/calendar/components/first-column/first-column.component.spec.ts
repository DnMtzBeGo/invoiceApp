import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstColumnComponent } from './first-column.component';

describe('FirstColumnComponent', () => {
  let component: FirstColumnComponent;
  let fixture: ComponentFixture<FirstColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirstColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
