import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-price-details',
  templateUrl: './price-details.component.html',
  styleUrls: ['./price-details.component.scss']
})
export class PriceDetailsComponent implements OnInit {

  @Input() orderData: any = {};
  @Input() customsCruce?: any;
  constructor() { }

  ngOnInit(): void {
  }

}
