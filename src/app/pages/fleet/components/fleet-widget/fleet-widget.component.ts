import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { routes } from '../../consts';
import { Observable, Subscription } from 'rxjs';

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

  @Input()
  refreshNotifier?: Observable<void>;

  fleetDetails: any;
  fleetNameFromService: string;
  fleetName: string;
  members: Array<any> = [];
  trucks: Array<any> = [];
  trailers: Array<Object> = [];
  primeVehicles: Array<any> = [];
  hasTruck: boolean = false;
  hasChange: boolean = false;
  hasMembers: boolean = false;
  differentTruck: number;
  haveTimeOut: any;
  changeByBlur: boolean = false;
  changeNameSuccessfull: boolean = false;
  prevUrlTrucks: string;
  fleetDataLoaded: boolean = false;

  lang = 'en';
  langListener: Subscription;

  isPrime = false;

  constructor(
    private webService: AuthService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.lang = this.translateService.currentLang;
    this.langListener = this.translateService.onLangChange.subscribe((lang) => {
      this.lang = lang.lang;
    });

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd && ev.url === '/fleet') {
        this.prevUrlTrucks = ev.url;
      }
    });
  }

  ngOnInit() {
    this.getFleetDetails();
    this.changeURL();

    this.refreshNotifier?.subscribe(() => this.getFleetDetails());
  }

  ngOnDestroy() {
    this.langListener.unsubscribe();
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
    try {
      const [fleets, vehicles]: any[] = await Promise.allSettled([
        (await this.webService.apiRest('', 'fleet/overview', { loader: 'false' })).toPromise(),
        this.getPrimeVehicles()
      ]);

      const res = fleets?.value.result;

      this.primeVehicles = vehicles?.value;
      this.fleetDetails = fleets?.value.result;

      this.members = res.members || [];
      if (this.members.length > 0) this.hasMembers = true;

      this.trucks = res.trucks || [];
      this.hasChange = true;
      if (this.trucks.length > 0) this.hasTruck = true;

      this.trailers = res.trailers || [];

      this.fleetNameFromService = res.name;
      this.fleetName = this.fleetNameFromService;

      this.fleetDataLoaded = true;
      this.cdr.markForCheck();
    } catch (err) {
      this.fleetDataLoaded = false;
      console.log(err);
    }
  }

  async getPrimeVehicles() {
    const { result } = await (await this.webService.apiRest('', 'carriers/home')).pipe().toPromise();
    this.isPrime = Boolean(result.subscription);

    if (!this.isPrime) return [];

    const q = new URLSearchParams([
      ['fromDate', '0'],
      ['toDate', '0']
    ]);

    const { result: categories } = await (await this.webService.apiRestGet('orders/vehicles', { apiVersion: 'v1.1' })).toPromise();

    const requests = categories.map(async (group) => {
      if (!group.has_vehicles) return;

      const { result } = await (
        await this.webService.apiRestGet(`orders/vehicles/${group._id}?${q.toString()}`, { apiVersion: 'v1.1' })
      ).toPromise();

      return {
        ...group,
        vehicles: result
      };
    });

    const vehicles = (await Promise.allSettled(requests))
      .filter((data) => data.status === 'fulfilled' && data.value)
      .map((data: any) => data.value);

    return vehicles;
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
