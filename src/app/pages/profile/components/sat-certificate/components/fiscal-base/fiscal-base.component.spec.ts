import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalBaseComponent } from './fiscal-base.component';

describe('FiscalBaseComponent', () => {
  let component: FiscalBaseComponent;
  let fixture: ComponentFixture<FiscalBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
