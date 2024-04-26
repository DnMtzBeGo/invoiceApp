import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef, Host, EventEmitter } from '@angular/core';
import EmblaCarousel from 'embla-carousel';
import { FleetElementType } from 'src/app/shared/interfaces/FleetElement.type';
import { AuthService } from 'src/app/shared/services/auth.service';
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

  showLocationModal = false;

  constructor(private apiRestService: AuthService) {}

  @Input() orderInfo: any = {};
  @Input() statusListData: any = {};

  @Output() infoUpdated = new EventEmitter<void>();

  @ViewChild('embla', { static: true }) protected embla: any;
  @ViewChild('viewPort', { static: true }) protected viewPort: any;
  @ViewChild('chooseFleetElementRef') public chooseElementRef: ChooseFleetElementComponent;

  get selectedInfo() {
    return this.orderInfo?.destinations?.[this.selectedRow === 'pickup' ? 0 : 1];
  }

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
      this.slider?.scrollTo(0);
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

  public closeLocationModal() {
    this.showLocationModal = false;
  }

  public async updateDropoff(location: any) {
    const q = new URLSearchParams(Object.entries({
      location_id: location.location_id
    }));

    (
      await this.apiRestService.apiRestPut('', `/orders/update_dropoff_location/${this.orderInfo._id}?${q.toString()}`, {
        apiVersion: 'v1.1'
      })
    ).subscribe(() => {
      this.orderInfo.destinations[1].place_id = location.place_id;
      this.orderInfo.destinations[1].address = location.address;
      this.orderInfo = { ...this.orderInfo } // needed for change detection
      this.closeLocationModal();
    });
  }
}
