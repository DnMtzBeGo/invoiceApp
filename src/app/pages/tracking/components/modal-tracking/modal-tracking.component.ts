import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
@Component({
  selector: 'app-modal-tracking',
  templateUrl: './modal-tracking.component.html',
  styleUrls: ['./modal-tracking.component.scss']
})
export class ModalTrackingComponent implements OnInit {

  @Input() orderData: any;
  @Input() statusData: any;
  @Input() statusOrder: number = 0;
 
  public distance: string = '';
  public eta: number = 0;
  public address: string = '';
  public restTime: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.restTime = new Date().getTime();
  }
}
