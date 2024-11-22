import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MercanciasTableComponent } from './mercancias-table.component';

describe('MercanciasTableComponent', () => {
  let component: MercanciasTableComponent;
  let fixture: ComponentFixture<MercanciasTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MercanciasTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MercanciasTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
