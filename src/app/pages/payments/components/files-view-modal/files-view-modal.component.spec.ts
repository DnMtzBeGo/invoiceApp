import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesViewModalComponent } from './files-view-modal.component';

describe('FilesViewModalComponent', () => {
  let component: FilesViewModalComponent;
  let fixture: ComponentFixture<FilesViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesViewModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
