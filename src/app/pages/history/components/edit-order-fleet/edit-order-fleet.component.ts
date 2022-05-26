import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-edit-order-fleet',
  templateUrl: './edit-order-fleet.component.html',
  styleUrls: ['./edit-order-fleet.component.scss']
})
export class EditOrderFleetComponent implements OnInit {

  @Output() goBack = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
