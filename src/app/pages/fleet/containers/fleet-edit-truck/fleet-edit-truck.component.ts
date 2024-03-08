import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { Observable, Observer } from 'rxjs';
import { ActionConfirmationComponent } from 'src/app/pages/invoice/modals';
import { PickerSelectedColor } from 'src/app/shared/components/color-picker/color-picker.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { ReceviedPicture } from '../../components/pictures-grid/pictures-grid.component';
import { UploadFileInfo, UploadFilesComponent } from '../../components/upload-files/upload-files.component';
@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit-truck.component.html',
  styleUrls: ['./fleet-edit-truck.component.scss']
})
export class FleetEditTruckComponent implements OnInit {
  @ViewChild('sliderRef') sliderRef: ElementRef;
  public slider: EmblaCarouselType;

  public fleetTabs: string[];

  public truckDetailsForm: FormGroup;
  public pictures: UploadFileInfo[] = [];
  public selectedColor: PickerSelectedColor;
  //the url to the insurance file
  public insuranceFile: any;
  public filteredPermisosSCT: any[] = [];
  public filteredTruckSettings: any[] = [];
  public catalogs: Record<string, any>;
  public disableSaveBtn: boolean = true;
  public years: number[] = this.createDateOptions();

  public selectedTruckSettings = this.selectedValueAutoComplete('truck_settings', 'sat_cp_config_autotransporte');
  public selectedPermisoSCT = this.selectedValueAutoComplete('sct_permission', 'sat_cp_tipos_de_permiso');

