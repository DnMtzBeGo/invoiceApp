import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-driver-status-card',
  templateUrl: './driver-status-card.component.html',
  styleUrls: ['./driver-status-card.component.scss']
})
export class DriverStatusCardComponent implements OnInit {

  @Input() orderData: any = {};
  @Input() title: string = '';
  
  public orderCreated: boolean = false;
  public orderAccepted: boolean = false;
  public pickupStarted: boolean = false;
  public eta: number = 0;
  public calculateETA: number = 0;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orderData){
      if(this.orderData) {
        console.log('Order data is: ', this.orderData);
        this.eta = this.orderData.ETA;
        this.calculateETA = new Date().getTime();
        this.calculateETA += this.eta;
      }    
    }
  }

  public sendIdForTrackingOrder(): void {
    this.router.navigate(['/tracking'], {
      state: {
        order_id: this.orderData._id
      }
    })
  }

}
