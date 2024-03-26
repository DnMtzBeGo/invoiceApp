import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolygonFilterComponent } from './polygon-filter.component';

describe('PolygonFilterComponent', () => {
  let component: PolygonFilterComponent;
  let fixture: ComponentFixture<PolygonFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolygonFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolygonFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
