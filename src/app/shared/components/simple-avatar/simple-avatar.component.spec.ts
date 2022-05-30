import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleAvatarComponent } from './simple-avatar.component';

describe('SimpleAvatarComponent', () => {
  let component: SimpleAvatarComponent;
  let fixture: ComponentFixture<SimpleAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleAvatarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
