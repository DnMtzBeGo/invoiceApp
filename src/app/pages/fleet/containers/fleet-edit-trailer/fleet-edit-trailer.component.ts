import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Observer } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { ReceviedPicture } from '../../components/pictures-grid/pictures-grid.component';
import { UploadFileInfo } from '../../components/upload-files/upload-files.component';

@Component({
  selector: 'app-fleet-edit-trailer',
  templateUrl: './fleet-edit-trailer.component.html',
  styleUrls: ['./fleet-edit-trailer.component.scss']
})
export class FleetEditTrailerComponent implements OnInit {

  public trailerDetailsForm: FormGroup;
  public trailerTypesCataloge: any[];
  public filteredTrailerTypesCataloge: any[];
  public disableSaveBtn: boolean = true;
  public pictures: UploadFileInfo[] = [];
  public selectedSubtype;


  private originalInfo: any;
  private newtrailerPictures: File[] = [];
  private fleetId: string;





  constructor(private formBuilder: FormBuilder, private authService: AuthService, private route: ActivatedRoute, private router: Router, private notificationsService: NotificationsService, private translateService: TranslateService
    ) { }

  async ngOnInit(): Promise<void> {
    this.trailerDetailsForm = this.formBuilder.group({
      plates: ['', [Validators.required, this.arePlatesValid]],
      trailer_number: ['',Validators.required],
      type:['', Validators.required],
      subtype: ['']
    });

    this.trailerDetailsForm.get('type').valueChanges.subscribe((val)=>{
      let validations = [];
      if(val == 'other'){
        validations = [Validators.required]
      }

      this.trailerDetailsForm.get('subtype').setValidators(validations);
      this.trailerDetailsForm.controls['subtype'].updateValueAndValidity();

    });

    this.selectedSubtype = this.selectedValueAutoComplete('subtype')

    await this.fillCataloguesFromDb();
    let changesAction = this.ontrailerInfoUpdated;
    if(this.router.url !== '/fleet/trailers/new'){
      const { id } = this.route.snapshot.params;
      await this.gettrailerInfo({ id });
    }else{
      changesAction = this.ontrailerInfoChanged;
      this.fleetId =( await this.getFleetOverview())._id;
    }

    this.trailerDetailsForm.valueChanges.subscribe(changesAction);

  }

  async fillCataloguesFromDb(): Promise<any> {
    const payload = {
      catalogs: [
        {
          name: 'sat_cp_subtipos_de_remolque',
          version: 0
        },
      ]
    };

    const { result } = await (await this.authService.apiRest(JSON.stringify(payload), 'invoice/catalogs/fetch')).toPromise();

    this.trailerTypesCataloge = result.catalogs.find((c) => c.name == 'sat_cp_subtipos_de_remolque').documents;
    this.filteredTrailerTypesCataloge = this.trailerTypesCataloge;

  }

  ontrailerInfoUpdated = () => {
    this.disableSaveBtn = !this.valuesFormChanged();
  };
  /**
   * Called only when creating a new trailer
   */
  ontrailerInfoChanged = () => {
   const enoughPictures = this.newtrailerPictures.length >= 2;
    this.disableSaveBtn = this.trailerDetailsForm.status == 'INVALID' || !enoughPictures;
  }

  valuesFormChanged(): boolean {
    const changes = this.trailerDetailsForm.value;
    for (let key of Object.keys(changes)) {
      if (this.originalInfo[key] != changes[key]) {
        return true;
      }
    }
    return false;
  }

  async gettrailerInfo({ id }: { id: string }) {
    const payload = { id_trailer: id };

    const { result } = await (await this.authService.apiRest(JSON.stringify(payload), '/trailers/get_by_id')).toPromise();

    this.pictures = result.pictures.map((url) => ({ url: `${url}?${new Date()}` }));
    this.trailerDetailsForm.patchValue(result.attributes);
    this.originalInfo = result.attributes;
  }

  async getFleetOverview(){
    return (await (await this.authService.apiRest('','fleet/overview')).toPromise()).result;
  }

  async saveChanges(){
    if(this.router.url == '/fleet/trailers/new'){
      this.createtrailer();
    }else{
      this.updateChanges();
    }
  }

