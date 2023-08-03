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
import { Subscription, concat, from, of } from "rxjs";
import { mergeAll, switchMap, toArray, mapTo } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ContinueModalComponent } from "./components/continue-modal/continue-modal.component";
import { BegoMarks, BegoStepper, StepperOptions } from "@begomx/ui-components";
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
  @Input() datepickup: number;
  @Input() datedropoff: number;
  @Input() imageFromGoogle: any;
  @Input() membersToAssigned: any;
  @Input() userWantCP: boolean = false;
  screenshotOrderMap: any;
  requestScreenshotOrderMap: FormData = new FormData();

  creationTime: any;
  ordersSteps: Step[] = [
    {
      text: "1",
      nextBtnTxt: this.translateService.instant("orders.continue-to-dropoff"),
    },
    {
      text: "2",
      nextBtnTxt: this.translateService.instant("orders.next-step"),
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
  hazardousFileAWS: object = {};
  catalogsDescription: object = {};

  public orderData: Order = {
    stamp: false,
    reference_number: null,
    status: -1,
    completion_percentage: this.progress,
    cargo: {
      "53_48": "",
      type: "",
      required_units: 1,
      description: "",
      weigth: [1],
      hazardous_type: "",
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
      place_id_pickup: ""
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
      place_id_dropoff: ""
    },
  };

  public ETA: number = 0;
  public minDropoff: any;
  public checkoutProgress: number = 0;
  public sendMap: boolean = false;

  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  stepsValidate = [false, false, false, false];

  private subscription: Subscription;

  public isOrderWithCP: boolean = false;
  public orderWithCPFields = {
    pickupRFC: false,
    cargo_goods: false,
    dropoffRFC: false,
    unit_type: false,
  };
  public hazardousCPFields = {
    packaging: false,
    hazardous_material: false,
  };
  public editCargoWeightNow: boolean = false;
  public hasEditedCargoWeight: boolean = false;

  public resEncoder: any;
  public pickupLat: any;
  public pickupLng: any;
  public dropoffLat: any;
  public dropoffLng: any;
  public screenshotCanvas: any;
  public thumbnailMap: Array<any> = [];
  public thumbnailMapFile: Array<any> = [];

  @ViewChild(BegoStepper) stepperRef: BegoStepper;
  @ViewChild(BegoMarks) marksRef: BegoMarks;

  get currentStepIndex(): number {
    return this.stepperRef?.controller.currentStep ?? 0;
  }

  set currentStepIndex(step: number) {
    this.stepperRef?.controller.setStep(step)
  }

  stepperOptions: StepperOptions = {
    allowTouchMove: false,
  }

  constructor(
    private translateService: TranslateService,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private googlemaps: GoogleMapsService,
    private router: Router,
    private alertService: AlertService,
    private dialog: MatDialog
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
            this.typeOrder = this.translateService.instant("orders.title-dropoff");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.translateService.instant("orders.continue-to-dropoff");
            break;
          case 2:
            this.typeOrder = this.translateService.instant("orders.title-cargo-info");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.translateService.instant("orders.next-step");
            break;
          case 3:
            this.typeOrder = this.translateService.instant("orders.title-dropoff");
            this.ordersSteps[this.currentStepIndex].nextBtnTxt =
              this.userWantCP ? this.translateService.instant("orders.proceed-checkout") : this.translateService.instant("orders.create-order");
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

  ngAfterViewInit(): void {
    this.marksRef.controller = this.stepperRef.controller
  }

  ngOnDestroy() {
    if(this.membersToAssigned.hasOwnProperty('drivers') && this.membersToAssigned.hasOwnProperty('trucks') && this.membersToAssigned.hasOwnProperty('trailers')) {
      this.sendOrders("drafts")
    }
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.imageFromGoogle && !this.sendMap) {
      this.screenshotOrderMap = new File(this.imageFromGoogle, "image");
      this.requestScreenshotOrderMap.set("map", this.screenshotOrderMap);
      this.sendMap = true;
    }

    if (changes.locations && changes.locations.currentValue.pickupPostalCode > 0) {
      let locations = changes.locations.currentValue;

      this.orderData.pickup.place_id_pickup = locations.place_id_pickup;
      this.orderData.dropoff.place_id_dropoff = locations.place_id_dropoff;
      this.orderData.pickup.address = locations.pickup;
      this.orderData.pickup.lat = locations.pickupLat;
      this.orderData.pickup.lng = locations.pickupLng;
      this.orderData.pickup.zip_code = locations.pickupPostalCode;
      this.orderData.dropoff.address = locations.dropoff;
      this.orderData.dropoff.lat = locations.dropoffLat;
      this.orderData.dropoff.lng = locations.dropoffLng;
      this.orderData.dropoff.zip_code = locations.dropoffPostalCode;
      this.orderData.pickup;
      this.pickupLat = locations.pickupLat;
      this.pickupLng = locations.pickupLng;
      this.dropoffLat = locations.dropoffLat;
      this.dropoffLng = locations.dropoffLng;
      this.getETA(locations);
    }
    if (changes.draftData && changes.draftData.currentValue) {
      this.getHazardous(changes.draftData.currentValue._id);
      if(changes.draftData.currentValue.hasOwnProperty('stamp') && changes.draftData.currentValue.stamp) {
        this.getCatalogsDescription(changes.draftData.currentValue._id);
      }
    }

    if (changes.datepickup && changes.datepickup.currentValue) {
      this.orderData.pickup.startDate = this.datepickup;
    }
    if (changes.datedropoff && changes.datedropoff.currentValue) {
      this.orderData.dropoff.startDate = this.datedropoff;
      this.orderData.dropoff.endDate = this.datedropoff;
    }
    if (changes.hasOwnProperty("userWantCP")) {
      this.isOrderWithCP = this.userWantCP;
    }

    this.ordersSteps[3].nextBtnTxt = this.userWantCP? this.translateService.instant("orders.proceed-checkout") : this.translateService.instant("orders.create-order"); 
  }
  toggleCard() {
    this.cardIsOpen = !this.cardIsOpen;
  }

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
    if (
      this.stepsValidate[0] &&
      this.stepsValidate[1] &&
      this.stepsValidate[2] &&
      this.stepsValidate[3] &&
      this.currentStepIndex === 3
    ) {
      this.isOrderWithCP ? this.checkCPFields() : this.sendOrders("orders");
    }

    if (this.currentStepIndex === 1 && !this.hasEditedCargoWeight) {
      this.editCargoWeightNow = true;
    }

    if (this.currentStepIndex < 3) {
      this.currentStepIndex = this.currentStepIndex + 1;
      if (this.currentStepIndex > 2) {
        this.btnStatusNext = !this.validateForm();
      }
    }
  }

  prevSlide() {
    if (this.currentStepIndex === 0) return;
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
      if (this.validateRFC(data.rfc)) {
        this.orderWithCPFields.pickupRFC = true;
      } else {
        this.orderWithCPFields.pickupRFC = false;
      }
    }
  }

  getStep2FormData(data: any) {
    this.orderData.cargo["53_48"] = data.unitType;
    this.orderData.cargo.type = data.cargoType;
    this.orderData.cargo.required_units = data.cargoUnits;
    this.orderData.cargo.description = data.description;

    if(data.hazardousFile) {
      this.hazardousFile = data.hazardousFile;
    }

    if (data.hazardous_type != "select-catergory" && data.hazardous_type) {
      this.orderData.cargo["hazardous_type"] = data.hazardous_type;
    }
    if (this.isOrderWithCP) {
      this.orderData.cargo["cargo_goods"] = data.cargo_goods;
      data.cargo_goods !== ""
        ? (this.orderWithCPFields.cargo_goods = true)
        : (this.orderWithCPFields.cargo_goods = false);
      if (data.cargoType && data.cargoType === "hazardous") {
        this.orderData.cargo["hazardous_material"] = data.hazardous_material;
        data.hazardous_material !== ""
          ? (this.hazardousCPFields.hazardous_material = true)
          : (this.hazardousCPFields.hazardous_material = false);
        this.orderData.cargo["packaging"] = data.packaging;
        data.packaging !== ""
          ? (this.hazardousCPFields.packaging = true)
          : (this.hazardousCPFields.packaging = false);
      }
      this.orderData.cargo["unit_type"] = data.satUnitType;
      data.satUnitType !== ""
        ? (this.orderWithCPFields.unit_type = true)
        : (this.orderWithCPFields.unit_type = false);
      this.orderData.cargo["commodity_quantity"] = data.commodity_quantity;
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
      if (this.validateRFC(data.rfc)) {
        this.orderWithCPFields.dropoffRFC = true;
      } else {
        this.orderWithCPFields.dropoffRFC = false;
      }
    }
  }

  getStep4FormData(data: any) {
    this.orderData.dropoff.extra_notes = data.notes;
    if (this.stepsValidate.includes(false) && this.currentStepIndex > 2) {
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
        if(result.url.length > 0) {
          this.hazardousFileAWS = result;
        }
      },
      async (res) => {
        console.log(res);
      }
    );
  }

  private async getCatalogsDescription(id) {
    let requestCatalogsDescription = {
      order_id: id
    };

    (await this.auth.apiRest(JSON.stringify(requestCatalogsDescription), 'orders/get_order_catalogs')).subscribe( res => {
      this.catalogsDescription = res.result.cargo;
    }, error => {
      console.log('Something went wrong', error.error);
    })
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
    this.orderData["driver"] = this.membersToAssigned["drivers"]._id;
    this.orderData["truck"] = this.membersToAssigned["trucks"]._id;
    this.orderData["trailer"] = this.membersToAssigned["trailers"]._id;
    this.orderData["stamp"] = this.isOrderWithCP;

    const requestJson = JSON.stringify(this.orderData);
    (await this.submitCreateOrder(requestJson, page)).subscribe(
      async ({ result }) => {
        this.uploadScreenShotOrderMap(result._id);
        this.validateRoute = result.bego_order;
        if (this.hazardousFile) {
          const formData = new FormData();
          formData.set("order_id", result._id);
          formData.set('file', this.hazardousFile);
          (
            await this.auth.uploadFilesSerivce(formData, "orders/upload_hazardous")
          ).subscribe(async (data) => {
          });
        }
        if(this.userWantCP && page != 'drafts'){
          this.router.navigate(["pricing"], {
            state: {
              orderId: result._id,
            },
          });
        }
        else if(page != 'drafts') {
          this.alertService.create({
            body: this.translateService.instant('orders.create'),
            handlers: [
              {
                text: this.translateService.instant('checkout.btn-continue'),
                color: '#FFE000',
                action: async () => {
                  this.alertService.close();
                  location.reload();
                }
              }
            ]
          });
        }
      },
      async (res) => {
       console.log('Something went wrong', res.error)
      }
    );
  }

  submitCreateOrder(order, page) {
    order = JSON.parse(order);

    if (order.stamp || page === 'drafts') {
      return this.auth.apiRest(JSON.stringify(order), "carriers/create_order");
    }

    const { driver: carrier_id, truck: id_truck, trailer: id_trailer } = order;

    delete order.driver;
    delete order.truck;
    delete order.trailer;

    // create order
    return from(this.auth.apiRest(JSON.stringify(order), "carriers/create_order"))
      .pipe(
        mergeAll(),
        switchMap((responseData) =>
          concat(
            // assign carrier, truck & trailer
            from(this.auth.apiRest(JSON.stringify({
              order_id: responseData.result._id,
              carrier_id,
              id_truck,
              id_trailer,
            }), "orders/assign_order", { apiVersion: "v1.1" })).pipe(mergeAll()),
            // update status
            from(this.auth.apiRest(JSON.stringify({
              order_id: responseData.result._id,
              order_status: 1,
            }), "orders/update_status")).pipe(mergeAll()),
          ).pipe(
            toArray(),
            mapTo(of(responseData)),
          )
        ),
      )
      .toPromise();
  }

  public async uploadScreenShotOrderMap(orderId: string) {
    this.requestScreenshotOrderMap.set("order_id", orderId);

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

  public validateRFC(rfc: string) {
    const rfcRegex =
      /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/;
    const result = rfcRegex.test(rfc);
    return result;
  }

  public checkCPFields() {
    if (this.isOrderWithCP) {
      const leftList = [];
      for (const item in this.orderWithCPFields) {
        this.orderWithCPFields[item] === false && leftList.push(item);
      }
      if (this.orderData.cargo.type === "hazardous") {
        for (const item in this.hazardousCPFields) {
          this.hazardousCPFields[item] === false && leftList.push(item);
        }
      }
      if (leftList.length > 0) {
        this.showModal(leftList);
      } else {
        this.sendOrders("orders");
      }
    } else {
      this.sendOrders("orders");
    }
  }

  public showModal(leftList) {
    const modalData = {
      title: "Para generar carta porte:",
      list: leftList,
    };
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      panelClass: "modal",
      data: modalData,
    });
    dialogRef.afterClosed().subscribe(async (res) => {
      res ? this.sendOrders("orders") : (this.currentStepIndex = 0);
    });
  }

  public cargoWeightEdited() {
    this.hasEditedCargoWeight = true;
  }
}
