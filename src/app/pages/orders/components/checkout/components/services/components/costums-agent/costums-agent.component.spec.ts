import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostumsAgentComponent } from './costums-agent.component';

describe('CostumsAgentComponent', () => {
  let component: CostumsAgentComponent;
  let fixture: ComponentFixture<CostumsAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostumsAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostumsAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
