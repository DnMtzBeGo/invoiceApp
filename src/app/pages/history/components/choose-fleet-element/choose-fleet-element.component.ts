import { Component, EventEmitter, forwardRef, Host, Inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FleetElementType } from 'src/app/shared/interfaces/FleetElement.type';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { AlertService } from 'src/app/shared/services/alert.service';

interface SelectedFleetElements {
  carrier_id?: string;
  truck_id?: string;
  trailer_id?: string;
}

interface TitleTransLations {
  driver: string;
  truck: string;
  trailer: string;
}
@Component({
  selector: 'app-choose-fleet-element',
  templateUrl: './choose-fleet-element.component.html',
  styleUrls: ['./choose-fleet-element.component.scss']
})
export class ChooseFleetElementComponent implements OnInit {
  public elementToChoose: FleetElementType;
  public title: string;

  public disableSelectBtn: boolean = true;

  public selectedFleetElements: SelectedFleetElements;

  public filteredTrailers: any[];

  private titleTransLations: TitleTransLations;

  public fleetInfo: any;
  private payload: any;

  @Input() orderInfo: any;
  @Output() goBack = new EventEmitter<void>();
  @Output() infoUpdated = new EventEmitter<void>();

  constructor(
    private translateService: TranslateService,
    private webservice: AuthService,
    private notificationsService: NotificationsService,
    private alertService: AlertService
  ) {
    this.titleTransLations = {
      driver: this.translateService.instant('history.overview.label_driver'),
      truck: this.translateService.instant('history.overview.label_vehicle'),
      trailer: this.translateService.instant('history.overview.label_trailer')
    };
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderInfo && Object.keys(this.orderInfo).length) {
      this.setOriginalValues();

      this.updateFleetInfo();
      this.updateDisableSelectBtn();
    }
  }

  async updateFleetInfo(): Promise<void> {
    this.setOriginalValues();

    const [ pickup, dropoff ] = this.orderInfo.destinations;
    const payload = {
      fromDate: pickup.start_date,
      toDate: dropoff.end_date
    };

    (await this.webservice.apiRest(JSON.stringify(payload), '/orders/calendar', { apiVersion: 'v1.1' })).subscribe(({ result }) => {
      this.fleetInfo = result;
      this.filteredTrailers = this.fleetInfo.trailers.filter((trailer) => trailer.type == this.orderInfo.cargo['53_48']);
    });
  }

  setElementToChoose(elementToChoose: FleetElementType): void {
    this.elementToChoose = elementToChoose;
    this.title = this.translateService.instant('history.overview.btn-edit') + ' ' + this.titleTransLations[this.elementToChoose];
    this.updateFleetInfo();
  }

  async setChanges(): Promise<void> {
    (await this.webservice.apiRest(JSON.stringify(this.payload), '/orders/update_driver')).subscribe(
      () => {
        this.notificationsService.showSuccessToastr(this.translateService.instant('checkout.alerts.order-updated'));
        this.infoUpdated.emit(this.orderInfo._id);
      },
      (error) => {
        console.error('Error: ', error);
      }
    );
  }

  setDriver({ _id, availability, can_stamp }) {
    const setChanges = () => {
      this.selectedFleetElements = { ...this.selectedFleetElements, carrier_id: _id };
      this.payload = { order_id: this.orderInfo._id, carrier_id: _id };
      this.updateDisableSelectBtn();
    };

    if (!can_stamp && this.orderInfo.stamp) {
      this.showCantSelectElementToast();
      return;
    }

    if (!availability && _id !== this.orderInfo.driver._id) {
      this.alertService.create({
        title: this.translateService.instant('history.alerts.driver_unavailable.title'),
        body: this.translateService.instant('history.alerts.driver_unavailable.message'),
        handlers: [
          {
            text: this.translateService.instant('Ok'),
            color: '#FFE000',
            action: async () => {
              setChanges();
              this.alertService.close();
            }
          },
          {
            text: this.translateService.instant('orders.btn-cancel'),
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
            }
          }
        ]
      });
      return;
    }

    setChanges();
  }

  setTruck({ availability, _id, can_stamp }) {
    const setChanges = () => {
      this.selectedFleetElements = { ...this.selectedFleetElements, truck_id: _id };
      this.payload = { order_id: this.orderInfo._id, truck_id: _id };
      this.updateDisableSelectBtn();
    };

    if (!can_stamp && this.orderInfo.stamp) {
      this.showCantSelectElementToast();
      return;
    }

    if (!availability && _id !== this.orderInfo.truck._id) {
      this.alertService.create({
        title: this.translateService.instant('history.alerts.trailer_unavailable.title'),
        body: this.translateService.instant('history.alerts.truck_unavailable.message'),
        handlers: [
          {
            text: this.translateService.instant('Ok'),
            color: '#FFE000',
            action: async () => {
              setChanges();
              this.alertService.close();
            }
          },
          {
            text: this.translateService.instant('orders.btn-cancel'),
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
            }
          }
        ]
      });
      return;
    }

    setChanges();
  }

  setTrailer({ _id, availability, can_stamp }) {
    const setChanges = () => {
      this.selectedFleetElements = { ...this.selectedFleetElements, trailer_id: _id };
      this.payload = { order_id: this.orderInfo._id, trailer_id: _id };
      this.updateDisableSelectBtn();
    };

    if (!can_stamp && this.orderInfo.stamp) {
      this.showCantSelectElementToast();
      return;
    }

    if (!availability && _id !== this.orderInfo.trailer._id) {
      this.alertService.create({
        title: this.translateService.instant('history.alerts.trailer_unavailable.title'),
        body: this.translateService.instant('history.alerts.trailer_unavailable.message'),
        handlers: [
          {
            text: this.translateService.instant('Ok'),
            color: '#FFE000',
            action: async () => {
              setChanges();
              this.alertService.close();
            }
          },
          {
            text: this.translateService.instant('orders.btn-cancel'),
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
            }
          }
        ]
      });
      return;
    }

    setChanges();
  }

  private updateDisableSelectBtn(): boolean {
    const keys = { driver: 'carrier_id', truck: 'truck_id', trailer: 'trailer_id' };

    const originalValue = this.orderInfo[this.elementToChoose]?._id;
    const selectedValue = this.selectedFleetElements[keys[this.elementToChoose]];

    this.disableSelectBtn = originalValue == selectedValue;
    return this.disableSelectBtn;
  }

  setOriginalValues() {
    this.selectedFleetElements = {
      carrier_id: this.orderInfo?.driver?._id,
      truck_id: this.orderInfo?.truck?._id,
      trailer_id: this.orderInfo?.trailer?._id
    };
  }

  private showCantSelectElementToast() {
    this.alertService.create({
      title: this.translateService.instant('home.manager.member-assignment.cant-select'),
      body: this.translateService.instant('home.manager.member-assignment.info-missing'),
      handlers: [
        {
          text: this.translateService.instant('Ok'),
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
          }
        }
      ]
    });
  }
}
