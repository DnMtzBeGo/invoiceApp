import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BegoMarks, BegoStepper, StepperOptions } from '@begomx/ui-components';

import { Step } from '../../shared/components/stepper/interfaces/Step';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Order } from '../../shared/interfaces/order.model';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ContinueModalComponent } from './components/continue-modal/continue-modal.component';
import { SelectFleetModalComponent } from './components/select-fleet-modal/select-fleet-modal.component';
import { LocationsService } from '../../services/locations.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

export interface OrderPreview {
  destinations: string[];
  order_id: string;
  order_number: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  @ViewChild('ordersRef') public ordersRef!: ElementRef;
  @Input() public cardIsOpen: boolean = false;
  @Output() public cardIsOpenChange = new EventEmitter<boolean>();
  @Output() public stepChange = new EventEmitter<number>();
  @Input() public draftData: any;
  @Input() public locations: GoogleLocation = {
    pickup: '',
    dropoff: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    pickupPostalCode: 0,
    dropoffPostalCode: 0,
  };
  @Input() public datepickup: number;
  @Input() public datedropoff: number;
  @Input() public imageFromGoogle: any;
  @Input() public membersToAssigned: any;
  @Input() public userWantCP: boolean = false;
  @Input() public orderType: string;

  private screenshotOrderMap: any;
  private requestScreenshotOrderMap: FormData = new FormData();

  public creationTime: any;
  public ordersSteps: Step[];
  public ordersStepsOCL: Step[];

  private hazardousFile?: File;
  public hazardousFileAWS: object = {};
  public catalogsDescription: object = {};

  private multipleCargoFile?: File;

  @Input() public orderPreview?: OrderPreview;

  public orderData: Order = {
    stamp: false,
    reference_number: null,
    status: -1,
    cargo: {
      '53_48': '',
      'type': '',
      'required_units': 1,
      'description': '',
      'weigth': [1000],
      'hazardous_type': '',
      'unit_type': '',
      'packaging': '',
      'cargo_goods': '',
      'commodity_quantity': 0,
      'hazardous_material': '',
    },
    pickup: {
      lat: 0,
      lng: 0,
      address: '',
      startDate: 0,
      zip_code: 0,
      contact_info: {
        name: '',
        telephone: '',
        email: '',
        country_code: '',
      },
      place_id_pickup: '',
    },
    dropoff: {
      startDate: 0,
      endDate: 0,
      extra_notes: '',
      lat: 0,
      lng: 0,
      zip_code: 0,
      address: '',
      contact_info: {
        name: '',
        telephone: '',
        email: '',
        country_code: '',
      },
      place_id_dropoff: '',
    },
    pricing: {
      deferred_payment: false,
      subtotal: 0,
      currency: 'mxn',
    },
    invoice: {
      address: '',
      company: '',
      rfc: '',
      cfdi: '',
      tax_regime: '',
      series_id: '',
    },
  };

  public ETA: number = 0;
  public minDropoff: any;
  public sendMap: boolean = false;

  public isLinear = false;
  public firstFormGroup!: FormGroup;
  public secondFormGroup!: FormGroup;

  public stepsValidate = [false, false, false, false, false];
  public stepsValidateOCL = [false, false];

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

  public typeOrder: string;
  public btnStatusNext: boolean = false;

  public lang: string = 'en';
  public clearFailedMultipleFile: boolean = false;
  public clearUploadedMultipleFile: boolean = false;

  @ViewChild('stepper') private stepperRef: BegoStepper;
  @ViewChild('marks') private marksRef: BegoMarks;

  public get currentStepIndex(): number {
    return this.stepperRef?.controller?.currentStep ?? 0;
  }

  public set currentStepIndex(step: number) {
    this.stepperRef?.controller.setStep(step);
  }

  public stepperOptions: StepperOptions = {
    allowTouchMove: false,
    autoHeight: true,
  };
  private orderPreviewReceived = new Subject();
  private orderPreviewSubscription: Record<string, Subscription | null> = {};

  constructor(
    private translateService: TranslateService,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private googlemaps: GoogleMapsService,
    private router: Router,
    private alertService: AlertService,
    private locationsService: LocationsService,
    private dialog: MatDialog,
    private readonly notificationService: NotificationsService,
  ) {}

