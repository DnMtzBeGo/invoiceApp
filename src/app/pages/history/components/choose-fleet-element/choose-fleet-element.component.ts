import {
  Component,
  EventEmitter,
  forwardRef,
  Host,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { FleetElementType } from "src/app/shared/interfaces/FleetElement.type";
import { AuthService } from "src/app/shared/services/auth.service";
import { HistoryComponent } from "../../history.component";
import { NotificationsService } from "src/app/shared/services/notifications.service";

@Component({
  selector: "app-choose-fleet-element",
  templateUrl: "./choose-fleet-element.component.html",
  styleUrls: ["./choose-fleet-element.component.scss"],
})
export class ChooseFleetElementComponent implements OnInit {
  public elementToChoose: FleetElementType;
  public title: string;

  public selectedDriverId: string;
  public selectedTruckId: string;
  public selectedTrailerId: string;

  private titleTransLations = {
    drivers: this.translateService.instant("history.overview.label_driver"),
    trucks: this.translateService.instant("history.overview.label_vehicle"),
    trailers: this.translateService.instant("history.overview.label_trailer"),
  };

  private fleetInfo: string;
  private payload: any;

  @Input() orderInfo: any;
  @Output() goBack = new EventEmitter<void>();
  @Output() infoUpdated = new EventEmitter<void>();

  constructor(
    private translateService: TranslateService,
    private webservice: AuthService,
    @Inject(forwardRef(() => HistoryComponent))
    private historyComponent: HistoryComponent,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderInfo && Object.keys(this.orderInfo).length) {
      this.selectedDriverId = this.orderInfo?.driver?._id;
      this.selectedTruckId = this.orderInfo?.truck?._id;
      this.selectedTrailerId = this.orderInfo?.trailer?._id;
      this.updateFleetInfo();
    }
  }

  async updateFleetInfo(): Promise<void> {
    const { pickup, dropoff } = this.orderInfo;
    const payload = {
      fromDate: pickup.startDate,
      toDate: dropoff.endDate,
    };

    (
      await this.webservice.apiRest(
        JSON.stringify(payload),
        "/orders/calendar",
        { apiVersion: "v1.1" }
      )
    ).subscribe(({ result }) => {
      this.fleetInfo = result;
    });
  }

  setElementToChoose(elementToChoose: FleetElementType): void {
    this.elementToChoose = elementToChoose;
    this.title =
      this.translateService.instant("history.overview.btn-edit") +
      " " +
      this.titleTransLations[this.elementToChoose];
    this.updateFleetInfo();
  }

  async setChanges(): Promise<void> {
    (
      await this.webservice.apiRest(
        JSON.stringify(this.payload),
        "/orders/update_driver"
      )
    ).subscribe(
      () => {
        this.historyComponent.getOrderById(this.orderInfo._id).then(() => {
          this.goBack.emit();
          this.notificationsService.showSuccessToastr(
            this.translateService.instant("checkout.alerts.order-updated")
          );
        });
      },
      (error) => {
        console.error("Error: ", error);
      }
    );
  }

  setDriver(driver_id: string): void {
    this.selectedDriverId = driver_id;
    this.payload = {
      order_id: this.orderInfo._id,
      carrier_id: driver_id,
    };
  }

  setTruck(truck_id): void {
    this.selectedTruckId = truck_id;
    this.payload = {
      order_id: this.orderInfo._id,
      truck_id: truck_id,
    };
  }

  setTrailer(trailer_id): void {
    this.selectedTrailerId = trailer_id;
    this.payload = {
      order_id: this.orderInfo._id,
      trailer_id: trailer_id,
    };
  }
}
