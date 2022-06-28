import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  SimpleChanges,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { MatButtonToggleChange } from "@angular/material/button-toggle";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { InputSelectableComponent } from "../input-selectable/input-selectable.component";
import { CargoWeightComponent } from "../cargo-weight/cargo-weight.component";
import * as moment from "moment";
import { UnitDetailsModalComponent } from "../unit-details-modal/unit-details-modal.component";

type CargoType = "general" | "hazardous";

interface Option {
  value?: string;
  viewValue?: string;
}

@Component({
  selector: "app-step2",
  templateUrl: "./step2.component.html",
  styleUrls: ["./step2.component.scss"],
})
export class Step2Component implements OnInit {
  @ViewChild("fileBar") fileBar!: ElementRef;
  @Input() creationTime: any;
  @Input() draftData: any;
  @Input() hazardousFileAWS: object = {};
  @Input() catalogsDescription: object = {};
  @Input() orderWithCP: boolean;
  @Input() creationdatepickup: number;
  @Input() editCargoWeightNow: boolean;
  @Output() step2FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep2: EventEmitter<boolean> = new EventEmitter();
  @Output() cargoWeightEdited: EventEmitter<void> = new EventEmitter();

  events: string = "DD / MM / YY";
  editWeight: boolean = false;
  public quantityunits: number = 1;

  datepicker: Date = new Date();
  draftDate: number = 0;
  minTime: Date = new Date();
  maxTime: Date = new Date();
  creationDatePickupLabel: string;

  cargoType: CargoType = "general";
  hazardousList: Array<any> = [];
  hazardousType: string = "select-catergory";
  hazardousFile!: File;

  destroyPicker: boolean = false;
  firstLoad: boolean = true;
  lastTime: any;

  calendar: any;
  // step2Form: FormGroup = this.formBuilder.group({
  //   datepickup: [this.events, Validators.required],
  //   timepickup: ['', Validators.required],
  //   unitType: ['', Validators.required],
  //   cargoUnits: [1, Validators.required],
  //   cargoWeight: [1],
  //   cargoType: [this.cargoType, Validators.required],
  //   hazardousType: [this.hazardousType, Validators.required],
  //   hazardousUn: ['', Validators.required],
  //   hazardousFile: [this.hazardousFile],
  //   description: ['', Validators.required],
  //   file: ['valid', Validators.required],
  // });
  step2Form = new FormGroup({
    hazardous_material: new FormControl(""),
    packaging: new FormControl(""),
    hazardous_type: new FormControl(""),
    hazardousUn: new FormControl(""),
    cargo_goods: new FormControl(""),
    datepickup: new FormControl(""),
    timepickup: new FormControl("", Validators.required),
    unitType: new FormControl("", Validators.required),
    cargoUnits: new FormControl(1, Validators.required),
    cargoWeight: new FormControl(1),
    cargoType: new FormControl(this.cargoType, Validators.required),
    description: new FormControl("", Validators.required),
  });

  mercModal: Option = {
    value: '',
    viewValue: ''
  };
  mercModalSelected: boolean = false;
  packModal: Option = {
    value: '',
    viewValue: ''
  };
  packModalSelected: boolean = false;
  hzrdModal: Option = {
    value: '',
    viewValue: ''
  };
  hzrdModalSelected: boolean = false;

  satUnitData: Option;

  public screenshotCanvas: any;
  public thumbnailMap: Array<any> = [];
  public thumbnailMapFile: Array<any> = [];

  constructor(
    translateService: TranslateService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    const hazardousList = translateService.instant("orders.hazardous-list");

    this.hazardousList = [];
    for (const [key, value] of Object.entries(hazardousList)) {
      this.hazardousList.push({
        key,
        text: value,
      });
    }
    this.minTime.setHours(1);
    this.minTime.setMinutes(0);

    this.step2Form.get("timepickup")!.setValue(new Date());
  }

