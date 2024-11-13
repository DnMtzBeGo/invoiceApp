import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularAvatarComponent } from './circular-avatar.component';

describe('CircularAvatarComponent', () => {
  let component: CircularAvatarComponent;
  let fixture: ComponentFixture<CircularAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircularAvatarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CircularAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
