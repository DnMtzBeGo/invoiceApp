import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CfdiService } from 'src/app/services/cfdi.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileInfoService } from '../../services/profile-info.service';
import { TranslateService } from '@ngx-translate/core';
import { BegoAlertHandler } from 'src/app/shared/components/bego-alert/BegoAlertHandlerInterface';
const statusList = require("src/assets/json/status-list.json");

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  upcomingData = [];
  selectedOrderId!: string;
  orderInfo: object = {};
  public statusList: any = {};

  constructor(
    private formBuilder: FormBuilder,
    public profileInfoService: ProfileInfoService,
    public cfdiService: CfdiService,
    public webService: AuthService,
    public translateService: TranslateService,
    public route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.statusList = statusList;
    this.loadData()
      .then(() => {
        if (this.upcomingData.length > 0) {
          this.openDetails(this.upcomingData[0]._id);
        }
      });
  }

  loadData() {
    const carrier_id = this.route.snapshot.queryParamMap.get('id') || null;

    const payload = carrier_id
      ? {
          carrier_id
        }
      : '';

    return this.webService.apiRest(JSON.stringify(payload), 'carriers/get_orders')
      .then(observable => observable.toPromise())
      .then((res) => {
        this.upcomingData = res.result;
      })
      .catch((res) => {
        console.log(res.error.error);
      });
  }

  openDetails(id: string) {
    this.selectedOrderId = id;
    this.getOrderById(id);
  }

  public async getOrderById(orderId: string) {
    let requestOrders = `{"order_id": "${orderId}"}`;

    (await this.webService.apiRest(requestOrders, 'orders/get_by_id')).subscribe(res => {
      this.orderInfo = res.result;
    }, error => {
      console.log(error.error);
    })
  }
}
