import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatCertificateComponent } from './sat-certificate.component';

describe('SatCertificateComponent', () => {
  let component: SatCertificateComponent;
  let fixture: ComponentFixture<SatCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SatCertificateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SatCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
