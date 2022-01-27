import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoTicketComponent } from './bego-ticket.component';

describe('BegoTicketComponent', () => {
  let component: BegoTicketComponent;
  let fixture: ComponentFixture<BegoTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoTicketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
