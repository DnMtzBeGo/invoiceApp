import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirthColumnComponent } from './thirth-column.component';

describe('ThirthColumnComponent', () => {
  let component: ThirthColumnComponent;
  let fixture: ComponentFixture<ThirthColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThirthColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirthColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
