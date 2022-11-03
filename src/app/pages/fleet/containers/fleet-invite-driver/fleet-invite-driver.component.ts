import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  ) { 
  }

  ngOnInit(): void {
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


    // this.form.get("drivers").valueChanges.subscribe(value => {
    //   console.log(value);
    // });

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

  mailValidator(c: AbstractControl)  {
   
    const mail = c.value;

    const re: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const mailInvalid =  !re.test(String(mail).toLowerCase());
    if(mailInvalid)
      return { mailInvalid  };
    return null;

  }

  get drivers() {
    return this.form.controls["drivers"] as FormArray;
  }

  addDriver() {
    if(this.drivers.length < 20) {
      const driverForm = this._formBuilder.group({
        fullname: ['', Validators.required],
        email: ['', Validators.required],
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
    phone = value.phoneCode;
    phone = phone.concat(' ');
    phone = phone.concat(value.phone);
    console.log("phone: ", phone);
    (this.form.get('drivers') as FormArray).at(index).get('phone').patchValue(phone);
  }

  // validatePhone(flag, code, number) {
  //   let phoneNumber: string = '';
  //   if(flag != '' && code != '' && number != '' ) {
  //     phoneNumber = code;
  //     phoneNumber = phoneNumber.concat(' '); 
  //     phoneNumber = phoneNumber.concat(x.phone);
  //   } else phoneNumber = '';
  // }

  invitationPathChange(value: string) {
    //this.getFleetId();
    this.invitationPath = value;
  }

  getFleetId() {
    if(this.route.snapshot.paramMap.get('id') == null) {
      console.log('No tiene tiene:', this.route.snapshot.paramMap.get('id'))
      this.router.navigate(['/fleet/members']);
    } else {
      console.log('Si tiene tiene:', this.route.snapshot.paramMap.get('id'))
      this.fleetId = this.route.snapshot.paramMap.get('id');
    }
  }

  async download() {
    window.open('https://ion-files.s3.amazonaws.com/invite.csv');
  }

  sendInvitation() {
    

    // const { value: fleetId } = await Storage.get({ key: 'fleet' });

    // let requestBody = {
    //   id_fleet: fleetId,
    //   invitations: []
    // };

    // requestBody.invitations = [];
    // let phoneNumber: string = '';

    // this.drivers.map((x) => {
    //   if(x.phone != '') {
    //     phoneNumber = x.selectedPhoneCode;
    //     phoneNumber = phoneNumber.concat(' ');
    //     phoneNumber = phoneNumber.concat(x.phone);
    //   } else phoneNumber = '';

    //   requestBody.invitations.push({
    //     member: x.name,
    //     email: x.email,
    //     telephone: phoneNumber
    //   });
    // });
    // (
    //   await this.apiRestService.apiRestToken(
    //     JSON.stringify(requestBody),
    //     'fleet/send_invitation'
    //   )
    // ).subscribe((res) => {
    //   console.log(res.result.rejected.length);
      
    //   if(res.result.rejected.length > 0) {
    //     let sendMessage = this.translateService.instant('fleet.alerts.partial_sent.message');
    //     this.invitationsConfirm(sendMessage, res.result.rejected);
    //   } else {
    //     let sendMessage = this.translateService.instant('fleet.alerts.invitation_sent.message');
    //     this.invitationsConfirm(sendMessage);
    //   }
      
    // });
  }

}