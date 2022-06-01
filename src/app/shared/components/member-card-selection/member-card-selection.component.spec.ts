import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCardSelectionComponent } from './member-card-selection.component';

describe('MemberCardSelectionComponent', () => {
  let component: MemberCardSelectionComponent;
  let fixture: ComponentFixture<MemberCardSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberCardSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberCardSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
