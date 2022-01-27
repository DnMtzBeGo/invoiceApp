import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondColumnComponent } from './second-column.component';

describe('SecondColumnComponent', () => {
  let component: SecondColumnComponent;
  let fixture: ComponentFixture<SecondColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecondColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
