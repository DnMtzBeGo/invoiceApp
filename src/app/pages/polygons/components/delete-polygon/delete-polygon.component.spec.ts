import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePolygonComponent } from './delete-polygon.component';

describe('DeletePolygonComponent', () => {
  let component: DeletePolygonComponent;
  let fixture: ComponentFixture<DeletePolygonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletePolygonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletePolygonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
