import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from "swiper/angular";
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
  EffectCoverflow,
  EffectCards
} from "swiper";
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';

// install Swiper modules
SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
  EffectCoverflow,
  EffectCards
]);

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {

  @ViewChild('swiperRef', { static: false }) swiperRef?: SwiperComponent;
  
  indexSlide: number = 0
  numSlides: number = 2

  orderId: string = '';
  prevUrl: string = '';

  insurance: boolean = false;
  cruce: boolean = false;
  customs_agent: boolean = false;
  cargo_value: number = 0;
  totalInsurance = 0;
  cargoValueSet: boolean = false;

  lang: any;
  totalPrice: number = 0.00;
  slideOpts: any = {
    speed: 400
  };

  checkout: boolean = false;

  orderData = {};

  dataCustomsCruce = {
    cruce: 0,
    customs: 0,
    total: 0
  }

  pagination = {
    clickable: true
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) { 

    this.router.events.subscribe( res => {
      if( res instanceof NavigationEnd && res.url === '/services') {
        let data = this.router.getCurrentNavigation()?.extras.state;
        if(data && data.hasOwnProperty('orderId')) {
          this.orderId = data.orderId
        }
      }
    });
  }

  ngOnInit(): void {
    if(this.orderId) {
      this.updateAddOns();
      this.getCustomsCruce();
    }
  }

  async getInsuranceCost(value: any) {
    console.log(value)
    if(value > 0) {
      var params = {
        cargo_value: parseInt(value),
      };
  
      (await this.auth.apiRest(JSON.stringify(params), 'orders/get_insurance_cost')).subscribe(
        async(res) => {
          console.log(res)
          this.totalInsurance = res.result.insurance_cost;
          this.cargoValueSet = true;
          // console.log(this.totalInsurance)
          this.cargo_value = parseInt(value)
          console.log(this.cargo_value)
        },
        async(res) => {console.log(res.error.error[this.lang])}
      );
    } else {
      this.cargoValueSet = false;
      this.cargo_value = 0;
    }
  }
  

  async updateAddOns() {
    console.log("Cargo_value: ",this.cargo_value)
    var params = {
      order_id: this.orderId,
      add_ons: {
        insurance: this.insurance,
        cruce: this.cruce,
        customs_agent: this.customs_agent,
        cargo_value: this.cargo_value,
      },
    };

    (await this.auth.apiRest(JSON.stringify(params), 'orders/update_add_ons')).subscribe(
      async(res) => {
        console.log(res.result.pricing)
        this.totalPrice = res.result.pricing.total
        if(this.checkout) {
          this.router.navigate(['/checkout'], {
            state: {
              orderId: this.orderId
            }
          });
        }
      },
      async(res) => {
        
      }
    );
  }

  async getCustomsCruce() {
    (await this.auth.apiRest('', 'orders/get_customs_cruce')).subscribe(
      async(res) => {
        console.log(res.result)
        this.dataCustomsCruce.cruce = res.result.cruce;
        this.dataCustomsCruce.total = res.result.total;
        this.dataCustomsCruce.customs = res.result.customs;
      },
      async(res) => {

      }
    );
  }

  getInsurance (value: any) {
    if(parseInt(value) > 0) {
      this.cargo_value = parseInt(value)
      this.insurance = true
      this.updateAddOns()
    } else {
      this.insurance = false
      this.cargo_value = 0
      this.updateAddOns()
    }
  }

  getAgentCruce(value: any) {
    console.log(value)
    this.customs_agent = value.customs_agent;
    this.cruce = value.cruce;
    this.checkout = value.checkout;
    this.updateAddOns();
  }

  onSwiper(swiper: any) {
    console.log(swiper);
  }
  onSlideChange(swiper: any) {
    this.indexSlide = swiper
    console.log('slide change',swiper);
  }
}
