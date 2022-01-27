import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
const statusList = require("src/assets/json/status-list.json");

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  public statusList: any = {};
  public noOrders: boolean = false;
  public currentTab = 'completed';

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.statusList = statusList;
  }

  data: string = ''
  orderInfo: object = {}

  receiveId($event: string) {
    this.data = $event
    this.getOrderById($event)
  }

  public async getOrderById(orderId: string) {
    let requestOrders = `{"order_id": "${orderId}"}`;

    (await this.authService.apiRest(requestOrders, 'orders/get_by_id')).subscribe(res => {
      this.orderInfo = res.result;
    }, error => {
      console.log(error.error);
    })
  }

  public noOrdersAction(areThereAnyOrders: any) : void {
    this.noOrders  = areThereAnyOrders.noOrders;
    this.currentTab = areThereAnyOrders.tab;
  }

}
