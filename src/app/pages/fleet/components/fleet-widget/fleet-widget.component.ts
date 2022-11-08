import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { routes } from '../../consts';

@Component({
  selector: 'app-fleet-widget',
  templateUrl: './fleet-widget.component.html',
  styleUrls: ['./fleet-widget.component.scss'],
  animations: [trigger('enterAnimation', [transition(':enter', [style({ opacity: 0 }), animate('800ms', style({ opacity: 1 }))])])]
})
export class FleetWidgetComponent implements OnInit {
  public routes: typeof routes = routes;

  // sm | md
  @Input()
  size: string = 'md';

  @Input()
  editName: boolean = false;

  fleetDetails: any;
  fleetNameFromService: string;
  fleetName: string;
  members: Array<any> = [];
  trucks: Array<any> = [];
  trailers: Array<Object> = [];
  hasTruck: boolean = false;
  hasChange: boolean = false;
  hasMembers: boolean = false;
  differentTruck: number;
  haveTimeOut: any;
  changeByBlur: boolean = false;
  changeNameSuccessfull: boolean = false;
  prevUrlTrucks: string;
  fleetDataLoaded: boolean = false;

  constructor(private webService: AuthService, private translateService: TranslateService, private router: Router) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd && ev.url === '/fleet') {
        this.prevUrlTrucks = ev.url;
      }
    });
  }

  ngOnInit() {
    this.getFleetDetails();
    this.changeURL();
  }

  async changeFleetName(newName: any) {
    if (newName && newName !== '') {
      const fleetId = this.fleetDetails._id;
      const requestChangeFleetName = {
        id_fleet: fleetId,
        name: newName
      };
      (await this.webService.apiRest(JSON.stringify(requestChangeFleetName), 'fleet/change_name')).subscribe();
    }
  }

  blurDetectedInput(event: any) {
    if (event.target.value != this.fleetNameFromService && event.target.value.length > 0 && !!!this.changeByBlur) {
      this.changeByBlur = true;
      let newName = event.target.value;
      this.changeFleetName(newName);
      this.changeNameSuccessfull = true;
      setTimeout(() => (this.changeNameSuccessfull = false), 3000);
      clearTimeout(this.haveTimeOut);
    }
  }

  detectedLastChange(event: any) {
    clearTimeout(this.haveTimeOut);
    this.fleetName = event;
    this.haveTimeOut = setTimeout(() => this.changeFleetName(this.fleetName), 4000);
    if (!this.changeByBlur) {
      clearTimeout(this.haveTimeOut);
      this.fleetName = event;
      setTimeout(() => (this.changeNameSuccessfull = false), 6000);
      this.haveTimeOut = setTimeout(() => {
        this.changeNameSuccessfull = true;
        this.changeByBlur = true;
        return this.changeFleetName(this.fleetName);
      }, 3000);
    }
  }

  resetVariablesOnFocus() {
    this.changeByBlur = false;
  }

  async getFleetDetails() {
    (await this.webService.apiRest('', 'fleet/overview', { loader: 'false' })).subscribe(
      async (res) => {
        this.fleetDetails = res.result;

        this.members = res.result.members || [];
        if (this.members.length > 0) this.hasMembers = true;

        this.trucks = res.result.trucks || [];
        this.hasChange = true;
        if (this.trucks.length > 0) this.hasTruck = true;

        this.trailers = res.result.trailers || [];

        this.fleetNameFromService = res.result.name;
        this.fleetName = this.fleetNameFromService;

        this.fleetDataLoaded = true;
      },
      async (err) => {
        this.fleetDataLoaded = false;
        console.log(err);
      }
    );
  }

  changeURL() {
    this.differentTruck = new Date().getTime();
  }

  onPicError(index) {
    this.members[index].thumbnail = '../../assets/fleet/user-outline.svg';
  }

  picError(index) {
    this.trucks[index] = '../../assets/home/truck.svg';
  }
}
