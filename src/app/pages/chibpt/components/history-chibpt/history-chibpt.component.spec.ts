import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChibptComponent } from './history-chibpt.component';

describe('HistoryChibptComponent', () => {
  let component: HistoryChibptComponent;
  let fixture: ComponentFixture<HistoryChibptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryChibptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChibptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
