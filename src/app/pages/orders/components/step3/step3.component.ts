import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BegoDialogService } from '@begomx/ui-components';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

import { CargoWeightComponent } from '../cargo-weight/cargo-weight.component';
import { UnitDetailsModalComponent } from '../unit-details-modal/unit-details-modal.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

type CargoType = 'general' | 'hazardous';

interface Option {
  value?: string;
  displayValue?: string;
}

interface Catalog {
  value: string;
  displayValue: string;
}

const enum Catalogs {
  Cargo = 'sat_cp_claves_productos_servicios',
  Packaging = 'sat_cp_tipos_de_embalaje',
  Hazardous = 'sat_cp_material_peligroso',
}

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss'],
})
export class Step3Component implements OnInit {
  @Input() public creationTime: any;
  @Input() public orderId: string = '';
  @Input() public draftData: any;
  @Input() public hazardousFileAWS: object = {};
  @Input() public catalogsDescription: object = {};
  @Input() public orderWithCP: boolean;
  @Input() public creationdatepickup: number;
  @Input() public editCargoWeightNow: boolean;
  @Input() public clearMultipleFile!: boolean;
  @Output() public step3FormData: EventEmitter<any> = new EventEmitter();
  @Output() public validFormStep3: EventEmitter<boolean> = new EventEmitter();
  @Output() public cargoWeightEdited: EventEmitter<void> = new EventEmitter();

  public events: string = 'DD / MM / YY';
  public editWeight: boolean = false;

  public datepicker: Date = new Date();
  public draftDate: number = 0;
  public minTime: Date = new Date();
  public maxTime: Date = new Date();
  public creationDatePickupLabel: string;

  public cargoType: CargoType = 'general';
  public hazardousType: string = 'select-catergory';
  public hazardousFile!: File;

  public destroyPicker: boolean = false;
  public firstLoad: boolean = true;
  public lastTime: any;

  public unitsData: any = {
    first: {
      label: '53 ft',
      value: '53',
    },
    second: {
      label: '48 ft',
      value: '48',
    },
  };

  public calendar: any;
  public step3Form: FormGroup;

  public satUnitData: Option = {
    value: '',
    displayValue: '',
  };

  public screenshotCanvas: any;
  public thumbnailMap: Array<any> = [];
  public thumbnailMapFile: Array<any> = [];

  public fileInfo: any = null;

  public fileLang;

  public type: string = 'tabs';

  public cargoCatalog: Catalog[] = [];
  public packagingCatalog: Catalog[] = [];
  public hazardousCatalog: Catalog[] = [];

  public categoryCatalog: Catalog[] = [];
  public filteredCategoryCatalog: Catalog[] = [];

  public fileTypes = ['.xlsx'];
  public files: any = null;

  public multipleFilesLang;
  public multipleCargo: boolean = false;

  public stepIndex: number = 0;

  public get cargoDescription() {
    if (!this.orderWithCP) {
      return this.step3Form.get('description')!.value;
    }

    const quantity = this.step3Form.get('commodity_quantity').value;
    const unitType = this.step3Form.get('satUnitType').value;
    const description = this.step3Form.get('description').value;

    return [unitType && `Qty ${quantity} units`, unitType, description].filter(Boolean).join('\n');
  }

