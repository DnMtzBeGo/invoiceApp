import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeCardComponent } from './prime-card.component';

describe('PrimeCardComponent', () => {
  let component: PrimeCardComponent;
  let fixture: ComponentFixture<PrimeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrimeCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
