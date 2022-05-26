import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import EmblaCarousel from 'embla-carousel';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss']
})
export class OrderInfoComponent implements OnInit, OnChanges {

  public language: any = '';
  public statusOrder: number = 1;
  public selectedRow: string = 'pickup';
  public slider: any;

  constructor() { }

  @Input() orderInfo: any = {};
  @Input() statusListData: any = {};

  @ViewChild('embla', { static: true }) protected embla: any;
  @ViewChild('viewPort', { static: true }) protected viewPort: any;

  ngOnInit(): void {
    this.language = localStorage.getItem('lang');

    const options = {
      loop: false,
      dragFree: false,
      draggable: false,
      slidesToScroll: 1
    };

    const wrap = this.embla.nativeElement;
    const viewPort = this.viewPort.nativeElement;
    const embla = EmblaCarousel(viewPort, options);
    this.slider = embla;
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
