import { Component, OnInit, ViewChild, ElementRef, NgZone, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AlertService } from 'src/app/shared/services/alert.service';
const statusList = require("src/assets/json/status-list.json");

declare var google: any;

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {

  public statusList: any = {};
  public totalDriversInvitation: number = 1;
  public driverObj = { name: '', email: '', tabOpened: false, completed: false };
  public driversInvitation: Array<any> = [{ name: '', email: '', tabOpened: true, completed: false}];
  public validateName: boolean = false;
  public validateEmail: boolean = false;
  public isDriversCompleted: boolean = false;
  public isDriversInvitationShow: boolean = false;

  etaData: any;

  orderId: string = '';

  routeParamsSub: any;
  map: any;
  start: any
  startCoordinates: any
  pickup: any;
  dropoff: any;
  orderData: any;
  distance: any;
  duration: any;
  endAddress: any;
  timeForDrop: any;
  driverLocation: any;
  destinationLocation: any;
  leg: any;
  startMarker: any;
  endMarker: any;
  markersArray: any = [];
  interval: any;
  firstLocation: boolean = true;
  routeCenter: any;
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: '#FFE000',
      strokeWeight: 2
    },
    suppressMarkers: true
  });
  mapStyle: any;
  icons = {
    start: new google.maps.MarkerImage(
      '../assets/images/maps/marker-yellow.svg',
      new google.maps.Size(84, 84),
      new google.maps.Point(-35, -35),
      new google.maps.Point(42, 50)
    ),
    end: new google.maps.MarkerImage(
      '../assets/images/maps/marker-white.svg',
      new google.maps.Size(84, 84),
      new google.maps.Point(-35, -35),
      new google.maps.Point(42, 42)
    ),
  };

  statusOrder: number = 0;
  changeBody: any;
  @ViewChild('map', { read: ElementRef, static: false }) mapRef!: ElementRef;

  constructor(
   /*  private etaInfoService: EtaInfoService,
    public modalController: ModalController, */
    public activatedRoute: ActivatedRoute,
    public zone: NgZone,
    private http: HttpClient,
    private renderer: Renderer2,
    private router: Router,
    private auth: AuthService,
    private alertService: AlertService
  ) {

    this.router.events.subscribe( res => {
      if( res instanceof NavigationEnd && res.url === '/tracking') {
        //console.log("ENTRANDO A TRACKING")
        let data = this.router.getCurrentNavigation()?.extras;
        if(data) {
          this.orderId = data.state?.order_id;
          console.log(data);
        }
      }
    })
    /* this.routeParamsSub = this.activatedRoute.params.subscribe((ev) => {
     if(ev) {
       this.orderId = ev.id;
       if(!ev.id) {
         this.router.navigate(['/home']);
       }
     }
    }); */

    setTimeout(() => {
      this.getDriverLocation();
    }, 0);
  }

  ngOnInit() {
    this.initMap();
    this.statusList = statusList;
    this.changeBody = document.getElementsByTagName("BODY")[0];
    this.renderer.addClass(this.changeBody, 'body-tracking');
  }

  ngOnDestroy()	{
    this.renderer.removeClass(this.changeBody,'body-tracking');
    clearTimeout(this.interval);
  }

  initMap() {
    let mapOptions = {
      mapId: "893ce2d924d01422",
      disableDefaultUI: true,
      backgroundColor: "#040b12"
    };

    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  }

  createRoute(map: any, startPoint: any, endPoint: any, directionsRenderer: any, directionsService: any, animated: any) {
    this.clearOverlays();

    directionsRenderer.setMap(map);

    var request = {
      origin: startPoint,
      destination: endPoint,
      travelMode: 'DRIVING'
    };

    directionsService.route(request, (result: any, status: any) => {
      if(status == 'OK') {
        directionsRenderer.setDirections(result);
        this.distance = result.routes[0].legs[0].distance;
        this.duration = result.routes[0].legs[0].duration;
        this.endAddress = result.routes[0].legs[0].end_address;
        this.leg = result.routes[0].legs[0];
        this.driverLocation = this.leg.start_location;
        this.makeStartMarker(this.leg.start_location);
        this.makeEndMarker(this.leg.end_location);
        this.timeForDrop = (new Date().getTime() + (this.duration.value * 1000 * 1.95));
        this.routeCenter = new google.maps.LatLng(result.routes[0].overview_path[Math.floor(result.routes[0].overview_path.length / 2)].lat(), result.routes[0].overview_path[Math.floor(result.routes[0].overview_path.length / 2)].lng()),
        setTimeout(() => {
          this.centerMap(this.leg.start_location, this.leg.end_location, this.routeCenter);
        }, 500);
      }
    });
  }

  makeStartMarker(position: any) {
    if (this.startMarker) {
      if (this.startMarker.position.lat() !== position.lat() && this.startMarker.position.lng() !== position.lng()) {
        this.startMarker.setPosition(position)
      }
    } else {
      this.startMarker = new google.maps.Marker({
        position,
        map: this.map,
        icon: this.icons.start,
      });
    }
  }

  makeEndMarker(position: any) {
    if (this.endMarker) {
      if (this.endMarker.position.lat() !== position.lat() && this.endMarker.position.lng() !== position.lng()) {
        this.endMarker.setPosition(position)
      }
    } else {
      this.endMarker = new google.maps.Marker({
        position,
        map: this.map,
        icon: this.icons.end,
      });
    }
  }

  centerMap(origin: any, destination: any, routeCenter: any) {
    let bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    bounds.extend(routeCenter);
    this.map.fitBounds(bounds, { bottom: 230, top: 50, left: 50, right: 50 });
  }

  refreshRoute(startPoint: any, endPoint: any) {
    const request = {
      origin: startPoint,
      destination: endPoint,
      travelMode: 'DRIVING'
    };

    this.directionsRenderer.setOptions({preserveViewport: true});

    this.directionsService.route(request, (result: any, status: any) => {
      if(status == 'OK') {
        this.distance = result.routes[0].legs[0].distance;
        this.duration = result.routes[0].legs[0].duration;
        this.timeForDrop = (new Date().getTime() + (this.duration.value * 1000 * 1.95));
        this.directionsRenderer.setDirections(result);
        this.leg = result.routes[0].legs[0];
        this.makeStartMarker(this.leg.start_location);
        this.makeEndMarker(this.leg.end_location);
        this.routeCenter = new google.maps.LatLng(result.routes[0].overview_path[Math.floor(result.routes[0].overview_path.length / 2)].lat(), result.routes[0].overview_path[Math.floor(result.routes[0].overview_path.length / 2)].lng())
      }
    });
  }

  clearOverlays() {
    if(this.markersArray.length > 0)
      for(var i = 0; i < this.markersArray.length; i++)
        this.markersArray[i].setMap(null);

    this.markersArray = [];
  }

  async getDriverLocation() {
    let currentTime = new Date().getTime();
    let requestData = { encrypted: false } ;

    (await this.auth.apiRest(JSON.stringify(requestData),`carriers/tracking/${this.orderId}`, { apiVersion: 'v1.1' })).subscribe(({result}) => {
      this.etaData = result;
      this.etaData['currentTime'] = currentTime;
      this.statusOrder = result.status;
      this.driverLocation = new google.maps.LatLng(result.driver_location.lat, result.driver_location.lng);
      this.destinationLocation = new google.maps.LatLng(result.destination.lat, result.destination.lng);
      if(this.firstLocation) {
        this.initMap();
        this.createRoute(this.map, this.driverLocation, this.destinationLocation, this.directionsRenderer, this.directionsService, this.firstLocation);
        this.firstLocation = false;
      }
      else {
        this.refreshRoute(this.driverLocation, this.destinationLocation);
      }
    }, (error)=>{
      if(error) {
        this.router.navigate(['/home']);
      }
    })
    
    this.interval = setTimeout(async () => {
      this.getDriverLocation();
    }, 5000);
  }

  /* public shareTracking() {
    this.router.navigate(['/history/tracking/external-tracking'], {
      state: this.orderData,
    });
  } */

  public getDriversInvitation(data: any): void {
    //console.log("RECIBIENDO LA INFO DE ADD REMOVE COUNTER", data);
    this.driversInvitation = data.drivers;
    this.totalDriversInvitation = data.totalDrivers;
    this.validateAllDrivers(this.driversInvitation);
    /* for(let i = 0; i < data.totalDrivers; i++) {
      this.driversInvitation = [{...this.driverObj}];
    } */
  }

  public getInfoDrivers(data: any, index: number): void {
    //console.log("AQUI SE RESETEAN LAS BANDERAS", this.validateEmail, this.validateName, data)
    let emailPattern = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    
    if(data.hasOwnProperty('name') && data.name.length > 0) {
      this.validateName = true;
      this.driversInvitation[index].name = data.name;
    }

    if(data.hasOwnProperty('email')) {
      console.log("AQUÍ NO DEBE DE ENTRAR", data, this.validateEmail);
      this.validateEmail = emailPattern.test(data.email);
      if(this.validateEmail) {
        this.driversInvitation[index].email = data.email;
      }
    }

    let emailValidate = emailPattern.test(data.email);
    console.log("CAMBIAAAAAAAAAAAAA", emailValidate)

    if(!emailValidate) {
      console.log("AQUÍ NECESITA HACER EL CAMBIO************", this.isDriversCompleted)
      this.driversInvitation[index].completed = false;
      this.isDriversCompleted = false;
    } else if(this.driversInvitation[index].name.length > 0 && emailPattern.test(data.email)) {
      console.log("AQUI AL PARECER HAY UN ERROR", this.driversInvitation[index])
      this.driversInvitation[index].completed = true;
      this.validateEmail = false;
      this.validateName = false;
    }

    this.validateAllDrivers(this.driversInvitation);

  }

  public validateAllDrivers(driversInvitation: Array<any>): any {
    for (const iterator of driversInvitation) {
      console.log("EN LA ITERACIÓN", iterator)
      if(!iterator.completed) {
        this.isDriversCompleted = false;
        return;
      } 
      if(iterator.completed) {
        this.isDriversCompleted = true;
      }
    }
    console.log("AQUÑI DEBE DE ENTRAR**********************", this.isDriversCompleted);
  }

  async sendExternalTracking() {
    console.log("ANTES DE ENVIAR A LOS DRIVERS", this.orderId)
    let requestExternalTRacking: any = {
      order_id: this.orderId,
      invitations: [],
    };

    this.driversInvitation.map((x) => {
      requestExternalTRacking.invitations.push({
        name: x.name,
        email: x.email,
      });
    });

    (await this.auth.apiRest(JSON.stringify(requestExternalTRacking), 'carriers/share_tracking')).subscribe(
      (res) => {
        console.log("CON LA URL DE ENVÍO", res);
        this.alertService.create({
          body: 'invitación enviada',
          handlers: [
            {
              text: 'ok',
              color: '#FFE000',
              action: async () => {
                this.alertService.close();
              }
            }
          ]
        });
        this.isDriversInvitationShow = !this.isDriversInvitationShow;
        this.driversInvitation = [{ name: '', email: '', tabOpened: true, completed: false}];
        this.isDriversCompleted = false;
        this.totalDriversInvitation = 1;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  public showDriversInvitation(): void {
    this.isDriversInvitationShow = !this.isDriversInvitationShow;
  }

}
