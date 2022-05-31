import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadInvoicesComponent } from './download-invoices.component';

describe('DownloadInvoicesComponent', () => {
  let component: DownloadInvoicesComponent;
  let fixture: ComponentFixture<DownloadInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadInvoicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
