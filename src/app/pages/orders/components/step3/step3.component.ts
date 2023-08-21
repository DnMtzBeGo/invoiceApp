import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputSelectableComponent } from '../input-selectable/input-selectable.component';
import { CargoWeightComponent } from '../cargo-weight/cargo-weight.component';
import * as moment from 'moment';
import { UnitDetailsModalComponent } from '../unit-details-modal/unit-details-modal.component';
import { AuthService } from 'src/app/shared/services/auth.service';

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
  selector: "app-step3",
  templateUrl: "./step3.component.html",
  styleUrls: ["./step3.component.scss"],
})
export class Step3Component implements OnInit {
  @Input() creationTime: any;
  @Input() draftData: any;
  @Input() hazardousFileAWS: object = {};
  @Input() catalogsDescription: object = {};
  @Input() orderWithCP: boolean;
  @Input() creationdatepickup: number;
  @Input() editCargoWeightNow: boolean;
  @Output() step3FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep3: EventEmitter<boolean> = new EventEmitter();
  @Output() cargoWeightEdited: EventEmitter<void> = new EventEmitter();

  events: string = "DD / MM / YY";
  editWeight: boolean = false;

  datepicker: Date = new Date();
  draftDate: number = 0;
  minTime: Date = new Date();
  maxTime: Date = new Date();
  creationDatePickupLabel: string;

  cargoType: CargoType = "general";
  hazardousType: string = "select-catergory";
  hazardousFile!: File;

  destroyPicker: boolean = false;
  firstLoad: boolean = true;
  lastTime: any;

  unitsData = {
    first: {
      label: '53 ft',
      value: '53'
    },
    second: {
      label: '48 ft',
      value: '48'
    }
  };

  calendar: any;
  // step3Form: FormGroup = this.formBuilder.group({
  //   datepickup: [this.events, Validators.required],
  //   timepickup: ['', Validators.required],
  //   unitType: ['', Validators.required],
  //   cargoWeight: [1],
  //   cargoType: [this.cargoType, Validators.required],
  //   hazardousType: [this.hazardousType, Validators.required],
  //   hazardousUn: ['', Validators.required],
  //   hazardousFile: [this.hazardousFile],
  //   description: ['', Validators.required],
  //   file: ['valid', Validators.required],
  // });
  step3Form = new FormGroup({
    hazardous_material: new FormControl(""),
    packaging: new FormControl(""),
    hazardousFile: new FormControl(this.hazardousFile),
    hazardous_type: new FormControl(""),
    hazardousUn: new FormControl(""),
    cargo_goods: new FormControl(""),
    datepickup: new FormControl(""),
    timepickup: new FormControl("", Validators.required),
    unitType: new FormControl(this.unitsData.first.value, Validators.required),
    cargoWeight: new FormControl([1000]),
    cargoType: new FormControl(this.cargoType, Validators.required),
    description: new FormControl("", Validators.required),
    commodity_quantity: new FormControl(""),
    satUnitType: new FormControl("")
  });

  satUnitData: Option = {
    value: '',
    displayValue: ''
  };

  public screenshotCanvas: any;
  public thumbnailMap: Array<any> = [];
  public thumbnailMapFile: Array<any> = [];

  fileInfo: any = null;

  fileLang = {
    labelBrowse: this.translateService.instant('orders.upload-file.label-browse'),
    labelOr: this.translateService.instant('orders.upload-file.label-or'),
    btnBrowse: this.translateService.instant('orders.upload-file.btn-browse'),
    labelMax: this.translateService.instant('orders.upload-file.label-max'),
  };

  cargoCatalog: Catalog[] = [];
  packagingCatalog: Catalog[] = [];
  hazardousCatalog: Catalog[] = [];

  categoryCatalog: Catalog[] = [];
  filteredCategoryCatalog: Catalog[] = [];

  get cargoDescription() {
    if (!this.orderWithCP) {
      return this.step3Form.get('description')!.value
    }

    const quantity = this.step3Form.get('commodity_quantity').value;
    const unitType = this.step3Form.get('satUnitType').value;
    const description = this.step3Form.get('description').value;

    return [
      unitType && `Qty ${quantity} units`,
      unitType,
      description,
    ].filter(Boolean).join('\n')
  }


  constructor(private translateService: TranslateService, public dialog: MatDialog, private apiRestService: AuthService) {
    this.minTime.setHours(1);
    this.minTime.setMinutes(0);

    this.step3Form.get("timepickup")!.setValue(new Date());
  }

