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

  public disableSelectBtn: boolean = true;

  public selectedFleetElements = {
    carrier_id: "",
    truck_id: "",
    trailer_id: "",
  };

  public filteredTrailers: any[];

  private titleTransLations = {
    driver: this.translateService.instant("history.overview.label_driver"),
    truck: this.translateService.instant("history.overview.label_vehicle"),
    trailer: this.translateService.instant("history.overview.label_trailer"),
  };

  private fleetInfo: any;
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
      this.selectedFleetElements = {
        carrier_id: this.orderInfo?.driver?._id,
        truck_id: this.orderInfo?.truck?._id,
        trailer_id: this.orderInfo?.trailer?._id,
      };

      this.updateFleetInfo();
      this.updateDisableSelectBtn();
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
      this.filteredTrailers = this.fleetInfo.trailers.filter((trailer)=>trailer.type == this.orderInfo.cargo['53_48']);

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

  setFleetElement(values) {
    this.selectedFleetElements = { ...this.selectedFleetElements, ...values };
    this.payload = { order_id: this.orderInfo._id, ...values };
    this.updateDisableSelectBtn();
  }

  private updateDisableSelectBtn(): boolean {
    const keys = { driver: 'carrier_id', truck: 'truck_id', trailers: 'trailer_id'};

    const originalValue =  this.orderInfo[this.elementToChoose]?._id;
    const selectedValue = this.selectedFleetElements[keys[this.elementToChoose]];

    this.disableSelectBtn = originalValue == selectedValue;
    return this.disableSelectBtn;
  }

}
