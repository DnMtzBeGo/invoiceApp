import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

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
      },
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
