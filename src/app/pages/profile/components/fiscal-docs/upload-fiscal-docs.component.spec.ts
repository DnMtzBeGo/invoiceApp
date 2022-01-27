import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFiscalDocsComponent } from './upload-fiscal-docs.component';

describe('UploadFiscalDocsComponent', () => {
  let component: UploadFiscalDocsComponent;
  let fixture: ComponentFixture<UploadFiscalDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadFiscalDocsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFiscalDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
