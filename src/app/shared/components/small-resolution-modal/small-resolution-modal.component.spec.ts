import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallResolutionModalComponent } from './small-resolution-modal.component';

describe('SmallResolutionModalComponent', () => {
  let component: SmallResolutionModalComponent;
  let fixture: ComponentFixture<SmallResolutionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallResolutionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallResolutionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