  private originalInfo: any;
  private fleetId: string;
  private newTruckPictures: File[] = [];

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private matDialog: MatDialog,
    private webService: AuthService,
    private notificationsService: NotificationsService
  ) {
    this.route.params;

    this.fleetTabs = [
      this.translateService.instant('fleet.trucks.truck_details'),
      this.translateService.instant('fleet.trucks.truck_settings'),
      this.translateService.instant('fleet.trucks.truck_insurance')
    ];
  }

  async ngOnInit(): Promise<void> {
    this.truckDetailsForm = this.formBuilder.group({
      brand: ['', Validators.required],
      year: ['', Validators.required],
      plates: ['', [Validators.required, this.arePlatesValid]],
      colorName: ['', Validators.required],
      color: ['', Validators.required],
      sct_permission: ['', Validators.required],
      sct_permission_text: [''],
      sct_number: ['', Validators.required],
      truck_settings: ['', Validators.required],
      truck_settings_text: [''],
      insurer: ['', Validators.required],
      policy_number: ['', Validators.required]
    });

    await this.fillCataloguesFromDb();
    let changesAction = this.onTruckInfoUpdated;
    if (this.router.url !== '/fleet/trucks/new') {
      const { id } = this.route.snapshot.params;
      await this.getTruckInfo({ id });

      await this.getInsuranceFile({ id });
    } else {
      changesAction = this.onTruckInfoChanged;
      this.fleetId = (await this.getFleetOverview())._id;
    }

    this.truckDetailsForm.valueChanges.subscribe(changesAction);
  }

  setAutocompleteValue = (catalogueName: string, selectedCode: string): string => {
    const selectedValue = this.getCatalogue(catalogueName)?.find((e) => e.code == selectedCode) || {};
    return `${selectedValue.code} - ${selectedValue.description}`;
  };

  ngAfterViewInit() {
    var emblaNode = this.sliderRef.nativeElement;
    var options: EmblaOptionsType = { loop: false, draggable: false };

    this.slider = EmblaCarousel(emblaNode, options);

    //THIS LINE MUST BE DELETED
    this.slider.canScrollNext();
  }

  updateTruckColor(color) {
    this.truckDetailsForm.patchValue(color);
  }

  openFileEditor(flag: boolean) {
    if (!flag) return;
    const dialog = this.matDialog.open(UploadFilesComponent, {
      data: {
        places: 5,
        obligatoryImages: 3,
        files: this.pictures,
        handleFileInput: async ({ file, i }: { file: File; i: number }) => {
          const fileInfo = dialog.componentInstance.info.files[i];
          const newTruck = this.router.url == '/fleet/trucks/new';

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            fileInfo.url = reader.result as string;
            if (newTruck) this.pictures[i] = { url: fileInfo.url };
          };

          if (newTruck) {
            this.newTruckPictures[i] = file;
            this.onTruckInfoChanged();
          } else {
            (await this.updatePicture(file, i)).subscribe((resp) => {
              fileInfo.uploadPercentage = (resp.loaded / resp.total) * 100;
            });
          }
        }
      },
      backdropClass: ['brand-dialog-1', 'no-padding']
    });
  }

  async getTruckInfo({ id }: { id: string }) {
    const payload = { id_truck: id };

    const { result } = await (await this.authService.apiRest(JSON.stringify(payload), '/trucks/get_by_id')).toPromise();

    const { color, colorName } = result.attributes;
    this.pictures = result.pictures.map((url) => ({ url: `${url}?${new Date()}` }));

    result.attributes.year = parseInt(result.attributes.year);
    this.truckDetailsForm.patchValue(result.attributes);
    this.originalInfo = result.attributes;
    this.selectedColor = { color, colorName };
  }

  async getInsuranceFile({ id }: { id: string }) {
    const payload = { id_truck: id };

    const { result } = await (await this.authService.apiRest(JSON.stringify(payload), '/trucks/get_files')).toPromise();
    if (result.files[0]) {
      this.insuranceFile = result.files[0];
      this.insuranceFile.size = Math.max(this.insuranceFile.size * 0.000001, 0.01).toFixed(2) + 'MB';

      const destructuredUrl = this.insuranceFile.url.split('/');
      const fileName = destructuredUrl[destructuredUrl.length - 1];
      const splittedName = fileName.split('.');

      this.insuranceFile.fileType = splittedName[splittedName.length - 1];
      this.insuranceFile.name = fileName;
    }
  }

  getCatalogue(catalogueName: string) {
    return this.catalogs?.find((c) => c.name == catalogueName).documents;
  }

  setOption(selectedValue, formControlName: string) {
    const values = {};
    values[formControlName] = selectedValue.code;
    values[formControlName + '_text'] = selectedValue.description;
    //patch value
    this.truckDetailsForm.patchValue(values);
  }

  resetOption({ target }: { target: HTMLInputElement }, catalog: any[], formControlName: string) {
    const selectedValue = catalog.find((e) => e.code == this.truckDetailsForm.value[formControlName]);
    target.value = selectedValue ? this.displayFn(selectedValue) : '';
    this.truckDetailsForm.get(formControlName).markAsTouched();
  }

  async fillCataloguesFromDb(): Promise<any> {
    const payload = {
      catalogs: [
        {
          name: 'sat_cp_tipos_de_permiso',
          version: 0
        },
        {
          name: 'sat_cp_config_autotransporte',
          version: 0
        }
      ]
    };

    const { result } = await (await this.webService.apiRest(JSON.stringify(payload), 'invoice/catalogs/fetch')).toPromise();

    this.catalogs = result.catalogs;
    this.filteredPermisosSCT = this.getCatalogue('sat_cp_tipos_de_permiso');
    this.filteredTruckSettings = this.getCatalogue('sat_cp_config_autotransporte');
  }

  showInsuranceFile() {
    window.open(this.insuranceFile.url);
  }

  editInsuranceFile(event: PointerEvent) {
    event.stopPropagation();

    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant('invoice.invoice-table.delete-title'),
        modalMessage: this.translateService.instant('fleet.trucks.delete-insurance-warning')
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
    });

    dialogRef.afterClosed().subscribe((response: boolean) => {
      if (response) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (file) => {
          this.updateInsuranceFile(input.files[0]);
        };

        input.click();
      }
    });
  }

  async updateInsuranceFile(file: File) {
    if (this.router.url == '/fleet/trucks/new') {
      this.insuranceFile = file;
      this.onTruckInfoChanged();

      return;
    }

    const formData = new FormData();
    const { id } = this.route.snapshot.params;
    formData.append('id_truck', id);
    formData.append('files', file);

    const requestOptions = {
      reportProgress: true,
      observe: 'events'
    };

    const appBehaviourOptions = {
      loader: 'false'
    };

    (await this.webService.uploadFilesSerivce(formData, 'trucks/upload_files', requestOptions, appBehaviourOptions)).subscribe((resp) => {
      if (resp.status == 200) this.getInsuranceFile({ id });
    });
  }

  async saveChanges() {
    if (this.router.url == '/fleet/trucks/new') {
      this.createTruck();
    } else {
      this.updateChanges();
    }
  }

  async updateChanges() {
    const payload = {
      id_truck: this.route.snapshot.params.id,
      attributes: this.truckDetailsForm.value
    };
    (await this.webService.apiRest(JSON.stringify(payload), 'trucks/insert_attributes')).subscribe(() => {
      this.router.navigateByUrl('fleet/trucks');
    });
  }

  async createTruck() {
    const formData = new FormData();
    formData.append('id_fleet', this.fleetId);

    const newTruckInfo = this.truckDetailsForm.value;
    newTruckInfo.year = parseInt(newTruckInfo.year);

    //add properties received props to formdata
    Object.keys(newTruckInfo).forEach((key) => {
      formData.append(key, newTruckInfo[key]);
    });

    this.newTruckPictures.forEach((file: File, i: number) => {
      formData.append('pictures', file, i.toString());
    });

    formData.append('files', this.insuranceFile);
    // , {apiVersion: 'v1.1'}
    (await this.webService.uploadFilesSerivce(formData, 'trucks/create', { apiVersion: 'v1.1' })).subscribe(() => {
      this.router.navigateByUrl('fleet/trucks');
    });
  }

  async getFleetOverview() {
    return (await (await this.webService.apiRest('', 'fleet/overview')).toPromise()).result;
  }

  onTruckInfoUpdated = () => {
    this.disableSaveBtn = !this.valuesFormChanged() || this.truckDetailsForm.status == 'INVALID';
  };
  /**
   * Called only when creating a new truck
   */
  onTruckInfoChanged = () => {
    const enoughPictures = this.newTruckPictures.length >= 3;
    this.disableSaveBtn = this.truckDetailsForm.status == 'INVALID' || !enoughPictures || !this.insuranceFile;
  };

  valuesFormChanged(): boolean {
    const changes = this.truckDetailsForm.value;
    for (let key of Object.keys(changes)) {
      const originalValue = this.originalInfo[key];
      const change = changes[key];
      if (originalValue != change && originalValue && change) {
        return true;
      }
    }
    return false;
  }

  searchFunction(options: any[], input: string) {
    return options.filter((e: any) => {
      const currentValue = `${e.code} ${e.description}`.toLowerCase();
      return currentValue.includes(input.toLowerCase());
    });
  }

  /**
   * Uploads a truck picture
   * @param file the picture to be changed
   * @param i The index of the picture that will be changed
   * @returns the observable with the values of the progress of the uplaod
   */
  private async updatePicture(file: File, i: number): Promise<Observable<any>> {
    const formData = new FormData();
    formData.append('id_truck', this.route.snapshot.params.id);
    formData.append('pictures', file, i.toString());

    const requestOptions = {
      reportProgress: true,
      observe: 'events'
    };

    const appBehaviourOptions = {
      loader: 'false'
    };

    return await this.webService.uploadFilesSerivce(formData, 'trucks/upload_pictures', requestOptions, appBehaviourOptions);
  }

  arePlatesValid = ({ value }: FormControl): ValidationErrors | null => {
    let platesRegex = /^[^(?!.*\s)-]{5,7}$/;
    return platesRegex.test(value) ? null : { errors: true };
  };

  displayFn(element: any): string {
    return `${element.code} - ${element.description}`;
  }

  selectedValueAutoComplete(input: string, catalogName: string): Observable<string> {
    return new Observable<string>((observer: Observer<string>) => {
      this.truckDetailsForm.get(input)?.valueChanges.subscribe((value) => {
        const catalog = this.catalogs.find((e) => e.name == catalogName);
        const selectedElement = catalog.documents.find((e) => e.code == value);
        if (selectedElement) observer.next(this.displayFn(selectedElement));
      });
    });
  }

  public createDateOptions(): any[] {
    const range = (start: number, end: number) =>
      Array(end - start + 1)
        .fill(0)
        .map((_, idx) => start + idx);
    return range(1980, new Date().getFullYear() + 1)
      .reverse()
      .map((value) => ({ text: String(value), value }));
  }

  public async handleFileInput({ file, i, dialog }: ReceviedPicture) {
    const acceptedFiles = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!acceptedFiles.includes(file.type)) {
      this.notificationsService.showErrorToastr(this.translateService.instant('fleet.only-imgs'));
      return;
    }

    const fileInfo = dialog.componentInstance.info.files[i];
    const newTruck = this.router.url == '/fleet/trucks/new';

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      fileInfo.url = reader.result as string;
      if (newTruck) this.pictures[i] = { url: fileInfo.url };
    };

    if (newTruck) {
      this.newTruckPictures[i] = file;
      this.onTruckInfoChanged();
    } else {
      (await this.updatePicture(file, i)).subscribe((resp) => {
        fileInfo.uploadPercentage = (resp.loaded / resp.total) * 100;
      });
    }
  }
}
