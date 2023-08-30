import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  Input,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { GoogleLocation } from "src/app/shared/interfaces/google-location";
import { GoogleMapsService } from "src/app/shared/services/google-maps/google-maps.service";

const MAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PHONE_REGEX = /^([0-9]{2}\s?){5}$/

@Component({
  selector: "app-step1",
  templateUrl: "./step1.component.html",
  styleUrls: ["./step1.component.scss"],
})
export class Step1Component implements OnInit {
  phoneFlag = "mx";
  phoneCode = "+52";
  phoneNumber = "";

  @Input() cardIsOpen = false;
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
  @Input() datePickup: number;
  @Input() draftData: any;
  @Input() orderWithCP: boolean;
  @Output() step1FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep1: EventEmitter<boolean> = new EventEmitter();

  step1Form: FormGroup = this.formBuilder.group({
    fullname: [null, Validators.required],
    email: [null, [Validators.required, Validators.pattern(MAIL_REGEX)]],
    phoneCode: [this.phoneCode],
    phonenumber: [this.phoneNumber, [Validators.required, Validators.pattern(PHONE_REGEX)]],
    reference: [null, Validators.required],
    country_code: [this.phoneFlag],
    orderWithCP: [false],
    rfc: [null],
  });

  phoneValidator = {
    _firstCheck: true,
    errorMsg: this.translateService.instant('orders.invalid-phone'),
    isValid(value: string) {
      if (this._firstCheck) {
        this._firstCheck = false;
        return true
      }

      return PHONE_REGEX.test(value)
    }
  }

  emailValidator = {
    _firstCheck: true,
    errorMsg: this.translateService.instant('orders.invalid-email'),
    isValid(value: string) {
      if (this._firstCheck) {
        this._firstCheck = false;
        return true
      }

      return MAIL_REGEX.test(value);
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private googleService: GoogleMapsService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.step1Form.get("orderWithCP").valueChanges.subscribe((value) => {
      const rfc = this.step1Form.get("rfc");
      if (this.orderWithCP) {
        rfc.setValidators(
          Validators.compose([
            Validators.minLength(12),
            Validators.pattern(
              /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/
            ),
          ])
        );
      } else {
        rfc.clearValidators();
      }
      rfc.updateValueAndValidity();
    });

    this.step1Form.statusChanges.subscribe((val) => {
      if (val === "VALID") {
        this.validFormStep1.emit(true);
      } else {
        this.validFormStep1.emit(false);
      }
    });

    this.step1Form.valueChanges.subscribe(() => {
      this.step1FormData.emit(this.step1Form.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.step1Form.get("orderWithCP").setValue(this.orderWithCP);
    if (
      changes.draftData &&
      changes.draftData.currentValue &&
      changes.draftData.currentValue.pickup &&
      changes.draftData.currentValue.pickup.contact_info
    ) {
      const {pickup} = changes.draftData.currentValue;

      if(pickup.contact_info.telephone){
        let [telephoneCode, ...telephone] =
          changes.draftData.currentValue.pickup.contact_info.telephone.split(" ");
        telephone = telephone.join(" ");
        this.phoneCode = telephoneCode;
        this.phoneFlag = changes.draftData.currentValue.pickup.contact_info.country_code;
        this.phoneNumber = telephone;
        this.step1Form.get("phonenumber")!.setValue(telephone);
        this.step1Form.get("phoneCode")!.setValue(telephoneCode);
      }

      this.step1Form
        .get("fullname")!
        .setValue(changes.draftData.currentValue.pickup.contact_info.name);
      this.step1Form
        .get("email")!
        .setValue(changes.draftData.currentValue.pickup.contact_info.email);
      this.step1Form
        .get("reference")!
        .setValue(changes.draftData.currentValue.reference_number);
      this.step1Form
        .get("country_code")!
        .setValue(changes.draftData.currentValue.pickup.contact_info.country_code);

      this.validFormStep1.emit(this.step1Form.valid);

      if(this.draftData['stamp']){
        this.step1Form.get('rfc').setValue(pickup.contact_info.rfc);
      }

    }
  }

  phoneCodeChanged(data: any) {
    this.phoneFlag = data.code;
    this.phoneCode = data.dial_code;

    this.step1Form.get("country_code")!.setValue(data.code);
    this.step1Form.get("phoneCode")!.setValue(data.dial_code);
  }

  phoneNumberChangeValue(data: any) {
    this.phoneNumber = data.value;
    this.step1Form.get("phonenumber")!.setValue(data.value);
  }

  updateFormGroup(data: any) {
    this.step1Form.get(data.key)!.setValue(data.value);
  }

  changeLocation(type: string) {
    this.googleService.hidePreviewMap(type);
  }
}
