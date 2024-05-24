import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppChatChibptComponent } from './app-chat-chibpt.component';

describe('AppChatChibptComponent', () => {
  let component: AppChatChibptComponent;
  let fixture: ComponentFixture<AppChatChibptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppChatChibptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppChatChibptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
