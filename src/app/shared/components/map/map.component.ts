
import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter,SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs'
import { HeaderService } from 'src/app/pages/home/services/header.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';

declare var google: any;
@Component({
  selector: 'bego-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @Input() hide: boolean= false;

  private mapStyle: any;
  @Input() typeMap?: string;
  @Input() headerTransparent?: boolean;
  @Output() renderRoute? = new EventEmitter<any>();
  @Output() public createGoogleImage: any = new EventEmitter();
 
  private map: any;
  private bounds: any;

  private lat: any;
  private lng: any;
  private start: any;
  private  routeCenter: any;

  private startMarker: any = {};
  private endMarker: any = {};

  private origin: any = {};

  public mapFadedOut: boolean = false;
  public resEncoder: any;
  public pickupLat: any;
  public pickupLng: any;
  public dropoffLat: any;
  public dropoffLng: any;
  public screenshotCanvas: any;
  public thumbnailMap: Array<any> = [];
  public thumbnailMapFile: Array<any> = [];
  
  private directionsService = new google.maps.DirectionsService();
  private directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      visible: false
    },
  });
  private route = new google.maps.Polyline({
    path: [],
    geodesic : true,
    strokeColor: '#FFBE00',
    strokeWeight: 3,
    editable: false,
    zIndex: 2
  });

  private markersArray: any = [];

  private markerStyle = [
    new google.maps.Size(22, 22),
    new google.maps.Point(0, 0),
    new google.maps.Point(11, 11),
    new google.maps.Size(22, 22)
  ];

  private icons = {
    start: new google.maps.MarkerImage('../assets/images/maps/marker-yellow.svg', ...this.markerStyle),
    end: new google.maps.MarkerImage('../assets/images/maps/marker-white.svg', ...this.markerStyle),
  };

  private iconLocation = {
    start: new google.maps.MarkerImage(
      '../assets/images/maps/marker-yellow.svg',
      new google.maps.Size(22, 22),
      new google.maps.Point(0, 0),
      new google.maps.Point(11, 11),
      new google.maps.Size(22, 22)
    )
  };

  private zoom = 17;
  private anim = {
    index: 0,
    id: 0,
    pathCoords: [],

    mainFunc: (pathCoords: any) => {
      //Prepare animation (route and path cleaning)
      if(this.anim.index == 0) {
        this.route.setPath([]);
        this.anim.pathCoords = pathCoords;
      }

      //Ending condition
      if(this.anim.index >= this.anim.pathCoords.length) return;

      //Begins recursion
      this.routeAnimation(this.anim.index++, this.anim.pathCoords);
      this.anim.id = window.requestAnimationFrame(this.anim.mainFunc);
    }
  };

  @ViewChild('map', { read: ElementRef, static: false }) mapRef!: ElementRef;

  subs = new Subscription()

  constructor(
    private  googlemaps: GoogleMapsService,
    private elementRef: ElementRef
  ) {

  }

  ngOnInit(): void {
    console.log('TIPO DE MAP!!!!!!!!!!!', this.typeMap)
    if(this.typeMap !== 'draft' && this.typeMap !== 'tracking') {
      this.showMap();
    } 
    console.log('OLLLLD MAP')
    this.subs.add(this.googlemaps.updateData.subscribe((data) => {
      console.log("mapa",data)
      if(data === 0){
        this.directionsRenderer.setMap(null);
        this.route.setMap(null);
        this.route.setPath([]);
        this.clearOverlays();
      } else if(this.typeMap == 'draft') {
        this.origin = data;
        this.startMarker.position = new google.maps.LatLng(
          data.pickupLat,
          data.pickupLng
        );
        this.endMarker.position = new google.maps.LatLng(
          data.dropoffLat,
          data.dropoffLng
        );
        if(this.typeMap === 'draft') {
          this.createMap(data.pickupLat, data.pickupLng)
        }
        this.displayRoute(this.startMarker, this.endMarker);
      } else if(this.typeMap === 'tracking') {
        this.origin = data;

        this.origin = data;
        this.startMarker.position = new google.maps.LatLng(
          data.origin.lat,
          data.origin.lng
        );
        this.endMarker.position = new google.maps.LatLng(
          data.destination.lat,
          data.destination.lng
        );

        if(this.typeMap === 'tracking') {
          this.createMap(data.destination.lat, data.destination.lng);
        }
        this.displayRoute(this.startMarker, this.endMarker);
      } else if(this.typeMap === 'home') {
        this.origin = data;
        this.startMarker.position = new google.maps.LatLng(
          data.pickupLat,
          data.pickupLng
        );
        this.endMarker.position = new google.maps.LatLng(
          data.dropoffLat,
          data.dropoffLng
        );
        this.displayRoute(this.startMarker, this.endMarker);
      }
      this.pickupLat = data.pickupLat;
      this.pickupLng = data.pickupLng;
      this.dropoffLat = data.dropoffLat;
      this.dropoffLng = data.dropoffLng;
    }));
    
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }

  ngOnChanges(changes: SimpleChanges ):void {
    // if(changes.hide && this.mapRef){
    //   setTimeout(() => {
    //     console.log('Hide element after this moment');
    //     console.log('elem : ', this.mapRef.nativeElement);

    //     const displayStatus = this.hide ? 'none' : 'block';
    //     this.mapRef.nativeElement.style.display = displayStatus;
    //   },500)
    // }
  }

  async showMap() {
    let perm = await navigator.permissions.query({ name: 'geolocation' });

    if (perm.state === 'granted') {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    } else {
      console.log("User not allowing to access location");
      this.lat = 19.432608;
      this.lng = -99.133209;
    }

    this.createMap(this.lat, this.lng)
    this.map.panBy(200, 0);

    this.bounds = new google.maps.LatLngBounds();
    // this.map.panToBounds( this.bounds)
    // console.log(this.bounds)
    this.map.addListener('dblclick', () => {
      this.zoom += 1;
      this.map.setZoom(this.zoom);
    });

    this.elementRef.nativeElement.querySelector('#map').addEventListener(
      'mousewheel',
      (event: any) => {
        if (event.deltaY > 1) this.zoom += -1;
        else this.zoom += 1;
        this.map.setZoom(this.zoom);
      },
      true
    );

    if (perm.state === 'granted') {
      this.makeMarker(this.start, this.iconLocation.start, 'yellow');
    }
  }

  makeMarker(position: any, icon: any, title: string) {
    this.markersArray.push(
      new google.maps.Marker({
        position,
        map: this.map,
        icon,
        title,
      })
    );
  }

  createMap(lat: number, lng: number) {
    this.start = new google.maps.LatLng(lat, lng);
    const mapOptions = {
      mapId: "893ce2d924d01422",
      center: this.start,
      zoom: this.zoom,
      scrollwheel: true,
      disableDoubleClickZoom: true,
      disableDefaultUI: true,
      backgroundColor: '#040b12',
      keyboardShortcuts: false,
      draggable: true,
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);
    this.map.addListener('dblclick', () => {
      this.zoom += 1;
      this.map.setZoom(this.zoom);
    });
  }

  resetLocation() {
    let bounds = new google.maps.LatLngBounds();
      bounds.extend(this.startMarker.position);
      bounds.extend(this.endMarker.position);
      this.map.fitBounds(bounds);
  }

  centerMap(origin: any, destination: any, routeCenter: any) {
    let bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    bounds.extend(routeCenter);

    this.map.fitBounds(bounds, { bottom: 50, top: 0, left: 0, right: 0 });
  }

  displayRoute(startMarker: any, endMarker: any) {
    if (startMarker.position && endMarker.position) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer.setOptions({draggable: true, zoomControl: true, scrollwheel: true, disableDoubleClickZoom: false});


      this.route.setMap(null);
      this.route.setPath([]);
      this.createRoute(
        this.map,
        startMarker.position,
        endMarker.position,
        this.directionsRenderer,
        this.directionsService
      );
    } else {
      console.log('you are missing fields');
    }
  }

  createRoute(map: any, startPoint: any, endPoint: any, directionsRenderer: any, directionsService: any) {
    this.clearOverlays();

    directionsRenderer.setMap(map);

    const request = {
      origin: startPoint,
      destination: endPoint,
      travelMode: 'DRIVING',
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        this.resEncoder = google.maps.geometry.encoding.encodePath(result.routes[0].overview_path);
        this.generateScreenshotFromGoogle();
        directionsRenderer.setDirections(result);
        const leg = result.routes[0].legs[0];
        this.makeMarker(leg.start_location, this.icons.start, 'yellow');
        this.drawRoute(map, result.routes[0].overview_path, leg.start_location);
        this.routeCenter = new google.maps.LatLng(result.routes[0].overview_path[Math.floor(result.routes[0].overview_path.length / 2)].lat(), result.routes[0].overview_path[Math.floor(result.routes[0].overview_path.length / 2)].lng()),
        setTimeout(() => {
          this.centerMap(leg.start_location, leg.end_location, this.routeCenter);
        }, 500);
      }
    });
  }

  drawRoute(map: any, pathCoords: any, startLocation: any) {
    let i: number = 0;
    this.makeMarker(startLocation, this.icons.end, 'white');
    this.route.setMap(map);

    //Animate route from pickup to drop off
    this.anim.mainFunc = this.anim.mainFunc.bind(this.anim);
    this.anim.index = 0;
    this.anim.pathCoords = [];
    this.anim.mainFunc(pathCoords);
  }

  routeAnimation(index: any, pathCoords: any) {
    if(index < pathCoords.length) {
      this.route.getPath().push(pathCoords[index]);
      this.markersArray[1].setPosition(pathCoords[index]);
    }
  }

  showRoute(data: any) {
    this.origin = data;
    this.startMarker.position = new google.maps.LatLng(
      data.pickupLat,
      data.pickupLng
    );
    this.endMarker.position = new google.maps.LatLng(
      data.dropoffLat,
      data.dropoffLng
    );
    if(this.typeMap === 'draft') {
      this.createMap(data.pickupLat, data.pickupLng)
    }
    this.displayRoute(this.startMarker, this.endMarker);
  }

  clearOverlays() {
    if (this.markersArray && this.markersArray.length > 0) {
      for (var i = 0; i < this.markersArray.length; i++) {
        this.markersArray[i].setMap(null);
      }
    }
    this.markersArray = [];
  }

  fadeOut(){
    this.mapFadedOut = true;
    setTimeout(() => {
      this.mapFadedOut = false;
    },2500);

  }

  public generateScreenshotFromGoogle() {
    let url = 'https://maps.googleapis.com/maps/api/staticmap?';
    
    let size = '512x512';
    url += `size=${size}`;

    let mapStyle = '893ce2d924d01422';
    url += `&map_id=${mapStyle}`;

    let mapType = 'roadmap';
    url += `&maptype=${mapType}`;

    let pathStyles = 'color:0xFFD200ff|weight:2';
    url += `&path=${pathStyles}`;

    let encode = `|enc:${this.resEncoder}`;
    url += `${encode}`;

    let originMarker = `&markers=anchor:32,25|icon:https://begomaps.s3.amazonaws.com/origin.png%7C${this.pickupLat},${this.pickupLng}`;
    url += `${originMarker}`;

    let endMarker = `&markers=anchor:25,35|icon:https://begomaps.s3.amazonaws.com/destination.png%7C${this.dropoffLat},${this.dropoffLng}`;
    url += `${endMarker}`;

    let apiKey = 'AIzaSyA57_SEgRpNRV7G5dH38BS-cwMwmcIBtm8';
    url += `&key=${apiKey}`;

    this.generateScreenshot(url);
  }

  public generateScreenshot(url: any) {
    let img = new Image();
    let elem = document.body;
    this.screenshotCanvas = <HTMLCanvasElement> document.getElementById("canvas-edit");
    let ctx = this.screenshotCanvas.getContext("2d");
    let pixelRatio = window.devicePixelRatio;
    const offsetWidth = elem.offsetWidth * pixelRatio;
    const offsetHeight = elem.offsetHeight * pixelRatio;
    const posX = (window.scrollX) * pixelRatio;
    const posY = (window.scrollY) * pixelRatio;
    this.screenshotCanvas.width = 512;
    this.screenshotCanvas.height = 512;
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      ctx.drawImage(img, posX, posY, offsetWidth, offsetHeight, 0, 0, offsetWidth, offsetHeight);
      let resultFinal = this.screenshotCanvas.toDataURL("image/png", 100);
      this.transformToFile(resultFinal);
    }
  }

  public transformToFile(data: any) {
    let resultBase64 = data.split(',');
    this.thumbnailMap.push(resultBase64[1]);
    const rawData = atob(resultBase64[1]);
    const bytes = new Array(rawData.length);
    for(let i = 0; i < rawData.length; i++) {
      bytes[i] = rawData.charCodeAt(i);
    }
    const arr = new Uint8Array(bytes);
    const blob = new Blob([arr], { type: 'image/png '});
    this.thumbnailMapFile.push(blob);
    this.createGoogleImage.emit(this.thumbnailMapFile);
  }

}
