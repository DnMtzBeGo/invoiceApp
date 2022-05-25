import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss']
})
export class OrderInfoComponent implements OnInit, OnChanges {

  public language: any = '';
  public statusOrder: number = 1;
  public selectedRow: string = 'pickup';

  constructor() { }

  @Input() orderInfo: any = {};
  @Input() statusListData: any = {};

  ngOnInit(): void {
    this.language = localStorage.getItem('lang');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedRow = 'pickup';
    this.statusOrder = this.orderInfo.status;
    if(this.statusOrder > 3){
      this.changePickupDropoff('dropoff');
    }
  }

  public changePickupDropoff(row: string): void {
    this.selectedRow = row;
  }
}
