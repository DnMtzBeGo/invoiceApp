import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomsAgentComponent } from './customs-agent.component';

describe('CustomsAgentComponent', () => {
  let component: CustomsAgentComponent;
  let fixture: ComponentFixture<CustomsAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomsAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomsAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
