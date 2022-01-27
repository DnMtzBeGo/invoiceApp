import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebMenuButtonComponent } from './web-menu-button.component';

describe('WebMenuButtonComponent', () => {
  let component: WebMenuButtonComponent;
  let fixture: ComponentFixture<WebMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebMenuButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