  ngOnInit(): void {
    this.step2Form.statusChanges.subscribe((val) => {
      if (val === "VALID") {
        this.validFormStep2.emit(true);
      } else {
        this.validFormStep2.emit(false);
      }
    });

    this.handleCargoTypeChange();
    this.step2Form.get("cargoType")!.valueChanges.subscribe((val) => {
      this.step2Form.updateValueAndValidity();
      this.handleCargoTypeChange();
    });

    // this.step2Form.get("datepickup")!.valueChanges.subscribe((val) => {
    //   let oldDate = moment(this.calendar, "MM-DD-YYYY").format("MMMM DD YYYY");
    //   let newDate = moment(val, "MM-DD-YYYY").format("MMMM DD YYYY");
    //   if (oldDate !== newDate) {
    //     // this.minTime.setHours(0);
    //     // this.minTime.setMinutes(0);
    //     // this.minTime.setSeconds(0);
    //     this.minTime = this.creationTime;
    //     this.step2Form.controls.timepickup.setValue(void 0);
    //   } else {
    //     this.minTime = this.creationTime;
    //   }
    // });

    this.step2Form.get("timepickup")!.valueChanges.subscribe((val) => {
      // if(val===null) {
      // }
      // let value = val.moment().hour();
    });

    this.step2Form.valueChanges.subscribe(() => {
      this.step2FormData.emit(this.step2Form.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    
    if(changes.hasOwnProperty('hazardousFileAWS') && changes.hazardousFileAWS.currentValue.hasOwnProperty('url')) {
      this.generateScreenshot(changes.hazardousFileAWS.currentValue.url);
    }

    if(changes.hasOwnProperty('catalogsDescription') && changes.catalogsDescription.currentValue.hasOwnProperty('cargo_goods') && changes.catalogsDescription.currentValue.cargo_goods.length > 0) {
      this.catalogsDescription = changes.catalogsDescription.currentValue;
      this.mercModal.viewValue = changes.catalogsDescription.currentValue['cargo_goods'];
      /* this.step2Form
      .get("cargo_goods")
      .setValue(changes.catalogsDescription.currentValue['cargo_goods']); */
      this.mercModalSelected = true;
    }

    if(changes.hasOwnProperty('catalogsDescription') && changes.catalogsDescription.currentValue.hasOwnProperty('packaging') && changes.catalogsDescription.currentValue.packaging.length > 0) {
      this.packModal.viewValue = changes.catalogsDescription.currentValue['packaging'];
      this.step2Form
      /*   .get('packaging')
        .setValue(changes.draftData.currentValue.cargo.packaging); */
      this.packModalSelected = true;
    }

    if(changes.hasOwnProperty('catalogsDescription') && changes.catalogsDescription.currentValue.hasOwnProperty('hazardous_material') && changes.catalogsDescription.currentValue.hazardous_material.length > 0) {
      this.hzrdModal.viewValue = changes.catalogsDescription.currentValue['hazardous_material'];
      /* this.step2Form
        .get('hazardous_material')
        .setValue(changes.draftData.currentValue.cargo.hazardous_material); */
      this.hzrdModalSelected = true;
    }

    if (
      changes.draftData &&
      changes.draftData.currentValue &&
      changes.draftData.currentValue.pickup &&
      changes.draftData.currentValue.cargo
    ) {

      if(changes.draftData.currentValue.cargo.type) {
        this.cargoType = changes.draftData.currentValue.cargo.type;
        this.step2Form.get("cargoType")!.setValue(changes.draftData.currentValue.cargo.type);
        if(changes.draftData.currentValue.cargo.type === 'hazardous') {
          /* this.step2Form.addControl("hazardous_type", new FormControl("", [Validators.required])); */
          this.step2Form.get("hazardous_type")!.setValue(changes.draftData.currentValue.cargo.hazardous_type);

          /* this.generateScreenshot() */
        }

        /* if(changes.hasOwnProperty('catalogsDescription')) {
          this.catalogsDescription = changes.catalogsDescription.currentValue;
          this.mercModal.viewValue = changes.catalogsDescription.currentValue['cargo_goods'];
          this.step2Form
          .get("cargo_goods")
          .setValue(changes.catalogsDescription.currentValue['cargo_goods']);
          this.mercModalSelected = true;

          if(changes.draftData.currentValue.cargo.hasOwnProperty('packaging') && changes.draftData.currentValue.cargo.packaging.length > 0) {
            this.packModal.viewValue = this.catalogsDescription['packaging'];
            this.step2Form
              .get('packaging')
              .setValue(changes.draftData.currentValue.cargo.packaging);
            this.packModalSelected = true;
          }

          if(changes.draftData.currentValue.cargo.hasOwnProperty('hazardous_material') && changes.draftData.currentValue.cargo.hazardous_material.length > 0) {
            this.hzrdModal.viewValue = this.catalogsDescription['hazardous_materialÍ'];
            this.step2Form
              .get('hazardous_material')
              .setValue(changes.draftData.currentValue.cargo.hazardous_material);
            this.hzrdModalSelected = true;
          }
        } */

      }

      if (changes.draftData.currentValue.pickup.startDate !== null) {
        this.draftDate = changes.draftData.currentValue.pickup.startDate;
      }
      this.step2Form.get("cargoType")!.setValue(changes.draftData);
      this.step2Form
        .get("unitType")!
        .setValue(changes.draftData.currentValue.cargo["53_48"]);
      this.quantityunits = changes.draftData.currentValue.cargo.required_units;
      this.step2Form
        .get("cargoUnits")!
        .setValue(changes.draftData.currentValue.cargo.required_units);
      if (changes.draftData.currentValue.cargo.weigth) {
        this.step2Form
          .get("cargoWeight")!
          .setValue(changes.draftData.currentValue.cargo.weigth);
        this.editWeight = true;
      }

      this.step2Form
        .get("description")!
        .setValue(changes.draftData.currentValue.cargo.description);
    }
    // if (changes.creationTime && changes.creationTime.currentValue) {
    //   this.calendar = changes.creationTime.currentValue;
    //   if (this.draftDate > 0 && moment(this.calendar).valueOf() > this.draftDate) {
    //     // this.step2Form.get('datepickup')!.setValue('');
    //     // // this.ordersService.resetDropoffDate(true);")
    //     this.step2Form.get("datepickup")!.setValue(new Date(this.draftDate));
    //     this.events = moment(new Date(this.draftDate), "MM-DD-YYYY").format(
    //       "MMMM DD YYYY"
    //     );
    //     this.step2Form.get("timepickup")!.setValue(new Date(this.draftDate));
    //   } else {
    //     this.step2Form.get("datepickup")!.setValue(this.calendar);
    //     this.events = moment(
    //       new Date(moment(this.calendar).valueOf()),
    //       "MM-DD-YYYY"
    //     ).format("MMMM DD YYYY");
    //     this.step2Form.get("timepickup")!.setValue(this.calendar);
    //     this.minTime = this.calendar;
    //   }
    // }

    if (changes.creationdatepickup && changes.creationdatepickup.currentValue) {
      const date = changes.creationdatepickup.currentValue;
      this.step2Form.value.datepickup = date;
      this.creationDatePickupLabel = moment(new Date(date), "MM-DD-YYYY").format(
        "MMMM DD YYYY"
      );
      this.step2Form.get("timepickup").setValue(new Date(date));
    }

    if (changes.editCargoWeightNow && changes.editCargoWeightNow.currentValue) {
      this.editUnits();
    }

    this.validFormStep2.emit(this.step2Form.valid);
  }

  handleCargoTypeChange(): void {
    const cargoType = this.step2Form.get("cargoType")?.value;
    if (cargoType === "hazardous") {
      const validators = [Validators.required];
      this.step2Form.addControl(
        "hazardous_type",
        new FormControl(this.hazardousType, validators)
      );
      /* this.step2Form.addControl("hazardousUn", new FormControl("", validators)); */
      this.step2Form.addControl(
        "hazardousFile",
        new FormControl(this.hazardousFile, validators)
      );
      if (this.orderWithCP) {
        this.step2Form.addControl("packaging", new FormControl(""));
        this.step2Form.addControl("hazardous_material", new FormControl(""));
      }
    } else {
     /*  this.step2Form.removeControl("hazardous_type"); */
      /* this.step2Form.removeControl("hazardousUn"); */
      /* this.step2Form.removeControl("hazardousFile");
      this.step2Form.removeControl("hazardous_material");
      this.step2Form.removeControl("packaging"); */
    }
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events = moment(new Date(`${event.value}`), "MM-DD-YYYY").format("MMMM DD YYYY");
  }

  timeChange(time: any) {}

  increment() {
    if (this.quantityunits < 100) {
      this.quantityunits++;
      this.step2Form.get("cargoUnits")!.setValue(this.quantityunits);
    }
  }

  decrement() {
    if (this.quantityunits > 1) {
      this.quantityunits--;
      this.step2Form.get("cargoUnits")!.setValue(this.quantityunits);
    }
  }

  selectedUnits(unit: MatButtonToggleChange): void {
    this.step2Form.get("unitType")!.setValue(unit.value);
  }

  editUnits(): void {
    const dialogRef = this.dialog.open(CargoWeightComponent, {
      width: "312px",
      minHeight: "496px",
      panelClass: "modal",
      backdropClass: "backdrop",
      data: {
        units: this.step2Form.get("cargoUnits")!.value,
        weight: this.step2Form.get("cargoWeight")!.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.step2Form.get("cargoUnits")!.setValue(result.units);
        this.step2Form.get("cargoWeight")!.setValue(result.weight);
        this.quantityunits = result.units;
        this.editWeight = true;
        this.cargoWeightEdited.emit();
      }
    });
  }

  /**
   * Sets cargotype to the value to what it was changed
   * @param value The value to what was changed an element
   */
  setCargoType(value: MatButtonToggleChange): void {
    this.step2Form.get("cargoType")!.setValue(value.value);
    this.cargoType = value.value;
    if (value.value === "hazardous") {
      this.step2Form.get("file");
    }
  }

  clickFileInputElement() {}

  selectHazardousFile(file: any) {
    this.step2Form.get("hazardousFile")!.setValue(file);
  }

  dropHazardousFile() {
    // console.log("Here goes the logic to drop hazardous file");
  }

  // hourValidator(c: AbstractControl): {} {
  //   const value = c.value;

  //   if (!value) {
  //     return null as any;
  //   }

  //   const hours = value.getHours();

  //   if (hours <  1 || hours > 12) {
  //     return { outOfRange: true };
  //   }

  //   return null as any;
  // }

  timepickerValid(data: any) {
    this.lastTime = this.step2Form.controls["timepickup"].value || this.lastTime;
    if (!data && !this.firstLoad) {
      this.destroyPicker = true;
      setTimeout(() => {
        this.destroyPicker = false;
        this.firstLoad = true;
        this.step2Form.controls["timepickup"].setValue(this.lastTime);
      }, 0);
    }
    this.firstLoad = false;
  }

  showInputSelectorCP(type) {
    const modalData =
      type === "merc"
        ? this.mercModal
        : type === "pack"
        ? this.packModal
        : this.hzrdModal;
    const dialogRef = this.dialog.open(InputSelectableComponent, {
      panelClass: "modal",
      data: { data: modalData, type },
    });
    dialogRef.afterClosed().subscribe(async (res) => {
      if (typeof res === "object") {
        if (type === "merc") {
          this.mercModal = res;
          this.mercModalSelected = true;
          this.step2Form.get("cargo_goods")!.setValue(res.value);
        } else if (type === "pack") {
          this.packModal = res;
          this.packModalSelected = true;
          this.step2Form.get("packaging")!.setValue(res.value);
        } else {
          this.hzrdModal = res;
          this.hzrdModalSelected = true;
          this.step2Form.get("hazardous_material")!.setValue(res.value);
        }
      }
    });
  }

  addUnitDetailsFields() {
    console.log("se crearon campos");
    this.step2Form.addControl("commodity_quantity", new FormControl(""));
    this.step2Form.addControl("satUnitType", new FormControl(""));
  }

  showUnitDetailsModal() {
    if (!this.satUnitData) {
      this.addUnitDetailsFields();
    }
    const modalData = {
      qty: this.step2Form.value.commodity_quantity,
      satUnit: this.satUnitData,
      description: this.step2Form.value.description,
    };
    const dialogRef = this.dialog.open(UnitDetailsModalComponent, {
      panelClass: "modal",
      disableClose: true,
      data: modalData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.step2Form.get("description")!.setValue(result.description);
        this.step2Form.get("commodity_quantity")!.setValue(result.qty);
        this.step2Form.get("satUnitType")!.setValue(result.value);
        this.satUnitData = { value: result.value, viewValue: result.viewValue };
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
    this.thumbnailMapFile.push(blob);
    console.log('TENEMOS LA IMAGEN!!!', this.thumbnailMapFile);
    /* this.createGoogleImage.emit(this.thumbnailMapFile); */
  }
}
