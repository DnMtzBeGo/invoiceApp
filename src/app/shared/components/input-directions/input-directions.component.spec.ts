import { MatLegacyDialogModule } from '@angular/material/legacy-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, NgZone, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';

import { InputDirectionsComponent } from './input-directions.component';
import { HomeComponent } from 'src/app/pages/home/home.component';

@Component({
  selector: 'app-home',
  template: '',
})
class MockHomeComponent {}

describe('InputDirectionsComponent', () => {
  let component: InputDirectionsComponent;
  let fixture: ComponentFixture<InputDirectionsComponent>;

  beforeAll(() => {
    (global as any).google = {
      maps: {
        DirectionsService: jest.fn(),
        DirectionsRenderer: jest.fn().mockImplementation(() => ({
          setMap: jest.fn(),
          setDirections: jest.fn(),
        })),
        Polyline: jest.fn().mockImplementation(() => ({
          setMap: jest.fn(),
          setPath: jest.fn(),
        })),
        Size: jest.fn().mockImplementation(() => ({})),
        Point: jest.fn().mockImplementation(() => ({})),
        MarkerImage: jest.fn().mockImplementation(() => ({})),
        LatLng: jest.fn().mockImplementation((lat, lng) => ({ lat, lng })),
        Map: jest.fn().mockImplementation(() => ({
          setCenter: jest.fn(),
          setZoom: jest.fn(),
          addListener: jest.fn(),
          panBy: jest.fn(),
        })),
        LatLngBounds: jest.fn().mockImplementation(() => ({
          extend: jest.fn(),
          getCenter: jest.fn(),
        })),
        places: {
          AutocompleteService: jest.fn().mockImplementation(() => ({
            getPlacePredictions: jest.fn(),
          })),
        },
      },
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputDirectionsComponent, MockHomeComponent],
      imports: [HttpClientModule, TranslateModule.forRoot(), MatSnackBarModule, MatLegacyDialogModule],
      providers: [
        {
          provide: HomeComponent,
          useClass: MockHomeComponent,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
