import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppFrecuentPrompsComponent } from './app-frecuent-promps.component';

describe('AppFrecuentPrompsComponent', () => {
  let component: AppFrecuentPrompsComponent;
  let fixture: ComponentFixture<AppFrecuentPrompsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppFrecuentPrompsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppFrecuentPrompsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
