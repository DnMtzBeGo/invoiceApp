import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Step } from "../../shared/components/stepper/interfaces/Step";
import { GoogleLocation } from "src/app/shared/interfaces/google-location";
import { AuthService } from "src/app/shared/services/auth.service";
import { Order } from "../../shared/interfaces/order.model";
import * as moment from "moment";
import { GoogleMapsService } from "src/app/shared/services/google-maps/google-maps.service";
import { Router } from "@angular/router";
import { AlertService } from "src/app/shared/services/alert.service";
import { Subscription } from "rxjs";
@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit {
  @ViewChild("ordersRef") public ordersRef!: ElementRef;
  @Input() cardIsOpen: boolean = false;
  @Output() cardIsOpenChange = new EventEmitter<boolean>();
  @Input() draftData: any;
  @Input() locations: GoogleLocation = {
    pickup: "",
    dropoff: "",
    pickupLat: "",
    pickupLng: "",
    dropoffLat: "",
    dropoffLng: "",
    pickupPostalCode: 0,
    dropoffPostalCode: 0,
  };
  @Input() imageFromGoogle: any;
  screenshotOrderMap: any;
  requestScreenshotOrderMap: FormData = new FormData();

  creationTime: any;
  ordersSteps: Step[] = [
    {
      text: "1",
      nextBtnTxt: this.translateService.instant("orders.next-step"),
    },
    {
      text: "2",
      nextBtnTxt: this.translateService.instant("orders.continue-to-dropoff"),
    },
    {
      text: "3",
      nextBtnTxt: this.translateService.instant("orders.next-step"),
    },
    {
      text: "4",
      nextBtnTxt: this.translateService.instant("orders.proceed-checkout"),
    },
  ];

  validateRoute: boolean = false;
  progress: number = 0;
  hazardousFile?: File;

  public orderData: Order = {
    reference_number: "",
    status: -1,
    completion_percentage: this.progress,
    cargo: {
      "53_48": "",
      type: "",
      required_units: 1,
      description: "",
      weigth: [1],
    },
    pickup: {
      lat: 0,
      lng: 0,
      address: "",
      startDate: 0,
      zip_code: 0,
      contact_info: {
        name: "",
        telephone: "",
        email: "",
        country_code: "",
      },
    },
    dropoff: {
      startDate: 0,
      endDate: 0,
      extra_notes: "",
      lat: 0,
      lng: 0,
      zip_code: 0,
      address: "",
      contact_info: {
        name: "",
        telephone: "",
        email: "",
        country_code: "",
      },
    },
  };

  public ETA: number = 0;
  public minDropoff: any;
  public checkoutProgress: number = 0;
  public currentStepIndex: number = 0;
  public sendMap: boolean = false;

  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  stepsValidate = [false, false, false, false];

  private subscription: Subscription;

  public isOrderWithCP: boolean;

  constructor(
    private translateService: TranslateService,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private googlemaps: GoogleMapsService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.subscription = this.translateService.onLangChange.subscribe(
      (langChangeEvent: LangChangeEvent) => {
        switch (this.currentStepIndex) {
          case 0:
            this.typeOrder = this.translateService.instant("orders.title-pickup");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.translateService.instant("orders.next-step");
            break;
          case 1:
            this.typeOrder = this.translateService.instant("orders.title-pickup");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.translateService.instant("orders.continue-to-dropoff");
            break;
          case 2:
            this.typeOrder = this.translateService.instant("orders.title-dropoff");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.translateService.instant("orders.next-step");
            break;
          case 3:
            this.typeOrder = this.translateService.instant("orders.title-dropoff");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.translateService.instant("orders.proceed-checkout");
            break;
        }
      }
    );
  }

  typeOrder: string = this.translateService.instant("orders.title-pickup");
  btnStatusNext: boolean = false;

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ["", Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ["", Validators.required],
    });

    this.subscription = this.translateService.onLangChange.subscribe(
      (langChangeEvent: LangChangeEvent) => {
        if (this.currentStepIndex < 2) {
          this.typeOrder = this.translateService.instant("orders.title-pickup");
        } else {
          this.typeOrder = this.translateService.instant("orders.title-dropoff");
        }
      }
    );
  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.imageFromGoogle && !this.sendMap) {
      this.screenshotOrderMap = new File(this.imageFromGoogle, "image");
      this.requestScreenshotOrderMap.append("map", this.screenshotOrderMap);
      this.sendMap = true;
    }

    if (changes.locations && changes.locations.currentValue.pickupPostalCode > 0) {
      let locations = changes.locations.currentValue;
      this.orderData.pickup.address = locations.pickup;
      this.orderData.pickup.lat = locations.pickupLat;
      this.orderData.pickup.lng = locations.pickupLng;
      this.orderData.pickup.zip_code = locations.pickupPostalCode;
      this.orderData.dropoff.address = locations.dropoff;
      this.orderData.dropoff.lat = locations.dropoffLat;
      this.orderData.dropoff.lng = locations.dropoffLng;
      this.orderData.dropoff.zip_code = locations.dropoffPostalCode;
      this.getETA(locations);
    }
    if (changes.draftData && changes.draftData.currentValue) {
      this.getHazardous(changes.draftData.currentValue._id);
    }
    // this.locations = {
    //   dropoff: "Perif. Blvd. Manuel Ávila Camacho 3130, Valle Dorado, 54020 Tlalnepantla de Baz, Méx., Mexico",
    //   dropoffLat: '19.5475331',
    //   dropoffLng: '-99.2110099',
    //   dropoffPostalCode: 54020,
    //   pickup: "Mariano Matamoros, Sector Centro, 88000 Nuevo Laredo, Tamps., Mexico",
    //   pickupLat: '27.4955923',
    //   pickupLng: '-99.5077369',
    //   pickupPostalCode: 88000,
    // }
    // this.getETA(this.locations);
    // this.getCreationTime();
  }

  toggleCard() {
    this.cardIsOpen = !this.cardIsOpen;
  }

  /**
   * @returns The percentage of completion to create a new order
   */
  // calculateProgress(): number {
  //   let consecutivePositionValited = 0;

  //   for(let index in this.ordersSteps){

  //     if(this.ordersSteps[index].validated){
  //       consecutivePositionValited = parseInt(index) + 1;
  //     }
  //     else{
  //       break;
  //     }
  //   }

  //   return consecutivePositionValited/(this.ordersSteps.length-1) *100;
  // }
  calculateProgress(): number {
    this.checkoutProgress = (this.currentStepIndex / (this.ordersSteps.length - 1)) * 100;

    if (this.currentStepIndex < 2) {
      this.typeOrder = this.translateService.instant("orders.title-pickup");
    } else {
      this.typeOrder = this.translateService.instant("orders.title-dropoff");
    }

    if (this.currentStepIndex < 3) {
      this.btnStatusNext = false;
    } else {
      this.btnStatusNext = !this.validateForm();
    }

    this.ordersSteps.forEach((e, i) => {
      if (this.stepsValidate[i]) {
        e.validated = true;
        return false;
      } else {
        e.validated = false;
        return true;
      }
    });

    return this.checkoutProgress;
  }

  validateForm() {
    const v = this.stepsValidate;
    return v[0] && v[1] && v[2] && v[3];
  }

  nextSlide() {
    if (this.currentStepIndex < 3) {
      this.currentStepIndex = this.currentStepIndex + 1;
      if (this.currentStepIndex > 2) {
        this.btnStatusNext = !this.validateForm();
      }
    }

    if (
      this.stepsValidate[0] &&
      this.stepsValidate[1] &&
      this.stepsValidate[2] &&
      this.stepsValidate[3] &&
      this.currentStepIndex > 2
    ) {
      this.sendOrders("orders");
    }
  }

  prevSlide() {
    if (this.currentStepIndex > 0) this.currentStepIndex = this.currentStepIndex - 1;
    else this.cardIsOpenChange.emit(false);

    if (this.currentStepIndex < 3) {
      this.btnStatusNext = false;
    }
  }

  jumpStepTitle() {
    if (this.currentStepIndex < 2) {
      this.currentStepIndex = 2;
      this.typeOrder = this.translateService.instant("orders.title-dropoff");
    } else {
      this.currentStepIndex = 0;
      this.typeOrder = this.translateService.instant("orders.title-pickup");
    }
  }

  getStep1FormData(data: any) {
    this.orderData.pickup.contact_info.name = data.fullname;
    this.orderData.pickup.contact_info.telephone = data.phoneCode.concat(
      " ",
      data.phonenumber
    );
    this.orderData.pickup.contact_info.email = data.email;
    this.orderData.reference_number = data.reference;
    this.orderData.pickup.contact_info.country_code = data.country_code;
    if (this.isOrderWithCP) {
      this.orderData.pickup.contact_info["rfc"] = data.rfc;
    }
  }

  getStep2FormData(data: any) {
    if (data.datepickup && data.timepickup !== "") {
      this.orderData.pickup.startDate = this.convertDateMs(
        data.datepickup,
        data.timepickup
      );
      let sumETA = this.convertDateMs(data.datepickup, data.timepickup) + this.ETA;
      this.minDropoff = new Date(sumETA);
    } else {
      this.orderData.pickup.startDate = 0;
    }
    this.orderData.cargo["53_48"] = data.unitType;
    this.orderData.cargo.type = data.cargoType;
    this.orderData.cargo.required_units = data.cargoUnits;
    this.orderData.cargo.description = data.description;
    if (data.hazardousType !== "select-catergory" && data.hazardousType) {
      this.orderData.cargo["hazardous_type"] = data.hazardousType;
    }
    if (this.isOrderWithCP) {
      this.orderData.cargo["cargo_goods"] = data.cargo_goods;
    }
    this.orderData.cargo.weigth = data.cargoWeight;
  }

  getStep3FormData(data: any) {
    this.orderData.dropoff.contact_info.name = data.fullname;
    this.orderData.dropoff.contact_info.telephone = data.phoneCode.concat(
      " ",
      data.phonenumber
    );
    this.orderData.dropoff.contact_info.email = data.email;
    this.orderData.dropoff.contact_info.country_code = data.country_code;
    if (this.isOrderWithCP) {
      this.orderData.dropoff.contact_info["rfc"] = data.rfc;
    }
  }

  getStep4FormData(data: any) {
    this.orderData.dropoff.startDate = this.convertDateMs(
      data.datedropoff,
      data.timestartdropoff
    );
    this.orderData.dropoff.endDate = this.convertDateMs(
      data.datedropoff,
      data.timeenddropoff
    );
    this.orderData.dropoff.extra_notes = data.notes;
    if (this.stepsValidate.includes(false) && this.currentStepIndex > 2) {
      // console.log("COOOOOOOLLLLLLLLLLLLL");
    }
  }

  validStep1(valid: any) {
    if (valid) {
      this.stepsValidate[0] = true;
    } else {
      this.stepsValidate[0] = false;
    }
    this.calculateProgress();
  }

  validStep2(valid: any) {
    if (valid) {
      this.stepsValidate[1] = true;
    } else {
      this.stepsValidate[1] = false;
    }
    this.calculateProgress();
  }

  validStep3(valid: any) {
    if (valid) {
      this.stepsValidate[2] = true;
    } else {
      this.stepsValidate[2] = false;
    }
    this.calculateProgress();
  }

  validStep4(valid: any) {
    if (valid) {
      this.stepsValidate[3] = true;
    } else {
      this.stepsValidate[3] = false;
    }
    this.calculateProgress();
  }

  async getETA(locations: GoogleLocation) {
    let datos = {
      pickup: {
        lat: locations.pickupLat,
        lng: locations.pickupLng,
      },
      dropoff: {
        lat: locations.dropoffLat,
        lng: locations.dropoffLng,
      },
    };

    let requestJson = JSON.stringify(datos);

    (await this.auth.apiRest(requestJson, "orders/calculate_ETA")).subscribe(
      async (res) => {
        this.ETA = res.result.ETA;
        this.getCreationTime(locations);
      },
      async (res) => {
        console.log(res);
      }
    );
  }

  async getCreationTime(locations: GoogleLocation) {
    (await this.auth.apiRest("", "orders/get_creation_time")).subscribe(
      async (res) => {
        this.creationTime = moment().add(res.result.creation_time, "ms").toDate();
        // this.getETA(locations);
      },
      async (res) => {
        console.log(res);
      }
    );
  }

  async getHazardous(orderId: string) {
    let dataRequest = {
      order_id: orderId,
    };

    (
      await this.auth.apiRest(JSON.stringify(dataRequest), "orders/get_hazardous")
    ).subscribe(
      async ({ result }) => {
        console.log(result);
      },
      async (res) => {
        console.log(res);
      }
    );
  }

  convertDateMs(date: Date, time: Date) {
    let event = new Date(date);
    let hour = moment(time).hour();
    let minute = moment(time).minute();
    event.setHours(hour, minute, 0);
    return Date.parse(event.toString());
  }

  porcentageComplete(orderData: any) {
    if (orderData) {
      this.progress += 1 / 12;
    }
  }

  async sendOrders(page: string) {
    this.progress = 0;
    this.porcentageComplete(this.orderData.pickup.contact_info.name);
    this.porcentageComplete(this.orderData.pickup.contact_info.email);
    this.porcentageComplete(this.orderData.pickup.contact_info.telephone);
    this.porcentageComplete(this.orderData.reference_number);
    this.porcentageComplete(this.orderData.pickup.startDate);
    this.porcentageComplete(this.orderData.cargo.description);
    this.porcentageComplete(this.orderData.dropoff.contact_info.name);
    this.porcentageComplete(this.orderData.dropoff.contact_info.email);
    this.porcentageComplete(this.orderData.dropoff.contact_info.telephone);
    this.porcentageComplete(this.orderData.dropoff.startDate);
    this.porcentageComplete(this.orderData.dropoff.endDate);

    this.orderData.completion_percentage = this.progress;

    const requestJson = JSON.stringify(this.orderData);
    (await this.auth.apiRest(requestJson, "orders/create")).subscribe(
      async ({ result }) => {
        this.validateRoute = result.bego_order;
        if (this.hazardousFile) {
          const formData = new FormData();
          formData.append("order_id", result._id);
          // formData.append('file', this.hazardousFile[0]);
          (
            await this.auth.uploadFilesSerivce(formData, "orders/upload_hazardous")
          ).subscribe(async (data) => {
            // console.log(await data);
          });
        }
        this.router.navigate(['pricing'], {
          state: {
            orderId: result._id,
          },
        });
        this.uploadScreenShotOrderMap(result._id);
      },
      async (res) => {
        // this.errorAlert(res.error.error[this.lang]);
      }
    );
  }

  public async uploadScreenShotOrderMap(orderId: string) {
    this.requestScreenshotOrderMap.append("order_id", orderId);

    (
      await this.auth.uploadFilesSerivce(
        this.requestScreenshotOrderMap,
        "orders/upload_map"
      )
    ).subscribe(
      (res) => {},
      (error) => {
        console.log("Con el error", error.error.errror);
      }
    );
  }

  public toogleOrderWithCP() {
    this.isOrderWithCP = !this.isOrderWithCP;
  }
}
