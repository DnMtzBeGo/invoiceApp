import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-fleet-invite-driver',
  templateUrl: './fleet-invite-driver.component.html',
  styleUrls: ['./fleet-invite-driver.component.scss']
})
export class FleetInviteDriverComponent implements OnInit {

  form = this._formBuilder.group({
    drivers: this._formBuilder.array([])
  });

  phoneFlag = "mx";
  phoneCode = "+52";
  phoneNumber = "";

  invitationPath: string = '';
  validateInvitation: boolean = false;
  fleetId: string = '';

  numDriverForm: FormGroup = this._formBuilder.group({
    numDriver: ['', Validators.required],
  });

  constructor(
    private _formBuilder: FormBuilder,
    public router: Router,
    public route: ActivatedRoute,
    private webService: AuthService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) { 
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe((params: Params) => {
      this.fleetId = params['fleet_id'];
   });

    this.numDriverForm.get("numDriver").valueChanges.subscribe((value) => {
      if(value < 21) {
        if(value != '') {
          if(value < this.drivers.length) {
            for(let i = 0; value < this.drivers.length; i++ ) {
              this.deleteDriver();
            }
          } else {
            
          }
        } else {
          this.numDriverForm.get('numDriver').setValue(this.drivers.length);
        }
      }
      
    });

    this.form.get("drivers").statusChanges.subscribe(value => {
      if(value == 'VALID') {
        this.validateInvitation = true;
      } else {
        this.validateInvitation = false;
      }
    });

    // (this.form.get('drivers') as FormArray).at(1).get('flag').valueChanges.subscribe((value) => {
    //   const rfc = this.step1Form.get("rfc");
    //   if (this.orderWithCP) {
    //     rfc.setValidators(
    //       Validators.compose([
    //         Validators.minLength(12),
    //         Validators.pattern(
    //           /^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/
    //         ),
    //       ])
    //     );
    //   } else {
    //     rfc.clearValidators();
    //   }
    //   rfc.updateValueAndValidity();
    // });


    this.addDriver();
  }

  // emailConditionallyRequiredValidator(formGroup: FormGroup) {
  //   if (formGroup.value.email) {
  //     return Validators.required(formGroup.get('email')) ? {
  //       mailValidator: true,
  //     } : null;
  //   }
  //   return null;
  // }

  mailValidator(c: AbstractControl): { [key: string]: boolean } {
    const mail = c.value;
    const regexp = new RegExp('^([da-zA-Z_.-]+)@([da-z.-]+).([a-z.]{2,6})$');
    const pattern =
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    const test = regexp.test(mail);

    if (!pattern.test(mail)) {
      return { mailInvalid: true };
    }

    return null;
  }

  get drivers() {
    return this.form.controls["drivers"] as FormArray;
  }

  addDriver() {
    if(this.drivers.length < 20) {
      const driverForm = this._formBuilder.group({
        fullname: ['', Validators.required],
        email: ['', [Validators.required, this.mailValidator]],
        phone: ['', Validators.required],
        flag: ['mx'],
        phoneNumber: [''],
        phoneCode: ['+52']
      });
      this.drivers.push(driverForm);
      this.numDriverForm.get('numDriver').setValue(this.drivers.length);
    }
  }

  deleteDriver() {
    if((this.drivers.length) - 1 != 0) {
      this.drivers.removeAt(this.drivers.length - 1);
      this.numDriverForm.get('numDriver').setValue(this.drivers.length);
    }
  }

  phoneFlagChangeValue(value: any, index: number) {
    (this.form.get('drivers') as FormArray).at(index).get('flag').patchValue(value);
  }

  phoneCodeChangeValue(value: any, index: number) {
    (this.form.get('drivers') as FormArray).at(index).get('phoneCode').patchValue(value);
  }

  phoneNumberChangeValue(value: any, index: number) {
    (this.form.get('drivers') as FormArray).at(index).get('phoneNumber').patchValue(value);
  }

  phoneChangeValue(value: any, index: number) {
    let phone: string;
    if(value.phoneNumber) {
      phone = value.phoneCode;
      phone = phone.concat(' ');
      phone = phone.concat(value.phoneNumber);
    } else {
      phone = '';
    }
    (this.form.get('drivers') as FormArray).at(index).get('phone').patchValue(phone);
    const emailInput = (this.form.get('drivers') as FormArray).at(index).get('email');
    const phoneInput = (this.form.get('drivers') as FormArray).at(index).get('phone');
    const phoneValue = (this.form.get('drivers') as FormArray).at(index).get('phone').value;
    const emailValue = (this.form.get('drivers') as FormArray).at(index).get('email').value;
    const phoneValid = (this.form.get('drivers') as FormArray).at(index).get('phone').valid;
    if(phoneValid && emailValue == '') {
      emailInput.clearValidators();
    }
    
    if (emailValue == '' && phoneValue == '') {
      emailInput.setValidators(
        Validators.compose([
          Validators.required,
          this.mailValidator
        ])
      );
      phoneInput.setValidators(
        Validators.compose([
          Validators.required
        ])
      );
      
    } 
    emailInput.updateValueAndValidity();
    phoneInput.updateValueAndValidity();
  }

  invitationPathChange(value: string) {
    this.invitationPath = value;
  }


  emailValid(validEmail: boolean, valueEmail: string, index: number) {

    const phone = (this.form.get('drivers') as FormArray).at(index).get('phone');
    const phoneValue = (this.form.get('drivers') as FormArray).at(index).get('phone').value;
    const emailInput = (this.form.get('drivers') as FormArray).at(index).get('email');
    
    if(validEmail && phoneValue == '') {
      phone.clearValidators();
    }
    
    if(valueEmail == '' && phoneValue != '') {
      emailInput.clearValidators();
    }

    if(!validEmail && valueEmail != '' ) {
      emailInput.setValidators(
        Validators.compose([
          Validators.required,
          this.mailValidator
        ])
      );
    }

    emailInput.updateValueAndValidity();
    phone.updateValueAndValidity();

  }

  async download() {
    window.open('https://ion-files.s3.amazonaws.com/invite.csv');
  }

  async sendInvitation() {

    let requestBody = {
      id_fleet: this.fleetId,
      invitations: []
    };

    requestBody.invitations = [];

    this.drivers.value.map((x) => {
      requestBody.invitations.push({
        member: x.fullname,
        email: x.email,
        telephone: x.phone
      });
    });

    // console.log(requestBody);
    (
      await this.webService.apiRest(
        JSON.stringify(requestBody),
        'fleet/send_invitation'
      )
    ).subscribe((res) => {
      
      if(res.result.rejected.length > 0) {
        let sendMessage = this.translateService.instant('fleet.alerts.partial_sent.message');
        this.invitationsConfirm(sendMessage, res.result.rejected);
      } else {
        let sendMessage = this.translateService.instant('fleet.alerts.invitation_sent.message');
        this.invitationsConfirm(sendMessage);
      }
      
    });
  }


  async invitationsConfirm(message, rejected?) {

    let messageString = rejected?.map(function(x) {
      return x;
    }).join("<br>") || '';

    this.alertService.create({
      title: this.translateService.instant('fleet.alerts.invitation_sent.title'),
      body: message + "<br>" + messageString,
      handlers: [
        {
          text: this.translateService.instant('Ok'),
          color: '#FFE000',
          action: async () => {
            this.router.navigate(['fleet/members']);
            this.alertService.close();
          }
        },
        {
          text: this.translateService.instant('orders.btn-cancel'),
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
          }
        }
      ]
    });

  }
}