import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipHelpComponent } from './tooltip-help.component';

describe('TooltipHelpComponent', () => {
  let component: TooltipHelpComponent;
  let fixture: ComponentFixture<TooltipHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TooltipHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
