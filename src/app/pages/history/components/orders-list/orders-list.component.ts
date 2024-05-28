import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {

  @Input() statusListData: any = {};
  @Input() dropoffUpdated: Subject<any>;
  @Output() idEvent = new EventEmitter<string>();
  @Output() noOrders = new EventEmitter<any>();

  public allOrders: any = [];
  public language: any = '';
  public selectedOrder: boolean = false;
  public prevSelectedOrder: number = 0;
  public defaultOrder: Object = {};
  public paginationPages: number = 0;
  public pagesGroup: Array<number> = [];
  public currentPage: number = 1;
  public noOrdersInCurrentTab: boolean = false;
  public showSelectPage: boolean = false;
  public inputSearch: any = '';
  public orderTabs: any = [];
  public orderTabsText: string[];
  public currentTabIndex: number = 0;
  public selectedOrderId!: string 

  suscriptions: Subscription[] = [];

  Object = Object;

  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
  ) {
    this.orderTabs = {
      upcoming : {
        text: this.translateService.instant('history.tabs.upcoming'),
        orders: [],
        key: 'upcoming',
      },
      completed: {
        text: this.translateService.instant('history.tabs.completed') ,
        orders: [],
        key: 'completed',
      },
      past: {
        text: this.translateService.instant('history.tabs.past') ,
        orders: [],
        key: 'past',
      },
    }

    this.orderTabsText = Object.values(this.orderTabs).map((e: any)=>e.text);
   }


  ngOnInit(): void {
    this.language = localStorage.getItem('lang');
    this.getOrders();
    this.suscriptions.push(this.dropoffUpdated.subscribe((orderInfo: any) => {

      for (const list of Object.values<any>(this.orderTabs)) {
        const idx = list.orders.findIndex((order: any) => order._id === orderInfo._id);

        if (idx >= 0) {
          list.orders[idx].destinations[1].address = orderInfo.destinations[1].address;
          break
        }
      }
    }));
  }

  ngOnDestroy() {
    this.suscriptions.forEach((s) => s.unsubscribe());
  }

  sendData(order: any, index: number) {

    this.selectedOrderId = order._id
    this.idEvent.emit(order._id);
  }


  public async getOrders() {

    const currentTab = this.orderTabs[Object.keys(this.orderTabs)[this.currentTabIndex]].key;
    let requestOrders = {
      tab: currentTab,
      pagination: {
        page: this.currentPage,
        size: 5
      },
      search: this.inputSearch
    };

    (await this.authService.apiRest(JSON.stringify(requestOrders), 'carriers/get_orders', { apiVersion: 'v1.1' })).subscribe( res => {
      this.pagesGroup = [];
      this.orderTabs[currentTab].orders = res.result.orders;      
      if(!this.orderTabs[currentTab].orders.length){
        this.noOrdersInCurrentTab = true;
      }else{
        this.noOrdersInCurrentTab = false;
      }
      this.noOrders.emit({
        noOrders: this.noOrdersInCurrentTab,
        tab: currentTab
      });

      this.paginationPages = res.result.pages;
      this.createSelectPagination(this.paginationPages);
      //if current tab has orders
      if( this.orderTabs[currentTab].orders.length){

        this.selectedOrderId = this.orderTabs[currentTab].orders[0]._id;
        this.idEvent.emit(this.selectedOrderId);

      }
    }, error => {
      console.log("CON EL ERROR", error.error);
    })
  }

  private createSelectPagination(pages: number): void {
    
    for(let i = 0; pages >= i; i++) {
      if(i !=0) {
        this.pagesGroup.push(i);
      }
    }
  }

  public changeCurrentPage(): void {
    this.showSelectPage = !this.showSelectPage;
  }

  public selectedPage(page: number): void {
    this.showSelectPage = false;
    this.currentPage = page;
    this.getOrders();
  }

  public selectedArrowPage(action: string): void {
    if(action == 'prev' && this.currentPage > 1) {
      this.currentPage -= 1;
      this.getOrders();
    } else if(action == 'next' && this.currentPage < this.paginationPages) {
      this.currentPage += 1;
      this.getOrders();
    }
  }

  selectTab( index: number):void{
    this.currentTabIndex = index;
    this.currentPage = 1;
    this.getOrders();
  }

  public searchOrder(event: Event): void {
    this.currentPage = 1;
    this.getOrders();
  }
}
