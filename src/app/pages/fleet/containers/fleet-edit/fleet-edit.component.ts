import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit.component.html',
  styleUrls: ['./fleet-edit.component.scss']
})
export class FleetEditComponent implements OnInit {

  constructor(private translateService: TranslateService) { }

  public fleetTabs = [
    this.translateService.instant('fleet.trucks.truck_details'),
    this.translateService.instant('fleet.trucks.truck_settings'),
    this.translateService.instant('fleet.trucks.truck_insurance'),
  ]

  ngOnInit(): void {
  }

}
