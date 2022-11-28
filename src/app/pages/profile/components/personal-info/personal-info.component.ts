import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CfdiService } from 'src/app/services/cfdi.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileInfoService } from '../../services/profile-info.service';
import { TranslateService } from '@ngx-translate/core';
import { BegoAlertHandler } from 'src/app/shared/components/bego-alert/BegoAlertHandlerInterface';
@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {
  public id?: string;
  CFDIs: any;
  originalCFDI: Array<any>;
  personalInfo: any;

  showPhoneVerificationModal: boolean = false;
  showEmailVerificationModal: boolean = false;
  mailErrorMsg: string = '';
  phoneErrorMsg: string = ''
  phoneInvalid: boolean = false;
  originalPhoneValues: any = {};

  showGeneralAlert: boolean = false;
  alertMsg: string = '';
  generalAlertHandler: BegoAlertHandler[] = [
      {
        text: 'Ok',
        action: () => {
          this.showGeneralAlert = false;
          this.alertMsg = '';
        },
        color: '#FFE000'
      }
  ]

  constructor(
    private formBuilder: FormBuilder,
    public profileInfoService: ProfileInfoService,
    public cfdiService: CfdiService,
    public webService: AuthService,
    private translateService: TranslateService,
    public route: ActivatedRoute
  ) { }

  personalInfoForm: FormGroup = this.formBuilder.group({
    fullname: ['', Validators.required],
    email: ['', { validators: [Validators.required, this.mailValidator], updateOn: 'blur' }],
    phoneFlag: ['', Validators.required],
    phoneCode: ['', Validators.required],
    phoneNumber: ['', { validators: [Validators.required], updateOn: 'blur' }],
    companyName: ['', Validators.required],
    RFC: [
      '',
      [
        Validators.minLength(12),
        Validators.compose([Validators.pattern(/^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z&\d]{2}(?:[A&\d]))?$/)])
      ]
    ],
    CFDI: ['', Validators.required],
    address: ['', Validators.required],
    license: ['', [Validators.compose([Validators.pattern(/^[A-Za-z0-9]{6,16}$/)])]],
    taxRegime: ['']
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id') || null;
    // console.log('personal-info', this.route);
    // console.log('personal-info params', this.route.snapshot.params);
    // console.log('personal-info queryParams', this.route.snapshot.queryParams);

    this.profileInfoService.data.subscribe( (data: any) => {
      this.personalInfo = data;
      if(Object.keys(data).length){
        let phoneNumber = data.raw_telephone.split(' ')
        const dialCode = phoneNumber.shift();
        phoneNumber = phoneNumber.join(' ');
    
        this.personalInfoForm.patchValue({
          fullname: data?.nickname,
          email: data?.email,
          phoneFlag: data.country_code ,
          phoneCode: dialCode,
          phoneNumber: phoneNumber,
          companyName: data?.attributes?.companyName,
          RFC: data?.attributes?.RFC,
          CFDI: data?.attributes?.CFDI,
          address: data?.attributes?.address || '',
          license: data?.attributes?.license
        });

        this.originalPhoneValues = {
          phoneFlag: data.country_code ,
          phoneCode: dialCode,
          phoneNumber: phoneNumber,
        }

        this.originalCFDI = this.CFDIs;


      }
    });
    this.getCatalog();
  }


  mailValidator(c: AbstractControl)  {
   
    const mail = c.value;

    const re: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const mailInvalid =  !re.test(String(mail).toLowerCase());
    if(mailInvalid)
      return { mailInvalid  };
    return null;

  }

  /////////////////////////////////
  ////// mail logic //////////////
  /////////////////////////////////
 async updateEmail(){

    const { errors: emailErrors} = this.personalInfoForm.controls.email
    const mailInvalid = emailErrors && emailErrors.mailInvalid;


    const mailToValidate = this.personalInfoForm.value.email;
    if(this.personalInfo.email !== mailToValidate  && !mailInvalid){
      const bodyRequest = {
        telephone_mail: mailToValidate,
        type: 'update_profile'
      };
      (await this.webService.apiRest(JSON.stringify(bodyRequest),'carriers/send_code')).subscribe(
        (res) => {
          this.showEmailVerificationModal = true;

        },
        ( err ) => {
          const error = err.error.error[localStorage.getItem('lang') || 'en']
          this.showErrorMsg(error);
        }
      )

    }
  }

   async verifyEmail(validationCode: string){

    const newMail = this.personalInfoForm.value.email;
    const currentMail = this.personalInfo.email;
    const bodyRequest = {
      telephone_mail: newMail,
      code: validationCode
    };

    (await this.webService.apiRest(
      JSON.stringify(bodyRequest),'carriers/validate_code')
    ).subscribe(
      async ( res ) => {

        //If code is valid, then update email

        const updateEmailBody = {
          newTelephoneMail: newMail,
          telephone_mail: currentMail
        };
        if (this.id) updateEmailBody['carrier_id'] = this.id;

        (await this.webService.apiRest(JSON.stringify(updateEmailBody),'carriers/change_telephone_mail')).subscribe(
          (res : any)=>{
            this.profileInfoService.getProfileInfo(this.id);
            this.showEmailVerificationModal = false;
            this.mailErrorMsg = '';

          }
        )

      },
      ( error ) => {
        const lang = localStorage.getItem('lang') || 'en';
        this.mailErrorMsg = error.error.error[lang];
      }
    );
  }

  cancelEmailVerification(){
    this.personalInfoForm.patchValue({
      email : this.personalInfo.email
    });
    this.mailErrorMsg = '';
    this.showEmailVerificationModal = false;
  }


  /////////////////////////////////
  ////// Phone logic //////////////
  /////////////////////////////////
  async updatePhone( newPhoneValues: any ){



    this.personalInfoForm.patchValue(newPhoneValues);

    const { 
        phoneFlag: currentFlag, 
        phoneCode: currentCode,
        phoneNumber: currentNumber 
    } = this.personalInfoForm.value;

    const { 
      phoneFlag: originalFlag, 
      phoneCode: originalCode,
      phoneNumber: originalNumber 
  } = this.originalPhoneValues;   
  
  if(
      (currentFlag != originalFlag || currentCode  != originalCode || currentNumber != originalNumber)  
      && !this.phoneInvalid){
      const bodyRequest = {
        telephone_mail: `${currentCode}${currentNumber}`,
        type: 'update_profile'
      };
      (await this.webService.apiRest(JSON.stringify(bodyRequest),'carriers/send_code')).subscribe(
        (res) => {
          this.showPhoneVerificationModal = true;

        },
        ( err ) => {
          const error = err.error.error[localStorage.getItem('lang') || 'en']
          this.showErrorMsg(error);
        }
      )

    }
  }


  showErrorMsg(msg: string):void{
    this.alertMsg = msg;
    this.showGeneralAlert = true;
    this.profileInfoService.getProfileInfo(this.id);
  }


  async verifyPhone(validationCode : string){

    const { phoneCode, phoneFlag, phoneNumber } =  this.personalInfoForm.value ;
    const currentPhone = `${this.originalPhoneValues.phoneCode}${this.originalPhoneValues.phoneNumber}`;
    const newPhone = `${phoneCode} ${phoneNumber}`;

    const bodyRequest = {
      country_code: phoneFlag,
      telephone_mail: newPhone,
      code: validationCode
    };

    (await this.webService.apiRest(
      JSON.stringify(bodyRequest),'carriers/validate_code')
    ).subscribe(
      async ( res ) => {

        //If code is valid, then update phone

        const updateEmailBody = {
          country_code: phoneFlag,
          newTelephoneMail: newPhone,
          telephone_mail: currentPhone
        };
        if (this.id) updateEmailBody['carrier_id'] = this.id;

        (await this.webService.apiRest(JSON.stringify(updateEmailBody),'carriers/change_telephone_mail')).subscribe(
          (res : any)=>{
            this.profileInfoService.getProfileInfo(this.id);
            this.showPhoneVerificationModal = false;
            this.phoneErrorMsg = '';

          }
        )

      },
      ( error ) => {
        const lang = localStorage.getItem('lang') || 'en';
        this.phoneErrorMsg = error.error.error[lang];
      }
    );
  }

  cancelPhoneVerification(){

    this.personalInfoForm.patchValue({
      phoneFlag: this.originalPhoneValues.phoneFlag ,
      phoneCode: this.originalPhoneValues.phoneCode,
      phoneNumber: this.originalPhoneValues.phoneNumber,
    });

    this.phoneErrorMsg = '';
    this.showPhoneVerificationModal = false;
  }



  async updateAttribute( formControlName: string ){
    const bodyRequest: any  = {};
    bodyRequest[formControlName]= this.personalInfoForm.value[formControlName];

    if (!this.personalInfoForm.controls[formControlName].valid) return;
    
    (await this.webService.apiRest(
      JSON.stringify({
        attributes: bodyRequest,
        ...(this.id ? { carrier_id: this.id } : {})
      }),
      'carriers/insert_attributes')
    ).subscribe(
      ( res )=>{
      },
      ( err ) => {

      }
    );
  }

  /**
   * Indicates db to update nickname in db given the current value 
   * in the formgroup for fullname
   */
  async changeNickname(){

    const newNickname = this.personalInfoForm.value.fullname;

    const requestBody = {
      nickname: newNickname
    };

    if (this.id) requestBody['carrier_id'] = this.id;

    (await this.webService.apiRest(JSON.stringify(requestBody),'carriers/change_nickname')).subscribe(
      ( res )=>{
        this.profileInfoService.getProfileInfo(this.id);
      },
      ( err ) => {

      }
    )
  }

  updateAddress( newAddress : string){
    this.personalInfoForm.patchValue({ 
      address: newAddress
    });
    this.updateAttribute('address');
  }

  async getCatalog() {
    const requestJson = {
      catalogs: [
        {
          name: "sat_regimen_fiscal",
          version: "0",
        },
        {
          name: "sat_usos_cfdi",
          version: "0",
        },
      ],
    };
    await (
      await this.webService.apiRest(
        JSON.stringify(requestJson),
        "invoice/catalogs/fetch"
      )
    ).subscribe(
      ({ result }) => {
        const regimen_fiscal = result.catalogs[0].documents.map((item) => {
          const filteredItem = {
            text: item.description,
            rawText: item.rawDescription,
            value: item.code
          };
          return filteredItem;
        });
        this.CFDIs = result.catalogs[1].documents.map((item) => {
          const filteredItem = {
            text: item.code + ' - ' + item.description,
            value: item.code,
            fisica: item.fisica,
            moral: item.moral
          };
          return filteredItem;
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }


}
