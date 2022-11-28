import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PicturesGridComponent } from './pictures-grid.component';

describe('PicturesGridComponent', () => {
  let component: PicturesGridComponent;
  let fixture: ComponentFixture<PicturesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PicturesGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PicturesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
