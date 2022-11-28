import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  Input,
} from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { GoogleLocation } from "src/app/shared/interfaces/google-location";
import { Subscription } from "rxjs";
import { GoogleMapsService } from "src/app/shared/services/google-maps/google-maps.service";
@Component({
  selector: "app-step1",
  templateUrl: "./step1.component.html",
  styleUrls: ["./step1.component.scss"],
})
export class Step1Component implements OnInit {
  phoneFlag = "mx";
  phoneCode = "+52";
  phoneNumber = "";

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
  @Input() draftData: any;
  @Input() orderWithCP: boolean;
  @Output() step1FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep1: EventEmitter<boolean> = new EventEmitter();

  step1Form: FormGroup = this.formBuilder.group({
    fullname: [null, Validators.required],
    email: [null, [Validators.required, this.mailValidator]],
    phoneCode: [this.phoneCode],
    phonenumber: [this.phoneNumber, Validators.required],
    reference: [null, Validators.required],
    country_code: [this.phoneFlag],
    orderWithCP: [false],
    rfc: [null],
  });

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private googleService: GoogleMapsService
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

  mailValidator(c: AbstractControl): { [key: string]: boolean } {
    const mail = c.value;
    const regexp = new RegExp("^([da-z_.-]+)@([da-z.-]+).([a-z.]{2,6})$");
    const pattern =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    const test = regexp.test(mail);

    if (!pattern.test(mail)) {
      return { mailInvalid: true };
    }

    return null as any;
  }

  phoneFlagChangeValue(value: any) {
    this.phoneFlag = value;
    this.step1Form.get("country_code")!.setValue(value);
  }

  phoneCodeChangeValue(value: any) {
    this.phoneCode = value;
    this.step1Form.get("phoneCode")!.setValue(value);
  }

  phoneNumberChangeValue(value: any) {
    this.phoneNumber = value;
    this.step1Form.get("phonenumber")!.setValue(value);
  }

  changeLocation(type: string) {
    this.googleService.hidePreviewMap(type);
  }
}
