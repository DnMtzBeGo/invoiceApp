import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUserMessageComponent } from './app-user-message.component';

describe('AppUserMessageComponent', () => {
  let component: AppUserMessageComponent;
  let fixture: ComponentFixture<AppUserMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUserMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUserMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
