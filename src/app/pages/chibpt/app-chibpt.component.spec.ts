import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppChibptComponent } from './app-chibpt.component';

describe('AppChibptComponent', () => {
  let component: AppChibptComponent;
  let fixture: ComponentFixture<AppChibptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppChibptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppChibptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