  private afterOrderPreviewReceived(identifier: string, callback: (orderPreview: Record<string, any>) => any) {
    const subsExists = this.orderPreviewSubscription[identifier];
    if (!subsExists) {
      this.orderPreviewSubscription[identifier] = this.orderPreviewReceived.subscribe((orderPreview) => {
        callback(orderPreview);
        this.orderPreviewSubscription[identifier].unsubscribe();
        this.orderPreviewSubscription[identifier] = null;
      });
    }
  }

  public ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });

    this.lang = localStorage.getItem('lang') || 'en';
    this.updateStepTexts();
    this.subscription = this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.updateStepTexts();
      this.lang = langChangeEvent.lang;
    });
  }

  public ngAfterViewInit(): void {
    this.marksRef.controller = this.stepperRef.controller;
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.orderType) {
      Promise.resolve().then(() => {
        if (this.marksRef) this.marksRef.controller = this.stepperRef.controller;
      });
    }

    if (changes.orderPreview && changes.orderPreview.currentValue) {
      this.orderPreviewReceived.next(changes.orderPreview.currentValue);
    }

    if (this.imageFromGoogle && !this.sendMap) {
      this.screenshotOrderMap = new File(this.imageFromGoogle, 'image');
      this.requestScreenshotOrderMap.set('map', this.screenshotOrderMap);
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
      const draftData = changes.draftData.currentValue;
      this.getHazardous(draftData._id);
      if (changes.draftData.currentValue.hasOwnProperty('stamp') && draftData.stamp) {
        this.getCatalogsDescription(draftData._id);
      }

      this.orderData.cargo = {
        ...draftData.cargo,
        '53_48': draftData.cargo?.trailer?.load_cap,
      };

      this.draftData = { ...draftData };
    }

    if (changes.datepickup && changes.datepickup.currentValue) {
      this.orderData.pickup.startDate = this.datepickup;
    }
    if (changes.datedropoff && changes.datedropoff.currentValue) {
      this.orderData.dropoff.startDate = this.datedropoff;
      this.orderData.dropoff.endDate = this.datedropoff;
    }
    if (changes.hasOwnProperty('userWantCP')) {
      this.isOrderWithCP = this.userWantCP;
    }
  }
  public toggleCard() {
    this.cardIsOpen = !this.cardIsOpen;
  }

  public updateStatus() {
    this.updateTitleText();

    if (this.stepperRef?.controller.isLastStep()) {
      this.btnStatusNext = !this.validateForm();
    } else {
      this.btnStatusNext = false;
    }

    this.stepChange.emit(this.currentStepIndex);
  }

  private validateForm() {
    const validate = this.orderType === 'FTL' ? this.stepsValidate.slice(0, -2) : this.stepsValidateOCL;

    return validate.every(Boolean);
  }

  public nextSlide() {
    if (!this.stepperRef.controller.isLastStep()) {
      if (
        this.orderType === 'FTL' &&
        this.currentStepIndex === 2 &&
        !this.hasEditedCargoWeight &&
        !this.multipleCargoFile
      ) {
        this.editCargoWeightNow = true;
      }

      this.currentStepIndex += 1;
    } else if (this.validateForm()) {
      if (this.multipleCargoFile) {
        this.completeOrder();
        return;
      }

      if (this.isOrderWithCP && this.orderType === 'FTL') {
        this.checkCPFields();
      } else {
        this.completeOrder();
      }
    }
  }

  public prevSlide() {
    if (this.currentStepIndex === 0) return;
    if (this.currentStepIndex > 0) this.currentStepIndex = this.currentStepIndex - 1;
    else this.cardIsOpenChange.emit(false);

    if (this.currentStepIndex < 3) {
      this.btnStatusNext = false;
    }
  }

  public jumpStepTitle() {
    this.updateTitleText();
  }

  public getStep1FormData(data: any) {
    this.orderData.pickup.contact_info.name = data.fullname;
    this.orderData.pickup.contact_info.telephone = data.phoneCode.concat(' ', data.phonenumber);
    this.orderData.pickup.contact_info.email = data.email;
    this.orderData.reference_number = data.reference;
    this.orderData.pickup.contact_info.country_code = data.country_code;
    this.orderData.pickup.startDate = data.start_date;
    if (this.isOrderWithCP) {
      this.orderData.pickup.tax_information = {
        rfc: data.rfc,
        company_name: data.company_name,
        registration_number: data.registration_number,
        country_of_residence: data.country_of_residence,
      };
      if (this.validateRFC(data.rfc)) {
        this.orderWithCPFields.pickupRFC = true;
      } else {
        this.orderWithCPFields.pickupRFC = false;
      }
    }

    this.orderData = { ...this.orderData };
  }

  public getStep2FormData(data: any) {
    this.orderData.dropoff.contact_info.name = data.fullname;
    this.orderData.dropoff.contact_info.telephone = data.phoneCode.concat(' ', data.phonenumber);
    this.orderData.dropoff.contact_info.email = data.email;
    this.orderData.dropoff.contact_info.country_code = data.country_code;
    this.orderData.dropoff.extra_notes = data.extra_notes;
    if (this.isOrderWithCP) {
      this.orderData.dropoff.tax_information = {
        rfc: data.rfc,
        company_name: data.company_name,
        country_of_residence: data.country_of_residence,
        registration_number: data.registration_number,
      };
      if (this.validateRFC(data.rfc)) {
        this.orderWithCPFields.dropoffRFC = true;
      } else {
        this.orderWithCPFields.dropoffRFC = false;
      }
    }

    this.orderData = { ...this.orderData };
  }

  public getStep3FormData(data: any) {
    this.orderData.cargo['53_48'] = data.unitType;
    this.orderData.cargo.type = data.cargoType;
    this.orderData.cargo.required_units = data.cargoWeight.length;
    this.orderData.cargo.description = data.description;

    if (data.hazardousFile) {
      this.hazardousFile = data.hazardousFile;
    }

    // if (data.multipleCargoFile) {
    this.multipleCargoFile = data?.multipleCargoFile;
    // }

    if (data.hazardous_type != 'select-catergory' && data.hazardous_type) {
      this.orderData.cargo['hazardous_type'] = data.hazardous_type;
    }
    if (this.isOrderWithCP) {
      this.orderData.cargo['cargo_goods'] = data.cargo_goods;
      data.cargo_goods !== ''
        ? (this.orderWithCPFields.cargo_goods = true)
        : (this.orderWithCPFields.cargo_goods = false);
      if (data.cargoType && data.cargoType === 'hazardous') {
        this.orderData.cargo['hazardous_material'] = data.hazardous_material;
        data.hazardous_material !== ''
          ? (this.hazardousCPFields.hazardous_material = true)
          : (this.hazardousCPFields.hazardous_material = false);
        this.orderData.cargo['packaging'] = data.packaging;
        data.packaging !== '' ? (this.hazardousCPFields.packaging = true) : (this.hazardousCPFields.packaging = false);
      }
      this.orderData.cargo['unit_type'] = data.satUnitType;
      data.satUnitType !== '' ? (this.orderWithCPFields.unit_type = true) : (this.orderWithCPFields.unit_type = false);
      this.orderData.cargo['commodity_quantity'] = data.commodity_quantity;
    }

    this.orderData.cargo.weigth = data.cargoWeight;
    this.orderData = { ...this.orderData };
  }

  public getStep4FormData(data: any) {
    Object.assign(this.orderData.invoice, data);
  }

  public getPricingStepFormData(data: any) {
    Object.assign(this.orderData.pricing, data);
  }

  public validStep1(valid: boolean) {
    this.stepsValidate[0] = valid;
    if (valid) this.sendPickup();
    this.updateStatus();
  }

  public validStep2(valid: boolean) {
    this.stepsValidate[1] = valid;
    if (valid) this.sendDropoff();
    this.updateStatus();
  }

  public validStep3(valid: boolean) {
    this.stepsValidate[2] = valid;

    if (valid) {
      if (this.orderPreview?.order_id) {
        this.sendCargo();
      } else {
        this.afterOrderPreviewReceived('step3', () => this.sendCargo());
      }
    }
    this.updateStatus();
  }

  public validPricingStep(valid: boolean) {
    this.stepsValidate[3] = valid;
    if (valid) this.sendPricing();
    this.updateStatus();
  }

  public validStep4(valid: boolean) {
    this.stepsValidate[4] = valid;
    //TODO: In drafts, if all inputs are not valid, it won't be sent
    if (valid) this.sendInvoice();
    this.updateStatus();
  }

  public validStepOCL(idx: number, valid: boolean) {
    this.stepsValidateOCL[idx] = valid;
    this.updateStatus();
  }

  public updateStep1OCL(data: any) {
    Object.assign(this.orderData, {
      reference_number: data.reference,
      pickup: {
        startDate: data.date,
        contact_info: {
          name: data.name,
          telephone: `${data.phone_code} ${data.phone_number}`,
          country_code: data.phone_flag,
          email: data.email,
        },
      },
    });

    this.sendPickup();
  }

  public updateStep2OCL(data: any) {
    Object.assign(this.orderData.dropoff, {
      extra_notes: data.aditional_details,
      contact_info: {
        name: data.name,
        email: data.email,
        telephone: `${data.phone_code} ${data.phone_number}`,
        country_code: data.phone_flag,
      },
    });

    this.sendDropoff();
  }

  private async sendPickup() {
    const { pickup, reference_number } = this.orderData;
    const { startDate, contact_info, tax_information } = pickup;
    const [id] = this.orderPreview?.destinations || [];

    const destinationPayload = {
      reference_number,
      start_date: startDate,
      end_date: startDate,
      name: contact_info.name,
      email: contact_info.email,
      telephone: contact_info.telephone,
      country_code: contact_info.country_code,
      rfc: tax_information?.rfc,
      company_name: tax_information?.company_name,
      registration_number: tax_information?.registration_number,
      country_of_residence: tax_information?.country_of_residence,
    };

    if (id) this.sendDestination(destinationPayload, id);
  }

  private async sendDropoff() {
    const { dropoff } = this.orderData;
    const { contact_info, tax_information, extra_notes } = dropoff;

    const destinationPayload = {
      extra_notes,
      name: contact_info.name,
      email: contact_info.email,
      telephone: contact_info.telephone,
      country_code: contact_info.country_code,
      rfc: tax_information?.rfc,
      company_name: tax_information?.company_name,
      registration_number: tax_information?.registration_number,
      country_of_residence: tax_information?.country_of_residence,
    };

    const [, id] = this.orderPreview?.destinations || [];
    if (id) {
      this.sendDestination(destinationPayload, id);
    } else {
      this.afterOrderPreviewReceived('dropoff', (orderPreview) => {
        const [, id] = orderPreview?.destinations || [];
        this.sendDestination(destinationPayload, id);
      });
    }
  }

  private async sendCargo() {
    const { cargo }: { cargo: any } = this.orderData;
    const { order_id } = this.orderPreview;

    const cargoPayload = {
      type: cargo.type,
      description: cargo.description,
      unit_type: cargo.unit_type,
      required_units: cargo.required_units,
      hazardous_type: cargo.hazardous_type,
      weight: cargo.weigth || cargo.weight,
      weight_uom: 'kg',
      trailer: {
        load_cap: cargo['53_48'],
      },
    };

    if (this.isOrderWithCP) {
      Object.assign(cargoPayload, {
        commodity_quantity: cargo.commodity_quantity,
        hazardous_material: cargo.hazardous_material,
        packaging: cargo.packaging,
        cargo_goods: cargo.cargo_goods,
      });
    }

    for (const key in cargoPayload) {
      if ([undefined, null, ''].includes(cargoPayload[key])) {
        delete cargoPayload[key];
      }
    }

    const req = await this.auth.apiRestPut(JSON.stringify(cargoPayload), `orders/cargo/${order_id}`, {
      apiVersion: 'v1.1',
    });
    await req.toPromise();

    if (this.hazardousFile) {
      const formData = new FormData();
      formData.append('order_id', order_id);
      formData.append('file', this.hazardousFile);

      const req = await this.auth.uploadFilesSerivce(formData, 'orders/upload_hazardous');
      await req.toPromise();
    }

    if (this.multipleCargoFile) {
      if (!this.multipleCargoFile.size) return;

      const formData = new FormData();

      formData.append('file', this.multipleCargoFile);
      formData.append('load_cap', cargo['53_48']);
      formData.append('required_units', cargo.required_units);

      await this.uploadMultipleCargoFile(formData, order_id);
    } else {
      if (this.draftData.cargo.imported_file) return;

      const { order_id } = this.orderPreview;
      await this.deleteMultipleCargoFile(order_id);
    }
  }

  private async uploadMultipleCargoFile(formData: FormData, order_id: string) {
    const req = await this.auth.uploadFilesSerivce(
      formData,
      `orders/cargo/import-ftl/${order_id}`,
      { apiVersion: 'v1.1' },
      { timeout: '300000' },
    );

    await req
      .toPromise()
      .then(() => {
        this.clearUploadedMultipleFile = !this.clearUploadedMultipleFile;
      })
      .catch(({ error: { error } }) => {
        this.clearFailedMultipleFile = !this.clearFailedMultipleFile;
        const { message, errors } = error;
        let errMsg = `${message[this.lang] || ''}.`;
        console.error(errMsg);

        if (errors?.en) {
          errMsg += `
        ${errors[this.lang] || ''}`;
        }

        this.notificationService.showErrorToastr(errMsg, errors?.en ? 10000 : 5000, 'brand-snackbar-2');
      });
  }

  private async deleteMultipleCargoFile(order_id: string) {
    const req = await this.auth.apiRest(null, `orders/cargo/remove-multiple/${order_id}`, {
      apiVersion: 'v1.1',
      timeout: '300000',
    });
    await req.toPromise();
  }

  private async sendDestination(payload: any, id: string) {
    const req = await this.auth.apiRestPut(JSON.stringify(this.removeEmpty(payload)), `orders/destination/${id}`, {
      apiVersion: 'v1.1',
    });

    await req.toPromise();
  }

  private async sendInvoice() {
    const { invoice } = this.orderData;

    const sendInvoice = async (payload) => {
      const req = await this.auth.apiRestPut(JSON.stringify(payload), 'orders/update_invoice', { apiVersion: 'v1.1' });
      await req.toPromise();
    };

    if (this.orderPreview) {
      sendInvoice({
        order_id: this.orderPreview.order_id,
        place_id: invoice.address,
        cfdi: invoice.cfdi,
        rfc: invoice.rfc,
        company: invoice.company,
        tax_regime: invoice.tax_regime,
        series_id: invoice.series_id,
      });
    } else {
      this.afterOrderPreviewReceived('invoice', (orderPreview) => {
        sendInvoice({
          order_id: this.orderPreview.order_id,
          place_id: invoice.address,
          cfdi: invoice.cfdi,
          rfc: invoice.rfc,
          company: invoice.company,
          tax_regime: invoice.tax_regime,
          series_id: invoice.series_id,
        });
      });
    }
  }

  private async sendPricing() {
    const { pricing } = this.orderData;

    const sendPricing = async (payload) => {
      const req = await this.auth.apiRest(JSON.stringify(payload), 'orders/set_pricing');
      await req.toPromise();
    };

    if (this.orderPreview) {
      sendPricing({
        order_id: this.orderPreview.order_id,
        subtotal: pricing.subtotal,
        currency: pricing.currency,
        deferred_payment: pricing.deferred_payment,
      });
    } else {
      this.afterOrderPreviewReceived('pricing', (orderPreview) => {
        sendPricing({
          order_id: orderPreview.order_id,
          subtotal: pricing.subtotal,
          currency: pricing.currency,
          deferred_payment: pricing.deferred_payment,
        });
      });
    }
  }

  private async getETA(locations: GoogleLocation) {
    if (!locations.pickup || !locations.dropoff) return;

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

    (await this.auth.apiRest(requestJson, 'orders/calculate_ETA')).subscribe(
      async (res) => {
        this.ETA = res.result.ETA;
        this.getCreationTime(locations);
        this.locationsService.setDataObtained(true);
      },
      async (res) => {
        console.log(res);
      },
    );
  }

  private async getCreationTime(locations: GoogleLocation) {
    (await this.auth.apiRest('', 'orders/get_creation_time')).subscribe(
      async (res) => {
        this.creationTime = moment().add(res.result.creation_time, 'ms').toDate();
      },
      async (res) => {
        console.log(res);
      },
    );
  }

  private async getHazardous(orderId: string) {
    let dataRequest = {
      order_id: orderId,
    };

    (await this.auth.apiRest(JSON.stringify(dataRequest), 'orders/get_hazardous')).subscribe(
      async ({ result }) => {
        if (result.url.length > 0) {
          this.hazardousFileAWS = result;
        }
      },
      async (res) => {
        console.log(res);
      },
    );
  }

  private async getCatalogsDescription(id) {
    let requestCatalogsDescription = {
      order_id: id,
    };

    (await this.auth.apiRest(JSON.stringify(requestCatalogsDescription), 'orders/get_order_catalogs')).subscribe(
      (res) => {
        this.catalogsDescription = res.result.cargo;
      },
      (error) => {
        console.log('Something went wrong', error.error);
      },
    );
  }

  public convertDateMs(date: Date, time: Date) {
    let event = new Date(date);
    let hour = moment(time).hour();
    let minute = moment(time).minute();
    event.setHours(hour, minute, 0);
    return Date.parse(event.toString());
  }

  private async completeOrder() {
    await this.confirmOrder();
    await this.assignOrder();
    if (this.orderType === 'FTL' && this.locations.dropoff) await this.uploadScreenShotOrderMap();

    // cleanup page
    await this.router.navigate(['/about'], { skipLocationChange: true });
    await this.router.navigate(['/home'], { state: { showCompleteModal: true } });
  }

  private async confirmOrder() {
    const confirmPayload = {
      order_id: this.orderPreview.order_id,
    };

    const req = await this.auth.apiRestPut(JSON.stringify(confirmPayload), 'orders/confirm_order', {
      apiVersion: 'v1.1',
    });

    return req.toPromise();
  }

  private assignOrder() {
    const sendFleet = async (orderData) => {
      const payload: any = {
        order_id: this.orderPreview.order_id,
        carrier_id: orderData.drivers._id,
      };

      if (this.orderType === 'FTL') {
        payload.id_truck = orderData.trucks._id;
        payload.id_trailer = orderData.trailers._id;

        const req = await this.auth.apiRest(JSON.stringify(payload), 'orders/assign_order', { apiVersion: 'v1.1' });
        return req.toPromise();
      } else {
        payload.vehicle_id = orderData.vehicle._id;
        const req = await this.auth.apiRestPut(JSON.stringify(payload), 'orders/ocl/assign_order', {
          apiVersion: 'v1.1',
        });
        return req.toPromise();
      }
    };

    return new Promise(async (resolve, reject) => {
      //if we are finishing a draft and don't have the information
      if (!Object.keys(this.membersToAssigned).length) {
        const [pickup] = this.draftData.destinations;
        const dialogRef = this.dialog.open(SelectFleetModalComponent, {
          panelClass: 'modal',
          data: { start_date: pickup.start_date, end_date: pickup.end_date },
        });

        dialogRef.afterClosed().subscribe(async (data) => {
          await sendFleet(data);
          resolve(true);
        });
      } else {
        await sendFleet(this.membersToAssigned);
        resolve(true);
      }
    });
  }

  public async uploadScreenShotOrderMap() {
    this.requestScreenshotOrderMap.set('order_id', this.orderPreview.order_id);

    const req = await this.auth.uploadFilesSerivce(this.requestScreenshotOrderMap, 'orders/upload_map');
    return req.toPromise();
  }

  public toogleOrderWithCP() {
    this.isOrderWithCP = !this.isOrderWithCP;
  }

  public validateRFC(rfc: string) {
    const rfcRegex = /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/;
    const result = rfcRegex.test(rfc);
    return result;
  }

  public checkCPFields() {
    const leftList = [];

    for (const item in this.orderWithCPFields) {
      this.orderWithCPFields[item] === false && leftList.push(item);
    }

    if (this.orderData.cargo.type === 'hazardous') {
      for (const item in this.hazardousCPFields) {
        this.hazardousCPFields[item] === false && leftList.push(item);
      }
    }

    if (leftList.length > 0) {
      this.showModal(leftList);
    } else {
      this.completeOrder();
    }
  }

  public showModal(leftList) {
    const modalData = {
      title: 'Para generar carta porte:',
      list: leftList,
    };
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      panelClass: 'modal',
      data: modalData,
    });
    dialogRef.afterClosed().subscribe(async (res) => {
      res ? this.completeOrder() : (this.currentStepIndex = 0);
    });
  }

  public cargoWeightEdited() {
    this.hasEditedCargoWeight = true;
  }

  private updateTitleText() {
    const keys = [
      'orders.title-pickup',
      'orders.title-dropoff',
      'orders.title-cargo-info',
      'orders.title-summary',
      'orders.title-summary',
    ];

    this.typeOrder = this.translateService.instant(keys[this.currentStepIndex]);
  }

  private updateStepTexts() {
    this.ordersSteps = [
      { text: '1', nextBtnTxt: this.translateService.instant('orders.next-step') },
      { text: '2', nextBtnTxt: this.translateService.instant('orders.next-step') },
      { text: '3', nextBtnTxt: this.translateService.instant('orders.next-step') },
      { text: '4', nextBtnTxt: this.translateService.instant('orders.next-step') },
      { text: '5', nextBtnTxt: this.translateService.instant('orders.create-order') },
    ];

    this.ordersStepsOCL = [
      { text: '1', nextBtnTxt: this.translateService.instant('orders.next-step') },
      { text: '2', nextBtnTxt: this.translateService.instant('orders.create-order') },
    ];

    this.updateTitleText();
  }

  private removeEmpty(obj: any) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => ![null, undefined, ''].includes(v as any))
        .map(([k, v]) => [k, v === Object(v) ? this.removeEmpty(v) : v]),
    );
  }
}
