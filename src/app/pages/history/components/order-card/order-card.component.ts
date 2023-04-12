import { Component, OnInit, Input } from '@angular/core';
const statusList = require('src/assets/json/status-list.json');

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent implements OnInit {
  statusListData = statusList;
  @Input() order!: any;
  @Input() language!: string;
  @Input() active: boolean = false;
  constructor() {}

  ngOnInit(): void {}
}
