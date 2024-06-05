import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { fromEvent, interval, merge, of, Subscription } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CustomMarker } from 'src/app/pages/home/custom.marker';
import { MapDashboardService } from './map-dashboard.service';
import { HeaderService } from 'src/app/pages/home/services/header.service';
import { PolygonFilter } from 'src/app/pages/home/components/polygon-filter/polygon-filter.component';
import { DateTime } from 'luxon';
import { NotificationsService } from '../../services/notifications.service';

declare var google: any;

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.scss']
})
export class MapDashboardComponent {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef!: ElementRef;
  @ViewChild(PolygonFilter) polygonFilter: PolygonFilter;

  trafficLayer: google.maps.TrafficLayer;

  map: any;
  bounds: any;
  isMapDirty = false;
  isTrafficActive = false;
  showTrafficButton = false;

  googleMarkers = [];
  markersFromService = [];

  zoom = 18;
  maxZoom = 18;

  subscriptions = new Subscription();
  isHeatmap: boolean = false;

  constructor(
    public mapDashboardService: MapDashboardService,
    public router: Router,
    public apiRestService: AuthService,
    public headerService: HeaderService,
    private notificationsService: NotificationsService
  ) {
    this.headerService.changeHeader(true);
  }

  ngOnInit() {
    this.subscriptions.add(
      this.router.events.subscribe((res) => {
        if (!(res instanceof NavigationEnd)) return;

        if (['/home', '/fleet'].includes(res.url)) {
          this.headerService.changeHeader(true);
          this.mapDashboardService.showPolygons = true;
          this.mapDashboardService.showFleetMap = true;
          this.polygonFilter?.clearFilters();
        }
      })
    );

    this.subscriptions.add(this.mapDashboardService.clearMap.subscribe(() => this.clearMap()));
    this.subscriptions.add(this.mapDashboardService.toggleTraffic.subscribe(() => this.toggleTraffic()));
    this.subscriptions.add(this.mapDashboardService.getFleetDetails.subscribe((cleanRefresh) => this.getFleetDetails(cleanRefresh)));
    this.subscriptions.add(this.mapDashboardService.centerMap.subscribe((isPolygons: boolean) => this.centerMap(isPolygons)));
    this.subscriptions.add(this.mapDashboardService.clearFilter.subscribe(() => this.polygonFilter?.clearFilters()));
    this.getFleetDetails(false);
  }

  ngOnDestroy() {
    this.headerService.changeHeader(false);
    this.subscriptions.unsubscribe();
  }

  async getFleetDetails(cleanRefresh: boolean) {
    if (!this.mapDashboardService.showFleetMap || this.mapDashboardService.userRole === 1) return;

    (
      await this.apiRestService.apiRest('', 'carriers/home', {
        loader: cleanRefresh
      })
    )
      .pipe(catchError(() => of({})))
      .subscribe((res) => {
        if (res.status === 200 && res.result) {
          // When members exist on the fleet, it saves them on this array
          this.markersFromService = [];

          res.result.members.forEach((row: any) => {
            if (row.location) {
              this.markersFromService.push({
                _id: row._id,
                title: '',
                position: {
                  lat: row.location.lat,
                  lng: row.location.lng
                },
                icon: row.thumbnail,
                state: !row.connected
                  ? 'inactive'
                  : row.availability === 1
                  ? 'available'
                  : row.availability === 2
                  ? 'unavailable'
                  : 'unavailable'
              });
            }
          });

          this.markersFromService = this.markersFromService;

          this.mapDashboardService.haveNotFleetMembers = !res.result.trailers || !res.result.trucks;
          if (res.result.hasOwnProperty('errors') && res.result.errors.length > 0) {
            this.mapDashboardService.haveFleetMembersErrors = res.result.errors;
          }
        }

        const userRole = res.result.role;
        this.mapDashboardService.userRole = userRole;

        if (userRole && this.markersFromService.length) {
          this.updateMap(cleanRefresh);
          this.mapDashboardService.showFleetMap = true;
        } else {
          this.mapDashboardService.showFleetMap = false;
        }
      });
  }

