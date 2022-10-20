import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit.component.html',
  styleUrls: ['./fleet-edit.component.scss']
})
export class FleetEditComponent implements OnInit {

  constructor(private translateService: TranslateService, private formBuilder: FormBuilder) { }

  public fleetTabs = [
    this.translateService.instant('fleet.trucks.truck_details'),
    this.translateService.instant('fleet.trucks.truck_settings'),
    this.translateService.instant('fleet.trucks.truck_insurance'),
  ]

  public truckDetailsForm: FormGroup;

  ngOnInit(): void {
    this.truckDetailsForm = this.formBuilder.group({
      model: ['', Validators.required],
      year: ['', Validators.required],
      plates: ['', Validators.required],
    });
  }

}
