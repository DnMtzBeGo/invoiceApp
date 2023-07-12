import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditedModalComponent } from './edited-modal.component';

describe('EditedModalComponent', () => {
  let component: EditedModalComponent;
  let fixture: ComponentFixture<EditedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditedModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
