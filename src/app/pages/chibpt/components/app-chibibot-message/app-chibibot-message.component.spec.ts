import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppChibibotMessageComponent } from './app-chibibot-message.component';

describe('AppChibibotMessageComponent', () => {
  let component: AppChibibotMessageComponent;
  let fixture: ComponentFixture<AppChibibotMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppChibibotMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppChibibotMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
