import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { PickerSelectedColor } from 'src/app/shared/components/color-picker/color-picker.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UploadFileInfo, UploadFilesComponent } from '../../components/upload-files/upload-files.component';

@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit-truck.component.html',
  styleUrls: ['./fleet-edit-truck.component.scss']
})
export class FleetEditTruckComponent implements OnInit {

  @ViewChild('sliderRef') sliderRef: ElementRef;
  public slider: EmblaCarouselType;

  constructor(private translateService: TranslateService, private formBuilder: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private matDialog: MatDialog, private webService: AuthService) { 
    this.route.params;
  }

  public fleetTabs = [
    this.translateService.instant('fleet.trucks.truck_details'),
    this.translateService.instant('fleet.trucks.truck_settings'),
    this.translateService.instant('fleet.trucks.truck_insurance'),
  ];

  public truckDetailsForm: FormGroup;
  public pictures: UploadFileInfo[];
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
      this.pictures = result.pictures.map(url=>({url: `${url}?${new Date()}`}));

      this.truckDetailsForm.patchValue({
        model: brand, plates, year
      });
      this.selectedColor = {color, colorName};
    });
    
  }

  ngAfterViewInit(){
    var emblaNode = this.sliderRef.nativeElement
    var options: EmblaOptionsType = { loop: false, draggable: false }
  
    this.slider = EmblaCarousel(emblaNode, options);
  }

  updateTruckColor(color){
  }

  openFileEditor(){
    const dialog = this.matDialog.open(UploadFilesComponent,{
      data: {
        places: 5,
        obligatoryImages: 3,
        files: this.pictures,
        handleFileInput: async ({file, i}: {file: File, i: number}) =>{
          const fileInfo =  dialog.componentInstance.info.files[i];

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = ()=>{
              fileInfo.url = reader.result as string;
          }

          const formData = new FormData();
          formData.append('id_truck', this.route.snapshot.params.id);
          formData.append('pictures',file, (i).toString());

          const requestOptions = {
            reportProgress : true,
            observe: 'events',
          };
      
          const appBehaviourOptions = {
            loader: 'false'
          };

          (await this.webService.uploadFilesSerivce(formData, 'trucks/upload_pictures',requestOptions, appBehaviourOptions)).subscribe((resp)=>{
            fileInfo.uploadPercentage = resp.loaded / resp.total * 100;
          })

          
          
        }
      },
      backdropClass: ['brand-dialog-1','no-padding']
    });
  }

}