  constructor(
    private translateService: TranslateService,
    public dialog: MatDialog,
    private apiRestService: AuthService,
    private begoDialog: BegoDialogService,
    private httpClient: HttpClient,
    private notificationsService: NotificationsService,
  ) {
    this.step3Form = new FormGroup({
      hazardous_material: new FormControl(''),
      packaging: new FormControl(''),
      hazardousFile: new FormControl(this.hazardousFile),
      hazardous_type: new FormControl(''),
      hazardousUn: new FormControl(''),
      cargo_goods: new FormControl(''),
      datepickup: new FormControl(''),
      timepickup: new FormControl('', Validators.required),
      unitType: new FormControl(this.unitsData.first.value, Validators.required),
      cargoWeight: new FormControl([1000]),
      cargoType: new FormControl(this.cargoType, Validators.required),
      description: new FormControl('', Validators.required),
      commodity_quantity: new FormControl(''),
      satUnitType: new FormControl(''),
      multipleCargoFile: new FormControl(this.files),
    });

    this.fileLang = {
      labelBrowse: this.translateService.instant('orders.upload-file.label-browse'),
      labelOr: this.translateService.instant('orders.upload-file.label-or'),
      btnBrowse: this.translateService.instant('orders.upload-file.btn-browse'),
      labelMax: this.translateService.instant('orders.upload-file.label-max'),
    };

    this.multipleFilesLang = {
      name: this.translateService.instant('orders.upload-multiple-orders.name'),
      labelBrowse: this.translateService.instant('orders.upload-multiple-orders.labelBrowse'),
      labelOr: this.translateService.instant('orders.upload-multiple-orders.labelOr'),
      btnBrowse: this.translateService.instant('orders.upload-multiple-orders.btnBrowse'),
      labelMax: this.translateService.instant('orders.upload-multiple-orders.labelMax'),
      uploading: this.translateService.instant('orders.upload-multiple-orders.uploading'),
    };

    this.minTime.setHours(1);
    this.minTime.setMinutes(0);

    const isoDate = new Date();
    const isoDateString = isoDate.toISOString();

    this.step3Form.get('timepickup').setValue(isoDateString);

    // this.step3Form.get("timepickup")!.setValue(new Date());
  }

  public ngOnInit(): void {
    this.step3Form.statusChanges.subscribe((val) => {
      if (val === 'VALID') {
        this.validFormStep3.emit(true);
      } else {
        this.validFormStep3.emit(false);
      }
    });

    this.handleCargoTypeChange(this.multipleCargo);

    this.step3Form.get('cargoType')!.valueChanges.subscribe((val) => {
      this.handleCargoTypeChange(this.multipleCargo);
    });

    this.step3Form.get('timepickup')!.valueChanges.subscribe((val) => {
      // if(val===null) {
      // }
      // let value = val.moment().hour();
    });

    this.step3Form.valueChanges.subscribe(() => {
      this.step3FormData.emit(this.step3Form.value);
    });

    this.getCargoTypeList();
    this.getPackagingList();
    this.getCategoryCatalog();
    this.getHazardousTypeList();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('hazardousFileAWS') && changes.hazardousFileAWS.currentValue.hasOwnProperty('url')) {
      this.generateScreenshot(changes.hazardousFileAWS.currentValue.url);
    }

    if (changes.draftData && changes.draftData.currentValue) {
      const {
        cargo,
        destinations: [pickup],
        documents,
      } = changes.draftData.currentValue;

      if (cargo) {
        this.cargoType = cargo.type;
        this.step3Form.get('cargoType')!.setValue(cargo.type);
        this.step3Form.get('cargo_goods').setValue(cargo['cargo_goods']);
        this.step3Form.get('commodity_quantity').setValue(cargo.commodity_quantity);
        this.satUnitData.displayValue = cargo.unit_type;
        if (cargo.type === 'hazardous') {
          this.step3Form.get('hazardous_type').setValue(cargo.hazardous_type);
          this.step3Form.get('packaging').setValue(cargo.packaging);
          this.step3Form.get('hazardous_material').setValue(cargo.hazardous_material);
        }

        /* if (cargo?.imported_file) {
          this.fileInfo = {
            name: this.getFileName(cargo?.imported_file),
            date: new Date(),
            size: 0,
          };
          this.stepIndex = 1;
          this.stepStatus(1);
        } */
      }

      if (pickup.startDate !== null) {
        this.draftDate = pickup.startDate;
      }
      this.step3Form.get('unitType')!.setValue(cargo?.trailer?.load_cap);
      if (cargo?.weight) {
        this.step3Form.get('cargoWeight')!.setValue(cargo?.weight);
        this.editWeight = true;
      }

      if (documents.hazardous) {
        const splittedHazardousUrl = documents.hazardous.split('/');
        const name = splittedHazardousUrl[splittedHazardousUrl.length - 1];
        this.fileInfo = { name };
        this.step3Form.get('hazardousFile').setValue(name);
      }

      this.step3Form.get('description')!.setValue(cargo?.description);
    }

