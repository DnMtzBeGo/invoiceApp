import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalDocumentItemComponent } from './fiscal-document-item.component';

describe('FiscalDocumentItemComponent', () => {
  let component: FiscalDocumentItemComponent;
  let fixture: ComponentFixture<FiscalDocumentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalDocumentItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalDocumentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
