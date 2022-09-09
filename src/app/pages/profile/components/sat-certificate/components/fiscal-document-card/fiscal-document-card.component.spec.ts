import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalDocumentCardComponent } from './fiscal-document-card.component';

describe('FiscalDocumentCardComponent', () => {
  let component: FiscalDocumentCardComponent;
  let fixture: ComponentFixture<FiscalDocumentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalDocumentCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalDocumentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
