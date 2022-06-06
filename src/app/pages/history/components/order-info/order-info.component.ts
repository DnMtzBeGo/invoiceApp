import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, Host } from '@angular/core';
import EmblaCarousel from 'embla-carousel';
import { FleetElementType } from 'src/app/shared/interfaces/FleetElement.type';
import { ChooseFleetElementComponent } from '../choose-fleet-element/choose-fleet-element.component';
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
  public sliderIndex: number = 0;
  public onSlideSelect = ()=>{
    this.sliderIndex = this.slider.selectedScrollSnap();
  }

  constructor() { }

  @Input() orderInfo: any = {};
  @Input() statusListData: any = {};

  @ViewChild('embla', { static: true }) protected embla: any;
  @ViewChild('viewPort', { static: true }) protected viewPort: any;
  @ViewChild('chooseFleetElementRef') public chooseElementRef: ChooseFleetElementComponent;

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
    this.slider.on('select',this.onSlideSelect)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedRow = 'pickup';
    this.statusOrder = this.orderInfo.status;
    if(this.statusOrder > 3){
      this.changePickupDropoff('dropoff');
    }
    const {orderInfo} = changes;
    if(orderInfo.currentValue?._id !== orderInfo.previousValue?._id){
      this.slider.scrollTo(0);
    }
  }

  ngOnDestroy(){
    this.slider.off('select', this.onSlideSelect);
  }

  public changePickupDropoff(row: string): void {
    this.selectedRow = row;
  }

  public chooseFleetElement(fleetElement: FleetElementType): void{
    this.chooseElementRef.setElementToChoose(fleetElement);
    this.slider.scrollNext();
  }
}
