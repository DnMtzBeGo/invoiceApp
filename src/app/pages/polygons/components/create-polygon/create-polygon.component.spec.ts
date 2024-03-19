import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePolygonComponent } from './create-polygon.component';

describe('CreatePolygonComponent', () => {
  let component: CreatePolygonComponent;
  let fixture: ComponentFixture<CreatePolygonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePolygonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePolygonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
