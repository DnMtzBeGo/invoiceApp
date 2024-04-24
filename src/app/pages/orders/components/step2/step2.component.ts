import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BegoRfcInputInfo, BegoRfcInputInfoOutput } from '@begomx/ui-components';
import { TranslateService } from '@ngx-translate/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';

const MAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PHONE_REGEX = /^([0-9]{2}\s?){5}$/;

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit {
  phoneFlag = 'mx';
  phoneCode = '+52';
  phoneNumber = '';

  @Input() locations: GoogleLocation = {
    pickup: '',
    dropoff: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    pickupPostalCode: 0,
    dropoffPostalCode: 0
  };
  @Input() draftData: any;
  @Input() orderWithCP: boolean;
  @Output() step2FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep2: EventEmitter<boolean> = new EventEmitter();

  public step2Form: FormGroup;
  public phoneValidator;
  public emailValidator;

  public rfcComponentValues: Partial<BegoRfcInputInfo>;

  constructor(private formBuilder: FormBuilder, private googleService: GoogleMapsService, private translateService: TranslateService) {
    this.step2Form = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(MAIL_REGEX)]],
      phoneCode: [this.phoneCode],
      phonenumber: [this.phoneNumber, [Validators.required, Validators.pattern(PHONE_REGEX)]],
      country_code: [this.phoneFlag],
      orderWithCP: [false],
      rfc: [''],
      registration_number: [''],
      country_of_residence: [''],
      company_name: [''],
      extra_notes: ['']
    });

    this.phoneValidator = {
      _firstCheck: true,
      errorMsg: this.translateService.instant('orders.invalid-phone'),
      isValid(value: string) {
        if (this._firstCheck) {
          this._firstCheck = false;
          return true;
        }

        return PHONE_REGEX.test(value);
      }
    };

    this.emailValidator = {
      _firstCheck: true,
      errorMsg: this.translateService.instant('orders.invalid-email'),
      isValid(value: string) {
        if (this._firstCheck) {
          this._firstCheck = false;
          return true;
        }

        return MAIL_REGEX.test(value);
      }
    };
  }

  ngOnInit(): void {
    this.step2Form.get('orderWithCP').valueChanges.subscribe((value) => {
      const rfc = this.step2Form.get('rfc');
      if (this.orderWithCP) {
        rfc.setValidators(
          Validators.compose([
            Validators.minLength(12),
            Validators.pattern(/^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/)
          ])
        );
      } else {
        rfc.clearValidators();
      }
      rfc.updateValueAndValidity();
    });

    this.step2Form.statusChanges.subscribe((val) => {
      if (val === 'VALID') {
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
    this.step2Form.get('orderWithCP').setValue(this.orderWithCP);
    if (changes.draftData && changes.draftData.currentValue) {
      const draft = changes.draftData.currentValue;
      const [, dropoff] = draft.destinations;

      if (dropoff?.contact_info?.telephone) {
        let [telephoneCode, ...telephone] = dropoff.contact_info.telephone.split(' ');
        telephone = telephone.join(' ');
        this.phoneCode = telephoneCode;
        this.phoneFlag = dropoff.contact_info.country_code;
        this.phoneNumber = telephone;
        this.step2Form.get('phonenumber')!.setValue(telephone);
        this.step2Form.get('phoneCode')!.setValue(telephoneCode);
      }

      this.step2Form.get('fullname')!.setValue(dropoff?.contact_info?.name);
      this.step2Form.get('email')!.setValue(dropoff?.contact_info?.email);
      this.step2Form.get('country_code')!.setValue(dropoff?.contact_info?.country_code);

      if (this.draftData['stamp']) {
        if (dropoff.tax_information) {
          this.rfcComponentValues = dropoff?.tax_information;
          this.step2Form.get('company_name').setValue(dropoff?.tax_information?.company_name);
        }

        this.step2Form.get('rfc').setValue(dropoff?.contact_info?.rfc);
      }
    }
    this.validFormStep2.emit(this.step2Form.valid);
  }

  updateFormGroup(data: any) {
    this.step2Form.get(data.key)!.setValue(data.value ?? data.details);
  }

  updateFormPhoneCode(data: any) {
    this.phoneFlag = data.code;
    this.phoneCode = data.dial_code;

    this.step2Form.get('country_code')!.setValue(data.code);
    this.step2Form.get('phoneCode')!.setValue(data.dial_code);
  }

  updateRFC(data: BegoRfcInputInfoOutput) {
    const { isInternationalRFC, values } = data;

    this.step2Form.patchValue({
      rfc: values.rfc,
      registration_number: isInternationalRFC ? values.registration_number : '',
      country_of_residence: isInternationalRFC ? values.country_of_residence : ''
    });
  }

  phoneNumberChangeValue(data: any) {
    this.phoneNumber = data.value;
    this.step2Form.get('phonenumber')!.setValue(data.value);
  }

  changeLocation(type: string) {
    this.googleService.hidePreviewMap(type);
  }
}
