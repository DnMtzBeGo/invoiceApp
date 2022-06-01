import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

}
