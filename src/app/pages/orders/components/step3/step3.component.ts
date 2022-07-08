import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { GoogleLocation } from "src/app/shared/interfaces/google-location";
import { GoogleMapsService } from "src/app/shared/services/google-maps/google-maps.service";
@Component({
  selector: "app-step3",
  templateUrl: "./step3.component.html",
  styleUrls: ["./step3.component.scss"],
})
export class Step3Component implements OnInit {
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
  @Output() step3FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep3: EventEmitter<boolean> = new EventEmitter();

  step3Form: FormGroup = this.formBuilder.group({
    fullname: ["", Validators.required],
    email: ["", [Validators.required, this.mailValidator]],
    phoneCode: [this.phoneCode],
    phonenumber: [this.phoneNumber, Validators.required],
    country_code: [this.phoneFlag],
    orderWithCP: [false],
    rfc: [""],
  });

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private googleService: GoogleMapsService
  ) {}

  ngOnInit(): void {
    this.step3Form.get("orderWithCP").valueChanges.subscribe((value) => {
      const rfc = this.step3Form.get("rfc");
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

    this.step3Form.statusChanges.subscribe((val) => {
      if (val === "VALID") {
        this.validFormStep3.emit(true);
      } else {
        this.validFormStep3.emit(false);
      }
    });

    this.step3Form.valueChanges.subscribe(() => {
      this.step3FormData.emit(this.step3Form.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.step3Form.get("orderWithCP").setValue(this.orderWithCP);
    if (
      changes.draftData &&
      changes.draftData.currentValue &&
      changes.draftData.currentValue.dropoff &&
      changes.draftData.currentValue.dropoff.contact_info
    ) {
      let [telephoneCode, ...telephone] =
        changes.draftData.currentValue.dropoff.contact_info.telephone.split(" ");
      telephone = telephone.join(" ");
      this.phoneCode = telephoneCode;
      this.phoneFlag = changes.draftData.currentValue.dropoff.contact_info.country_code;
      this.phoneNumber = telephone;
      this.step3Form
        .get("fullname")!
        .setValue(changes.draftData.currentValue.dropoff.contact_info.name);
      this.step3Form.get("phonenumber")!.setValue(telephone);
      this.step3Form
        .get("email")!
        .setValue(changes.draftData.currentValue.dropoff.contact_info.email);
      this.step3Form
        .get("country_code")!
        .setValue(changes.draftData.currentValue.dropoff.contact_info.country_code);
      this.step3Form.get("phoneCode")!.setValue(telephoneCode);

      if(changes.draftData.currentValue.dropoff.contact_info.hasOwnProperty('rfc') && changes.draftData.currentValue.dropoff.contact_info.rfc.length > 0) {
        this.step3Form
          .get("rfc")
          .setValue(changes.draftData.currentValue.dropoff.contact_info.rfc);
      }
    }
    this.validFormStep3.emit(this.step3Form.valid);
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
    this.step3Form.get("country_code")!.setValue(value);
  }

  phoneCodeChangeValue(value: any) {
    this.phoneCode = value;
    this.step3Form.get("phoneCode")!.setValue(value);
  }

  phoneNumberChangeValue(value: any) {
    this.phoneNumber = value;
    this.step3Form.get("phonenumber")!.setValue(value);
  }

  changeLocation(type: string) {
    this.googleService.hidePreviewMap(type);
  }
}