  ngOnInit(): void {
    this.step3Form.statusChanges.subscribe((val) => {
      if (val === "VALID") {
        this.validFormStep3.emit(true);
      } else {
        this.validFormStep3.emit(false);
      }
    });

    this.handleCargoTypeChange();
    this.step3Form.get("cargoType")!.valueChanges.subscribe((val) => {
      this.handleCargoTypeChange();
    });

    // this.step3Form.get("datepickup")!.valueChanges.subscribe((val) => {
    //   let oldDate = moment(this.calendar, "MM-DD-YYYY").format("MMMM DD YYYY");
    //   let newDate = moment(val, "MM-DD-YYYY").format("MMMM DD YYYY");
    //   if (oldDate !== newDate) {
    //     // this.minTime.setHours(0);
    //     // this.minTime.setMinutes(0);
    //     // this.minTime.setSeconds(0);
    //     this.minTime = this.creationTime;
    //     this.step3Form.controls.timepickup.setValue(void 0);
    //   } else {
    //     this.minTime = this.creationTime;
    //   }
    // });

    this.step3Form.get("timepickup")!.valueChanges.subscribe((val) => {
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

  ngOnChanges(changes: SimpleChanges) {
    if(changes.hasOwnProperty('hazardousFileAWS') && changes.hazardousFileAWS.currentValue.hasOwnProperty('url')) {
      this.generateScreenshot(changes.hazardousFileAWS.currentValue.url);
    }

    if (
      changes.draftData &&
      changes.draftData.currentValue &&
      changes.draftData.currentValue.pickup &&
      changes.draftData.currentValue.cargo
    ) {

      if(changes.draftData.currentValue.cargo.type) {
        this.cargoType = changes.draftData.currentValue.cargo.type;
        this.step3Form.get("cargoType")!.setValue(changes.draftData.currentValue.cargo.type);
        this.step3Form
        .get("cargo_goods")
        .setValue(changes.draftData.currentValue.cargo['cargo_goods']);
        this.satUnitData.value = changes.draftData.currentValue.cargo.unit_type;
        if(changes.draftData.currentValue.cargo.type === 'hazardous') {
          this.step3Form.get("hazardous_type").setValue(changes.draftData.currentValue.cargo.hazardous_type);
          this.step3Form
          .get('packaging')
          .setValue(changes.draftData.currentValue.cargo.packaging);
          this.step3Form
          .get('hazardous_material')
          .setValue(changes.draftData.currentValue.cargo.hazardous_material);
        }

      }

      if (changes.draftData.currentValue.pickup.startDate !== null) {
        this.draftDate = changes.draftData.currentValue.pickup.startDate;
      }
      this.step3Form.get("unitType")!.setValue(changes.draftData.currentValue.cargo["53_48"]);
      if (changes.draftData.currentValue.cargo.weigth) {
        this.step3Form
          .get("cargoWeight")!
          .setValue(changes.draftData.currentValue.cargo.weigth);
        this.editWeight = true;
      }

      this.step3Form
        .get("description")!
        .setValue(changes.draftData.currentValue.cargo.description);
    }

    if (changes.creationdatepickup && changes.creationdatepickup.currentValue) {
      const date = changes.creationdatepickup.currentValue;
      this.step3Form.value.datepickup = date;
      this.creationDatePickupLabel = moment(new Date(date), "MM-DD-YYYY").format(
        "MMMM DD YYYY"
      );
      this.step3Form.get("timepickup").setValue(new Date(date));
    }

    if (changes.editCargoWeightNow && changes.editCargoWeightNow.currentValue) {
      this.editUnits();
    }

    this.validFormStep3.emit(this.step3Form.valid);
  }

  handleCargoTypeChange(): void {
    const hazardousType = this.step3Form.get("hazardous_type")!;
    const hazardousFile = this.step3Form.get("hazardousFile")!;
    const cargoType: CargoType = this.step3Form.get("cargoType")!.value;

    if (cargoType === 'general') {
      hazardousType.clearValidators();
      hazardousFile.clearValidators();

      this.fileInfo = null;
      this.hazardousFile = null;
      this.step3Form.get('hazardousFile').reset();
      this.step3Form.get('hazardous_type').reset();

      if (this.orderWithCP) {
        this.step3Form.get("packaging").reset();
        this.step3Form.get("hazardous_material").reset();
      }
    } else {
      const validators = [Validators.required];
      hazardousType.setValidators(validators);
      hazardousFile.setValidators(validators);
    }

    hazardousType.updateValueAndValidity();
    hazardousFile.updateValueAndValidity();
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events = moment(new Date(`${event.value}`), "MM-DD-YYYY").format("MMMM DD YYYY");
  }

  timeChange(time: any) {}

  selectedUnits(unit: any): void {
    this.step3Form.get('unitType')!.setValue(unit.value);
  }

  editUnits(): void {
    const dialogRef = this.dialog.open(CargoWeightComponent, {
      panelClass: "bego-modal",
      backdropClass: "backdrop",
      data: {
        units: this.step3Form.get("cargoWeight")!.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => { if (result) {
        this.step3Form.get("cargoWeight")!.setValue(result);
        this.editWeight = true;
        this.cargoWeightEdited.emit();
      }
    });
  }

  /**
   * Sets cargotype to the value to what it was changed
   * @param value The value to what was changed an element
   */
  setCargoType(value: CargoType): void {
    this.cargoType = value;
    this.step3Form.get('cargoType')!.setValue(value);
  }

  selectHazardousFile(file?: File) {
    if (file) {
      this.fileInfo = {
        name: file.name,
        date: new Date(file.lastModified),
        size: file.size
      };
    } else {
      this.fileInfo = null;
    }

    this.step3Form.get('hazardousFile')!.setValue(file);
  }

  setCargoDescirption(data: any) {
    this.step3Form.get('description')!.setValue(data.details);
  }

  timepickerValid(data: any) {
    this.lastTime = this.step3Form.controls["timepickup"].value || this.lastTime;
    if (!data && !this.firstLoad) {
      this.destroyPicker = true;
      setTimeout(() => {
        this.destroyPicker = false;
        this.firstLoad = true;
        this.step3Form.controls["timepickup"].setValue(this.lastTime);
      }, 0);
    }
    this.firstLoad = false;
  }

  addUnitDetailsFields() {
    console.log("se crearon campos");
    this.step3Form.addControl("commodity_quantity", new FormControl(""));
    this.step3Form.addControl("satUnitType", new FormControl(""));
  }

  showUnitDetailsModal() {
    if (!this.satUnitData) {
      this.addUnitDetailsFields();
    }
    const modalData = {
      qty: this.step3Form.value.commodity_quantity,
      satUnit: this.satUnitData,
      description: this.step3Form.value.description,
    };
    const dialogRef = this.dialog.open(UnitDetailsModalComponent, {
      panelClass: "bego-modal",
      backdropClass: "backdrop",
      disableClose: true,
      data: modalData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.step3Form.patchValue({
          description: result.description,
          commodity_quantity: result.qty,
          satUnitType: result.value
        })
        this.satUnitData = { value: result.value, displayValue: result.displayValue };
      }
    });
  }

  public generateScreenshot(url: any) {
    let img = new Image();
    let elem = document.body;
    this.screenshotCanvas = <HTMLCanvasElement> document.getElementById("canvas-edit");
    let ctx = this.screenshotCanvas.getContext("2d");
    let pixelRatio = window.devicePixelRatio;
    const offsetWidth = elem.offsetWidth * pixelRatio;
    const offsetHeight = elem.offsetHeight * pixelRatio;
    const posX = (window.scrollX) * pixelRatio;
    const posY = (window.scrollY) * pixelRatio;
    this.screenshotCanvas.width = 512;
    this.screenshotCanvas.height = 512;
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      ctx.drawImage(img, posX, posY, offsetWidth, offsetHeight, 0, 0, offsetWidth, offsetHeight);
      let resultFinal = this.screenshotCanvas.toDataURL("image/png", 100);
      this.transformToFile(resultFinal);
    }
  }

  public transformToFile(data: any) {
    let resultBase64 = data.split(',');
    this.thumbnailMap.push(resultBase64[1]);
    const rawData = atob(resultBase64[1]);
    const bytes = new Array(rawData.length);
    for(let i = 0; i < rawData.length; i++) {
      bytes[i] = rawData.charCodeAt(i);
    }
    const arr = new Uint8Array(bytes);
    const blob = new Blob([arr], { type: 'image/png '});
    this.setHazardousAWSFile(blob);
  }

  setHazardousAWSFile(blob: Blob) {
    this.thumbnailMapFile.push(blob);
    this.step3Form.get("hazardousFile")!.setValue(blob);
    this.fileInfo = {
      name: 'AWS file',
      date: new Date(),
      size: blob.size,
    }
  }


  private async getCatalogs(catalog: string, query?: string): Promise<Catalog[]> {
    const params = new URLSearchParams()
    if (query) params.set('q', query)

    const req = await this.apiRestService.apiRestGet(`invoice/catalogs/query/${catalog}?${params.toString()}`)

    return new Promise((resolve, reject) => {
      req.subscribe(({ result }) => {
        const catalog = result.map((item: any) => ({
          value: item.code,
          displayValue: `${item.code} - ${item.description}`
        }))

        resolve(catalog)
      }),
      (err: any) => {
        console.error(err)
        reject(err)
      }
    })
  }

  async getCargoTypeList(query?: string) {
    const catalog = await this.getCatalogs(Catalogs.Cargo, query);
    this.cargoCatalog = catalog;
  }

  async getPackagingList(query?: string) {
    const catalog = await this.getCatalogs(Catalogs.Packaging, query);
    this.packagingCatalog = catalog;
  }

  async getHazardousTypeList(query?: string) {
    const catalog = await this.getCatalogs(Catalogs.Hazardous, query);
    this.hazardousCatalog = catalog;
  }

  getCategoryCatalog() {
    const list: Record<string, string> = this.translateService.instant('orders.hazardous-list');

    const catalog = Object.entries(list).map(([key, value]) => ({
      value: key,
      displayValue: value
    }))

    this.categoryCatalog = catalog;
    this.filteredCategoryCatalog = catalog;
  }

  updateCategoryCatalog(value: any) {
    this.filteredCategoryCatalog = this.categoryCatalog.filter((item) => item.displayValue.toLowerCase().includes(value.toLowerCase()));
  }

  updateForm(key: string, value: any) {
    this.step3Form.get(key)!.setValue(value);
  }
}
