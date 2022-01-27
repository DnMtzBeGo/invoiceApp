import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  @Input() orderData: any;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges):void {
    if( changes.orderData ){
      console.log('payment order data : ', this.orderData );
    }
  }

}
