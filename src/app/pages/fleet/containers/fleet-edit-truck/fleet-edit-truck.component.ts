import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PickerSelectedColor } from 'src/app/shared/components/color-picker/color-picker.component';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit-truck.component.html',
  styleUrls: ['./fleet-edit-truck.component.scss']
})
export class FleetEditTruckComponent implements OnInit {

  constructor(private translateService: TranslateService, private formBuilder: FormBuilder, private route: ActivatedRoute, private authService: AuthService) { 
    this.route.params;
  }

  public fleetTabs = [
    this.translateService.instant('fleet.trucks.truck_details'),
    this.translateService.instant('fleet.trucks.truck_settings'),
    this.translateService.instant('fleet.trucks.truck_insurance'),
  ];

  public truckDetailsForm: FormGroup;
  public pictures: string[];
  public selectedColor: PickerSelectedColor;

  async ngOnInit(): Promise<void> {
    this.truckDetailsForm = this.formBuilder.group({
      model: ['', Validators.required],
      year: ['', Validators.required],
      plates: ['', Validators.required],
    });

    const payload = {
      id_truck: this.route.snapshot.params.id
    };
    ( await this.authService.apiRest(JSON.stringify(payload),'/trucks/get_by_id')).subscribe(({result})=>{
      const { brand, plates, year, color, colorName} = result.attributes;
      this.pictures = result.pictures

      this.truckDetailsForm.patchValue({
        model: brand, plates, year
      });
      this.selectedColor = {color, colorName};
    });
    
  }

  updateTruckColor(color){
  }

}
