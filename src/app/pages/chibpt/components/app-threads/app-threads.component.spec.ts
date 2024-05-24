import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppThreadsComponent } from './app-threads.component';

describe('AppThreadsComponent', () => {
  let component: AppThreadsComponent;
  let fixture: ComponentFixture<AppThreadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppThreadsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppThreadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
