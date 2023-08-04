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
  selector: "app-step2",
  templateUrl: "./step2.component.html",
  styleUrls: ["./step2.component.scss"],
})
export class Step2Component implements OnInit {
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
  @Output() step2FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep2: EventEmitter<boolean> = new EventEmitter();

  step2Form: FormGroup = this.formBuilder.group({
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
    this.step2Form.get("orderWithCP").valueChanges.subscribe((value) => {
      const rfc = this.step2Form.get("rfc");
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

    this.step2Form.statusChanges.subscribe((val) => {
      if (val === "VALID") {
        this.validFormStep2.emit(true);
      } else {
        this.validFormStep2.emit(false);
      }
    });

    this.step2Form.valueChanges.subscribe(() => {
      this.step2FormData.emit(this.step2Form.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.step2Form.get("orderWithCP").setValue(this.orderWithCP);
    if (
      changes.draftData &&
      changes.draftData.currentValue &&
      changes.draftData.currentValue.dropoff &&
      changes.draftData.currentValue.dropoff.contact_info
    ) {
      const {dropoff} = changes.draftData.currentValue;

      if(dropoff.contact_info.telephone){
        let [telephoneCode, ...telephone] =
          changes.draftData.currentValue.dropoff.contact_info.telephone.split(" ");
        telephone = telephone.join(" ");
        this.phoneCode = telephoneCode;
        this.phoneFlag = changes.draftData.currentValue.dropoff.contact_info.country_code;
        this.phoneNumber = telephone;
        this.step2Form.get("phonenumber")!.setValue(telephone);
        this.step2Form.get("phoneCode")!.setValue(telephoneCode);
      }

      this.step2Form
        .get("fullname")!
        .setValue(changes.draftData.currentValue.dropoff.contact_info.name);
      this.step2Form
        .get("email")!
        .setValue(changes.draftData.currentValue.dropoff.contact_info.email);
      this.step2Form
        .get("country_code")!
        .setValue(changes.draftData.currentValue.dropoff.contact_info.country_code);

      if(this.draftData['stamp']){
        this.step2Form.get('rfc').setValue(dropoff.contact_info.rfc);
      }
    }
    this.validFormStep2.emit(this.step2Form.valid);
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

  updateFormGroup(data: any) {
    this.step2Form.get(data.key)!.setValue(data.value)
  }

  updateFormPhoneCode(data: any) {
    this.phoneFlag = data.code;
    this.phoneCode = data.dial_code;

    this.step2Form.get("country_code")!.setValue(data.code);
    this.step2Form.get("phoneCode")!.setValue(data.dial_code);
  }

  phoneNumberChangeValue(data: any) {
    this.phoneNumber = data.value;
    this.step2Form.get("phonenumber")!.setValue(data.value);
  }

  changeLocation(type: string) {
    this.googleService.hidePreviewMap(type);
  }
}
