import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BegoAddressAutocompleteComponent } from './bego-address-autocomplete.component';

describe('BegoAddressAutocompleteComponent', () => {
  let component: BegoAddressAutocompleteComponent;
  let fixture: ComponentFixture<BegoAddressAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BegoAddressAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BegoAddressAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
