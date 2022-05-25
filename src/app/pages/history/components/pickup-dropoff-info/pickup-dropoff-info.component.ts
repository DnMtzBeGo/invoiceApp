import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pickup-dropoff-info',
  templateUrl: './pickup-dropoff-info.component.html',
  styleUrls: ['./pickup-dropoff-info.component.scss']
})
export class PickupDropoffInfoComponent implements OnInit {

  @Input() title: string = '';
  @Input() orderData: any = {};

  public address: string = '';
  public dateOrder: number = 0;
  public extraNotes: string = '';
  public phone: string = '';
  public email: string = '';
  public cargoType: string = '';

  constructor(
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

  }

  getHazardousTitle(key: string): string {
    const completeKey = `orders.hazardous-list.${key}`;
    const translation = this.translateService.instant(completeKey);
    if(translation !== completeKey && translation !== '')
      return translation;
    return key;
  }

  ngOnChanges(changes: any): void{

    if(this.orderData && this.title.length > 0) {
      this.address = this.orderData[this.title]?.address;
      this.dateOrder = this.orderData[this.title]?.startDate;
      this.extraNotes = this.orderData[this.title]?.extra_notes;
      this.phone = this.orderData[this.title]?.contact_info.telephone;
      this.email = this.orderData[this.title]?.contact_info.email;
      this.cargoType = this.orderData.cargo?.type;
    }

  }

}
