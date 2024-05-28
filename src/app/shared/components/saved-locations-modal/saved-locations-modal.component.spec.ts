import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedLocationsModalComponent } from './saved-locations-modal.component';

describe('SavedLocationsModalComponent', () => {
  let component: SavedLocationsModalComponent;
  let fixture: ComponentFixture<SavedLocationsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavedLocationsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedLocationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
