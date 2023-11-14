import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewModalComponent } from './list-view-modal.component';

describe('ListViewModalComponent', () => {
  let component: ListViewModalComponent;
  let fixture: ComponentFixture<ListViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListViewModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
