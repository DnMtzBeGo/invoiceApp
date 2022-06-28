import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";

@Component({
  selector: "app-step4",
  templateUrl: "./step4.component.html",
  styleUrls: ["./step4.component.scss"],
})
export class Step4Component implements OnInit {
  public quantityunits: number = 1;
  @Input() timeETA: any;
  @Input() draftData: any;
  @Input() dropoffETA: number;
  @Output() step4FormData: EventEmitter<any> = new EventEmitter();
  @Output() validFormStep4: EventEmitter<any> = new EventEmitter();

  events: string = "DD / MM / YY";
  timeStart: string = "";
  timeEnd: string = "";
  deliverDatePickupLabel: string;

  destroyPickerStart: boolean = false;
  firstLoadStart: boolean = true;
  lastTimeStart: any;
  destroyPickerEnd: boolean = false;
  firstLoadEnd: boolean = true;
  lastTimeEnd: any;

  step4Form: FormGroup = this.formBuilder.group({
    datedropoff: [""],
    timestartdropoff: ["", Validators.required],
    timeenddropoff: ["", Validators.required],
    notes: [""],
  });

  draftStartTime: number = 0;
  draftEndTime: number = 0;

  constructor(translateService: TranslateService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.step4Form.statusChanges.subscribe((val) => {
      if (val === "VALID") {
        this.validFormStep4.emit(true);
      } else {
        this.validFormStep4.emit(false);
      }
    });

    this.step4Form.valueChanges.subscribe(() => {
      this.step4FormData.emit(this.step4Form.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.draftData &&
      changes.draftData.currentValue &&
      changes.draftData.currentValue.dropoff
    ) {
      if (
        changes.draftData.currentValue.dropoff.startDate > 0 &&
        changes.draftData.currentValue.dropoff.endDate > 0
      ) {
        this.draftStartTime = changes.draftData.currentValue.dropoff.startDate;
        this.draftEndTime = changes.draftData.currentValue.dropoff.endDate;
        this.step4Form
          .get("datedropoff")!
          .setValue(new Date(changes.draftData.currentValue.dropoff.startDate));
        this.events = moment(changes.draftData.currentValue.dropoff.startDate).format(
          "MMMM DD YYYY"
        );
        /* this.step4Form
          .get("extraNotes")!
          .setValue(changes.draftData.currentValue.dropoff.extra_notes); */
      } else {
        this.step4Form.controls.timestartdropoff.setValue("");
        this.step4Form.controls.timeenddropoff.setValue("");
      }
    }

    if (changes.dropoffETA && changes.dropoffETA.currentValue) {
      const date = changes.dropoffETA.currentValue;
      // this.step4Form.get("datedropoff").setValue(date);
      this.deliverDatePickupLabel = moment(new Date(date), "MM-DD-YYYY").format(
        "MMMM DD YYYY"
      );
      this.step4Form.get("timestartdropoff").setValue(new Date(date));
      this.step4Form.get("timeenddropoff").setValue(new Date(date));
    }
    this.validFormStep4.emit(this.step4Form.valid);
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events = moment(new Date(`${event.value}`), "MM-DD-YYYY").format("MMMM DD YYYY");
  }

  timeStartChange(data: string) {
    this.step4Form.get("timeenddropoff")?.setValue(data);
  }

  timeEndChange(data: string) {}

  // convertDateStringToMs(time: string) {

  //   let hours = moment(time, "h:mm A").format("HH:mm").split(':', 2);
  //   event.setHours(parseInt(hours[0]), parseInt(hours[1]), 0);
  //   return Date.parse(event.toString());
  // }

  timepickerValidStart(data: any) {
    this.lastTimeStart =
      this.step4Form.controls["timestartdropoff"].value || this.lastTimeStart;
    if (!data && !this.firstLoadStart) {
      this.destroyPickerStart = true;
      setTimeout(() => {
        this.destroyPickerStart = false;
        this.firstLoadStart = true;
        this.step4Form.controls["timestartdropoff"].setValue(this.lastTimeStart);
      }, 0);
    }
    this.firstLoadStart = false;
  }

  timepickerValidEnd(data: any) {
    this.lastTimeEnd =
      this.step4Form.controls["timeenddropoff"].value || this.lastTimeEnd;
    if (!data && !this.firstLoadEnd) {
      this.destroyPickerEnd = true;
      setTimeout(() => {
        this.destroyPickerEnd = false;
        this.firstLoadEnd = true;
        this.step4Form.controls["timeenddropoff"].setValue(this.lastTimeEnd);
      }, 0);
    }
    this.firstLoadEnd = false;
  }
}
