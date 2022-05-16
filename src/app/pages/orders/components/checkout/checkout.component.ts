import { Component, OnInit } from '@angular/core';
import { Step } from '../../../../shared/components/stepper/interfaces/Step'
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';

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
            this.router.navigate(['/home']);
          }
        }
      });
      this.checkoutSteps = [
        
        {
          text: translateService.instant('checkout.invoice'),
          nextBtnTxt: translateService.instant('checkout.stepper-btns.continue-to-invoice')
        },
        {
          text: translateService.instant('checkout.summary'),
          nextBtnTxt: translateService.instant('checkout.stepper-btns.submit')
        },
        // {
        //   text: translateService.instant('checkout.payment'),
        //   nextBtnTxt: translateService.instant('checkout.stepper-btns.submit')

        // },
      ];
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
        if(!this.summaryData.manager.cer?.key || !this.summaryData.manager.key?.key) {
          this.checkoutSteps.unshift({
            text: this.translateService.instant('checkout.emitter'),
            nextBtnTxt: this.translateService.instant('checkout.stepper-btns.continue-to-reciever')
          })
      }
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

      (await this.webService.apiRest('','orders/get_customs_cruce')).subscribe(
        (res: any) => {
          console.log('customs cruce: ', res.result);
          this.customsCruce = res.result;
        },
        
        (error : any) => {
          console.error('Error on customs cruce : ', error.customsCruce );
        }
      )
      console.log(this.summaryData);
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

  updateInvoiceData(data: any) {
    console.log(data)
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
            this.changeStatusOrder(0).then(()=>{
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
          color: '#ffbe00',
          action: async () => {
            this.alertService.close();
            this.router.navigate(['history']);
          }
        }
      ]
    });
  }

  async infoAlert(title: string, message: string) {
    this.alertService.create({
      title: title,
      body: message,
      handlers: [
        {
          text: this.translateService.instant('OK'),
          color: '#ffbe00',
          action: async () => {
            this.alertService.close();
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
          color: '#ffbe00',
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
          color: '#ffbe00',
          action: async () => {
            this.alertService.close();
            this.router.navigate(['/home']);
          }
        }
      ]
    });
  }
}

