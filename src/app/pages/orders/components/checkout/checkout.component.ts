import { Component, OnInit } from '@angular/core';
import { Step } from '../../../../shared/components/stepper/interfaces/Step'
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router, NavigationEnd  } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { emitterData} from './interfaces/emitterData';
import { receiverData } from './interfaces/receiverData';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  checkoutSteps: Step[] = [];
  currentStepIndex: number = 0;

  selectedCard: string = 'pickup';
  validateRoute: boolean = true;
  summaryData: any;
  customsCruce: any;

  invoiceData: any;

  emitterData: emitterData ={
    address: '',
    place_id: '',
    tax_regime: '',
    archivo_cer: null,
    archivo_key: null,
    archivo_key_pswd: ''
  };

  receiverData: receiverData = {
    address: '',
    place_id: '',
    company: '',
    rfc : '',
    cfdi: '',
    taxRegime: '',
  }

  checkoutProgress: number = 0;
  weights: any;
  orderId: string = ''


  constructor(
    public translateService: TranslateService,
    private webService: AuthService,
    private router: Router,
    private alertService: AlertService

  ) {
      this.router.events.subscribe( res => {
        if( res instanceof NavigationEnd && res.url === '/checkout') {
          let data = this.router.getCurrentNavigation()?.extras.state;
          if(data && data.hasOwnProperty('validateRoute')) {
            this.validateRoute = data.validateRoute;
          }
          if(data && data.hasOwnProperty('orderId')) {
            this.orderId = data.orderId
            localStorage.setItem('checkoutOrderId',this.orderId);
          }else{
            this.orderId = localStorage.getItem('checkoutOrderId') || '';
          }

          if(!this.orderId){
            this.alertService.create({
              title: this.translateService.instant('checkout.alerts.error-something'),
              body: this.translateService.instant('checkout.alerts.error-missing-orderId'),
              handlers: [
                {
                  text: this.translateService.instant('OK'),
                  color: '#FFE000',
                  action: async () => {
                    this.alertService.close();
                    this.router.navigate(['/home']);
                  }
                }
              ]
            });

          }
        }
      });
      this.checkoutSteps = [
        {
          text: translateService.instant('checkout.invoice'),
          nextBtnTxt: translateService.instant('checkout.stepper-btns.continue-to-invoice'),
          step: 'invoice'
        },
        {
          text: translateService.instant('checkout.summary'),
          nextBtnTxt: translateService.instant('checkout.stepper-btns.summary'),
          step: 'summary'
        },
      ];
      this.translateService.onLangChange.subscribe(() => {
        this.checkoutSteps = this.checkoutSteps.map(e => {
          return {
            text:translateService.instant(`checkout.${e.step}`),
            nextBtnTxt: e.step === 'summary' ? translateService.instant(`checkout.stepper-btns.summary`) : translateService.instant(`checkout.stepper-btns.continue-to-${e.step}`),
            step: e.step
          }
        })
        this.calculateProgress();
      })      
   }

  async ngOnInit(): Promise<void> {

    const jsonRequest = {
      order_id: this.orderId
      // order_id: '618416317db4b43949779efb' // with imgs 
      // order_id: '61847409a0a3d50d3b968592' //hazardous
      // order_id: '6184240d7db4b43949779f15'
    };
    console.log(jsonRequest);
    (await this.webService.apiRest(JSON.stringify(jsonRequest),'orders/get_by_id')).subscribe(
      ( res : any ) => {
        this.summaryData = res.result;
        console.log('summary data: ', this.summaryData);
    },
      ( err: any ) => {

      }
    );

    (await this.webService.apiRest('','carriers/select_attributes')).subscribe(

      (res: any) => {
        this.invoiceData = res.result;
        console.log('Receiving select attributes : ', this.invoiceData);
      },
      (err: any) => {
        console.error('An error ocurred', err);
      }
      );

      
    (await this.webService.apiRest('','profile/get_emitter_files')).subscribe(
      (res: any) => {},
      (err: any) => {
        this.checkoutSteps.unshift({
          text: this.translateService.instant('checkout.emitter'),
          nextBtnTxt: this.translateService.instant('checkout.stepper-btns.continue-to-emitter'),
          step: 'emitter'
        })
      }
      );


      (await this.webService.apiRest('','orders/get_customs_cruce')).subscribe(
        (res: any) => {
          console.log('customs cruce: ', res.result);
          this.customsCruce = res.result;
        },
        
        (error : any) => {
          console.error('Error on customs cruce : ', error.customsCruce );
        }
      )
  }

  calculateProgress():number{
    console.log('Current index:', this.currentStepIndex, 'total elements:¨', this.checkoutSteps.length)
    this.checkoutProgress = (this.currentStepIndex  )/(this.checkoutSteps.length -1 ) * 100;
    console.log('calculateProgress', this.checkoutProgress);

    this.checkoutSteps.forEach((e,i)=>{
      if(i < this.currentStepIndex){
        e.validated = true;
        return false;
      }else{
        e.validated = false;
        return true;

      }
    });

    return this.checkoutProgress;
  }

  changeSelectedCard(newValue: string){
    this.selectedCard = newValue;
    console.log('Selected card is ', this.selectedCard)

  }

  async updatereceiverData(data: any) {
    this.receiverData = data;
  }  

  updateEmitterData(data: emitterData){
    this.emitterData = data;
  }
  /**
   * Moves checkout stepper to the next step
   */
  nextStep():void {
    if(this.currentStepIndex < this.checkoutSteps.length -1){
      this.currentStepIndex++;
      this.calculateProgress();
    } else {
      this.updateOrder();
    }
  }

  validate(){
    if(this.currentStepIndex === 0 && this.checkoutSteps.length === 3){
      this.validateEmitter();
    }
    else{
      this.validateReceiver();
    }
  }

  setDefaultMapImg():void {
    if(this.summaryData)
      this.summaryData.map.thumbnail_url = '../../../../../assets/images/checkout/map.png';
  }

  async updateOrder() {
    if(!this.validateRoute) {
      this.changeStatusOrder(-3);
    } else {
  
      let datos = {
        "orderId": this.orderId,
        "propertyToUpdate": "invoice",
        // "newValue": this.userValidateData
      }
  
      let requestJson = JSON.stringify(datos);
  
      (await this.webService.apiRest(requestJson, 'orders/update')).subscribe(
        async (res) => {
          if(res.status === 200){
            this.changeStatusOrder(1).then(()=>{
              localStorage.removeItem('checkoutOrderId');
            });
          }
        }
      );
    }
  }
  
  async changeStatusOrder(status: number) {

    let datos = {
      order_id: this.orderId,
      order_status: status,
    };

    let requestJson = JSON.stringify(datos);

    (await this.webService.apiRest(requestJson, 'orders/update_status')).subscribe(
      async (res) => {
        if(!this.validateRoute) {
          this.routeInvalidAlert(this.translateService.instant('checkout.title-valid-route'),this.translateService.instant('checkout.txt-valid-route'))
        } else {
          this.orderPlacedModal();
        }
      },
      async (res) => {
        if(res.status == 406) {
          this.verificationAlert(this.translateService.instant('checkout.alerts.title-user-verified'), this.translateService.instant('checkout.alerts.txt-user-verified'))
        }
      });
  }
  
  async orderPlacedModal() {
    this.alertService.create({
      title: this.translateService.instant('checkout.alerts.title-order-placed'),
      body: this.translateService.instant('checkout.alerts.txt-order-placed'),
      handlers: [
        {
          text: this.translateService.instant('OK'),
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
            this.router.navigate(['history']);
          }
        }
      ]
    });
  }

  async verificationAlert(title: string, message: string) {
    this.alertService.create({
      title: title,
      body: message,
      handlers: [
        {
          text: this.translateService.instant('OK'),
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
            this.router.navigate(['/home']);
          }
        }
      ]
    });
  }

  async routeInvalidAlert(title: string, message: string) {
    this.alertService.create({
      title: title,
      body: message,
      handlers: [
        {
          text: this.translateService.instant('OK'),
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
            this.router.navigate(['/home']);
          }
        }
      ]
    });
  }

  async validateEmitter() {
    if(this.emitterData.tax_regime){
      let attributes = {};
      attributes['tax_regime'] = this.emitterData.tax_regime;
      this.emitterData.address ? attributes['address'] = this.emitterData.address : null;
      this.emitterData.place_id ? attributes['place_id'] = this.emitterData.place_id : null;

      let request = {
        carrier_id: this.summaryData.user_id,
        attributes
      };

      (await this.webService.apiRest(JSON.stringify(request),'carriers/insert_attributes'))
    }
      if(this.emitterData.archivo_cer && this.emitterData.archivo_key && this.emitterData.archivo_key_pswd){
        if(!this.emitterData.tax_regime && !this.invoiceData.attributes.tax_regime){
          this.alertService.create({
            title: this.translateService.instant('checkout.alerts.emitter-create'),
            body: this.translateService.instant('checkout.alerts.emitter-tax_regime'),
            handlers: [
              {
                text: this.translateService.instant('OK'),
                color: '#FFE000',
                action: async () => {
                  this.alertService.close();
                }
              }
            ]
          });
        }
        else{

          let form = new FormData();
          form.append('archivo_cer', this.emitterData.archivo_cer);
          form.append('archivo_key', this.emitterData.archivo_key);
          form.append('archivo_key_pswd', this.emitterData.archivo_key_pswd);
          (await this.webService.uploadFilesSerivce(form, 'profile/validate_emitter'))
          .subscribe(
        res => {
          this.alertService.create({
            title: this.translateService.instant('checkout.alerts.emitter-validated'),
            handlers: [
              {
                text: this.translateService.instant('OK'),
                color: '#FFE000',
                action: async () => {
                  this.alertService.close();
                  this.nextStep();
                }
              }
            ]
          });
        },
        err => {
          let message:string;
          Array.isArray(err.error.error) ? message = err.error.error[0].error.split(',').join('\n') : message = err.error.error.error;
          this.alertService.create({
            title: this.translateService.instant('checkout.alerts.emitter-validated-fail'),
            body: message,
            handlers: [
              {
                text: this.translateService.instant('checkout.btn-retry'),
                color: '#FFE000',
                action: async () => {
                  this.alertService.close();
                }
              },
              {
                text: this.translateService.instant('checkout.btn-continue'),
                color: '#FFE000',
                action: async () => {
                  this.alertService.close();
                  this.nextStep();
                }
              },
            ]
          });
         }
        )
      }
      }
      else{
        this.nextStep();
      }
    
  }

  validateReceiver() {
    let faltates = [];
    this.receiverData.address ? null : faltates.push(this.translateService.instant('checkout.alerts.receiver-address')+'\n');
    this.receiverData.company ? null : faltates.push(this.translateService.instant('checkout.alerts.receiver-company'));
    this.receiverData.cfdi ? null : faltates.push(this.translateService.instant('checkout.alerts.receiver-cfdi'));
    this.receiverData.rfc ? null : faltates.push(this.translateService.instant('checkout.alerts.receiver-rfc'));
    this.receiverData.taxRegime ? null : faltates.push(this.translateService.instant('checkout.alerts.receiver-tax_regime'));

    if(faltates.length > 0){
      let errores = faltates.join('<br>');
      this.alertService.create({
        title: this.translateService.instant('checkout.alerts.receiver-stamp'),
        body: errores,
        handlers: [
          {
            text: this.translateService.instant('profile.account.btn_cancel'),
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
            }
          },
          {
            text: this.translateService.instant('checkout.btn-continue'),
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
              this.updateInvoiceData();
            }
          }
        ]
      });
   }
   else{
     this.updateInvoiceData();
   }
  }

  async updateInvoiceData(){
    let receiver = { 
      address:{
        address: this.receiverData.address,
        place_id: this.receiverData.place_id
      },
      company: this.receiverData.company,
      rfc: this.receiverData.rfc,
      cfdi: this.receiverData.cfdi,
      tax_regime: this.receiverData.taxRegime
    };
    let request = {
      order_id: this.orderId,
      receiver
    };

    (await this.webService.apiRest(JSON.stringify(request),'orders/update_invoice')).subscribe(
      res => {
        this.nextStep();
      },
      err => {
        this.alertService.create({
          title: this.translateService.instant('errors.timeout.title'),
          body: this.translateService.instant('errors.timeout.body'),
          handlers: [
            {
              text: this.translateService.instant('Ok'),
              color: '#FFE000',
              action: async () => {
                this.alertService.close();
              }
            }
          ]
        });
        console.log(err)
      }
    )
  }
  
  async getInvoicePreview(){
    const token = await localStorage.getItem("token")
    window.open( `${environment.URL_BASE}/invoice/get_preview_consignment/${this.orderId}/?token=${token}`, '_blank')
  }

}

