import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {

  orderId: string = '';
  
  btnPricing: boolean = false;
  
  select: boolean = false;
  
  insuranceForm: FormGroup = this.formBuilder.group({
    cargoValue: [0]
  });
  
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private webService: AuthService,
  ) { 
    this.router.events.subscribe( res => {
      if( res instanceof NavigationEnd && res.url === '/pricing') {
        let data = this.router.getCurrentNavigation()?.extras.state;
        if(data && data.hasOwnProperty('orderId')) {
          this.orderId = data.orderId
        }
      }
    });
  }


  changePay(value: any){
    this.select = value
  }

  async updatePricing() {
    let requestUpdatePricing = {
      order_id: this.orderId,
      subtotal: this.insuranceForm.value.cargoValue,
      deferred_payment: this.select
    };

    (await this.webService.apiRest(JSON.stringify(requestUpdatePricing), 'orders/set_pricing')).subscribe(res => {
      this.router.navigate(['checkout'], {
        state: {
          'orderId': this.orderId,
        }
      });
    }, error => {
      console.log('Error', error.error);
    });
  }

  getPricing(){
    if(this.insuranceForm.value.cargoValue > 0){
      this.btnPricing = true;
    }
    else{
      this.btnPricing = false;
    }
  }

  ngOnInit(): void {}
}
