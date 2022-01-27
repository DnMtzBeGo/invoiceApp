import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragFileBarComponent } from './drag-file-bar.component';

describe('DragFileBarComponent', () => {
  let component: DragFileBarComponent;
  let fixture: ComponentFixture<DragFileBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragFileBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragFileBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