  updateMap(cleanRefresh: boolean) {
    // Create map
    if (this.map == void 0) {
      window.requestAnimationFrame(() => {
        google.maps.event.addListener(this.map, 'drag', () => {
          this.isMapDirty = true;
        });

        google.maps.event.addListener(this.map, 'dblclick', () => {
          if (this.map.getZoom() + 1 <= this.maxZoom) {
            this.isMapDirty = true;
          }
        });

        this.mapRef.nativeElement.addEventListener(
          'mousewheel',
          (event: any) => {
            // zoom in
            if (this.map.getZoom() + 1 <= this.maxZoom && !(event.deltaY > 1)) {
              this.isMapDirty = true;
            }
            // zoom out
            else if (event.deltaY > 1) {
              this.isMapDirty = true;
            }
          },
          true
        );
      });
    }

    const fromShowMap = this.map && this.map.fromShowMap === true;
    this.map =
      this.map != void 0 && !fromShowMap
        ? this.map
        : new google.maps.Map(this.mapRef.nativeElement, {
            zoom: this.zoom,
            maxZoom: this.maxZoom,
            mapId: '893ce2d924d01422',
            disableDefaultUI: true,
            backgroundColor: '#040b12',
            keyboardShortcuts: false,
            center: {
              lat: this.markersFromService[0].position.lat,
              lng: this.markersFromService[0].position.lng
            }
          });

    // clean bounds, googleMarkers
    this.bounds = new google.maps.LatLngBounds();
    this.googleMarkers.forEach((marker) => {
      marker.setMap(null);
      marker.remove();
    });

    this.googleMarkers = [];

    this.markersFromService.forEach((mark) => {
      mark.icon ||= '../assets/images/user-outline.svg';

      const marker = this.createCustomMarker(mark);
      marker.setMap(this.map);

      this.googleMarkers.push(marker);
      this.bounds.extend(marker.getPosition());
    });

    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      this.zoom = this.map.getZoom();
    });

    if (cleanRefresh === false || fromShowMap || this.isMapDirty === false)
      this.map.fitBounds(this.bounds, { bottom: 50, top: 50, left: 80, right: 50 + 400 + 50 });
  }

  toggleTraffic() {
    this.isTrafficActive = !this.isTrafficActive;

    const btnTraffic = document.querySelector('.btn-traffic');

    if (this.isTrafficActive) {
      btnTraffic.classList.add('active');
    } else {
      btnTraffic.classList.remove('active');
    }

    const map = this.map;

    if (this.isTrafficActive && !this.showTrafficButton) {
      if (map) {
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        this.trafficLayer = trafficLayer;
      }
    } else {
      if (this.trafficLayer) {
        this.trafficLayer.setMap(null);
        this.trafficLayer = null;
      }
    }
  }

  clearMap(): void {
    this.googleMarkers?.forEach((marker) => {
      marker.setMap(null);
      marker.remove();
    });

    this.markersFromService = [];
    this.googleMarkers = [];
    this.heatmapPosition = [];
    this.markersPosition = [];

    this.heatmapPosition.forEach((point) => {
      point.setMap(null);
    });

    this.markersPosition.forEach((point) => {
      point.setMap(null);
    });

    if (this.heatmap) this.heatmap.setMap(null);

    if (this.polygons) {
      this.polygons.forEach((polygon) => {
        polygon.setMap(null);
      });
    }

    if (this.circles) {
      this.circles.forEach((circle) => {
        circle.setMap(null);
      });
      this.circles = [];
    }
  }

  // #region polygons
  activeCenter = false;
  centerCoords: any;
  heatmap: any;
  polygons = [];
  circles = [];
  heatmapPosition = [];
  markersPosition = [];

  getCoordinates({ type, geometry, locations, members }: any) {
    this.isHeatmap = type === 'heatmap';
    this.centerCoords = { type, geometry, locations, members };
    this.clearMap();

    if (this.isHeatmap) this.addHeatmap(locations);
    else this.addDispersion(members);
    this.createPolygons(geometry.features);
    this.activeCenter = !!locations?.length || !!members?.length || !!geometry?.features?.length;

    this.centerMap(true);
    this.mapDashboardService.getCoordinates.next();
  }

  clearedFilter() {
    this.mapDashboardService.clearedFilter.next();
  }

  addHeatmap(heatmapData) {
    const data = this.optimizedCoordinates(heatmapData);
    // const data = this.coordinatesToLatLng(heatmapData);
    // descomentar si es que usamos la función anterior con el array original sin modificar

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data,
      // dissipating: false,
      // descomentar si queremos el redondeo original
      map: this.map,
      radius: 12
    });

    this.heatmapPosition = data;
    this.heatmap.set('maxIntensity', 50);
  }

  createPolygons(geometry) {
    if (!geometry?.length) return;

    geometry.forEach((polygon) => {
      const coordinates = polygon.geometry.coordinates[0].map((coord) => {
        return { lat: coord[1], lng: coord[0] };
      });

      const newPolygon = new google.maps.Polygon({
        paths: coordinates,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#FFEE00',
        fillColor: '#FFEE00',
        fillOpacity: 0.2,
        editable: false,
        draggable: false
      });

      newPolygon.setMap(this.map);
      this.polygons.push(newPolygon);

      coordinates.forEach((coordinate) => {
        const circle = new google.maps.Marker({
          position: coordinate,
          map: this.map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#FFEE00',
            fillOpacity: 1,
            strokeColor: '#FFEE00',
            strokeWeight: 2
          }
        });

        this.circles.push(circle);
      });
    });
  }

  addDispersion(members) {
    if (!members?.length) return;

    members.forEach((member) => {
      if (member.location) {
        this.markersFromService.push({
          title: member.nickname,
          description: {
            email: member.email,
            lat: member.location.lat,
            lng: member.location.lng
          },
          position: {
            lat: member.location.lat,
            lng: member.location.lng
          },
          icon: member.thumbnail
        });
      }
    });

    this.googleMarkers = [];

    this.markersPosition = this.centerCoords.members.map(({ location }) => new google.maps.LatLng(location.lat, location.lng));

    for (var i = 0; i < this.markersFromService.length; i++) {
      const marker = new CustomMarker(
        new google.maps.LatLng(this.markersFromService[i].position.lat, this.markersFromService[i].position.lng),
        this.map,
        this.markersFromService[i].icon,
        null,
        this.markersFromService[i].title,
        true,
        this.markersFromService[i].description
      );

      this.googleMarkers.push(marker);
    }
  }

  centerMap(isPolygons?: boolean) {
    const bounds = new google.maps.LatLngBounds();
    if (isPolygons) {
      if (this.activeCenter) {
        if (this.circles?.length) {
          this.circles?.forEach((circle) => {
            bounds.extend(circle.getPosition());
          });
        }

        if (this.isHeatmap) {
          this.heatmapPosition?.forEach((point) => {
            bounds.extend(point.location);
            // bounds.extend(point);
            // descomentar si es que usamos la función anterior con el array original sin modificar
          });
        } else {
          this.markersPosition?.forEach((marker) => {
            bounds.extend(marker);
          });
        }

        this.map.fitBounds(bounds);
      } else {
        this.map.panTo(new google.maps.LatLng(19.432608, -99.133209));
      }
    } else {
      this.updateMap(false);
    }
  }

  optimizedCoordinates(coords): any[] {
    const newCoords = new Map();

    coords.forEach(({ lat, lng }) => {
      const key = `${lat},${lng}`;
      if (newCoords.has(key)) newCoords.get(key).weight++;
      else newCoords.set(key, { location: new google.maps.LatLng(lat, lng), weight: 1 });
    });

    return Array.from(newCoords.values());
  }

  coordinatesToLatLng(data: any[]): any[] {
    return data.map((coord) => new google.maps.LatLng(coord.lat, coord.lng));
  }

  setLatLng(lat, lng) {
    return new google.maps.LatLng(lat, lng);
  }

  createCustomMarker(markerData: any): any {
    const customMarker = new google.maps.OverlayView();
    const description = {
      raw_nickname: '',
      location: '',
      email: '',
      location_updated_at: ''
    };

    const infoWindow = new google.maps.InfoWindow({
      content: this.createContent('')
    });

    let div: HTMLElement | null = null;

    customMarker.draw = () => {
      if (!div) {
        div = document.createElement('div');
        div.className = 'customMarker';

        switch (markerData.state) {
          case 'inactive':
            div.classList.add('customMarker', 'inactive-marker');
            break;
          case 'available':
            div.classList.add('customMarker', 'available-marker');
            break;
          case 'unavailable':
            div.classList.add('customMarker', 'unavailable-marker');
            break;
          default:
            div.classList.add('customMarker', 'active-marker');
        }

        let img = document.createElement('img');
        img.src = markerData.icon;
        div.appendChild(img);

        google.maps.event.addDomListener(div, 'click', async () => {
          (await this.apiRestService.apiRestGet(`carriers/information?user_id=${markerData._id}`, { getLoader: 'true' })).subscribe({
            next: ({ result }) => {
              if (result?.location_updated_at) {
                const date = DateTime.fromMillis(result.location_updated_at);
                description.location_updated_at = date.toFormat('dd/MM/yyyy HH:mm:ss');
              }

              description.raw_nickname = result?.raw_nickname;
              description.email = result?.email;
              description.location = result?.location;

              infoWindow.setContent(this.createContent(description));

              infoWindow.open({ anchor: customMarker, map: this.map, shouldFocus: false });
            },
            error: (err) => {
              this.notificationsService.showErrorToastr('There was an error, try again later');
              console.error(err);
            }
          });
        });

        let panes = customMarker.getPanes();
        panes.overlayImage.appendChild(div);
      }

      let point = customMarker.getProjection().fromLatLngToDivPixel(this.setLatLng(markerData.position.lat, markerData.position.lng));
      if (point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
      }
    };

    customMarker.remove = () => {
      if (div) {
        div.parentNode.removeChild(div);
        div = null;
      }
    };

    customMarker.getPosition = () => {
      return markerData.position;
    };

    return customMarker;
  }

  createContent(description) {
    return `
    <div class="content" style="max-width: 350px">
        <h3 style="text-align: center">${description.raw_nickname}</h3>
        <div class="description">
        ${description?.email ? '<div class="info"><i class="material-icons">email</i><p>' + description.email + '</p></div>' : ''}
        ${
          description?.location_updated_at
            ? '<div class="info"><i class="material-icons">schedule</i><p>' + description.location_updated_at + '</p></div>'
            : ''
        }
        ${
          description?.location
            ? '<div class="info"><i class="material-icons">location_on</i><p>' + description.location + '</p></div>'
            : ''
        }
        </div>
    </div>`;
  }

  // #endregion
}
