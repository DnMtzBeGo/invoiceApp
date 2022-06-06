import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompatibleBrowserModalComponent } from './incompatible-browser-modal.component';

describe('IncompatibleBrowserModalComponent', () => {
  let component: IncompatibleBrowserModalComponent;
  let fixture: ComponentFixture<IncompatibleBrowserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncompatibleBrowserModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompatibleBrowserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
