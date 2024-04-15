import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FleetElementType } from 'src/app/shared/interfaces/FleetElement.type';

@Component({
  selector: 'app-edit-order-fleet',
  templateUrl: './edit-order-fleet.component.html',
  styleUrls: ['./edit-order-fleet.component.scss']
})
export class EditOrderFleetComponent implements OnInit {

  @Output() goBack = new EventEmitter<void>();
  @Output() edit = new EventEmitter<FleetElementType>();
  @Input() orderData?: any;

  constructor() { }

  ngOnInit(): void {
  }

  public driverData: any;
  public truckData: any;
  public trailerData: any;

  ngOnChanges(changes: SimpleChanges): void{
    const {driver, truck, trailer} = this.orderData;

    if(changes.orderData && this.orderData?._id){
      this.driverData = {...driver, availability: false, photo: this.getImg(driver) };
      this.truckData = {...truck, availability: false, photo: this.getImg(truck) };
      this.trailerData = {...trailer, availability: false, photo: this.getImg(trailer) };
    }
  }

  private getImg(el: any) {
    return el.thumbnail || el?.profile_picture?.thumbnail;
  }
}
