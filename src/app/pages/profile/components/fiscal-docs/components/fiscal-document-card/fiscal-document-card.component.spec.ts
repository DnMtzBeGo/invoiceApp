import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

// eslint-disable-next-line no-restricted-imports
import { FileInfo } from '../../interfaces/FileInfo';
import { FiscalDocumentCardComponent } from './fiscal-document-card.component';

const mockData = {
  fileInfo: { fileIsSelected: false },
};

describe('FiscalDocumentCardComponent', () => {
  let component: FiscalDocumentCardComponent;
  let fixture: ComponentFixture<FiscalDocumentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiscalDocumentCardComponent],
      imports: [HttpClientModule, TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalDocumentCardComponent);
    component = fixture.componentInstance;

    // Configura un valor para el @Input fileInfo
    component.fileInfo = { fileIsSelected: false } as FileInfo;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
