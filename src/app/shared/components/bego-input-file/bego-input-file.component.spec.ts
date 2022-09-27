import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoInputFileComponent } from './bego-input-file.component';

describe('BegoInputFileComponent', () => {
  let component: BegoInputFileComponent;
  let fixture: ComponentFixture<BegoInputFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoInputFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoInputFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
