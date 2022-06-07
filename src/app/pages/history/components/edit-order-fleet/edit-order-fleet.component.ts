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
  @Input() orderData: any;

  constructor() { }

  ngOnInit(): void {
  }

  public driverData: any;
  public truckData: any;
  public trailerData: any;

  ngOnChanges(changes: SimpleChanges): void{
    const {driver, truck, trailer} = this.orderData;
    if(changes.orderData){
      this.driverData = {...driver, availability: false, photo: driver.thumbnail};
      this.truckData = {...truck, availability: false, photo: truck.thumbnail};
      this.trailerData = {...trailer, availability: false, photo: trailer.thumbnail};
    }
  }

}