  async updateChanges() {
    const payload = {
      id_trailer: this.route.snapshot.params.id,
      attributes: this.trailerDetailsForm.value
    };
    (await this.authService.apiRest(JSON.stringify(payload), 'trailers/insert_attributes')).subscribe(() => {
      this.router.navigateByUrl('fleet/trailers');
    });
  }

  async createtrailer(){
    const formData = new FormData();
    formData.append('id_fleet', this.fleetId);

    const newtrailerInfo = this.trailerDetailsForm.value;
    newtrailerInfo.year = parseInt(newtrailerInfo.year);

    //add properties received props to formdata
    Object.keys(newtrailerInfo).forEach(key=>{
      formData.append(key, newtrailerInfo[key])
    });

    this.newtrailerPictures.forEach((file: File,i: number) => {
      formData.append('pictures', file, i.toString());
    });

    (await this.authService.uploadFilesSerivce(formData, 'trailers/create', {apiVersion: 'v1.1'})).subscribe(() => {
      this.router.navigateByUrl('fleet/trailers');
    });
  }

  public async handleFileInput({ file, i, dialog }: ReceviedPicture){
    const acceptedFiles = ['image/jpeg', 'image/jpg', 'image/png']

    if(!acceptedFiles.includes(file.type)){
      this.notificationsService.showErrorToastr(this.translateService.instant('fleet.only-imgs'));
      return;
    }

    //if img not found then set index to the las of pictures
    if(!this.pictures[i]) i = this.pictures.length;

    const fileInfo = dialog.componentInstance.info.files[i];
    const newtrailer = this.router.url == '/fleet/trailers/new';

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      fileInfo.url = reader.result as string;
      if(newtrailer)this.pictures[i] = {url: fileInfo.url};
    };

    if(newtrailer){
      this.newtrailerPictures[i] = file;
      this.ontrailerInfoChanged();
    }else{
      (await this.updatePicture(file,i)).subscribe(
        (resp) => {
          fileInfo.uploadPercentage = (resp.loaded / resp.total) * 100;
        }
      );
    }
  }

    /**
   * Uploads a trailer picture
   * @param file the picture to be changed
   * @param i The index of the picture that will be changed
   * @returns the observable with the values of the progress of the uplaod
   */
     private async updatePicture(file: File, i: number): Promise<Observable<any>>{
      const formData = new FormData();
      formData.append('id_trailer', this.route.snapshot.params.id);
      formData.append('pictures', file, i.toString());
  
      const requestOptions = {
        reportProgress: true,
        observe: 'events'
      };
  
      const appBehaviourOptions = {
        loader: 'false'
      };
  
      return (await this.authService.uploadFilesSerivce(formData, 'trailers/upload_pictures', requestOptions, appBehaviourOptions));
  
    }

    displayFn(element: any): string{
      return `${element.code} - ${element.description}`;
    }

    selectedValueAutoComplete(input: string): Observable<string>{
      return new Observable<string>((observer: Observer<string>)=>{
        this.trailerDetailsForm.get(input).valueChanges.subscribe((value)=>{
          const selectedElement = this.trailerTypesCataloge.find(e=>e.code == value);
          if(selectedElement)
            observer.next(this.displayFn(selectedElement));
        });
    
      });
    }

    searchFunction(options: any[], input: string) {
      return options.filter((e: any) => {
        const currentValue = `${e.code} ${e.description}`.toLowerCase();
        return currentValue.includes(input.toLowerCase());
      });
    }

    setOption(selectedValue, formControlName: string) {
      const values = {};
      values[formControlName] = selectedValue.code;
  
      this.trailerDetailsForm.patchValue(values);
    }
  
    resetOption({target}: {target: HTMLInputElement}, catalog: any[], formControlName: string){
      const selectedValue = catalog.find(e=>e.code == this.trailerDetailsForm.value[formControlName] );
      target.value = selectedValue ?  this.displayFn(selectedValue): '';
      this.trailerDetailsForm.get(formControlName).markAsTouched();
  }


  arePlatesValid = ({value}: FormControl): ValidationErrors | null=>{
    let platesRegex = /^[^(?!.*\s)-]{5,7}$/;
    return platesRegex.test(value) ?  null: { errors: true};
  }

}
