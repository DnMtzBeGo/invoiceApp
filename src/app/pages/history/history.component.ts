import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthService } from '../../shared/services/auth.service';
import { HeaderService } from '../home/services/header.service';

const statusList = require('src/assets/json/status-list.json');

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, AfterViewInit {
  public statusList: any = {};
  public noOrders: boolean = false;
  public currentTab = 'completed';
  public dropoffUpdated = new Subject<any>();

  public data: string = '';
  public orderInfo: object = {};

  constructor(private authService: AuthService, private headerStyle: HeaderService) {}

  public ngOnInit(): void {
    this.statusList = statusList;
  }

  public ngAfterViewInit(): void {
    this.headerStyle.changeHeader(false);
  }

  public receiveId($event: string) {
    this.data = $event;
    this.getOrderById($event);
  }

  public async getOrderById(orderId: string) {
    (await this.authService.apiRest('', `carriers/orders/${orderId}`, { apiVersion: `v1.1` })).subscribe(
      (res) => {
        this.orderInfo = res.result;
      },
      (error) => {
        console.log(error.error);
      },
    );
  }

  public noOrdersAction(areThereAnyOrders: any): void {
    this.noOrders = areThereAnyOrders.noOrders;
    this.currentTab = areThereAnyOrders.tab;
  }
}
