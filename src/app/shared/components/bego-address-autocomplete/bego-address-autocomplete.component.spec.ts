import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialog } from '@angular/material/legacy-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { BegoAddressAutocompleteComponent } from './bego-address-autocomplete.component';

declare global {
  interface Window {
    google: any;
  }
}

window.google = {
  maps: {
    places: {
      AutocompleteService: class {
        public getPlacePredictions = jest.fn();
      },
    },
  },
};

describe('BegoAddressAutocompleteComponent', () => {
  let component: BegoAddressAutocompleteComponent;
  let fixture: ComponentFixture<BegoAddressAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BegoAddressAutocompleteComponent],
      imports: [TranslateModule.forRoot(), MatAutocompleteModule],
      providers: [{ provide: MatLegacyDialog, useValue: {} }],
    }).compileComponents();
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