    if (changes.creationdatepickup && changes.creationdatepickup.currentValue) {
      const date = changes.creationdatepickup.currentValue;
      this.step3Form.value.datepickup = date;
      this.creationDatePickupLabel = moment(new Date(date), 'MM-DD-YYYY').format('MMMM DD YYYY');

      const isoDate = new Date();
      const isoDateString = isoDate.toISOString();

      this.step3Form.get('timepickup').setValue(isoDateString);
      // this.step3Form.get("timepickup").setValue(new Date(date));
    }

    if (changes.editCargoWeightNow && changes.editCargoWeightNow.currentValue) {
      this.editUnits();
    }

    if (changes.clearMultipleFile && changes.clearMultipleFile.currentValue) {
      this.files = null;
      this.step3Form.get('multipleCargoFile')!.setValue(null, { emitEvent: false });
    }

    this.validFormStep3.emit(this.step3Form.valid);
  }

  public handleCargoTypeChange(multiple: boolean): void {
    const hazardousType = this.step3Form.get('hazardous_type')!;
    const hazardousFile = this.step3Form.get('hazardousFile')!;
    const packaging = this.step3Form.get('packaging')!;
    const hazardousMaterial = this.step3Form.get('hazardous_material')!;
    const multipleCargoFile = this.step3Form.get('multipleCargoFile')!;
    const cargoType: CargoType = this.step3Form.get('cargoType')!.value;
    const validators = [Validators.required];

    if (multiple) {
      hazardousType.clearValidators();
      hazardousFile.clearValidators();
      packaging.clearValidators();
      hazardousMaterial.clearValidators();
      this.step3Form.get('hazardousFile').reset();
      this.step3Form.get('hazardous_type').reset();
      this.step3Form.get('packaging').reset();
      this.step3Form.get('hazardous_material').reset();
      multipleCargoFile.setValidators(validators);
    } else {
      multipleCargoFile.clearValidators();
      this.step3Form.get('multipleCargoFile').reset();

      if (cargoType === 'general') {
        hazardousType.clearValidators();
        hazardousFile.clearValidators();

        this.fileInfo = null;
        this.hazardousFile = null;
        this.step3Form.get('hazardousFile').reset();
        this.step3Form.get('hazardous_type').reset();

        if (this.orderWithCP) {
          this.step3Form.get('packaging').reset();
          this.step3Form.get('hazardous_material').reset();
        }
      } else {
        hazardousType.setValidators(validators);
        hazardousFile.setValidators(validators);
      }
    }

    hazardousType.updateValueAndValidity();
    hazardousFile.updateValueAndValidity();
    multipleCargoFile.updateValueAndValidity();

    console.log('hazardous type: ', typeof this.hazardousType);
  }

  public addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events = moment(new Date(`${event.value}`), 'MM-DD-YYYY').format('MMMM DD YYYY');
  }

  public selectedUnits(unit: any): void {
    this.step3Form.get('unitType')!.setValue(unit.value);
  }

  public editUnits(): void {
    const dialogRef = this.dialog.open(CargoWeightComponent, {
      panelClass: 'bego-modal',
      backdropClass: 'backdrop',
      data: {
        units: this.step3Form.get('cargoWeight')!.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.step3Form.get('cargoWeight')!.setValue(result);
        this.editWeight = true;
        this.cargoWeightEdited.emit();
      }
    });
  }

  /**
   * Sets cargotype to the value to what it was changed
   * @param value The value to what was changed an element
   */
  public setCargoType(value: CargoType): void {
    this.cargoType = value;
    this.step3Form.get('cargoType')!.setValue(value);
  }

  public selectHazardousFile(file?: File) {
    if (file) {
      this.fileInfo = {
        name: file.name,
        date: new Date(file.lastModified),
        size: file.size,
      };
    } else {
      this.fileInfo = null;
    }

    this.step3Form.get('hazardousFile')!.setValue(file);
  }

  public setCargoDescirption(data: any) {
    this.step3Form.get('description')!.setValue(data.details);
  }

  public timepickerValid(data: any) {
    this.lastTime = this.step3Form.controls['timepickup'].value || this.lastTime;
    if (!data && !this.firstLoad) {
      this.destroyPicker = true;
      setTimeout(() => {
        this.destroyPicker = false;
        this.firstLoad = true;
        this.step3Form.controls['timepickup'].setValue(this.lastTime);
      }, 0);
    }
    this.firstLoad = false;
  }

  public addUnitDetailsFields() {
    this.step3Form.addControl('commodity_quantity', new FormControl(''));
    this.step3Form.addControl('satUnitType', new FormControl(''));
  }

  public showUnitDetailsModal() {
    if (!this.satUnitData) {
      this.addUnitDetailsFields();
    }
    const modalData = {
      qty: this.step3Form.value.commodity_quantity,
      satUnit: this.satUnitData,
      description: this.step3Form.value.description,
    };
    const dialogRef = this.dialog.open(UnitDetailsModalComponent, {
      panelClass: 'bego-modal',
      backdropClass: 'backdrop',
      disableClose: true,
      data: modalData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.step3Form.patchValue({
          description: result.description,
          commodity_quantity: result.qty,
          satUnitType: result.value,
        });
        this.satUnitData = { value: result.value, displayValue: result.displayValue };
      }
    });
  }

  public generateScreenshot(url: any) {
    let img = new Image();
    let elem = document.body;
    this.screenshotCanvas = <HTMLCanvasElement>document.getElementById('canvas-edit');
    let ctx = this.screenshotCanvas.getContext('2d');
    let pixelRatio = window.devicePixelRatio;
    const offsetWidth = elem.offsetWidth * pixelRatio;
    const offsetHeight = elem.offsetHeight * pixelRatio;
    const posX = window.scrollX * pixelRatio;
    const posY = window.scrollY * pixelRatio;
    this.screenshotCanvas.width = 512;
    this.screenshotCanvas.height = 512;
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      ctx.drawImage(img, posX, posY, offsetWidth, offsetHeight, 0, 0, offsetWidth, offsetHeight);
      let resultFinal = this.screenshotCanvas.toDataURL('image/png', 100);
      this.transformToFile(resultFinal);
    };
  }

  public transformToFile(data: any) {
    let resultBase64 = data.split(',');
    this.thumbnailMap.push(resultBase64[1]);
    const rawData = atob(resultBase64[1]);
    const bytes = new Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      bytes[i] = rawData.charCodeAt(i);
    }
    const arr = new Uint8Array(bytes);
    const blob = new Blob([arr], { type: 'image/png ' });
    this.setHazardousAWSFile(blob);
  }

  public setHazardousAWSFile(blob: Blob) {
    this.thumbnailMapFile.push(blob);
    // this.step3Form.get("hazardousFile")!.setValue(blob);
    const file = new File([blob], 'AWS file');

    this.step3Form.get('hazardousFile')!.setValue(file);
    this.fileInfo = {
      name: 'AWS file',
      date: new Date(),
      size: blob.size,
    };
  }

  private async getCatalogs(catalog: string, query?: string): Promise<Catalog[]> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);

    const req = await this.apiRestService.apiRestGet(`invoice/catalogs/query/${catalog}?${params.toString()}`);

    return new Promise((resolve, reject) => {
      req.subscribe(({ result }) => {
        const catalog = result.map((item: any) => ({
          value: item.code,
          displayValue: `${item.code} - ${item.description}`,
        }));

        resolve(catalog);
      }),
        (err: any) => {
          console.error(err);
          reject(err);
        };
    });
  }

  public async getCargoTypeList(query?: string) {
    const catalog = await this.getCatalogs(Catalogs.Cargo, query);
    this.cargoCatalog = catalog;
  }

  public async getPackagingList(query?: string) {
    const catalog = await this.getCatalogs(Catalogs.Packaging, query);
    this.packagingCatalog = catalog;
  }

  public async getHazardousTypeList(query?: string) {
    const catalog = await this.getCatalogs(Catalogs.Hazardous, query);
    this.hazardousCatalog = catalog;
  }

  public getCategoryCatalog() {
    const list: Record<string, string> = this.translateService.instant('orders.hazardous-list');

    const catalog = Object.entries(list).map(([key, value]) => ({
      value: key,
      displayValue: value,
    }));

    this.categoryCatalog = catalog;
    this.filteredCategoryCatalog = catalog;
  }

  public updateCategoryCatalog(value: any) {
    this.filteredCategoryCatalog = this.categoryCatalog.filter((item) =>
      item.displayValue.toLowerCase().includes(value.toLowerCase()),
    );
  }

  public updateForm(key: string, value: any) {
    this.step3Form.get(key)!.setValue(value);
  }

  public async handleFileChange(file?: File, type?: 'xlsx') {
    if (file) {
      this.files = {
        name: file.name,
        date: new Date(file.lastModified),
        size: file.size,
      };
    } else {
      this.files = null;
      this.deleteMultipleCargoFile(this.orderId);
    }

    this.step3Form.get('multipleCargoFile')!.setValue(file);
  }

  public invalidFile() {
    this.notificationsService.showErrorToastr('Archivo inválido');
  }

  public async stepStatus(type: number) {
    if (type > 0) {
      this.multipleCargo = true;
    } else {
      this.handleFileChange(null);
      this.multipleCargo = false;
    }
    this.updateValidators(type > 0);
  }

  public downloadTemplate() {
    const URL: string =
      'https://begoclients.s3.amazonaws.com/production/layouts/orders/layout-multiple-merchandise-order.xlsx';
    this.httpClient.get(URL, { responseType: 'blob' }).subscribe((blob) => {
      const link = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = URL.split('/').pop() || 'archivo';
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    });
  }

  public updateValidators(isMultipleCargo: boolean) {
    if (isMultipleCargo) {
      Object.keys(this.step3Form.controls).forEach((field) => {
        const control = this.step3Form.get(field);
        if (control) {
          if (field === 'unitType') {
            control.setValidators(Validators.required);
          } else if (field === 'multipleCargoFile') {
            control.setValidators(Validators.required);
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity({ emitEvent: false });
        }
      });

      this.step3Form.get('multipleCargoFile')?.updateValueAndValidity({ emitEvent: true });
    } else {
      this.step3Form.get('timepickup')?.setValidators(Validators.required);
      this.step3Form.get('unitType')?.setValidators(Validators.required);
      this.step3Form.get('cargoType')?.setValidators(Validators.required);
      this.step3Form.get('description')?.setValidators(Validators.required);
      this.step3Form.get('multipleCargoFile')?.clearValidators();

      Object.keys(this.step3Form.controls).forEach((field) => {
        const control = this.step3Form.get(field);
        if (control) {
          control.updateValueAndValidity({ emitEvent: false });
        }
      });

      this.step3Form.get('description')?.updateValueAndValidity({ emitEvent: true });
    }
  }

  public getFileName(filePath: string) {
    const regex = /\/[^/]*_([^/]+)$/;
    const match = filePath.match(regex);
    return match ? match[1] : '';
  }

  private async deleteMultipleCargoFile(order_id: string) {
    const req = await this.apiRestService.apiRest(null, `orders/cargo/remove-multiple/${order_id}`, {
      apiVersion: 'v1.1',
      timeout: '300000',
    });
    await req.toPromise();
  }
}
