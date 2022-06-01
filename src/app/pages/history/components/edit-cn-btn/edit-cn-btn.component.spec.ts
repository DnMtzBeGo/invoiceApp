import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCnBtnComponent } from './edit-cn-btn.component';

describe('EditCnBtnComponent', () => {
  let component: EditCnBtnComponent;
  let fixture: ComponentFixture<EditCnBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCnBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCnBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
